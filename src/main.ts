import { calc } from "./time";

/// Update the output and errors
function update() {
    const input = (document.getElementById("input") as HTMLInputElement).value;
    var unit = BigInt(1000);
    if (
        (document.getElementById("radio_unit_30") as HTMLInputElement).checked
    ) {
        unit = BigInt(30);
    } else if (
        (document.getElementById("radio_unit_60") as HTMLInputElement).checked
    ) {
        unit = BigInt(60);
    }
    const { answers, errors } = calc(input, unit);
    (document.getElementById("output") as HTMLTextAreaElement).value =
        answers.join(",\n");
    (document.getElementById("error") as HTMLTextAreaElement).value =
        errors.join(",\n");
}

(window as any).__addtime_update = update;
