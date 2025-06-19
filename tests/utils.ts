import { JSDOM } from "jsdom";
import { join } from "path";
import { file } from "bun";

const filePath = join(import.meta.dir, "../_builds/index.js");
const js = await file(filePath).text();

export function load_html(body: string) {
    const dom = new JSDOM(`<!doctype html><html lang="en"><head></head>${body}</html>`, {
        runScripts: "dangerously"
    });

    const script = dom.window.document.createElement("script");
    script.defer = true;
    script.type = "text/javascript";
    script.textContent = js;
    dom.window.document.head.appendChild(script);

    return dom;
}
