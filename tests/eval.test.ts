import { describe, test, expect } from "bun:test";
import { eval_expr } from "../app/eval";

describe("reactivity", () => {
    test("basic eval", () => {
        const result = eval_expr(`{name: "Jo" + "hn", age: 9+9}`, []);

        expect(result).toEqual({ name: "John", age: 18 });
    });
});
