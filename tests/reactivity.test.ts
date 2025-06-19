import { describe, test, expect } from "bun:test";
import { create_jul_state, create_jul_effect } from "../app/reactivity";

describe("reactivity", () => {
    test("basic reactivity", () => {
        const user = { name: "John" };
        const user_state = create_jul_state(user);
        const results: string[] = [];

        // should push John on load
        const unsubscribe = create_jul_effect(() => {
            results.push(user_state.name);
        });

        // should push Jane on change
        user_state.name = "Jane";

        // unsub from user_state
        unsubscribe();

        // should not push Bruce on change
        user_state.name = "Bruce";

        expect(results).toEqual(["John", "Jane"]);
    });
});
