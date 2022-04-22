/**
 * TODO
 *
 *
 *
 *
 *
 *
 * @module
 * @category Utilities
 */

import {
  IBaseComponentTemplate,
  ZTComponentErrorDescriptions,
  ZTComponentErrorEither,
  ZTComponentErrorTypes
} from "./types"

import type { Node } from "./base"

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:24 PM
 * @author Ágata Ordano
 *
 * @param {string} name
 * @returns {string}
 */
export const canonicalize = (name: string) => `zt-${name}`

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:24 PM
 * @author Ágata Ordano
 *
 * @param {string} id
 * @param {string} type
 * @param {string} containerName
 * @param {Record<string, any>} elements
 * @returns {boolean}
 */
export const elementAccessCheck = (
  id: string,
  type: string,
  containerName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements: Record<string, any>
): boolean => {
  if (Object.values(elements).indexOf(id) !== -1) {
    return true
  } else {
    // TODO add debug level support
    console.error(`No ${type} with key ${id} was found in component ${containerName}`)
    return false
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:24 PM
 * @author Ágata Ordano
 *
 * @template NodeType extends Node
 * @template Template extends IBaseComponentTemplate<NodeType>
 * @param {Template} template
 * @param {ZTComponentErrorTypes} type
 * @param {string} message
 * @param {?string} [requestedId]
 * @param {?string} [requestedAction]
 * @param {?string} [requestedMethod]
 * @returns {ZTComponentErrorEither<NodeType, Template>}
 */
export const buildAccessError = <
  NodeType extends Node,
  Template extends IBaseComponentTemplate<NodeType>
>(
  template: Template,
  type: ZTComponentErrorTypes,
  message: string,
  requestedId?: string,
  requestedAction?: string,
  requestedMethod?: string
): ZTComponentErrorEither<NodeType, Template> => {
  return {
    message,
    requestedAction,
    requestedId,
    requestedMethod,
    template,
    name: "ZTComponentError",
    component: template.name,
    errorType: type,
    errorDescription: ZTComponentErrorDescriptions[type],
    ids: template.ids
  }
}

// export const buildStatefulError = <SharedState>(
//     component:
//         | StatefulComponent<SharedState>
//         | DeepStatefulComponent<SharedState>
// ): ZTStatefulComponentError => {};

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:24 PM
 * @author Ágata Ordano
 *
 * @type {{}}
 */
const idDictionary = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "V",
  "X",
  "Y",
  "Z",
  "1",
  "2",
  "3",
  "4",
  "7",
  "8",
  "9",
  "0"
]

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:17:24 PM
 * @author Ágata Ordano
 *
 * @param {number} length
 * @returns {string}
 */
export const unsafeID = (length: number): string => {
  let counter = 0
  let container = ""
  while (length > counter) {
    container += idDictionary[Math.floor(Math.random() * 53)]
    counter++
  }
  return container
}
