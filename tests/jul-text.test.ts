import { describe, test, expect } from "bun:test";
import { load_html } from "./utils";

describe("jul", () => {
    test("jul-text", async () => {
        const dom = load_html(`
            <body>
                <div jul-state="{name: 'John'}">
                    <p id="name" jul-text="name">aaaa</p>
                    <button id="button" jul-on:click="name = 'Jane'">changename</button>
                </div>
            </body>
        `);

        const document = dom.window.document;
        await new Promise((resolve) => dom.window.addEventListener("load", resolve));

        const name_p = document.getElementById("name");
        expect(name_p.textContent).toBe("John");

        const button = document.getElementById("button");
        button.click();

        expect(name_p.textContent).toBe("Jane");
    });

    test("jul-text-nested", async () => {
        const dom = load_html(`
            <body jul-state="{name: 'Outer'}">
                <div jul-state="{name: 'John'}">
                    <p id="name" jul-text="name"></p>
                    <button id="button" jul-on:click="name = 'Jane'">changename</button>
                </div>
                <p id="name-outer" jul-text="name"></p>
            </body>
        `);

        const document = dom.window.document;
        await new Promise((resolve) => dom.window.addEventListener("load", resolve));

        const name_p = document.getElementById("name");
        expect(name_p.textContent).toBe("John");

        const button = document.getElementById("button");
        button.click();

        expect(name_p.textContent).toBe("Jane");

        // shadowing does not mutate outer scope;
        const name_outer_p = document.getElementById("name-outer");
        expect(name_outer_p.textContent).toBe("Outer");
    });
});
