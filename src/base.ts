/**
 * Base classes to handle reactivity, state and HTML Elements.
 *
 *
 * @module
 * @category Basic Reactive Blocks
 */

import { BehaviorSubject, Observer, Subject, Subscription, map } from "rxjs"
import type {
  DirectlyEditableHTMLProps,
  IntendedAny,
  NodeAction,
  NodeActionRef,
  NodeActionVoidEither,
  OnErrorHandler,
  OnLifecycleHandler,
  Transform
} from "./types"
import { NodeActions } from "./actions"

/**
 * ## EditableNode
 *
 * The editable node represents a reactive HTMLElement present in the DOM, able to
 * be directly mutated. The mutations pertain to the editable properties of the element.
 *
 * The editable properties are all those that can be written to; {@link DirectlyEditableHTMLProps}
 * TODO Fix
 * ---
 *
 * ### Usage
 *
 * EditableNodes are indexed by element id, so they ought to be unique.
 *
 * Original markup:
 *
 * ```html
 * <p id="example">Placeholder</p>
 * ```
 *
 * Added code:
 *
 * ```typescript
 * const exampleEditableNode = new EditableNode("example");
 *
 * exampleEditableNode.setProperty("textContent", "Some Text");
 * ```
 *
 * Resulting markup:
 *
 * ```html
 * <p id="example">Some Text</p>
 * ```
 *
 * ---
 *
 *
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class EditableNode
 * @typedef {EditableNode}
 * @template EditableHTMLProp This generic extends HTMLElement[DirectlyEditableHTMLProps]
 * @category Reactive Elements
 */
export class EditableNode<EditableHTMLProp extends HTMLElement[DirectlyEditableHTMLProps]> {
  /**
   * ## Creates an instance of EditableNode.
   *
   * @constructor
   * @param {string} id Id of the element to target as EditableNode
   *
   * ---
   *
   * ### Usage
   *
   * ```typescript
   * const exampleEditableNode = new EditableNode("example");
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   */
  constructor(public id: string, public readonly initialState?: EditableHTMLProp) {
    this._subscriptions = {}
    this._transforms = {}
    this._state = {}
  }

  /**
   * ## Subscriptions
   *
   * This property contains the subscriptions that track all changes to the
   * element properties.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track the subscriptions.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, Subscription>}
   */
  protected _subscriptions: Record<string, Subscription>

  /**
   * ## State
   *
   * This property contains the Subject that handles the updates and changes
   * to the current state of the element.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track the subscriptions.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, BehaviorSubject<EditableHTMLProp>>}
   */
  protected _state: Record<string, BehaviorSubject<EditableHTMLProp>>

  /**
   * ## Transforms
   *
   * This property contains all the registered transforms to invoke when needed by the
   * property modification methods.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track the transforms.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {(Record<string, Transform<EditableHTMLProp> | undefined>)}
   */
  protected _transforms: Record<string, Transform<EditableHTMLProp> | undefined>

  /**
   * ## Set Direct Property Observer
   *
   * This method subscribes to the given property, and applies the given transform
   * when the subscription is executed.
   *
   * @protected
   * @param {DirectlyEditableHTMLProps} nodeProperty Property to track and transform
   * @param {Transform<EditableHTMLProp>} transform  Transform function to mutate the property
   * @param {?boolean} failSilently Flag to choose if throwing on indexing errors (property
   * already being tracked or inexistent node)
   * @param {?Observer<EditableHTMLProp>["error"]} onError Callback to execute on error during
   * the application of the transformation
   * @param {?Observer<EditableHTMLProp>["complete"]} onLifecycle Callback to execute when the
   * property gets unsubscribed from
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track the subscriptions.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  protected _setDirectPropertyObserver(
    nodeProperty: DirectlyEditableHTMLProps,
    transform: Transform<EditableHTMLProp> = (data) => data,
    failSilently?: boolean,
    onError?: Observer<EditableHTMLProp>["error"],
    onLifecycle?: Observer<EditableHTMLProp>["complete"]
  ): void {
    const element = document.getElementById(this.id)

    if (this._state[nodeProperty] || !element) {
      if (element) {
        if (!failSilently) {
          throw new Error(`Property ${nodeProperty} already exists`)
        }
        return
      }
      if (!failSilently) {
        throw new Error(`Node with id ${this.id} does not exist`)
      }
      return
    }

    this._state[nodeProperty] = new BehaviorSubject(element[nodeProperty] as EditableHTMLProp)
    this._subscriptions[nodeProperty] = this._state[nodeProperty].subscribe({
      next: (data) => {
        Object.defineProperty(element, nodeProperty, {
          value: transform(data)
        })
      },
      error: onError ? onError : undefined,
      complete: onLifecycle ? onLifecycle : undefined
    })
  }

  /**
   * ## Unset Direct Property Observer
   *
   * This method unsubscribes to the given property.
   *
   * @protected
   * @param {DirectlyEditableHTMLProps} nodeProperty Property name to unsusbcribe from
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track the subscriptions.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   */
  protected _unsetDirectPropertyObserver(nodeProperty: DirectlyEditableHTMLProps): void {
    if (!this._subscriptions[nodeProperty]) {
      return
    }
    this._subscriptions[nodeProperty].unsubscribe()
    return
  }

