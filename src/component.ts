/**
 * TODO
 *
 *
 *
 *
 *
 *
 * @category Component Blueprints
 * @module
 */

// TODO Refactor as a module with templates and a module with components,
// this file is too large

import {
  ComponentTypes,
  IBaseComponentTemplate,
  IntendedAny,
  NodeAction,
  NodeActionRequired,
  OnErrorHandler,
  OnLifecycleHandler,
  Transform,
  ZTComponentErrorEither
} from "./types"
import { Node, StatefulNode, UnregisteredState } from "./base"
import { Observer, Subscription, fromEvent } from "rxjs"
import { buildAccessError, canonicalize, elementAccessCheck, unsafeID } from "./util"

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:08 PM
 *
 * @abstract
 * @class BaseComponentTemplate
 * @typedef {BaseComponentTemplate}
 * @template NodeType extends Node
 * @implements {IBaseComponentTemplate<NodeType>}
 * @category Component Templates
 */
abstract class BaseComponentTemplate<NodeType extends Node>
  implements IBaseComponentTemplate<NodeType>
{
  /**
   * Creates an instance of BaseComponentTemplate.
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @constructor
   * @param {string} component
   * @param {string[]} ids
   * @param {Record<string, NodeType>} _elements
   */
  constructor(component: string, ids: string[], _elements: Record<string, NodeType>) {
    this.name = component
    this.ids = ids
    this._elements = _elements
  }

  // TODO Add method to check if there are new elements with the class name and regenerate them

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @protected
   * @type {Record<string, NodeType>}
   */
  protected _elements: Record<string, NodeType>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @type {*}
   */
  public name

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @type {*}
   */
  public ids

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} id
   * @returns {*}
   */
  public actionsListOf(id: string) {
    return this._elements[id] ? this._elements[id].actionsList : []
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} actionId
   * @param {NodeAction<IntendedAny>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public addAction(
    actionId: string,
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    this.ids.forEach((id) => {
      this._elements[id].addAction(actionId, action, onError, onLifecycle)
    })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} actionId
   * @returns {((ZTComponentErrorEither<NodeType, this> | false)[])}
   */
  public removeAction(actionId: string): (ZTComponentErrorEither<NodeType, this> | false)[] {
    return this.ids
      .map((id) => {
        if (elementAccessCheck(actionId, "action", this.name, this.actionsListOf(id))) {
          this._elements[id].removeAction(actionId)
          return false
        } else {
          return buildAccessError<NodeType, this>(
            this,
            "ENOACTION",
            "Unable to remove nonexistant action",
            id
          )
        }
      })
      .filter((error) => (error ? true : false))
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} actionId
   * @param {?unknown} [payload]
   * @returns {((ZTComponentErrorEither<NodeType, this> | false)[])}
   */
  public fireAction(
    actionId: string,
    payload?: unknown
  ): (ZTComponentErrorEither<NodeType, this> | false)[] {
    return this.ids
      .map((id) => {
        if (elementAccessCheck(actionId, "action", this.name, this.actionsListOf(id))) {
          this._elements[id].fireAction(actionId, payload)
          return false
        } else {
          return buildAccessError<NodeType, this>(this, "ENOACTION", "Unable to fire action", id)
        }
      })
      .filter((error) => (error ? true : false))
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {Partial<Observer<HTMLElement>>} observer
   * @returns {{}}
   */
  public sideEffect(observer: Partial<Observer<HTMLElement>>) {
    const subs: Subscription[] = []
    this.ids.forEach((id) => {
      subs.push(this._elements[id].sideEffect(observer))
    })
    return subs
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} actionId
   * @param {string} elementId
   * @param {NodeAction<IntendedAny>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   * @returns {(void | ZTComponentErrorEither<NodeType, this>)}
   */
  public addActionFor(
    actionId: string,
    elementId: string,
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ): void | ZTComponentErrorEither<NodeType, this> {
    if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
      if (!elementAccessCheck(actionId, "action", this.name, this.actionsListOf(elementId))) {
        this._elements[elementId].addAction(actionId, action, onError, onLifecycle)
      } else {
        return buildAccessError<NodeType, this>(
          this,
          "EEXISTSACTION",
          "Unable to add already existing action",
          elementId
        )
      }
    } else {
      return buildAccessError<NodeType, this>(
        this,
        "ENOELEMENT",
        "Unable to add action to nonexistant element",
        elementId
      )
    }
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} actionId
   * @param {string} elementId
   * @returns {(void | ZTComponentErrorEither<NodeType, this>)}
   */
  public removeActionFrom(
    actionId: string,
    elementId: string
  ): void | ZTComponentErrorEither<NodeType, this> {
    if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
      if (elementAccessCheck(actionId, "action", this.name, this.actionsListOf(elementId))) {
        this._elements[elementId].removeAction(actionId)
      } else {
        return buildAccessError<NodeType, this>(
          this,
          "ENOACTION",
          "Unable to remove nonexistant action",
          elementId
        )
      }
    } else {
      return buildAccessError<NodeType, this>(
        this,
        "ENOELEMENT",
        "Unable to remove action from nonexistant element",
        elementId
      )
    }
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} actionId
   * @param {string} elementId
   * @param {?unknown} [payload]
   * @returns {(void | ZTComponentErrorEither<NodeType, this>)}
   */
  public fireActionFor(
    actionId: string,
    elementId: string,
    payload?: unknown
  ): void | ZTComponentErrorEither<NodeType, this> {
    if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
      if (elementAccessCheck(actionId, "action", this.name, this.actionsListOf(elementId))) {
        this._elements[elementId].fireAction(actionId, payload)
      } else {
        return buildAccessError<NodeType, this>(
          this,
          "ENOACTION",
          "Unable to fire nonexistant action",
          elementId
        )
      }
    } else {
      return buildAccessError<NodeType, this>(
        this,
        "ENOELEMENT",
        "Unable to fire action from nonexistant element",
        elementId
      )
    }
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} elementId
   * @param {Partial<Observer<HTMLElement>>} observer
   * @returns {(Subscription[] | ZTComponentErrorEither<NodeType, this>)}
   */
  public sideEffectFor(
    elementId: string,
    observer: Partial<Observer<HTMLElement>>
  ): Subscription[] | ZTComponentErrorEither<NodeType, this> {
    if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
      const subs: Subscription[] = []
      subs.push(this._elements[elementId].sideEffect(observer))
      return subs
    }
    return buildAccessError<Node, this>(
      this,
      "ENOELEMENT",
      "Unable to attach side effect",
      elementId
    )
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:08 PM
 *
 * @class ComponentTemplate
 * @typedef {ComponentTemplate}
 * @extends {BaseComponentTemplate<Node>}
 * @category Component Templates
 */
