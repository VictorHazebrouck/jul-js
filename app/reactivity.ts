import type {
    JulEffect,
    JulEffectCleanup,
    JulEffectTracker,
    JulState,
    StateKeyToListenersMap
} from "./types";

let jul_effect_tracker: JulEffectTracker | null = null;

export function create_jul_state(obj: Record<string, any>): JulState {
    const listeners: StateKeyToListenersMap = new Map();

    return new Proxy(obj, {
        set(target, key, new_value) {
            if (typeof key != "string") return;

            target[key] = new_value;
            listeners.get(key)?.forEach((jul_effect) => jul_effect());

            return target[key];
        },
        get(target, key) {
            if (typeof key != "string") return;

            if (jul_effect_tracker) {
                const lstn_for_key_set = listeners.get(key) || new Set();

                lstn_for_key_set.add(jul_effect_tracker[0]);
                jul_effect_tracker[1].add(lstn_for_key_set);

                listeners.set(key, lstn_for_key_set);
            }

            return target[key];
        }
    });
}

export function create_jul_effect(jul_effect: JulEffect): JulEffectCleanup {
    const tracker: JulEffectTracker = [jul_effect, new Set()];

    jul_effect_tracker = tracker;
    jul_effect();
    jul_effect_tracker = null;

    return () => {
        tracker[1].forEach((dep) => dep.delete(jul_effect));
    };
}
