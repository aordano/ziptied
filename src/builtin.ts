/**
 * TODO
 *
 *
 *
 *
 *
 *
 * @module
 * @category Standard Components
 */

import { ActiveEvent, BreakpointQuery, TypeQuery, WidthQuery } from "./events"
import {
  BaseStateZT,
  BaseUIStateZT,
  ComponentGuard,
  ComponentTypes,
  EditableHTMLProp,
  IntendedAny,
  OnErrorHandler,
  OnLifecycleHandler,
  ZT,
  ZTBuiltinComponentVarints,
  ZTDataDictionary,
  ZTEventVariants,
  ZTGenericComponentVariants,
  ZTNodeVariants,
  ZTQueryVariants
} from "./types"
import { Component, DeepStatefulComponent } from "./component"
import {
  EditableNode,
  Node,
  State,
  StatefulNode,
  Stream,
  UnregisteredState,
  UnregisteredStream
} from "./base"

import { UAParser } from "ua-parser-js"
import { canonicalize } from "./util"
import { isStringExtension } from "./types"
abstract class DataReplacerGenericTarget extends DeepStatefulComponent<ZTDataDictionary> {
  /**
   * Creates an instance of TextReplacerTarget.
   * @date 4/19/2022 - 12:17:08 PM
   *
   * @constructor
   * @param {string} name
   * @param {Dictionary} textCorpus
   * @param {?string} [triggerLog]
   * @param {?OnErrorHandler} [onError]
   */
  constructor(
    name: string,
    dataCorpus: ZTDataDictionary,
    dataTargets: (keyof HTMLElement)[],
    triggerLog?: string,
    onError?: OnErrorHandler
  ) {
    super(name, "", dataCorpus, undefined, onError)
    this._dataTargets = dataTargets

    this._components.ids.forEach((currentId) => {
      //console.log("teas")
      const node = document.querySelector(`[zt-id="${currentId}"]`) as HTMLElement
      this._dataTargets.forEach((dataTarget) => {
        const dataTagAttribute =
          node.attributes.getNamedItem(`zt-${dataTarget.toLowerCase()}`) ?? undefined
        const targetKey = dataTagAttribute ? dataTagAttribute.value : undefined

        if (targetKey) {
          this._components.setLocalState(currentId, targetKey, `${dataTarget}_key`)

          this._components.setLocalState(
            currentId,
            this._sharedStateValue.corpus[this._sharedStateValue.selected][targetKey],
            `${dataTarget}_value`
          )

          this._components.sideEffectLocalStatefulFor(
            currentId,
            (node, newValue) => {
              if (newValue) {
                if (triggerLog) {
                  console.info(`${triggerLog}\n Data: ${newValue}`)
                }
                if (dataTarget in node) {
                  // This mess is here just to be able to redefine a property without things dying or TS complaining.
                  // It works, but we lose the typing guarantees. The solution is add a type guard.

                  // TODO add type guard to preserve guarantees in the rewriting of the HTMLElement properties

                  Object.defineProperty(node, dataTarget, { configurable: true })
                  delete node[dataTarget]
                  const newNode = node as IntendedAny
                  newNode[dataTarget] = newValue

                  node = Object.assign(node, newNode)
                }
              }
              return node
            },
            `${dataTarget}_value`
          )
        } else {
          throw new Error(`No key-${dataTarget} found for component ${name}, instance ${currentId}`)
        }
      })
    })

    this._sharedState.subscribe({
      next: (sharedState) => {
        this._components.ids.forEach((currentId) => {
          this._dataTargets.forEach((dataTarget) => {
            const currentKey = this._components.getLocalState(currentId, `${dataTarget}_key`)
            if (currentKey) {
              const storedValue = sharedState.corpus[sharedState.selected][currentKey]
              if (storedValue) {
                this._components.setLocalState(currentId, storedValue, `${dataTarget}_value`)
              } else {
                throw new Error(
                  `No key ${currentKey} found in the selected corpus ${
                    sharedState.corpus[sharedState.selected]
                  }`
                )
              }
            }
          })
        })
      },
      error: onError
    })
  }