  /**
   * ## Set Property as Reactive
   *
   * This method lets you select a property, mark it for tracking and mutate it with a
   * transform function.
   *
   * This means that when the value is updated, the transform function will modify it
   * accordingly and then set it to the given property.
   *
   * @public
   * @param {DirectlyEditableHTMLProps} property Property name to modify
   * @param {?Transform<EditableHTMLProp>} transform Transform to modify based off the current value
   * @param {?boolean} failSilently Flag to choose if throwing on indexing errors (property
   * already being tracked or inexistent node)
   * @param {?Observer<EditableHTMLProp>["error"]} onError Callback to execute on error during
   * the application of the transformation
   * @param {?Observer<EditableHTMLProp>["complete"]} onLifecycle Callback to execute when the
   * property gets unsubscribed from
   *
   * ---
   *
   * ### Usage
   *
   * Define the transform function and then call this method to apply it:
   *
   * ```typescript
   * // exampleEditableNode.innerText == "Some text"
   *
   * let transformText = (data) => data
   * exampleEditableNode.setProperty("innerText", transformText);
   *
   * exampleEditableNode.update("innerText", "Some Other Text");
   * // exampleEditableNode.innerText == "Some Other Text"
   *
   * transformText = (data) => data.reverse();
   *
   * exampleEditableNode.update("innerText", "Some Other Extra Text");
   * // exampleEditableNode.innerText == "txeT artxE rehtO emoS"
   * ```
   *
   * Alternatively define callbacks to execute on error and when the property is unsubscribed from.
   *
   * ---
   *
   * ### Notes
   *
   * Properties marked for tracking cannot ve overwritten. If you need to change the transform
   * function, make it mutable (nothing to lose as this methods are already mutable) and change that.
   *
   * This ensures that nothing has duplicate subscriptions and minimizes error surface.
   *
   * The assignation of the property will error out if it's already set as reactive or if the node
   * does not exist. This errors happen _before_ any transform is executed, they are located in
   * the setting the property as reactive. The parameter {@link failSilently} lets you choose
   * if throwing or just returning without doing nothing.
   *
   * If you need more flexibilty or immutability consider using a {@link Node} instead of doing
   * with an EditableNode.
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  public setReactiveProperty(
    property: DirectlyEditableHTMLProps,
    transform?: Transform<EditableHTMLProp>,
    failSilently?: boolean,
    onError?: Observer<EditableHTMLProp>["error"],
    onLifecycle?: Observer<EditableHTMLProp>["complete"]
  ): void {
    this._transforms[property] = transform
    this._setDirectPropertyObserver(property, transform, failSilently, onError, onLifecycle)
  }

  /**
   * ## Unset Property
   *
   * This method lets you select a property, remove it from the tracking and unsubscribe
   * from it.
   *
   * @public
   * @param {DirectlyEditableHTMLProps} property Property name to unsibscribe from
   * and stop tracking
   *
   * ---
   *
   * ### Usage
   *
   * ```typescript
   * exampleEditableNode.unsetProperty("innerText"); // Stops its reactivity
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  public unsetProperty(property: DirectlyEditableHTMLProps): void {
    this._unsetDirectPropertyObserver(property)
  }

  /**
   * ## Update
   *
   * @public
   * @param {DirectlyEditableHTMLProps} property Name of the editable property to update
   * @param {EditableHTMLProp} value Value to set the property to (passed to the transform function,
   * see {@link setReactiveProperty})
   *
   * ---
   *
   * ### Usage
   *
   * ```typescript
   * // exampleEditableNode.innerText == "Some text"
   * exampleEditableNode.update("innerText", "Some Other Text");
   *
   * // exampleEditableNode.innerText == "Some Other Text"
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  public update(property: DirectlyEditableHTMLProps, value: EditableHTMLProp): void {
    this._state[property].next(value)
  }

  /**
   * ## Add Side Effect
   *
   * This method lets you attach an arbitrary Observer to whatever property you're tracking.
   *
   * @public
   * @param {DirectlyEditableHTMLProps} property Name of the tracked property to subscribe to
   * @param {Partial<Observer<EditableHTMLProp>>} observer External observer to call
   * on every update
   * @param {?boolean} failSilently Flag to choose if throwing on indexing errors (property
   * already being tracked or inexistent node)
   *
   * ---
   *
   *  ### Usage
   *
   * ```typescript
   * const externalObserver = {next: (data) => console.log(data)};
   *
   * exampleEditableNode.addSideEffect("innerText", externalObserver);
   *
   * exampleEditableNode.update("innerText", "Some Other Text");
   *
   * // console: "Some Other Text"
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   * @returns {Subscription}
   */
  public sideEffect(
    property: DirectlyEditableHTMLProps,
    observer: Partial<Observer<EditableHTMLProp>>,
    failSilently?: boolean
  ): Subscription | void {
    const element = document.getElementById(this.id)

    if (!this._state[property] || !element) {
      if (element) {
        if (!failSilently) {
          throw new Error(`Property ${property} is not being tracked`)
        }
        return
      }
      if (!failSilently) {
        throw new Error(`Node with id ${this.id} does not exist`)
      }
      return
    }

    return this._state[property].subscribe(observer)
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class State
 * @typedef {State}
 * @template Data
 * @category Reactive Data Handling
 */
export class State<Data> {
  /**
   * Creates an instance of State.
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @constructor
   * @param {Data} initialState
   */
  constructor(public readonly initialState: Data) {
    this.initialState = initialState
    this._state = new BehaviorSubject<Data>(initialState)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {BehaviorSubject<Data>}
   */
  protected _state: BehaviorSubject<Data>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {Data} value
   */
  public update(value: Data): void {
    this._state.next(value)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {Partial<Observer<Data>>} observer
   * @returns {Subscription}
   */
  public subscribe(observer: Partial<Observer<Data>>): Subscription {
    return this._state.subscribe(observer)
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class Node
 * @typedef {Node}
 * @category Reactive Elements
 */
export class Node {
  /**
   * Creates an instance of Node.
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @constructor
   * @param {string} id
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   * @param {?boolean} [isComponent]
   */
  constructor(
    protected id: string,
    onError?: Observer<HTMLElement>["error"],
    onLifecycle?: Observer<HTMLElement>["complete"],
    isComponent?: boolean
  ) {
    // TODO handle the state initialization
    this._isComponent = isComponent ?? false
    if (this._isComponent) {
      this._nodeElement = () => {
        const element = document.querySelector(`[data-zt-id="${id}"]`) as HTMLElement | null
        if (!element) {
          throw new Error("No elements found; can't add reactivity to a node that does not exist.")
        } else {
          return element
        }
      }
    } else {
      this._nodeElement = () => {
        const element = document.getElementById(id)
        if (!element) {
          throw new Error("No elements found; can't add reactivity to a node that does not exist.")
        } else {
          return element
        }
      }
    }
    this._node = new BehaviorSubject(this._nodeElement())
    this._nodeSubscription = this._node.subscribe({
      next: (node) => {
        this._nodeElement().replaceWith(node)
      },
      error: onError ? onError : undefined,
      complete: onLifecycle ? onLifecycle : undefined
    })
    this._action = new BehaviorSubject({ id: "" })
    this._actions = {}
    this._actionSubscriptions = {}

    const defaultActionKeys: (keyof typeof NodeActions)[] = Object.keys(NodeActions)
    defaultActionKeys.forEach((actionKey) => {
      this.addAction(actionKey, NodeActions[actionKey])
    })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {boolean}
   */
  protected _isComponent: boolean

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {() => HTMLElement}
   */
  protected _nodeElement: () => HTMLElement

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Subscription}
   */
  protected _nodeSubscription: Subscription

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, Subscription>}
   */
  protected _actionSubscriptions: Record<string, Subscription>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {BehaviorSubject<HTMLElement>}
   */
  protected _node: BehaviorSubject<HTMLElement>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {BehaviorSubject<NodeActionRef<IntendedAny>>}
   */
  protected _action: BehaviorSubject<NodeActionRef<IntendedAny>>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, NodeAction<IntendedAny>>}
   */
  protected _actions: Record<string, NodeActionVoidEither<IntendedAny>>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {string} actionId
   * @param {NodeAction<IntendedAny>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public addAction(
    actionId: string,
    action: NodeActionVoidEither<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    this._actions[actionId] = action
    this._actionSubscriptions[actionId] = this._action.subscribe({
      next: (data) => {
        if (data.id === actionId) {
          const returnNode = action(this._nodeElement(), data.payload)
          if (returnNode) {
            this._node.next(returnNode)
          }
        }
        return data
      },
      error: onError,
      complete: onLifecycle
    })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {string} actionId
   */
  public removeAction(actionId: string) {
    this._actionSubscriptions[actionId].unsubscribe()
    delete this._actions[actionId]
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {string} actionId
   * @param {?*} [payload]
   */
  public fireAction(actionId: string, payload?: IntendedAny) {
    this._action.next({ id: actionId, payload: payload })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @readonly
   * @type {*}
   */
  public get actionsList() {
    return Object.keys(this._actions)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {Partial<Observer<HTMLElement>>} observer
   * @returns {Subscription}
   */
  public sideEffect(observer: Partial<Observer<HTMLElement>>): Subscription {
    return this._node.subscribe(observer)
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class StatefulNode
 * @typedef {StatefulNode}
 * @extends {Node}
 * @category Reactive Elements
 */
export class StatefulNode extends Node {
  /**
   * Creates an instance of StatefulNode.
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @constructor
   * @param {string} id
   * @param {*} initialState
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   * @param {?boolean} [isComponent]
   */
  constructor(
    protected id: string,
    initialState: IntendedAny,
    onError?: Observer<HTMLElement>["error"],
    onLifecycle?: Observer<HTMLElement>["complete"],
    isComponent?: boolean
  ) {
    super(id, onError, onLifecycle, isComponent)

    this._states = {}
    this._stateValues = {}
    this._states["default"] = new State(initialState)
    this._states["default"].subscribe({
      next: (value) => (this._stateValues["default"] = value)
    })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, State<IntendedAny>>}
   */
  protected _states: Record<string, State<IntendedAny>>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, IntendedAny>}
   */
  protected _stateValues: Record<string, IntendedAny>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {?string} [stateKey]
   * @returns {*}
   */
  public getState(stateKey?: string): IntendedAny {
    return this._stateValues[stateKey ?? "default"]
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {?string} [stateKey]
   * @returns {State<IntendedAny>}
   */
  public getStateObject(stateKey?: string): State<IntendedAny> {
    return this._states[stateKey ?? "default"]
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {unknown} newState
   * @param {?string} [stateKey]
   */
  public setState(newState: unknown, stateKey?: string): void {
    // console.log(
    //     `Setting state for node ${this.id}, key ${stateKey}, with the data ${newState}`
    // );
    if (this._states[stateKey ?? "default"]) {
      this._states[stateKey ?? "default"].update(newState)
    } else {
      this._states[stateKey ?? "default"] = new State(newState)
      this._states[stateKey ?? "default"].subscribe({
        next: (value) => (this._stateValues[stateKey ?? "default"] = value)
      })
    }
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {Transform<unknown>} transform
   * @param {?string} [stateKey]
   */
  public transformState(transform: Transform<unknown>, stateKey?: string): void {
    this._states[stateKey ?? "default"].update(transform(this._stateValues[stateKey ?? "default"]))
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @public
   * @param {NodeAction<IntendedAny>} action
   * @param {?string} [stateKey]
   * @returns {Subscription}
   */
  public sideEffectStateful(action: NodeAction<IntendedAny>, stateKey?: string): Subscription {
    return this._states[stateKey ?? "default"].subscribe({
      next: (state) => {
        action(this._nodeElement(), state)
      }
    })
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class Stream
 * @typedef {Stream}
 * @template Data
 * @category Reactive Data Handling
 */
export class Stream<Data> {
  /**
   * Creates an instance of Stream.
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @constructor
   */
  constructor() {
    this._state = new Subject<Data>()
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:50 PM
   *
   * @protected
   * @type {Subject<Data>}
   */
  protected _state: Subject<Data>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:50 PM
   *
   * @public
   * @param {(data: unknown) => Data} transform
   * @param {Observer<Data>} observer
   * @returns {Subscription}
   */
  public subscribe(transform: (data: unknown) => Data, observer: Observer<Data>): Subscription {
    return this._state.pipe(map(transform)).subscribe(observer)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:50 PM
   *
   * @public
   * @param {Data} value
   */
  public add(value: Data): void {
    this._state.next(value)
  }
}

// TODO fix the typings of window and shit
// TODO clean, fix and extend this properly
// TODO make a more decent startup script
