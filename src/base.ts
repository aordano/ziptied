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
  EditableHTMLProp,
  IntendedAny,
  NodeAction,
  NodeActionRef,
  NodeActionVoidEither,
  OnErrorHandler,
  OnLifecycleHandler,
  Transform
} from "./types"
import { NodeActions } from "./actions"
import { Ziptie } from "./builtin"

/**
 * ## EditableNode
 *
 * The editable node represents a reactive HTMLElement present in the DOM, able to
 * be directly mutated. The mutations pertain to the editable properties of the element.
 *
 * The editable properties are all those that can be written to; {@link DirectlyEditableHTMLProps}
 *
 * ---
 *
 * ### Usage
 *
 * #### Setting up the EditableNode
 *
 * EditableNodes are indexed by element id, so they ought to be unique.
 *
 * To define a new EditableNode, you need to set an element with a given id and
 * create a new instance of EditableNode with that id.
 *
 * ---
 *
 * You can then use the methods of EditableNode to mutate the element.
 *
 * For example let's take a `<p>` element with some text inside, mark it as EditableNode
 * and mutate its contents:
 *
 * Original markup
 *
 * ```html
 * <p id="example">Placeholder</p>
 * ```
 *
 * Then you can add the logic required
 *
 * ```typescript
 * // This binds the element as an EditableNode.
 * const exampleEditableNode = new EditableNode("example");
 *
 * // This sets the property "textContent" to be reactive.
 * exampleEditableNode.setProperty("textContent");
 *
 * // This updates the element with the new value.
 * exampleEditableNode.update("textContent", "Hello World!");
 *
 * ```
 *
 * With the resulting markup being
 *
 * ```html
 * <p id="example">Hello World!</p>
 * ```
 *
 * ---
 *
 *
 * #### Using the EditableNode
 *
 * The EditableNode contains methods that allow you to set any editable property as reactive
 * and tracked, to dispense new values to any tracked property, and to attach arbitrary
 * side effects when any of those properties react to changes given.
 *
 * These are:
 *
 * - `setReactiveProperty`: Sets a property as reactive.
 * - `unsetReactiveProperty`: Stops the reactivity on the given property.
 * - `update`: Updates the value of a property.
 * - `sideEffect`: Attachs an arbitrary, external side effect to a reactive property.
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
export class EditableNode {
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
   * ### Notes
   *
   * Creating a instance of EditableNode implies finding the element by id, and
   * appending reactivity logic to its demeanor. That means that the minor
   * hydration provided by this class can be instantiated at any time, not just when
   * the page loads.
   *
   * This can be useful to minimize the time to interactivity at the start of the page,
   * allowing you to lazy-load any reactivity you need or delaying it until user interaction
   * with a specific element; nothing prevents you to attach an onclick() that fires the
   * new instance and provides the reactivity at the exact time.
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   */
  constructor(public id: string, public readonly initialState?: EditableHTMLProp) {
    this._subscriptions = {}
    this._transforms = {}
    this._state = {}
    this._name = id
    Ziptie.registerNode(this)
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
   * ## UnregisteredState
   *
   * This property contains the Subject that handles the updates and changes
   * to the current state of the element.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to access the subscriptions.
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
   * This is not part of the public API, is used internally to access the transforms.
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
   * This is not part of the public API, is used internally to perform the subscriptions.
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
   * This is not part of the public API, is used internally to remove subscriptions.
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
   * // The transform can be omitted if you just want to set the data.
   * exampleEditableNode.setReactiveProperty("innerText", transformText); // equivalent to .setReactiveProperty("innerText")
   *
   * exampleEditableNode.update("innerText", "Some Other Text");
   * // exampleEditableNode.innerText == "Some Other Text"
   *
   * // We can mutate the transform function at any time.
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
   * Properties marked for tracking cannot be overwritten. If you need to change the transform
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
    const definedTransform = transform ? transform : (data: EditableHTMLProp) => data
    this._transforms[property] = definedTransform
    this._setDirectPropertyObserver(property, definedTransform, failSilently, onError, onLifecycle)
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
   * exampleEditableNode.unsetReactiveProperty("innerText"); // Stops its reactivity
   * ```
   *
   * ---
   *
   * ### Notes
   *
   * Unsetting the property means consuming the subscription, so executing this method will
   * trigger any lifetime callback you set on it.
   *
   * This implies that if you added some cleanup, or some unmounting/notification
   * behavior lifecycle completion, it will be immediately executed, and you should
   * consider the impact on the event loop and maybe add external async logic to manage that.
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  public unsetReactiveProperty(property: DirectlyEditableHTMLProps): void {
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

  protected _name: string

  public get name() {
    return this._name
  }

  protected set name(value: string) {
    this._name = value
  }
}
/**
 * ## UnregisteredState
 *
 * Base element that wraps a Subject to easily store state reactively.
 *
 * It allows you to store a single type of value, and fire side effects every time it updates.
 *
 * ---
 *
 * ### Usage
 *
 * This element has two methods; `update` and `subscribe`.
 *
 * `update` lets you store a new value (of the same type) to the element state.
 * `subscribe` lets you attach a callback to every change of the element state.
 *
 * To use this element, first you need to create a new instance of it:
 *
 * ```typescript
 * const state = new UnregisteredState("I am being stored");
 * ```
 *
 * You cannot imperatively access this value, but you can subscribe other element to its changes:
 *
 * ```typescript
 * const externalObserver = {next: (data) => console.log(data)};
 * state.subscribe(externalObserver);
 *
 * state.update("I am being updated"); // console: "I am being updated"
 * ```
 *
 * ---
 *
 * ### Notes
 *
 * Due to the subscriber being a common Observer, you can add any kind of lifecycle callback to it. This allows you
 * to handle dismounting the state element, or to add some cleanup logic:
 *
 * ```typescript
 * const externalObserver2 = {
 *    next: (data) => console.log(data),
 *    finally: () => console.log("It's dead.")
 * };
 *
 * const subscription = state.subscribe(externalObserver2);
 *
 * state.update("I am being updated again"); // console: "I am being updated again"
 * subscription.unsubscribe(); // console: "It's dead."
 * ```
 *
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class UnregisteredState
 * @typedef {UnregisteredState}
 * @template Data
 * @category Reactive Data Handling
 */
export class UnregisteredState<Data> {
  /**
   * Creates an instance of UnregisteredState.
   *
   * @param {Data} initialState UnregisteredState to initialize the element with.
   *
   * @constructor
   * @date 4/19/2022 - 12:17:51 PM
   */
  constructor(public readonly initialState: Data) {
    this.initialState = initialState
    this._state = new BehaviorSubject<Data>(initialState)
  }

  /**
   * ## UnregisteredState
   *
   * This property holds the reactive object managing the state.
   *
   * @protected
   * @type {BehaviorSubject<Data>}
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to contain state.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  protected _state: BehaviorSubject<Data>

  /**
   * ## Update
   *
   * This method updates the state and broadcasts the values to all subscribers.
   *
   * @public
   * @param {Data} value Value to set the state to.
   *
   * ---
   *
   * ### Usage
   *
   * ```typescript
   * state.update("I am being updated");
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  public update(value: Data): void {
    this._state.next(value)
  }

  /**
   * ## Subscribe
   *
   * This method lets you attach an arbitrary Observer to the current state.
   *
   *
   * @public
   * @param {Partial<Observer<Data>>} observer
   *
   * ---
   *
   * ### Usage
   *
   * ```typescript
   * const externalObserver = {next: (data) => console.log(data)};
   *
   * state.subscribe(externalObserver);
   *
   * state.update("I am being updated"); // console: "I am being updated"
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   * @returns {Subscription}
   */
  public subscribe(observer: Partial<Observer<Data>>): Subscription {
    return this._state.subscribe(observer)
  }
}

