// Run: node src/lib/tokenize.test.js
import assert from "node:assert/strict";
import { tokenize } from "./tokenize.js";

assert.deepEqual(tokenize("plain"), [{ t: "plain" }]);
assert.deepEqual(tokenize("a **b** c `d`"), [{ t: "a " }, { b: "b" }, { t: " c " }, { c: "d" }]);
assert.deepEqual(tokenize("2 ** 3 and a lone ` tick"), [{ t: "2 ** 3 and a lone ` tick" }]);
assert.deepEqual(tokenize("`a*b`"), [{ c: "a*b" }]);
assert.deepEqual(tokenize("an *indirection layer* here"), [{ t: "an " }, { i: "indirection layer" }, { t: " here" }]);
assert.deepEqual(tokenize("2 * 3 * 4"), [{ t: "2 * 3 * 4" }]);
console.log("tokenize ok");