  _dataTargets: (keyof HTMLElement)[]
}

export class DataReplacerTarget extends DataReplacerGenericTarget {
  constructor(
    name: string,
    dataCorpus: ZTDataDictionary,
    dataTarget: (keyof HTMLElement)[],
    triggerLog?: string,
    onError?: OnErrorHandler
  ) {
    super(name, dataCorpus, dataTarget, triggerLog, onError)
    Ziptie.registerComponent(this)
    this.type = ComponentTypes.DataReplacerTarget
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:08 PM
 *
 * @export
 * @class TextReplacerSelector
 * @typedef {TextReplacerSelector}
 * @template Selector extends string
 * @template Corpus extends Record<Selector, Record<string, string>>
 * @template Dictionary extends TextReplacerState<Selector, Corpus>
 * @extends {Component}
 */
export class DataReplacerSelector extends Component {
  /**
   * Creates an instance of TextReplacerSelector.
   * @date 4/19/2022 - 12:17:08 PM
   *
   * @constructor
   * @param {string} name
   * @param {string} corpusKey
   * @param {string} triggerEvent
   * @param {DeepStatefulComponent<Dictionary>} targetComponent
   * @param {?string} [triggerLog]
   * @param {?OnErrorHandler} [onError]
   */
  constructor(
    name: string,
    corpusKey: string,
    triggerEvent: string,
    targetComponent: string,
    triggerLog?: string,
    onError?: OnErrorHandler
  ) {
    super(name, undefined, onError)
    this.onEventLocal(triggerEvent, (node) => {
      const data = node.getAttribute(canonicalize(corpusKey).toLowerCase())
      if (data) {
        if (triggerLog) {
          // console.info(`${triggerLog}\n Data: ${data}`);
        }

        const target = Ziptie.state?.components[targetComponent]

        if (ComponentGuard.isDataReplacerTarget(target)) {
          target.transformSharedState((state) => {
            if (isStringExtension<string, ZTDataDictionary["corpus"]>(data, state.corpus)) {
              state.selected = data
            }
            return state
          })
        }
      }
      return node
    })
    Ziptie.registerComponent(this)
    this.type = ComponentTypes.DataReplacerSelector
  }
}

export class MakeDataReplacer {
  public selector(
    name: string,
    corpusKey: string,
    triggerEvent: string,
    targetComponent: string,
    triggerLog?: string,
    onError?: OnErrorHandler
  ) {
    new DataReplacerSelector(name, corpusKey, triggerEvent, targetComponent, triggerLog, onError)
    return this
  }

  public target(
    name: string,
    dataCorpus: ZTDataDictionary,
    dataTarget: (keyof HTMLElement)[],
    triggerLog?: string,
    onError?: OnErrorHandler
  ) {
    new DataReplacerTarget(name, dataCorpus, dataTarget, triggerLog, onError)
    return this
  }
}

export class MakeNode {
  public basic(id: string, onError?: OnErrorHandler, onLifecycle?: OnLifecycleHandler) {
    new Node(id, onError, onLifecycle, false)
    return this
  }

  public editable(id: string, initialState?: EditableHTMLProp) {
    new EditableNode(id, initialState)
    return this
  }

  public stateful(
    id: string,
    initialState: IntendedAny,
    onError?: OnErrorHandler,
    onLifecycle?: OnLifecycleHandler
  ) {
    new StatefulNode(id, initialState, onError, onLifecycle, false)
    return this
  }
}

export class MakeState {
  public basic<Data>(name: string, initialState: Data) {
    new State<Data>(initialState, name)
    return this
  }

  public stream<Data>(name: string) {
    new Stream<Data>(name)
    return this
  }
}

export class MakeStateUnregistered {
  public basic<Data>(initialState: Data) {
    return new UnregisteredState<Data>(initialState)
  }
  public stream<Data>() {
    return new UnregisteredStream<Data>()
  }
}

export class Make {
  public replacer: MakeDataReplacer = new MakeDataReplacer()
  public node: MakeNode = new MakeNode()
  public state: MakeState = new MakeState()
  public stateUnregistered: MakeStateUnregistered = new MakeStateUnregistered()
  public ziptie<BaseState extends BaseStateZT>(name: string, persistedState?: BaseState) {
    if (!window.__ZT) {
      const baseStateUI = {
        media: {
          breakpoint: new BreakpointQuery({
            sm: new WidthQuery(640),
            md: new WidthQuery(768, 641),
            lg: new WidthQuery(1024, 769),
            xl: new WidthQuery(1280, 1025),
            xxl: new WidthQuery(undefined, 1281)
          }),
          type: new TypeQuery(),
          width: new ActiveEvent<Window, number>("resize", window, (onResize) => {
            return onResize.target?.screen.availWidth
          }),
          height: new ActiveEvent<Window, number>("resize", window, (onResize) => {
            return onResize.target?.screen.availHeight
          }),
          userAgent: UAParser(window.navigator.userAgent),
          cursorPosition: new ActiveEvent<Window, { x: number; y: number }>(
            "mousemove",
            window,
            (onMouseMove) => {
              return { x: onMouseMove.x, y: onMouseMove.y }
            }
          ),
          cursorOverElement: new ActiveEvent<Window, Element | null>(
            "mousemove",
            window,
            (onMouseMove) => {
              return document.elementFromPoint(onMouseMove.x, onMouseMove.y)
            }
          )
        }
      }

      const baseState: ZT = {
        state: {
          [name]: {
            state: {},
            nodes: {},
            components: {}
          }
        },
        UI: baseStateUI
      }

      window.__ZT = Object.assign(baseState, persistedState)
      Ziptie.selectZiptie(name)
      return this
    }

    window.__ZT = Object.assign(window.__ZT, persistedState)
    Ziptie.selectZiptie(name)
    return this
  }
}

export class Ziptie {
  private static _selectedZiptie = "default"

  public static get selectedZiptie(): string {
    return this._selectedZiptie
  }

  public static selectZiptie(ziptie?: string) {
    this._selectedZiptie = window.__ZT
      ? ziptie && ziptie in window.__ZT.state
        ? ziptie
        : Object.keys(window.__ZT.state)[0]
      : "default"
    return this
  }

  public static registerComponent(
    component: ZTBuiltinComponentVarints | ZTGenericComponentVariants
  ) {
    if (window.__ZT) {
      window.__ZT.state[this.selectedZiptie].components = Object.assign(
        window.__ZT.state[this.selectedZiptie].components,
        {
          [component.name]: component
        }
      )
    }

    return this
  }

  public static registerNode(node: ZTNodeVariants) {
    if (window.__ZT) {
      window.__ZT.state[this.selectedZiptie].nodes = Object.assign(
        window.__ZT.state[this.selectedZiptie].nodes,
        {
          [node.name]: node
        }
      )
    }

    return this
  }

  public static registerState<StateType>(
    state: State<StateType> | Stream<StateType>,
    name: string
  ) {
    if (window.__ZT) {
      window.__ZT.state[this.selectedZiptie].state = Object.assign(
        window.__ZT.state[this.selectedZiptie].state,
        {
          [name]: state
        }
      )
    }
    return this
  }

  public static registerUI(
    uiState: ZTQueryVariants | ZTEventVariants | State<unknown> | Stream<unknown>,
    name: string
  ) {
    if (window.__ZT) {
      if (!window.__ZT.UI._userProvided) {
        window.__ZT.UI._userProvided = {
          [name]: uiState
        }
        return this
      }
      window.__ZT.UI._userProvided = Object.assign(window.__ZT.UI._userProvided, {
        [name]: uiState
      })
      return this
    }
    return this
  }

  public static create: Make = new Make()

  public static get state(): BaseStateZT | undefined {
    return window.__ZT ? window.__ZT.state[this.selectedZiptie] : undefined
  }

  public static UI: BaseUIStateZT | undefined = window.__ZT ? window.__ZT.UI : undefined
}
