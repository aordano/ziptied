import test from "ava";
import { ActiveEvent, MediaQuery, WidthQuery } from "./events";

// ===========================
// ======= ActiveEvent =======
// ===========================

// * GOALS:
// - Link the state/reactive nature of this framework to the
// event-based things that might be functioning elsewhere

test("[Events] [ActiveEvent] Factory functionality", (t) => {
    // TODO
});

test("[Events] [ActiveEvent] Fire on event", (t) => {
    // TODO
});

test("[Events] [ActiveEvent] Consume event firings", (t) => {
    // TODO
});

test("[Events] [ActiveEvent] Detach from event firings", (t) => {
    // TODO
});

// =================================
// ======= ActiveCustomEvent =======
// =================================
// TODO Implement class

// * GOALS:
// - Link the state/reactive nature of this framework to the event-based things that
// might be functioning elsewhere (this time for custom events)

test("[Events] [ActiveCustomEvent] Factory functionality", (t) => {
    // TODO
});

test("[Events] [ActiveCustomEvent] Handle custom event data", (t) => {
    // TODO
});

test("[Events] [ActiveCustomEvent] Fire on event", (t) => {
    // TODO
});

test("[Events] [ActiveCustomEvent] Consume event firings", (t) => {
    // TODO
});

test("[Events] [ActiveCustomEvent] Detach from event firings", (t) => {
    // TODO
});

// ==========================
// ======= MediaQuery =======
// ==========================

// * GOALS:
// - Link the state/reactive nature of this framework to any changes present
// in the window media.

test("[Events] [MediaQuery] Factory functionality", (t) => {
    // TODO
});

test("[Events] [MediaQuery] Fire on media change", (t) => {
    // TODO
});

test("[Events] [MediaQuery] Consume media change firings", (t) => {
    // TODO
});

test("[Events] [MediaQuery] Detach from media change firings", (t) => {
    // TODO
});

// ==========================
// ======= WidthQuery =======
// ==========================

// * GOALS:
// - Syntactic sugar for MediaQuery
// - Therefore should do everything MediaQuery does, but only for window width changes

test("[Events] [WidthQuery] Factory functionality", (t) => {
    // TODO
});
