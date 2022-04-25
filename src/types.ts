/**
 * TODO
 *
 *
 *
 *
 *
 *
 * @module
 * @category Types
 */
import type { Node, State, StatefulNode } from "./base"
import { Observer, Subscription } from "rxjs"
import type { OmitProperties, WritableKeys } from "ts-essentials"

/**
 * TODO  -- Description placeholder
 * @date 4/22/2022 - 11:09:32 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {IntendedAny}
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IntendedAny = any

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {DirectlyEditableHTMLProps}
 *
 */ // eslint-disable-next-line @typescript-eslint/ban-types
export type DirectlyEditableHTMLProps = WritableKeys<OmitProperties<HTMLElement, object | Function>>

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {DirectlyEditableStyleProps}
 */
export type DirectlyEditableStyleProps = WritableKeys<HTMLElement["style"]>

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {NodeAction}
 * @template Payload
 */
export type NodeActionVoid<Payload> = (node: HTMLElement, payload?: Payload) => void

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {NodeAction}
 * @template Payload
 */
export type NodeAction<Payload> = (node: HTMLElement, payload?: Payload) => HTMLElement

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {NodeActionRequired}
 * @template Payload
 */
export type NodeActionRequired<Payload> = (node: HTMLElement, payload: Payload) => HTMLElement

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {NodeActionImpure}
 */
export type NodeActionImpure = (node: HTMLElement) => HTMLElement

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {NodeActionImpure}
 */
export type NodeActionEither<Payload> = NodeAction<Payload> | NodeActionImpure

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {NodeActionImpure}
 */
export type NodeActionVoidEither<Payload> =
  | NodeActionVoid<Payload>
  | NodeAction<Payload>
  | NodeActionImpure

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @interface NodeActionRef
 * @typedef {NodeActionRef}
 * @template Payload
 */
export interface NodeActionRef<Payload> {
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {string}
   */
  id: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {?Payload}
   */
  payload?: Payload
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {Transform}
 * @template Data
 */
export type Transform<Data> = (data: Data) => Data

// TODO Extend this adding metadata and stuff
/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {OnErrorHandler}
 */
export type OnErrorHandler = (error: Error) => void

// TODO Extend this adding metadata and stuff
/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {OnLifecycleHandler}
 */
export type OnLifecycleHandler = () => void

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {TextReplacerState}
 * @template Selector extends string
 * @template Corpus extends Record<Selector, Record<string, string>>
 */
export type TextReplacerState<
  Selector extends string,
  Corpus extends Record<Selector, Record<string, string>>
> = {
  selected: Selector
  corpus: Corpus
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @template Selector extends string
 * @template Container extends Record<Selector, unknown>
 * @param {unknown} key
 * @param {Container} container
 * @returns {key is Selector}
 */
export const isStringExtension = <
  Selector extends string,
  Container extends Record<Selector, unknown>
>(
  key: unknown,
  container: Container
): key is Selector => {
  return (key as Selector) in container ? true : false
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @type {{ ENOACTION: string; ENOELEMENT: string; ENOCOMPONENT: string; EEXISTSACTION: string; EEXISTSELEMENT: string; EEXISTSCOMPONENT: string; }}
 */
export const ZTComponentErrorDescriptions = {
  ENOACTION: "Action not found on element",
  ENOELEMENT: "Element not found in component",
  ENOCOMPONENT: "Component not found",
  EEXISTSACTION: "Action already exists on element",
  EEXISTSELEMENT: "Element already exists in component",
  EEXISTSCOMPONENT: "Component already exists"
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {ZTComponentErrorTypes}
 */
export type ZTComponentErrorTypes = keyof typeof ZTComponentErrorDescriptions

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @interface ZTComponentError
 * @typedef {ZTComponentError}
 * @template Template
 * @extends {Error}
 */
export interface ZTComponentError<Template> extends Error {
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {string}
   */
  component: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {ZTComponentErrorTypes}
   */
  errorType: ZTComponentErrorTypes
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {typeof ZTComponentErrorDescriptions[ZTComponentError<Template>["errorType"]]}
   */
  errorDescription: typeof ZTComponentErrorDescriptions[ZTComponentError<Template>["errorType"]]
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {string[]}
   */
  ids: string[]
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {Template}
   */
  template: Template
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {?string}
   */
  requestedId?: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {?string}
   */
  requestedAction?: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {?string}
   */
  requestedMethod?: string
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @interface ZTStatefulComponentError
 * @typedef {ZTStatefulComponentError}
 * @template Template
 * @extends {ZTComponentError<Template>}
 */
export interface ZTStatefulComponentError<Template> extends ZTComponentError<Template> {
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {?State<any>}
   */
  sharedState?: State<IntendedAny>
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {?State<any>}
   */
  localState?: State<IntendedAny>
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @typedef {ZTComponentErrorEither}
 * @template NodeType
 * @template Template
 */
export type ZTComponentErrorEither<NodeType, Template> = NodeType extends StatefulNode
  ? ZTStatefulComponentError<Template>
  : ZTComponentError<Template>

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 * @author Ágata Ordano
 *
 * @export
 * @interface IBaseComponentTemplate
 * @typedef {IBaseComponentTemplate}
 * @template NodeType extends Node
 */
export interface IBaseComponentTemplate<NodeType extends Node> {
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {string}
   */
  name: string

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @type {string[]}
   */
  ids: string[]

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} id
   */
  actionsListOf(id: string): void

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} actionId
   * @param {NodeAction<any>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  addAction(
    actionId: string,
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ): void

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} actionId
   * @returns {((ZTComponentErrorEither<NodeType, this> | false)[])}
   */
  removeAction(actionId: string): (ZTComponentErrorEither<NodeType, this> | false)[]

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} actionId
   * @param {?unknown} [payload]
   * @returns {((ZTComponentErrorEither<NodeType, this> | false)[])}
   */
  fireAction(
    actionId: string,
    payload?: unknown
  ): (ZTComponentErrorEither<NodeType, this> | false)[]

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {Partial<Observer<HTMLElement>>} observer
   * @returns {Subscription[]}
   */
  sideEffect(observer: Partial<Observer<HTMLElement>>): Subscription[]

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} actionId
   * @param {string} elementId
   * @param {NodeAction<any>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   * @returns {(void | ZTComponentErrorEither<NodeType, this>)}
   */
  addActionFor(
    actionId: string,
    elementId: string,
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ): void | ZTComponentErrorEither<NodeType, this>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} actionId
   * @param {string} elementId
   * @returns {(void | ZTComponentErrorEither<NodeType, this>)}
   */
  removeActionFrom(
    actionId: string,
    elementId: string
  ): void | ZTComponentErrorEither<NodeType, this>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} actionId
   * @param {string} elementId
   * @param {?unknown} [payload]
   * @returns {(void | ZTComponentErrorEither<NodeType, this>)}
   */
  fireActionFor(
    actionId: string,
    elementId: string,
    payload?: unknown
  ): void | ZTComponentErrorEither<NodeType, this>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   * @author Ágata Ordano
   *
   * @param {string} elementId
   * @param {Partial<Observer<HTMLElement>>} observer
   * @returns {(Subscription[] | ZTComponentErrorEither<NodeType, this>)}
   */
  sideEffectFor(
    elementId: string,
    observer: Partial<Observer<HTMLElement>>
  ): Subscription[] | ZTComponentErrorEither<NodeType, this>
}
