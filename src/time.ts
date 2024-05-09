/// The smallest unit of time in milliseconds
/// For example, for 30 fps, the quantum is 1 frame, which is
export type QuantumPerSecond = bigint;

/// Type for time unit in the input
export type TimeUnit =
    | "D"
    | "d" // day
    | "H"
    | "h" // hour
    | "M"
    | "m" // minute
    | "S"
    | "s" // second
    // for formatting
    | never;

/// One value of time, equaps a value plus a unit
export type TimeValue<TQps extends QuantumPerSecond> = {
    /// How many quantums in this value
    val: bigint;
    /// Quantum per second - How many time quantums in one second
    qps: TQps;
};

/// Value of time in milliseconds
export type MillisecondValue = TimeValue<1000n>;

export function makeQuantum<TQps extends QuantumPerSecond>(
    val: bigint,
    qps: TQps,
): TimeValue<TQps> {
    return { val, qps };
}

export function makeMs(val: bigint): MillisecondValue {
    // @ts-ignore bruh
    return { val, qps: BigInt(1000) };
}

export function toMilliseconds<TQps extends QuantumPerSecond>(
    input: TimeValue<TQps>,
): MillisecondValue {
    const ms = BigInt(1000);
    const unit = input.qps;
    // using tenth as basis (5 is 0.5)
    const rounding = input.val < 0 ? -BigInt(5) : BigInt(5);

    const newValue = ((input.val * BigInt(10) * ms) / unit + rounding) / BigInt(10);
    return makeMs(newValue);
}

export function toQuantum<TQps extends QuantumPerSecond>(
    msValue: MillisecondValue,
    qps: TQps,
): TimeValue<TQps> {
    const ms = msValue.val;
    let lo = ms * qps / BigInt(1000);
    let loms = toMilliseconds({ val: lo, qps }).val;
    let hims: bigint;
    let hi: bigint;
    if (loms <= ms) {
        hi = lo + BigInt(1);
        hims = toMilliseconds({ val: hi, qps }).val;
    } else {
        hims = loms;
        hi = lo;
        lo = lo - BigInt(1);
        loms = toMilliseconds({ val: lo, qps }).val;
    }
    // Manual rounding
    if (hims - ms > ms - loms) {
        return makeQuantum(lo, qps);
    }
    return makeQuantum(hi, qps);
}

/// A parsed expression, containing time terms in milliseconds
/// Terms can be negative
export type MsExpression = bigint[];
const ERROR = "ERROR!" as const;
type ERROR = typeof ERROR;
/// Parser output
export type Parsed = {
    /// Expressions to compute
    exprs: (MsExpression | ERROR)[];
    /// Errors in parsing
    errors: string[];
};

/// Output of the program
export type CalcOutput = {
    /// Answer time strings, or "ERROR!" if there is an error
    answers: string[];
    /// Errors in parsing
    errors: string[];
};

/// Top level API that parses the input expressions and computes the result
/// Input should be ,-separated time expressions
export function calc(input: string, unit: QuantumPerSecond): CalcOutput {
    if (!input) {
        return { answers: [], errors: [] };
    }
    const { exprs, errors } = parse(tokenize(input));
    const answers = compute(exprs, unit).map(v => {
        if (v === ERROR) {
            return ERROR;
        }
        return stringifyMs(toMilliseconds(v).val);
    });
    return { answers, errors };
}

/// Tokenize the input string
export function tokenize(input: string): string[] {
    const tokens = [];
    let str = input;
    const regex = /[\+\-,DdHhMmSs]/;
    let j = str.search(regex);
    while (j !== -1) {
        if (j !== 0) {
            // Prevent empty tokens
            tokens.push(str.substring(0, j));
        }

        tokens.push(str[j]);
        str = str.substring(j + 1);
        j = str.search(regex);
    }
    if (str !== "") {
        tokens.push(str);
    }
    return tokens.map(t => t.replaceAll(/\s/g, "")).filter(Boolean);
}
const SECOND = BigInt(1000);
const MINUTE = BigInt(60) * SECOND;
const HOUR = BigInt(60) * MINUTE;
const DAY = BigInt(24) * HOUR;
const UNIT_MAP = {
    "D": DAY,
    "H": HOUR,
    "M": MINUTE,
    "S": SECOND,
} as const;

const LookAhead = {
    Number: 0,
    DelimiterOrUnit: 1,
    DelimiterOrNumber: 2,
} as const;
type LookAhead = typeof LookAhead[keyof typeof LookAhead];