/**
 * ## UnregisteredState
 *
 * Base element that wraps a Subject to easily store state reactively.
 *
 * It allows you to store a single type of value, and fire side effects every time it updates.
 *
 * ---
 *
 * ### Usage
 *
 * This element has two methods; `update` and `subscribe`.
 *
 * `update` lets you store a new value (of the same type) to the element state.
 * `subscribe` lets you attach a callback to every change of the element state.
 *
 * To use this element, first you need to create a new instance of it:
 *
 * ```typescript
 * const state = new UnregisteredState("I am being stored");
 * ```
 *
 * You cannot imperatively access this value, but you can subscribe other element to its changes:
 *
 * ```typescript
 * const externalObserver = {next: (data) => console.log(data)};
 * state.subscribe(externalObserver);
 *
 * state.update("I am being updated"); // console: "I am being updated"
 * ```
 *
 * ---
 *
 * ### Notes
 *
 * Due to the subscriber being a common Observer, you can add any kind of lifecycle callback to it. This allows you
 * to handle dismounting the state element, or to add some cleanup logic:
 *
 * ```typescript
 * const externalObserver2 = {
 *    next: (data) => console.log(data),
 *    finally: () => console.log("It's dead.")
 * };
 *
 * const subscription = state.subscribe(externalObserver2);
 *
 * state.update("I am being updated again"); // console: "I am being updated again"
 * subscription.unsubscribe(); // console: "It's dead."
 * ```
 *
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class UnregisteredState
 * @typedef {UnregisteredState}
 * @template Data
 * @category Reactive Data Handling
 */