class ComponentTemplate extends BaseComponentTemplate<Node> {
  /**
   * Creates an instance of ComponentTemplate.
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @constructor
   * @param {string} component
   * @param {?NodeAction<IntendedAny>} [prepare]
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   */
  constructor(
    protected component: string,
    prepare?: NodeAction<IntendedAny>,
    onError?: Observer<HTMLElement>["error"],
    onLifecycle?: Observer<HTMLElement>["complete"]
  ) {
    const ids: string[] = []
    const elements: Record<string, Node> = {}
    Array.from(
      // Might look hacky to select by class instead of attribute but makes
      // bolting the component to elements much much easier and cleaner
      document.querySelectorAll(`[zt=${component}]`)
    ).forEach((element) => {
      const newId = unsafeID(20)
      const doesExist = () => {
        const node = document.querySelector(`[zt-id="${newId}"]`)
        return !!node
      }
      if (!doesExist()) {
        element.setAttribute("zt-id", newId)
      }
      ids.push(newId)
      elements[newId] = new Node(newId, onError, onLifecycle, true)
      if (prepare) {
        elements[newId].addAction("prepare", prepare)
        elements[newId].fireAction("prepare")
      }
    })
    super(component, ids, elements)
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:08 PM
 *
 * @class StatefulComponentTemplate
 * @typedef {StatefulComponentTemplate}
 * @extends {BaseComponentTemplate<StatefulNode>}
 * @category Component Templates
 */
class StatefulComponentTemplate extends BaseComponentTemplate<StatefulNode> {
  /**
   * Creates an instance of StatefulComponentTemplate.
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @constructor
   * @param {string} component
   * @param {*} initialState
   * @param {?NodeAction<IntendedAny>} [prepare]
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   */
  constructor(
    protected component: string,
    initialState: IntendedAny,
    prepare?: NodeAction<IntendedAny>,
    onError?: Observer<HTMLElement>["error"],
    onLifecycle?: Observer<HTMLElement>["complete"]
  ) {
    const ids: string[] = []
    const elements: Record<string, StatefulNode> = {}
    Array.from(
      // Might look hacky to select by class instead of attribute but makes
      // bolting the component to elements much much easier and cleaner
      document.querySelectorAll(`[zt=${component}]`)
    ).forEach((element) => {
      const newId = unsafeID(20)
      const doesExist = () => {
        const node = document.querySelector(`[zt-id="${newId}"]`)
        return !!node
      }
      if (!doesExist()) {
        element.setAttribute("zt-id", newId)
      }
      ids.push(newId)
      elements[newId] = new StatefulNode(newId, initialState, onError, onLifecycle, true)
      if (prepare) {
        elements[newId].addAction("prepare", prepare)
        elements[newId].fireAction("prepare")
      }
    })
    super(component, ids, elements)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} id
   * @param {?string} [stateKey]
   * @returns {(IntendedAny | ZTComponentErrorEither<StatefulNode, this>)}
   */
  public getLocalState(
    id: string,
    stateKey?: string
  ): IntendedAny | ZTComponentErrorEither<StatefulNode, this> {
    if (elementAccessCheck(id, "element", this.name, this.ids)) {
      return this._elements[id].getState(stateKey)
    }
    return buildAccessError<StatefulNode, this>(
      this,
      "ENOELEMENT",
      "Unable to get state from element",
      id,
      undefined,
      "getState"
    )
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} id
   * @param {?string} [stateKey]
   * @returns {(UnregisteredState<IntendedAny> | ZTComponentErrorEither<StatefulNode, this>)}
   */
  public getLocalStateObject(
    id: string,
    stateKey?: string
  ): UnregisteredState<IntendedAny> | ZTComponentErrorEither<StatefulNode, this> {
    if (elementAccessCheck(id, "element", this.name, this.ids)) {
      return this._elements[id].getStateObject(stateKey)
    }
    return buildAccessError<StatefulNode, this>(
      this,
      "ENOELEMENT",
      "Unable to get state from element",
      id,
      undefined,
      "getState"
    )
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} id
   * @param {*} newState
   * @param {?string} [stateKey]
   */
  public setLocalState(id: string, newState: IntendedAny, stateKey?: string): void {
    this._elements[id].setState(newState, stateKey)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} id
   * @param {Transform<IntendedAny>} transform
   * @param {?string} [stateKey]
   * @returns {(void | ZTComponentErrorEither<StatefulNode, this>)}
   */
  public transformLocalState(
    id: string,
    transform: Transform<IntendedAny>,
    stateKey?: string
  ): void | ZTComponentErrorEither<StatefulNode, this> {
    if (elementAccessCheck(id, "element", this.name, this.ids)) {
      this._elements[id].transformState(transform, stateKey)
    }
    return buildAccessError<StatefulNode, this>(
      this,
      "ENOELEMENT",
      "Unable to transform element state",
      id,
      undefined,
      "transformState"
    )
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {NodeAction<IntendedAny>} action
   * @param {string} stateKey
   * @returns {Subscription[]}
   */
  public sideEffectStateful(action: NodeAction<IntendedAny>, stateKey: string): Subscription[] {
    const subs: Subscription[] = []
    this.ids.forEach((id) => {
      subs.push(this._elements[id].sideEffectStateful(action, stateKey))
    })
    return subs
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} id
   * @param {NodeAction<IntendedAny>} action
   * @param {string} stateKey
   * @returns {Subscription}
   */
  public sideEffectLocalStatefulFor(
    id: string,
    action: NodeAction<IntendedAny>,
    stateKey: string
  ): Subscription {
    return this._elements[id].sideEffectStateful(action, stateKey)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template LocalState
   * @param {string} elementId
   * @param {NodeAction<LocalState>} action
   * @returns {(Subscription[] | ZTComponentErrorEither<StatefulNode, this>)}
   */
  public sideEffectStatefulFor<LocalState>(
    elementId: string,
    action: NodeAction<LocalState>
  ): Subscription[] | ZTComponentErrorEither<StatefulNode, this> {
    const subs: Subscription[] = []
    if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
      subs.push(this._elements[elementId].sideEffectStateful(action))
      return subs
    }
    return buildAccessError<StatefulNode, this>(
      this,
      "ENOELEMENT",
      "Unable to attach side effect to element",
      elementId,
      undefined,
      "sideEffectStatefulFor"
    )
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:08 PM
 *
 * @abstract
 * @class BaseComponent
 * @typedef {BaseComponent}
 * @template Template extends BaseComponentTemplate<Node>
 * @category Component Blueprints
 */
abstract class BaseComponent<Template extends BaseComponentTemplate<Node>> {
  /**
   * Creates an instance of BaseComponent.
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @constructor
   * @param {Template} components
   */
  constructor(components: Template) {
    // TODO Handle SharedState initialization
    this._components = components
    this.type = ComponentTypes.BaseComponent
  }

  public type: ComponentTypes

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @protected
   * @type {Template}
   */
  protected _components: Template

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @readonly
   * @type {string}
   */
  public get name(): string {
    return this._components.name
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @readonly
   * @type {Template}
   */
  public get dangerouslyGetComponentTemplate(): Template {
    // TODO add way to enable or disable access to this option
    return this._components
  }

  // TODO populate the regenerate method on the component definition
  // public regenerate(): void {
  //     this._components = new ComponentTemplate(
  //         `zt-${this._name}`,
  //         onError,
  //         onLifecycle
  //     );
  // }

  // ? maybe custom implementation? it's pointless now so far
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {NodeAction<IntendedAny>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public onLoad(
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    this._components.addAction("onLoad", action)
    fromEvent(window, "load").subscribe({
      next: () => {
        this._components.fireAction("onLoad")
      },
      error: onError,
      complete: onLifecycle
    })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template Data
   * @param {string} name
   * @param {NodeAction<Data>} action
   */
  public addAction<Data>(name: string, action: NodeAction<Data>) {
    this._components.addAction(name, action)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} name
   */
  public fireAction(name: string) {
    this._components.fireAction(name)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template Data
   * @param {NodeAction<Data>} action
   */
  public instantAction<Data>(action: NodeAction<Data>) {
    this._components.addAction(`RESERVED_${canonicalize("anonymous")}`, action)
    this._components.fireAction(`RESERVED_${canonicalize("anonymous")}`)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {NodeAction<IntendedAny>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public onUpdate(
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    this._components.addAction("onUpdate", action)
    this._components.sideEffect({
      next: () => {
        this._components.fireAction("onUpdate")
      },
      error: onError,
      complete: onLifecycle
    })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template Data
   * @param {string} effectName
   * @param {NodeAction<Data>} action
   * @param {UnregisteredState<Data>} stateHolder
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public addSideEffect<Data>(
    effectName: string,
    action: NodeAction<Data>,
    stateHolder: UnregisteredState<Data>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    // console.info(
    //     `Added global effect "${effectName}" to component ${this._name}`
    // );

    this._components.addAction(effectName, action)
    stateHolder.subscribe({
      next: (data) => this._components.fireAction(effectName, data),
      error: onError,
      complete: onLifecycle
    })
  }

  // FIXME for some reason the event stuff is not working
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} event
   * @param {NodeAction<IntendedAny>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public onEvent(
    event: string,
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    // console.info(
    //     `Added global event listener to component ${this._name} for "${event}"`
    // );

    this._components.addAction(`on${event}`, action)
    fromEvent(window, event).subscribe({
      next: (event) => {
        // console.info(
        //     `Received global event "${event.type}" on component "${this._name}"`
        // );
        this._components.fireAction(`on${event}`, event)
      },
      error: onError,
      complete: onLifecycle
    })
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template LocalEvent extends Event
   * @param {string} eventName
   * @param {NodeAction<LocalEvent>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public onEventLocal<LocalEvent extends Event>(
    eventName: string,
    action: NodeAction<LocalEvent>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    // console.info(
    //     `Added local event listener to component ${this._name} for "${eventName}"`
    // );

    this._components.addAction(eventName, action)

    this._components.ids.forEach((elementId: string) => {
      const element = document.querySelector(`[zt-id="${elementId}"]`) as HTMLElement | null
      if (element) {
        fromEvent(element, eventName).subscribe({
          next: (event) => {
            // console.info(
            //     `Received local event "${event.type}" on component "${this._name}" with id "${elementId}"`
            // );
            this._components.fireActionFor(eventName, elementId, event)
          },
          error: onError,
          complete: onLifecycle
        })
      }
    })
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:08 PM
 *
 * @export
 * @class Component
 * @typedef {Component}
 * @extends {BaseComponent<ComponentTemplate>}
 * @category Component Blueprints
 */
export class Component extends BaseComponent<ComponentTemplate> {
  /**
   * Creates an instance of Component.
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @constructor
   * @param {string} name
   * @param {?NodeAction<IntendedAny>} [prepare]
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   */
  constructor(
    name: string,
    prepare?: NodeAction<IntendedAny>,
    onError?: Observer<HTMLElement>["error"],
    onLifecycle?: Observer<HTMLElement>["complete"]
  ) {
    const template = new ComponentTemplate(name, prepare, onError, onLifecycle)
    super(template)
    this.type = ComponentTypes.Component
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:08 PM
 *
 * @export
 * @class StatefulComponent
 * @typedef {StatefulComponent}
 * @template SharedState
 * @extends {BaseComponent<ComponentTemplate>}
 * @category Component Blueprints
 */
export class StatefulComponent<SharedState> extends BaseComponent<ComponentTemplate> {
  /**
   * Creates an instance of StatefulComponent.
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @constructor
   * @param {string} name
   * @param {SharedState} initialSharedState
   * @param {?NodeAction<SharedState>} [prepare]
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   */
  constructor(
    name: string,
    initialSharedState: SharedState,
    prepare?: NodeAction<SharedState>,
    onError?: Observer<HTMLElement>["error"],
    onLifecycle?: Observer<HTMLElement>["complete"]
  ) {
    const template = new ComponentTemplate(name, prepare, onError, onLifecycle)
    super(template)
    this._sharedState = new UnregisteredState(initialSharedState)
    this._sharedStateValue = initialSharedState
    this._sharedState.subscribe({
      next: (value) => (this._sharedStateValue = value)
    })
    this.type = ComponentTypes.StatefulComponent
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @protected
   * @type {UnregisteredState<SharedState>}
   */
  protected _sharedState: UnregisteredState<SharedState>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @protected
   * @type {SharedState}
   */
  protected _sharedStateValue: SharedState

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @type {SharedState}
   */
  get sharedState(): SharedState {
    return this._sharedStateValue
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @type {SharedState}
   */
  set sharedState(data) {
    throw new Error("Shared state is readonly. Use the methods to modify it.")
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @readonly
   * @type {UnregisteredState<SharedState>}
   */
  get sharedStateObject(): UnregisteredState<SharedState> {
    return this._sharedState
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {SharedState} newState
   */
  public setSharedState(newState: SharedState): void {
    this._sharedState.update(newState)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {Transform<SharedState>} transform
   */
  public transformSharedState(transform: Transform<SharedState>): void {
    this._sharedState.update(transform(this._sharedStateValue))
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template SharedState
   * @param {string} name
   * @param {NodeActionRequired<SharedState>} action
   */
  public addStatefulAction<SharedState>(name: string, action: NodeActionRequired<SharedState>) {
    this._components.addAction(name, (node: HTMLElement) =>
      action(node, this.sharedState as unknown as SharedState)
    )
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:08 PM
 *
 * @export
 * @class DeepStatefulComponent
 * @typedef {DeepStatefulComponent}
 * @template SharedState
 * @extends {BaseComponent<StatefulComponentTemplate>}
 * @category Component Blueprints
 */
export class DeepStatefulComponent<SharedState> extends BaseComponent<StatefulComponentTemplate> {
  /**
   * Creates an instance of DeepStatefulComponent.
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @constructor
   * @param {string} name
   * @param {*} initialLocalState
   * @param {SharedState} initialSharedState
   * @param {?NodeAction<{ shared: SharedState; local: IntendedAny }>} [prepare]
   * @param {?Observer<HTMLElement>["error"]} [onError]
   * @param {?Observer<HTMLElement>["complete"]} [onLifecycle]
   */
  constructor(
    name: string,
    initialLocalState: IntendedAny,
    initialSharedState: SharedState,
    prepare?: NodeAction<{ shared: SharedState; local: IntendedAny }>,
    onError?: Observer<HTMLElement>["error"],
    onLifecycle?: Observer<HTMLElement>["complete"]
  ) {
    const template = new StatefulComponentTemplate(
      name,
      initialLocalState,
      prepare,
      onError,
      onLifecycle
    )
    super(template)
    this._sharedState = new UnregisteredState(initialSharedState)
    this._sharedStateValue = initialSharedState
    this._sharedState.subscribe({
      next: (value) => (this._sharedStateValue = value)
    })
    this.type = ComponentTypes.DeepStatefulComponent
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @protected
   * @type {UnregisteredState<SharedState>}
   */
  protected _sharedState: UnregisteredState<SharedState>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @protected
   * @type {SharedState}
   */
  protected _sharedStateValue: SharedState

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @type {SharedState}
   */
  get sharedState(): SharedState {
    return this._sharedStateValue
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @type {SharedState}
   */
  set sharedState(data) {
    throw new Error("Shared state is readonly. Use the methods to modify it.")
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @readonly
   * @type {UnregisteredState<SharedState>}
   */
  get sharedStateObject(): UnregisteredState<SharedState> {
    return this._sharedState
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {SharedState} newState
   */
  public setSharedState(newState: SharedState): void {
    this._sharedState.update(newState)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {Transform<SharedState>} transform
   */
  public transformSharedState(transform: Transform<SharedState>): void {
    this._sharedState.update(transform(this._sharedStateValue))
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template SharedState
   * @param {string} name
   * @param {NodeActionRequired<SharedState>} action
   */
  public addStatefulAction<SharedState>(name: string, action: NodeActionRequired<SharedState>) {
    this._components.addAction(name, (node: HTMLElement) =>
      action(node, this.sharedState as unknown as SharedState)
    )
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @template LocalState
   * @template SharedState
   * @param {string} effectName
   * @param {NodeAction<{ local: LocalState; shared: SharedState }>} action
   * @param {UnregisteredState<SharedState>} stateHolder
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public addSideEffectStateful<LocalState, SharedState>(
    effectName: string,
    action: NodeAction<{ local: LocalState; shared: SharedState }>,
    stateHolder: UnregisteredState<SharedState>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    // console.info(
    //     `Added global effect "${effectName}" to component ${this._name}`
    // );

    this._components.addAction(effectName, action)
    stateHolder.subscribe({
      next: (data) => this._components.fireAction(effectName, data),
      error: onError,
      complete: onLifecycle
    })
  }

  // TODO add better way to handle the local state of each element
  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:08 PM
   *
   * @public
   * @param {string} event
   * @param {*} state
   * @param {NodeAction<IntendedAny>} action
   * @param {?OnErrorHandler} [onError]
   * @param {?OnLifecycleHandler} [onLifecycle]
   */
  public onEventLocalStateful(
    event: string,
    state: IntendedAny,
    action: NodeAction<IntendedAny>,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    // console.info(
    //     `Added local event listener to component ${this._name} for "${event}"`
    // );

    const statefulAction = (node: HTMLElement): HTMLElement => {
      return action(node, state)
    }

    this._components.addAction(`on${event}`, statefulAction)

    this._components.ids.forEach((elementId) => {
      const element = document.querySelector(`[zt-id="${elementId}"]`) as HTMLElement | null
      if (element) {
        fromEvent(element, event).subscribe({
          next: (event) => {
            // console.info(
            //     `Received local event "${event.type}" on component "${this._name}" with id "${elementId}"`
            // );
            this._components.fireAction(`on${event}`, event)
          },
          error: onError,
          complete: onLifecycle
        })
      }
    })
  }
}
