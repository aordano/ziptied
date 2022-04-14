import {
    ZTComponentError,
    ZTComponentErrorDescriptions,
    ZTStatefulComponentError,
    ZTComponentErrorTypes,
    ZTComponentErrorEither,
    IBaseComponentTemplate,
} from "./types";

import type { Node, StatefulNode } from "./base";

import type {
    Component,
    StatefulComponent,
    DeepStatefulComponent,
} from "./component";

export const canonicalize = (name: string) => `zt-${name}`;

export const elementAccessCheck = (
    id: string,
    type: string,
    containerName: string,
    elements: Record<string, any>
): boolean => {
    if (Object.values(elements).indexOf(id) !== -1) {
        return true;
    } else {
        // TODO add debug level support
        console.error(
            `No ${type} with key ${id} was found in component ${containerName}`
        );
        return false;
    }
};

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
        ids: template.ids,
    };
};

// export const buildStatefulError = <SharedState>(
//     component:
//         | StatefulComponent<SharedState>
//         | DeepStatefulComponent<SharedState>
// ): ZTStatefulComponentError => {};

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
    "0",
];

export const unsafeID = (length: number): string => {
    let counter = 0;
    let container = "";
    while (length > counter) {
        container += idDictionary[Math.floor(Math.random() * 53)];
        counter++;
    }
    return container;
};
