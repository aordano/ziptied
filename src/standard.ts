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

import { Component, DeepStatefulComponent } from "./component"
import type { OnErrorHandler, TextReplacerState } from "./types"
import { canonicalize } from "./util"
import { isStringExtension } from "./types"

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:08 PM
 * @author Ágata Ordano
 *
 * @export
 * @class TextReplacerTarget
 * @typedef {TextReplacerTarget}
 * @template Selector extends string
 * @template Corpus extends Record<Selector, Record<string, string>>
 * @template Dictionary extends TextReplacerState<Selector, Corpus>
 * @extends {DeepStatefulComponent<Dictionary>}
 *
 * @source potato
 */
export class TextReplacerTarget<
  Selector extends string,
  Corpus extends Record<Selector, Record<string, string>>,
  Dictionary extends TextReplacerState<Selector, Corpus>
> extends DeepStatefulComponent<Dictionary> {
  /**
   * Creates an instance of TextReplacerTarget.
   * @date 4/19/2022 - 12:17:08 PM
   * @author Ágata Ordano
   *
   * @constructor
   * @param {string} name
   * @param {Dictionary} textCorpus
   * @param {?string} [triggerLog]
   * @param {?OnErrorHandler} [onError]
   */
  constructor(name: string, textCorpus: Dictionary, triggerLog?: string, onError?: OnErrorHandler) {
    super(name, "", textCorpus, undefined, onError)
    this._components.ids.forEach((currentId) => {
      const node = document.querySelector(
        `[data-${canonicalize("id")}="${currentId}"]`
      ) as HTMLElement
      const replacementKey = node.innerText
      this._components.setLocalState(currentId, replacementKey, "key")
      this._components.setLocalState(currentId, replacementKey, "content")
    })
    this._components.sideEffectStateful((node, newText) => {
      if (newText) {
        if (triggerLog) {
          // console.info(`${triggerLog}\n Data: ${newText}`);
        }
        node.innerText = newText
      }
      return node
    }, "content")
    this._sharedState.subscribe({
      next: (sharedState) => {
        this._components.ids.forEach((id) => {
          // console.log(
          //     `data:\n id: ${id}, selected: ${
          //         sharedState.selected
          //     }, key: ${this._components.getLocalState(
          //         id,
          //         "key"
          //     )}, text: ${
          //         sharedState.corpus[sharedState.selected][
          //             this._components.getLocalState(id, "key")
          //         ]
          //     }`
          // );
          this._components.setLocalState(
            id,
            sharedState.corpus[sharedState.selected][this._components.getLocalState(id, "key")],
            "content"
          )
        })
      },
      error: onError
    })
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:08 PM
 * @author Ágata Ordano
 *
 * @export
 * @class TextReplacerSelector
 * @typedef {TextReplacerSelector}
 * @template Selector extends string
 * @template Corpus extends Record<Selector, Record<string, string>>
 * @template Dictionary extends TextReplacerState<Selector, Corpus>
 * @extends {Component}
 */
export class TextReplacerSelector<
  Selector extends string,
  Corpus extends Record<Selector, Record<string, string>>,
  Dictionary extends TextReplacerState<Selector, Corpus>
> extends Component {
  /**
   * Creates an instance of TextReplacerSelector.
   * @date 4/19/2022 - 12:17:08 PM
   * @author Ágata Ordano
   *
   * @constructor
   * @param {string} name
   * @param {string} dataTag
   * @param {string} triggerEvent
   * @param {DeepStatefulComponent<Dictionary>} target
   * @param {?string} [triggerLog]
   * @param {?OnErrorHandler} [onError]
   */
  constructor(
    name: string,
    dataTag: string,
    triggerEvent: string,
    target: DeepStatefulComponent<Dictionary>,
    triggerLog?: string,
    onError?: OnErrorHandler
  ) {
    super(name, undefined, onError)
    this.onEventLocal(triggerEvent, (node) => {
      const data = node.getAttribute(dataTag)
      if (data) {
        if (triggerLog) {
          // console.info(`${triggerLog}\n Data: ${data}`);
        }
        target.transformSharedState((state) => {
          if (isStringExtension<Selector, Dictionary["corpus"]>(data, state.corpus)) {
            state.selected = data
          }
          return state
        })
      }
      return node
    })
  }
}