export class State<Data> {
  /**
   * Creates an instance of UnregisteredState.
   *
   * @param {Data} initialState UnregisteredState to initialize the element with.
   *
   * @constructor
   * @date 4/19/2022 - 12:17:51 PM
   */
  constructor(public readonly initialState: Data, name: string) {
    this.initialState = initialState
    this._state = new BehaviorSubject<Data>(initialState)
    Ziptie.registerState(this, name)
  }

  /**
   * ## State
   *
   * This property holds the reactive object managing the state.
   *
   * @protected
   * @type {BehaviorSubject<Data>}
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to contain state.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  protected _state: BehaviorSubject<Data>

  /**
   * ## Update
   *
   * This method updates the state and broadcasts the values to all subscribers.
   *
   * @public
   * @param {Data} value Value to set the state to.
   *
   * ---
   *
   * ### Usage
   *
   * ```typescript
   * state.update("I am being updated");
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   */
  public update(value: Data): void {
    this._state.next(value)
  }

  /**
   * ## Subscribe
   *
   * This method lets you attach an arbitrary Observer to the current state.
   *
   *
   * @public
   * @param {Partial<Observer<Data>>} observer
   *
   * ---
   *
   * ### Usage
   *
   * ```typescript
   * const externalObserver = {next: (data) => console.log(data)};
   *
   * state.subscribe(externalObserver);
   *
   * state.update("I am being updated"); // console: "I am being updated"
   * ```
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   * @returns {Subscription}
   */
  public subscribe(observer: Partial<Observer<Data>>): Subscription {
    return this._state.subscribe(observer)
  }
}