/// Parse the tokens into expressions
export function parse(tokens: string[]): Parsed {
    const computations: (MsExpression | "ERROR!")[] = [];
    const errors: string[] = [];

    let expectLookAhead: LookAhead = LookAhead.Number;

    // current expression being parsed
    let current: MsExpression = [];
    let number = undefined;
    let value = undefined;
    let panic = false;
    let negative = false;

    // Grammar
    // Computations => Expression MoreComputation
    // MoreComputation => , Expression | epsilon
    // Expression => Time Unit MoreExpression
    // MoreExpression => + Expression | epsilon
    // Time => [0-9]+
    // Unit => [DHMS]
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const tupper = t.toUpperCase();
        if (panic && t !== ",") {
            continue;
        }

        if (panic) {
            expectLookAhead = LookAhead.Number;
            number = undefined;
            value = undefined;
            current = [];
            panic = false;
            negative = false;
        }

        if (t === "," || t === "+" || t === "-") {
            if (expectLookAhead === LookAhead.Number) {
                errors.push("Unexpected \"" + t + "\", did you forget to put a time before?");
                computations.push(ERROR);
                panic = true;
            } else {
                if (t === ",") {
                    if (number !== undefined) {
                        if (value !== undefined) {
                            number += value;
                        }
                        if (negative) {
                            number = -number;
                        }
                        current.push(number);
                        number = undefined;
                        value = undefined;
                    }
                    computations.push(current);
                    current = [];
                    negative = false;
                } else {
                    if (number === undefined) {
                        number = BigInt(0);
                    }
                    if (value !== undefined) {
                        number += value;
                    }
                    if (negative) {
                        number = -number;
                    }
                    current.push(number);
                    number = undefined;
                    value = undefined;
                    negative = t === "-";
                }
                expectLookAhead = LookAhead.Number;
            }
        } else if (tupper === "D" || tupper === "H" || tupper === "M" || tupper === "S") {
            if (expectLookAhead !== LookAhead.DelimiterOrUnit) {
                errors.push("Unexpected \"" + t + "\". Expecting a unit or delimiter");
                computations.push(ERROR);
                panic = true;
            } else {
                if (number === undefined) {
                    number = BigInt(0);
                }
                number = number + (value as bigint) * UNIT_MAP[tupper];
                expectLookAhead = LookAhead.DelimiterOrNumber;
                value = undefined;
            }
        } else {
            if (expectLookAhead === LookAhead.DelimiterOrUnit) {
                errors.push("Unexpected \"" + t + "\". Expecting a number");
                computations.push(ERROR);
                panic = true;
            } else {
                var regex = /^[0-9]+$/;
                if (!regex.test(t)) {
                    errors.push("\"" + t + "\" is not a valid time value");
                    computations.push("ERROR!");
                    panic = true;
                } else {
                    value = BigInt(t);
                    expectLookAhead = LookAhead.DelimiterOrUnit;
                }
            }
        }
    }
    if (!panic) {
        if (number === undefined) {
            number = BigInt(0);
        }
        if (value !== undefined) {
            number += value;
        }
        if (negative) {
            number = -number;
        }
        current.push(number);
        if (current.length !== 0) {
            computations.push(current);
        }
    }

    return {
        exprs: computations,
        errors,
    };
}

function pad2(input: bigint): string {
    if (input < BigInt(10)) {
        return "0" + input;
    }
    return "" + input;
}

/// Return string representation of the time value
export function stringifyMs(ms: bigint): string {
    let result = "";
    const negative = ms < 0;
    if (negative) {
        ms = -ms;
    }
    if (ms >= DAY) {
        const day = ms / DAY;
        result += day + "d";
        ms -= day * DAY;
    }
    let hour = undefined;
    if (ms >= HOUR) {
        hour = ms / HOUR;
        ms -= hour * HOUR;
    } else {
        if (result.length !== 0) {
            hour = BigInt(0);
        }
    }
    if (hour !== undefined) {
        result += pad2(hour) + "h";
    }

    let minute = undefined;
    if (ms >= MINUTE) {
        minute = ms / MINUTE;
        ms -= minute * MINUTE;
    } else {
        if (result.length !== 0) {
            minute = BigInt(0);
        }
    }
    if (minute !== undefined) {
        result += pad2(minute) + "m";
    }

    let second = undefined;
    if (ms >= SECOND) {
        second = ms / SECOND;
        ms -= second * SECOND;
    } else {
        if (result.length !== 0) {
            second = BigInt(0);
        }
    }
    if (second !== undefined) {
        result += pad2(second) + "s";
    }

    if (ms > 0 || result.length === 0) {
        if (ms < BigInt(10)) {
            result += "00" + ms;
        } else if (ms < BigInt(100)) {
            result += "0" + ms;
        } else {
            result += "" + ms;
        }
    }
    if (negative) {
        result = "-" + result;
    }
    return result;
}

/// Compute the expressions in the given QPS
function compute<TQps extends QuantumPerSecond>(
    exprs: (MsExpression | ERROR)[],
    qps: TQps,
): (TimeValue<TQps> | ERROR)[] {
    return exprs.map(function(input) {
        if (input === ERROR) {
            return input;
        }
        var resultInUnit = BigInt(0);
        for (let i = 0; i < input.length; i++) {
            resultInUnit += toQuantum(makeMs(input[i]), qps).val;
        }
        return makeQuantum(resultInUnit, qps);
    });
}
