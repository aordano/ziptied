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
import type { ActiveEvent, BreakpointQuery, MediaQuery, TypeQuery, WidthQuery } from "./events"
import type { Builtin, OmitProperties, Writable, WritableKeys } from "ts-essentials"
import { Component, DeepStatefulComponent, StatefulComponent } from "./component"
import { DataReplacerSelector, DataReplacerTarget } from "./builtin"
import type {
  EditableNode,
  Node,
  State,
  StatefulNode,
  Stream,
  UnregisteredState,
  UnregisteredStream
} from "./base"
import { Observer, Subscription } from "rxjs"
import UAParser, { UAParserInstance } from "ua-parser-js"

declare global {
  interface Window {
    __ZT: ZT | undefined
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/22/2022 - 11:09:32 PM
 *
 * @export
 * @typedef {IntendedAny}
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IntendedAny = any

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {DirectlyEditableHTMLProps}
 *
 */ // eslint-disable-next-line @typescript-eslint/ban-types
export type DirectlyEditableHTMLProps = WritableKeys<OmitProperties<HTMLElement, object | Function>>

export type EditableHTMLElement = Writable<HTMLElement>

export type EditableHTMLProp = HTMLElement[DirectlyEditableHTMLProps]

export const isDirectlyEditableHTMLProp = (prop: string): prop is DirectlyEditableHTMLProps => {
  const dummyElement = {} as HTMLElement
  const dummyPropList = Object.keys(dummyElement) as DirectlyEditableHTMLProps[]
  return dummyPropList.indexOf(prop as DirectlyEditableHTMLProps) !== -1
}
/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {HTMLProps}
 *
 */ // eslint-disable-next-line @typescript-eslint/ban-types
export type HTMLProps = keyof OmitProperties<HTMLElement, Function>

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {DirectlyEditableStyleProps}
 */
export type DirectlyEditableStyleProps = WritableKeys<HTMLElement["style"]>

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {NodeAction}
 * @template Payload
 */
export type NodeActionVoid<Payload> = (node: HTMLElement, payload?: Payload) => void

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {NodeAction}
 * @template Payload
 */
export type NodeAction<Payload> = (node: HTMLElement, payload?: Payload) => HTMLElement

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {NodeActionRequired}
 * @template Payload
 */
export type NodeActionRequired<Payload> = (node: HTMLElement, payload: Payload) => HTMLElement

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {NodeActionImpure}
 */
export type NodeActionImpure = (node: HTMLElement) => HTMLElement

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {NodeActionImpure}
 */
export type NodeActionEither<Payload> = NodeAction<Payload> | NodeActionImpure

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
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
   *
   * @type {string}
   */
  id: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {?Payload}
   */
  payload?: Payload
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
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
 *
 * @export
 * @typedef {OnErrorHandler}
 */
export type OnErrorHandler = (error: Error) => void

// TODO Extend this adding metadata and stuff
/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
 *
 * @export
 * @typedef {OnLifecycleHandler}
 */
export type OnLifecycleHandler = () => void

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
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
 *
 * @export
 * @typedef {DataReplacerState}
 * @template Selector extends string
 * @template Corpus extends Record<Selector, Record<string, string>>
 */
export type DataReplacerState<
  Selector extends string,
  Corpus extends Record<Selector, Record<string, unknown>>
> = {
  selected: Selector
  corpus: Corpus
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
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
 *
 * @export
 * @typedef {ZTComponentErrorTypes}
 */
export type ZTComponentErrorTypes = keyof typeof ZTComponentErrorDescriptions

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
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
   *
   * @type {string}
   */
  component: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {ZTComponentErrorTypes}
   */
  errorType: ZTComponentErrorTypes
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {typeof ZTComponentErrorDescriptions[ZTComponentError<Template>["errorType"]]}
   */
  errorDescription: typeof ZTComponentErrorDescriptions[ZTComponentError<Template>["errorType"]]
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {string[]}
   */
  ids: string[]
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {Template}
   */
  template: Template
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {?string}
   */
  requestedId?: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {?string}
   */
  requestedAction?: string
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {?string}
   */
  requestedMethod?: string
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
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
   *
   * @type {?UnregisteredState<any>}
   */
  sharedState?: UnregisteredState<IntendedAny>
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {?UnregisteredState<any>}
   */
  localState?: UnregisteredState<IntendedAny>
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:18:36 PM
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
   *
   * @type {string}
   */
  name: string

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @type {string[]}
   */
  ids: string[]

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
   *
   * @param {string} id
   */
  actionsListOf(id: string): void

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
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
   *
   * @param {string} actionId
   * @returns {((ZTComponentErrorEither<NodeType, this> | false)[])}
   */
  removeAction(actionId: string): (ZTComponentErrorEither<NodeType, this> | false)[]

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
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
   *
   * @param {Partial<Observer<HTMLElement>>} observer
   * @returns {Subscription[]}
   */
  sideEffect(observer: Partial<Observer<HTMLElement>>): Subscription[]

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:18:36 PM
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
export type ZTDataSelector = string
export type ZTDataCorpus = Record<ZTDataSelector, Record<string, unknown>>
export type ZTDataDictionary = DataReplacerState<ZTDataSelector, ZTDataCorpus>

export type ZTNodeVariants = EditableNode | Node | StatefulNode
export type ZTQueryVariants =
  | MediaQuery
  | WidthQuery
  | TypeQuery
  | BreakpointQuery<BaseUIMediaStateDefaultBreakpointsZT>
export type ZTEventVariants = ActiveEvent<unknown, unknown>
export type ZTGenericComponentVariants =
  | Component
  | StatefulComponent<unknown>
  | DeepStatefulComponent<unknown>
export type ZTBuiltinComponentVarints = DataReplacerSelector | DataReplacerTarget

export enum ComponentTypes {
  Component = "Component",
  StatefulComponent = "StatefulComponent",
  DeepStatefulComponent = "DeepStatefulComponent",
  BaseComponent = "BaseComponent",
  DataReplacerTarget = "DataReplacerTarget",
  DataReplacerSelector = "DataReplacerSelector"
}

export class ComponentGuard {
  static isComponent(component: IntendedAny): component is Component {
    return component.type === ComponentTypes.Component
  }
  static isStatefulComponent<T>(
    component: IntendedAny,
    state: IntendedAny
  ): component is StatefulComponent<T> {
    return (
      component.type === ComponentTypes.StatefulComponent &&
      Object.getOwnPropertyDescriptors((component as StatefulComponent<T>).sharedState) ===
        Object.getOwnPropertyDescriptors(state)
    )
  }
  static isDeepStatefulComponent<T>(
    component: IntendedAny,
    state: IntendedAny
  ): component is DeepStatefulComponent<T> {
    return (
      component.type === ComponentTypes.DeepStatefulComponent &&
      Object.getOwnPropertyDescriptors((component as DeepStatefulComponent<T>).sharedState) ===
        Object.getOwnPropertyDescriptors(state)
    )
  }
  static isDataReplacerTarget(component: IntendedAny): component is DataReplacerTarget {
    return component.type === ComponentTypes.DataReplacerTarget
  }
  static isDataReplacerSelector(component: IntendedAny): component is DataReplacerSelector {
    return component.type === ComponentTypes.DataReplacerSelector
  }
}

export type BaseUIMediaStateBreakpointVariantsZT = "sm" | "md" | "lg" | "xl" | "xxl"
export type BaseUIMediaStateTypesVariantsZT =
  | "all"
  | "braille"
  | "embossed"
  | "hadnheld"
  | "print"
  | "projection"
  | "screen"
  | "speech"
  | "tty"
  | "tv"

export interface BaseUIMediaStateDefaultBreakpointsZT extends Record<string, WidthQuery> {
  sm: WidthQuery
  md: WidthQuery
  lg: WidthQuery
  xl: WidthQuery
  xxl: WidthQuery
}

type ExtendedEventTarget<Target> = Target & EventTarget

export interface ArbitraryEvent<Target> extends Event, MouseEvent {
  target: ExtendedEventTarget<Target>
}

// TODO implement media tech
export interface BaseUIMediaStateZT {
  type: TypeQuery
  breakpoint: BreakpointQuery<BaseUIMediaStateDefaultBreakpointsZT>
  width: ActiveEvent<Window, number>
  height: ActiveEvent<Window, number>
  userAgent: UAParser.IResult
  cursorPosition: ActiveEvent<Window, { x: number; y: number }>
  cursorOverElement: ActiveEvent<Window, Element | null>
}

export interface BaseUIStateZT {
  media: BaseUIMediaStateZT
  events?: Record<string, ZTEventVariants>
  _userProvided?: Record<
    string,
    ZTQueryVariants | ZTEventVariants | State<unknown> | Stream<unknown>
  >
}

export interface ZT {
  UI: BaseUIStateZT
  state: Record<string, BaseStateZT>
}

export enum EntryTypesZT {
  state = "state",
  UI = "UI",
  node = "node",
  component = "component"
}

export interface BaseStateZT extends Record<string, unknown> {
  components: Record<
    string,
    | DataReplacerTarget
    | DataReplacerSelector
    | DeepStatefulComponent<unknown>
    | StatefulComponent<unknown>
    | Component
    | undefined
  >
  nodes: Record<string, ZTNodeVariants>
  state: Record<string, Stream<unknown> | State<unknown>>
}
