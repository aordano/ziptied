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
import type { BaseStateZT, IntendedAny, OnErrorHandler, ZT, ZTDataDictionary } from "./types"
import { Component, DeepStatefulComponent } from "./component"

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
  }
}

export class TextReplacerTarget extends DataReplacerGenericTarget {
  constructor(
    name: string,
    textCorpus: ZTDataDictionary,
    triggerLog?: string,
    onError?: OnErrorHandler
  ) {
    super(name, textCorpus, ["innerText"], triggerLog, onError)
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
    targetComponent: DeepStatefulComponent<ZTDataDictionary>,
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
        targetComponent.transformSharedState((state) => {
          if (isStringExtension<string, ZTDataDictionary["corpus"]>(data, state.corpus)) {
            state.selected = data
          }
          return state
        })
      }
      return node
    })
  }
}

export class Ziptie<BaseState extends BaseStateZT> {
  constructor(name: string, persistedState?: BaseState) {
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
      [name]: {
        state: {
          data: {},
          stream: {}
        },
        nodes: {},
        components: undefined
      },
      UI: baseStateUI
    }

    window.__ZT = window.__ZT
      ? Object.assign(window.__ZT, Object.assign(baseState, persistedState))
      : Object.assign(baseState, persistedState)
  }
}
