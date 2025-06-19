import { minify } from "terser";
import { file, build } from "bun";

// first pass, compile ts etc...
await build({
    entrypoints: ["./app/index.ts"],
    target: "browser",
    format: "esm",
    minify: true,
    sourcemap: "none",
    splitting: false,
    outdir: "_builds",
    naming: {
        entry: "index.js"
    }
});

// second pass, minify bundle as much as possible
const code = await file("./_builds/index.js").text();
const result = await minify(code, {
    compress: {
        toplevel: true,
        passes: 5,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        drop_console: true,
        dead_code: true,
        pure_getters: true,
        evaluate: true,
        hoist_funs: true,
        hoist_vars: true,
        collapse_vars: true,
        reduce_funcs: true,
        reduce_vars: true,
        booleans_as_integers: true
    },
    mangle: true
});
await Bun.write("./_builds/index.js", result.code);