/**
 * ## Node
 *
 * The node represents a reactive HTMLElement present in the DOM, not directly mutable.
 * The reactivity is given by completely replacing the element in the DOM on a given change.
 *
 * This might incur a performance penalty on simple modifications, but eases a lot of work, and increases
 * performance on very complex ones. Also, it's the only way to completely alter non-editable properties.
 *
 * This is the main building block used to hancle any UI changes in the DOM. Its versatility and ease of use
 * lets you do much more powerful things than what you could do directly handling the editable properties of a DOM node.
 *
 * ---
 *
 * ### Usage
 *
 * #### Setting up the Node
 *
 * Nodes are designed to be used independently of any semantic properties you might require for an element; this can be achieved
 * by defining the element as part of a `Component`. Components supercharge the features of the Node, allowing you to have several
 * instances of the same Node, with shared (or different) actions, behaviors, and side effects.
 *
 * To enable this behavior, the Node can be instantiated with a flag that defines it as part of a Component or just
 * as a standalone Node .
 *
 *
 * #### Setting up the Node as a standalone element
 *
 * To define a new Node, you need to set an element with a given id and
 * create a new instance of Node with that id, optionally a callback to be called when during
 * the consumption of an action there's an error, and optionally a callback to be called when the element reaches
 * the end of its life.
 *
 * ```typescript
 * const node = new Node("my-node", (error) => console.error(error), () => console.log("It's dead."));
 * ```
 *
 * #### Setting up the Node as part of a Component
 *
 * To define a new Node as part of a Component, you operate like in the case of the standalone Node, setting the component flag,
 * but the id you define will be stored in the element's `data-zt-id` attribute.
 * This is the same id you use to define the Node in the Component, and lets you have arbitrary copies of the same element.
 *
 * ```typescript
 * const componentNode = new Node("my-node", (error) => console.error(error), () => console.log("It's dead."), true);
 * ```
 *
 * ---
 *
 * With an instantiated Node, you can define an action.
 *
 * An action is a function that takes a HTMLElement and (usually) returns an HTMLElement, performing aribtrary modifications or
 * outright returning a different HTMLElement. The return value will be set as the next value for the Node, updating the DOM
 * to display it. For more information see {@link Actions}.
 *
 * ---
 *
 * #### Using the Node
 *
 * The Node contains methods that allow you to freely modify the element via the firing and consuming of *actions*, and side effects.
 *
 * The reactivity itself is handled by the Node, letting you specify what actions are to be performed and when.
 *
 * This class contains a series of methods that allow you to directly handle the setting, firing and consuming of actions and side effects.
 *
 * These are:
 *
 * - `addAction`: Defines an action for the Node.
 * - `removeAction`: Removes an action definition from the Node.
 * - `fireAction`: Fires the selected action.
 * - `sideEffect`: Attachs an arbitrary, external side effect on change.
 * - `actionsList`: Returns the list of currently defined actions.
 *
 * ---
 *
 * ### Notes
 *
 * See the usage guide for more information.
 *
 *
 *
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class Node
 * @typedef {Node}
 * @category Reactive Elements
 */
export class Node {
  /**
   * ## Creates an instance of Node.
   *
   * @constructor
   * @param {string} id
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   * @param {?boolean} [isComponent]
   *
   * ### Usage
   *
   * ```typescript
   * const exampleNode = new Node("example");
   *
   * const exampleNodeWithError = new Node("example2",(error) => console.error(error));
   *
   * const exampleNodeWithErrorAndLifecycle = new Node("example3",(error) => console.error(error), () => console.log("It's dead."));
   *
   * const exampleComponentNode = new Node("example", undefined, undefined, true);
   *
   * const exampleComponentNodeWithErrorAndLifecycle = new Node("example2",(error) => console.error(error), () => console.log("It's dead."), true);
   * ```
   *
   * ---
   *
   * ### Notes
   *
   * Creating a instance of a standalone Node implies finding the element by id, and
   * appending reactivity logic to its demeanor. That means that the minor
   * hydration provided by this class can be instantiated at any time, not just when
   * the page loads.
   *
   * This can be useful to minimize the time to interactivity at the start of the page,
   * allowing you to lazy-load any reactivity you need or delaying it until user interaction
   * with a specific element; nothing prevents you to attach an onclick() that fires the
   * new instance and provides the reactivity at the exact time.
   *
   * @date 4/19/2022 - 12:17:51 PM
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
        const element = document.querySelector(`[zt-id="${id}"]`) as HTMLElement | null
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

    this._name = id
    Ziptie.registerNode(this)
  }

  /** ## Is Component
   *
   * This property holds the component behavior flag set up an instantiation.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track the Node's target behavior.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {boolean}
   */
  protected _isComponent: boolean

