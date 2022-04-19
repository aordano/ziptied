import test from "ava";
import { EditableNode, Node, State, StatefulNode, Stream } from "./base";

// ============================
// ======= EditableNode =======
// ============================

// * GOALS:
// - Provide with reactivity to a regular HTMLElement.
// - The reactivity should be direct, meaning that the element should
// be able to directly modify itself when instructed to.
// - The element should be directly modifiable in all its capacity, meaning that
// all of its directly editable properties should be transformed.
// - The element should remain present in the DOM, only being modified and not
// supplanted entirely.
// - The element should be able to register side effects so when it's transformed,
//  it can trigger some consumer elsewhere to perform something else.

test("[Base] [EditableNode] Factory functionality", (t) => {
    // TODO
});

test("[Base] [EditableNode] Property setting", (t) => {
    // TODO
});

test("[Base] [EditableNode] Property unsetting", (t) => {
    // TODO
});

test("[Base] [EditableNode] Updating node", (t) => {
    // TODO
});

test("[Base] [EditableNode] Replacing node", (t) => {
    // TODO
});

test("[Base] [EditableNode] Attaching a side effect", (t) => {
    // TODO
});

test("[Base] [EditableNode] Detaching a side effect", (t) => {
    // TODO
});

test("[Base] [EditableNode] Reaching action lifecycle hook", (t) => {
    // TODO
});

test("[Base] [EditableNode] Reaching action error hook", (t) => {
    // TODO
});

test("[Base] [EditableNode] Reaching side effect lifecycle hook", (t) => {
    // TODO
});

test("[Base] [EditableNode] Reaching side effect error hook", (t) => {
    // TODO
});

// =====================
// ======= State =======
// =====================

// * GOALS:
// - Store data reactively and notify consumers when changes ocurr.
// - The data should be readily available for everyone who queries or consumes it.

test("[Base] [State] Factory functionality", (t) => {
    // TODO
});

test("[Base] [State] Updating state", (t) => {
    // TODO
});

test("[Base] [State] Consuming state changes", (t) => {
    // TODO
});

// ====================
// ======= Node =======
// ====================

// * GOALS:
// - Provide with reactivity to a regular HTMLElement.
// - The reactivity should be action-based, meaning that the element should
// register a set of recipes to perform when instructed to.
// - This recipes should take some data, do something, transform the element somehow,
// and return the modified element to be replaced in the DOM.
// - The element should be able to register side effects so when it's transformed
// by the recipes, it can trigger some consumer elsewhere to perform something else.
// - The recipes should be freely attachable and detachable to the element, being able
// to dynamically change the behavior it presents, even as a consequence of its own changes.
// - Any recipe executed on the element should be able to do something in response
// to errors.
// - Any recipe executed on the element should be able to do something when it's no longer
// needed and it has been detached from the element.

test("[Base] [Node] Factory functionality", (t) => {
    // TODO
});

test("[Base] [Node] Attaching action to node", (t) => {
    // TODO
});

test("[Base] [Node] Detaching action from node", (t) => {
    // TODO
});

test("[Base] [Node] Replacing node", (t) => {
    // TODO
});

test("[Base] [Node] Firing an action", (t) => {
    // TODO
});

test("[Base] [Node] Actions list contains all actions", (t) => {
    // TODO
});

test("[Base] [Node] Attaching side effect to node", (t) => {
    // TODO
});

test("[Base] [Node] Detaching side effect to node", (t) => {
    // TODO
});

test("[Base] [Node] Reaching action lifecycle hook", (t) => {
    // TODO
});

test("[Base] [Node] Reaching action error hook", (t) => {
    // TODO
});

test("[Base] [Node] Reaching side effect lifecycle hook", (t) => {
    // TODO
});

test("[Base] [Node] Reaching side effect error hook", (t) => {
    // TODO
});

// ============================
// ======= StatefulNode =======
// ============================

// * GOALS:
// - Do everything the regular reactive element can do, plus:
// - Provide each element with a state.
// - The state should be reactive as well, behaving like the stated goals of
// and instance of the previously defined State class.
// - The state should be easily readable, writable, and consumable, externally.
// - Side effects and some actions executed on this element should be aware of the
// current state and be able to read, consume or modify it.

test("[Base] [StatefulNode] Factory functionality", (t) => {
    // TODO
});

test("[Base] [StatefulNode] Retrieving its state", (t) => {
    // TODO
});

test("[Base] [StatefulNode] Retrieving the consumable state holder", (t) => {
    // TODO
});

test("[Base] [StatefulNode] Setting its state", (t) => {
    // TODO
});

test("[Base] [StatefulNode] Transforming its state", (t) => {
    // TODO
});

test("[Base] [StatefulNode] Attaching a stateful side effect", (t) => {
    // TODO
});

test("[Base] [StatefulNode] Detaching a stateful side effect", (t) => {
    // TODO
});

test("[Base] [StatefulNode] Firing a stateful side effect", (t) => {
    // TODO
});

// ======================
// ======= Stream =======
// ======================

// * GOALS:
// - Pool data reactively and notify consumers when something is added to the pool.
// - The data should be given to the consumer when the new element is added.

test("[Base] [Stream] Factory functionality", (t) => {
    // TODO
});

test("[Base] [Stream] Adding element to the pool", (t) => {
    // TODO
});

test("[Base] [Stream] Consuming additions", (t) => {
    // TODO
});
