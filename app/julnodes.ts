import { eval_expr } from "./eval";
import { create_jul_effect, create_jul_state } from "./reactivity";
import type { Callback, JulCtx, JulEffectCleanup } from "./types";

const jul_elems_map = new Map<HTMLElement, JulCtx>();
const jul_on_node_removed = new Map<HTMLElement, Callback>();

export function handle_jul_node(node: HTMLElement, jul_ctx: JulCtx): JulCtx {
    if (jul_elems_map.get(node)) {
        return jul_elems_map.get(node);
    }

    const state = node.getAttribute("jul-state");
    const effect = node.getAttribute("jul-effect");
    const text = node.getAttribute("jul-text");
    const show = node.getAttribute("jul-show");
    const model = node.getAttribute("jul-model");
    const forattr = node.getAttribute("jul-for");

    const attributes = [...node.attributes];
    const jul_ons = attributes.filter((a) => a.name.split(":")[0] == "jul-on");
    const jul_binds = attributes.filter((a) => a.name.split(":")[0] == "jul-bind");

    const new_jul_ctx = [...jul_ctx];
    const cleanups: JulEffectCleanup[] = [];

    if (state) {
        const eval_state = eval_expr(state, new_jul_ctx);
        const proxy_state = create_jul_state(eval_state);
        new_jul_ctx.unshift(proxy_state);
    }

    if (forattr) {
        let prev: HTMLElement[] = [];
        cleanups.push(
            create_jul_effect(() => {
                prev.forEach((el) => el.remove());
                prev = [];
                const arr = eval_expr(forattr, new_jul_ctx) as any[];
                arr.forEach((_, i) => {
                    // @ts-expect-error
                    const el = node.content.children[0].cloneNode();
                    const loop_jul_ctx = [{ i }, ...new_jul_ctx];

                    handle_jul_node(el, loop_jul_ctx);

                    node.parentNode!.appendChild(el);
                    prev.push(el);
                });
            })
        );
    }

    jul_ons.forEach((attr) => {
        const event = attr.name.split(":")[1];
        node.addEventListener(event, () => eval_expr(attr.value, new_jul_ctx));
    });

    jul_binds.forEach((attr) => {
        const prop = attr.name.split(":")[1];

        if (prop == "class") {
            const original_classes = node.className;
            cleanups.push(
                create_jul_effect(() => {
                    node.className = `${original_classes} ${eval_expr(attr.value, new_jul_ctx)}`;
                })
            );
        } else {
            cleanups.push(
                create_jul_effect(() => {
                    Object.assign(node[prop], eval_expr(attr.value, new_jul_ctx));
                })
            );
        }
    });

    if (text) {
        cleanups.push(
            create_jul_effect(() => {
                node.textContent = eval_expr(text, new_jul_ctx);
            })
        );
    }

    if (effect) {
        cleanups.push(
            create_jul_effect(() => {
                eval_expr(effect, new_jul_ctx);
            })
        );
    }

    if (show) {
        cleanups.push(
            create_jul_effect(() => {
                const original_display = node.style.display;
                const should_show = eval_expr(show, new_jul_ctx);
                if (!should_show) {
                    node.style.display = "none";
                } else {
                    node.style.display = original_display;
                }
            })
        );
    }

    if (model) {
        cleanups.push(
            create_jul_effect(() => {
                (node as HTMLInputElement).value = eval_expr(model, new_jul_ctx);
            })
        );

        node.addEventListener("input", (e) => {
            //@ts-expect-error
            eval_expr(`${model} = '${e.target.value}'`, new_jul_ctx);
        });
    }

    jul_elems_map.set(node, new_jul_ctx);
    jul_on_node_removed.set(node, () => {
        cleanups.forEach((cleanup) => cleanup());
        jul_elems_map.delete(node);
        jul_on_node_removed.delete(node);
    });

    return new_jul_ctx;
}

export function traverse_dom(node: HTMLElement = document.body, jul_ctx: JulCtx = []) {
    const new_ctx = handle_jul_node(node, jul_ctx);

    for (let i = 0; i < node.children.length; i++) {
        traverse_dom(node.children[i] as HTMLElement, new_ctx);
    }
}

export function observatinator() {
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1) {
                    traverse_dom();
                }
            }
            for (const node of m.removedNodes) {
                if (node.nodeType === 1) {
                    jul_on_node_removed.get(node as HTMLElement)?.();
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