  /**
   *  ## Node Element
   *
   * This property contains a function pointer that returns the current HTMLElement to display on change.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to display the element.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {() => HTMLElement}
   */
  protected _nodeElement: () => HTMLElement

  /**
   *  ## Node Subscription
   *
   * This property contains the subscription that track all changes to the
   * element.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track changes to the element.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Subscription}
   */
  protected _nodeSubscription: Subscription

  /**
   *  ## Action Subscriptions
   *
   * This property contains the subscriptions that track all changes for the actions defined.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track actions and element change.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, Subscription>}
   */
  protected _actionSubscriptions: Record<string, Subscription>

  /**
   *  ## Node
   *
   * This property contains the Subject that tracks the current state and updates the element.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track updates to the element.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {BehaviorSubject<HTMLElement>}
   */
  protected _node: BehaviorSubject<HTMLElement>

  /**
   *  ## Action
   *
   * This property contains the Subject that tracks the current state and updates the current action.
   *
   * ---
   *
   * ### Usage
   *
   * This is not part of the public API, is used internally to track updates to the current action.
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {BehaviorSubject<NodeActionRef<IntendedAny>>}
   */
  protected _action: BehaviorSubject<NodeActionRef<IntendedAny>>

  /**
   *  ## Actions
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
   * @type {Record<string, NodeAction<IntendedAny>>}
   */
  protected _actions: Record<string, NodeActionVoidEither<IntendedAny>>

  /**
   *  ## Add Action
   *
   * This method lets you define an action and attach it to the Node.
   *
   * @public
   * @param {string} actionId Identifier for the action to be used on invoking it.
   * @param {NodeAction<IntendedAny>} action The action to bind to the Node.
   * @param {?OnErrorHandler} [onError] Callback function to execute on error.
   * @param {?OnLifecycleHandler} [onLifecycle] Callback function to execute on action unsubscription.
   *
   * ---
   *
   * ### Usage
   *
   *
   *
   * ---
   *
   * @date 4/19/2022 - 12:17:51 PM
   *
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

  protected _name: string

  public get name() {
    return this._name
  }

  protected set name(value: string) {
    this._name = value
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
    this._states["default"] = new UnregisteredState(initialState)
    this._states["default"].subscribe({
      next: (value) => (this._stateValues["default"] = value)
    })

    this._name = id
    Ziptie.registerNode(this)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:17:51 PM
   *
   * @protected
   * @type {Record<string, UnregisteredState<IntendedAny>>}
   */
  protected _states: Record<string, UnregisteredState<IntendedAny>>

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
   * @returns {UnregisteredState<IntendedAny>}
   */
  public getStateObject(stateKey?: string): UnregisteredState<IntendedAny> {
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
      this._states[stateKey ?? "default"] = new UnregisteredState(newState)
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
    const stateObject = this._states[stateKey ?? "default"]
    if (stateObject) {
      return stateObject.subscribe({
        next: (state) => {
          action(this._nodeElement(), state)
        }
      })
    }
    throw new Error(`UnregisteredState entry ${stateKey} does not exist for node ${this.id}`)
  }

  protected _name: string

  public get name() {
    return this._name
  }

  protected set name(value: string) {
    this._name = value
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:51 PM
 *
 * @export
 * @class UnregisteredStream
 * @typedef {UnregisteredStream}
 * @template Data
 * @category Reactive Data Handling
 */
export class UnregisteredStream<Data> {
  /**
   * Creates an instance of UnregisteredStream.
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
  constructor(name: string) {
    this._state = new Subject<Data>()
    Ziptie.registerState(this, name)
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
