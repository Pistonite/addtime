// E2E testing for app script

function testEq(a, b) {
    if (a !== b) {
        throw new Error(`Expected ${a} to equal ${b}`);
    }
}

testEq(ADDTIME([["1m20s", "2m40s"]]), "04m00s");
testEq(SUBTIME("1m20s", "30s"), "50s");
testEq(DIVTIME("1m", "01m20s"), 0.75);

console.log("All tests passed!");
