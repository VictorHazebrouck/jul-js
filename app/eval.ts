import { JulCtx } from "./types";

export function eval_expr(expr: string, scope: JulCtx): any {
    const apply_scope = (content: string) => {
        return new Function(
            ...scope.map((_, i) => `_s${i}`),
            scope.reduce((acc, _, i) => `with(_s${i}){${acc}}`, `return(()=>${content})()`)
        )(...scope);
    };

    try {
        return apply_scope(`(${expr})`);
    } catch (_) {
        return apply_scope(`{${expr}}`);
    }
}
