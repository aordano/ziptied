/**
 * TODO
 *
 *
 *
 *
 *
 *
 * @module
 */

import { NodeAction } from "./types";

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:05 PM
 * @author Ágata Ordano
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
const arbitrarySet = <T>(value: T): T => {
    return value;
};

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:05 PM
 * @author Ágata Ordano
 *
 * @template T
 * @param {T} value
 * @param {(value: T) => T} transform
 * @returns {T}
 */
const arbitraryTransform = <T>(value: T, transform: (value: T) => T): T => {
    return transform(value);
};

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:05 PM
 * @author Ágata Ordano
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
const identity = <T>(value: T): T => value;

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:05 PM
 * @author Ágata Ordano
 *
 * @type {{ arbitrarySet: <T>(value: T) => T; arbitraryTransform: <T>(value: T, transform: (value: T) => T) => T; identity: <T>(value: T) => T; }}
 */
export const Primitives = {
    arbitrarySet,
    arbitraryTransform,
    identity,
};

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:05 PM
 * @author Ágata Ordano
 *
 * @type {Record<string, NodeAction<any>>}
 */
export const Nodes: Record<string, NodeAction<any>> = {
    innerHTML: (node: HTMLElement, payload: string) => {
        node.innerHTML = payload;
        return node;
    },
    opacity: (node: HTMLElement, payload: number) => {
        node.style.opacity = payload.toString();
        return node;
    },
    transform: (node: HTMLElement, payload: string) => {
        node.style.transform = payload;
        return node;
    },
    appendChild: (node: HTMLElement, ...[payload]: HTMLElement[]) => {
        node.append(payload);
        return node;
    },
    appendSibling: (
        node: HTMLElement,
        payload: {
            element: HTMLElement;
            placement: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
        }
    ) => {
        node.insertAdjacentElement(payload.placement, payload.element);
        return node;
    },
    replace: (node: HTMLElement, payload: HTMLElement) => {
        return payload;
    },
    remove: (node: HTMLElement) => {
        node.remove();
        return document.createElement("span");
    },
};
