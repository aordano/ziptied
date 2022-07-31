/**
 * ## Actions Module
 *
 * This module contains generic, default actions that will be embedded into every reactive
 * node and component ever initialized. This provides handy, pre-made ways to manipulate
 * the DOM, state or arbitrary data.
 *
 * TODO Add way to initialize a component or node without loading the default actions
 *
 *
 *
 * @module
 */

import { IntendedAny, NodeActionVoidEither } from "./types"

/**
 * ## Arbitrarily set value
 *
 * Use this function (it's the identity function) to set an arbitrary value while
 * preserving the type.
 *
 * ---
 *
 * @date 4/19/2022 - 12:18:05 PM
 *
 * @template UnregisteredState Type of the state to set.
 * @param {UnregisteredState} value Value to set.
 * @returns {UnregisteredState}
 */
const arbitrarySet = <UnregisteredState>(value: UnregisteredState): UnregisteredState => {
  return value
}

/**
 * ## Arbitrarily transform value
 *
 * Use this function to mutate the value while preserving the type.
 *
 * The transform function should preserve the origin type.
 *
 * ---
 *
 * @date 4/19/2022 - 12:18:05 PM
 *
 * @template UnregisteredState Type of the state to mutate.
 * @param {UnregisteredState} value Value to mutate.
 * @param {(value: UnregisteredState) => UnregisteredState} transform Transformation function.
 * @returns {UnregisteredState}
 */
const arbitraryTransform = <UnregisteredState>(
  value: UnregisteredState,
  transform: (value: UnregisteredState) => UnregisteredState
): UnregisteredState => {
  return transform(value)
}

/**
 * ## Mutation and state handling primitives
 *
 * These are primitive actions designed to handle any state or element mutation.
 *
 * They should be preferred over directly modifying or adding custom actions if possible.
 *
 * ---
 *
 * @date 4/19/2022 - 12:18:05 PM
 *
 * @param arbitrarySet {@link arbitrarySet}
 * @param arbitraryTransform {@link arbitraryTransform}
 */
export const PrimitiveActions = {
  arbitrarySet,
  arbitraryTransform
}

/**
 * ## NodeActions
 *
 * These are actions designed to handle basic {@link HTMLElement} editable properties.
 *
 * Each action is a function that takes the element to be modified as its first, mandatory
 * argument, and an optional second argument with arbitrary data to employ in the mutation.
 *
 * They should be preferred over directly modifying them.
 *
 * ---
 *
 *
 * @date 4/19/2022 - 12:18:05 PM
 *
 * @type {Record<string,  (node: HTMLElement, payload?: IntendedAny) => HTMLElement>}
 */
export const NodeActions: Record<string, NodeActionVoidEither<IntendedAny>> = {
  /**
   * ## Action: Mutate innerHTML
   *
   * ---
   *
   * @param node Node to edit
   * @param payload String to replace the current innerHTML with
   * @returns {HTMLElement}
   */
  innerHTML: (node: HTMLElement, payload: string) => {
    node.innerHTML = payload
    return node
  },
  /**
   * ## Action: Mutate opacity
   *
   * ---
   *
   * @param node Node to edit
   * @param payload New opacity to apply to the node
   * @returns {HTMLElement}
   */
  opacity: (node: HTMLElement, payload: number) => {
    node.style.opacity = payload.toString()
    return node
  },
  /**
   * ## Action: Apply CSS transform
   *
   * ---
   *
   * @param node Node to edit
   * @param payload String with the CSS transform to apply to the node
   * @returns {HTMLElement}
   */
  transform: (node: HTMLElement, payload: string) => {
    node.style.transform = payload
    return node
  },
  /**
   * ## Action: Append child to node
   *
   * ---
   *
   * @param node Node to edit
   * @param param1 Child(s) to append to the node
   * @returns {HTMLElement}
   */
  appendChild: (node: HTMLElement, ...[payload]: HTMLElement[]) => {
    node.append(payload)
    return node
  },
  /**
   * ## Action: Append sibling to node
   *
   * ---
   *
   * @param node Node to edit
   * @param payload Record containing the sibling insertion information
   * @param payload.element Sibling to append
   * @param payload.placement String describing the placement of the sibling
   * @returns {HTMLElement}
   */
  appendSibling: (
    node: HTMLElement,
    payload: {
      element: HTMLElement
      placement: InsertPosition
    }
  ) => {
    node.insertAdjacentElement(payload.placement, payload.element)
    return node
  },
  /**
   * ## Action: Replace node
   *
   * ---
   *
   * @param node Node to edit
   * @param payload New element to put instead of the current one
   * @returns {HTMLElement}
   */
  replace: (node: HTMLElement, payload: HTMLElement) => {
    return payload
  },
  /**
   * ## Action: Remove node
   *
   * ---
   *
   * @param node Node to remove
   * @returns {void}
   */
  remove: (node: HTMLElement): void => {
    node.remove()
  }
}
