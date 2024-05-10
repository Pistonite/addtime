import { describe, expect, test } from "bun:test";
import {
    makeMs,
    makeQuantum,
    tokenize,
    toMilliseconds,
    toQuantum,
} from "./time.ts";

test("should convert between 30fps and milliseconds", () => {
    let frame = BigInt(0);
    const adds = [BigInt(33), BigInt(34), BigInt(33)];
    for (let ms = BigInt(0); ms < BigInt(1000); ) {
        for (let i = 0; i < adds.length; i++) {
            const msValue = makeMs(ms);
            const frameValue = makeQuantum(frame, BigInt(30));
            expect(toQuantum(msValue, BigInt(30))).toEqual(frameValue);
            expect(toMilliseconds(frameValue)).toEqual(msValue);

            ms += adds[i];
            frame++;
        }
    }
});

describe("tokenize", () => {
    test("empty", () => {
        expect(tokenize("")).toEqual([]);
    });
    test("simple", () => {
        expect(tokenize("30h")).toEqual(["30", "h"]);
    });
    test("expression", () => {
        expect(tokenize("30h 12m + 2s300")).toEqual([
            "30",
            "h",
            "12",
            "m",
            "+",
            "2",
            "s",
            "300",
        ]);
    });
    test("multiple expressions", () => {
        expect(tokenize("30h- 12m+ 2s300, asdfasdf")).toEqual([
            "30",
            "h",
            "-",
            "12",
            "m",
            "+",
            "2",
            "s",
            "300",
            ",",
            "a",
            "s",
            "d",
            "fa",
            "s",
            "d",
            "f",
        ]);
    });
});
