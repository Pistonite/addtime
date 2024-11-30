import { calc, ratio } from "./time";

function isChecked(id: string) {
    return (document.getElementById(id) as HTMLInputElement).checked;
}

function valueOf(id: string) {
    return (document.getElementById(id) as HTMLInputElement).value;
}

function setTextArea(id: string, value: string) {
    (document.getElementById(id) as HTMLTextAreaElement).value = value;
}

/// Update the output and errors
function update() {
    const ratioMode = isChecked("ratio_mode_checkbox");
    const input = valueOf("input");

    var unit = BigInt(1000);
    if (isChecked("radio_unit_30")) {
        unit = BigInt(30);
    } else if (isChecked("radio_unit_60")) {
        unit = BigInt(60);
    }

    if (ratioMode) {
        const [a, b] = input.split("\n");
        if (!a || !b) {
            setTextArea("error", "Ratio mode requires two lines in input");
        }
        const answer = ratio(a, b, unit);
        if (typeof answer === "string") {
            setTextArea("error", answer);
            setTextArea("output", "There is an error");
        } else {
            setTextArea("output", answer * 100 + "%");
            setTextArea("error", "");
        }
    } else {
        const { answers, errors } = calc(input, unit);
        setTextArea("output", answers.join(",\n"));
        setTextArea("error", errors.join(",\n"));
    }
}

(window as any).__addtime_update = update;
