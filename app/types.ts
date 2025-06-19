/**
 * Reactive Proxy object, no nesting, only reactive at root, for arrays/objects,
 * reassign entire property with a new reference like react useState.
 */
export type JulState = Record<string, any>;

/**
 * Stack of JulStates, each reactive node holds its own version of it. Thus,
 * we must always return new array on each parse. (new array but same JulState
 * references)
 */
export type JulCtx = JulState[];

/**
 * An effect function, ran once on init to build up dependencies, gets added
 * to internal JulState as dependency, then called each time a set action is
 * detected on said JulState.
 */
export type JulEffect = () => void;

/**
 * Holds a set of JulEffect function references.
 */
export type ListenersReferenceSet = Set<JulEffect>;

/**
 * Maps out JulState key names to ListenersReferenceSet, allowing for fine
 * grained reactivity.
 */
export type StateKeyToListenersMap = Map<string, ListenersReferenceSet>;

/**
 * Used for bootstraping dependency tracking.
 * - The first element of the "tuple" is captured by a JulState and added to
 * its internal dependencies, called each time the dependency changes.
 * - The second element is for cleanup, whenever a node containing a JulEffect
 * leaves the dom, its effect needs to be removed from the associated JulState
 * 's internals. To achive this we pass back to the JulEffectTracker all the
 * ListenersReferenceSet the effect was just bound to. This way we can easily
 * cleanup the effect later on.
 */
export type JulEffectTracker = [JulEffect, Set<ListenersReferenceSet>];

/**
 * For cleaning up a JulEffect function. Removes its associated JulEffect
 * from JulState dependencies gotten via {@link JulEffectTracker}
 */
export type JulEffectCleanup = () => void;

export type Callback = () => void;
