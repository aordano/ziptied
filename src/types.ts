import type { WritableKeys, OmitProperties } from "ts-essentials";

import type { Node, StatefulNode, State } from "./base";

import { fromEvent, Subscription, Observer } from "rxjs";

export type DirectlyEditableHTMLProps = WritableKeys<
    OmitProperties<HTMLElement, object | Function>
>;

export type DirectlyEditableStyleProps = WritableKeys<HTMLElement["style"]>;

export type NodeAction<Payload> = (
    node: HTMLElement,
    payload?: Payload
) => HTMLElement;

export type NodeActionRequired<Payload> = (
    node: HTMLElement,
    payload: Payload
) => HTMLElement;

export type NodeActionImpure = (node: HTMLElement) => HTMLElement;

export interface NodeActionRef<Payload> {
    id: string;
    payload?: Payload;
}

export type Transform<Data> = (data: Data) => Data;

// TODO Extend this adding metadata and stuff
export type OnErrorHandler = (error: Error) => void;

// TODO Extend this adding metadata and stuff
export type OnLifecycleHandler = () => void;

export type TextReplacerState<
    Selector extends string,
    Corpus extends Record<Selector, Record<string, string>>
> = {
    selected: Selector;
    corpus: Corpus;
};

export const isStringExtension = <
    Selector extends string,
    Container extends Record<Selector, unknown>
>(
    key: unknown,
    container: Container
): key is Selector => {
    return (key as Selector) in container ? true : false;
};

export const ZTComponentErrorDescriptions = {
    ENOACTION: "Action not found on element",
    ENOELEMENT: "Element not found in component",
    ENOCOMPONENT: "Component not found",
    EEXISTSACTION: "Action already exists on element",
    EEXISTSELEMENT: "Element already exists in component",
    EEXISTSCOMPONENT: "Component already exists",
};

export type ZTComponentErrorTypes = keyof typeof ZTComponentErrorDescriptions;

export interface ZTComponentError<Template> extends Error {
    component: string;
    errorType: ZTComponentErrorTypes;
    errorDescription: typeof ZTComponentErrorDescriptions[ZTComponentError<Template>["errorType"]];
    ids: string[];
    template: Template;
    requestedId?: string;
    requestedAction?: string;
    requestedMethod?: string;
}

export interface ZTStatefulComponentError<Template>
    extends ZTComponentError<Template> {
    sharedState?: State<any>;
    localState?: State<any>;
}

export type ZTComponentErrorEither<NodeType, Template> =
    NodeType extends StatefulNode
        ? ZTStatefulComponentError<Template>
        : ZTComponentError<Template>;

export interface IBaseComponentTemplate<NodeType extends Node> {
    name: string;

    ids: string[];

    actionsListOf(id: string): void;

    addAction(
        actionId: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ): void;

    removeAction(
        actionId: string
    ): (ZTComponentErrorEither<NodeType, this> | false)[];

    fireAction(
        actionId: string,
        payload?: unknown
    ): (ZTComponentErrorEither<NodeType, this> | false)[];

    sideEffect(observer: Partial<Observer<HTMLElement>>): Subscription[];

    addActionFor(
        actionId: string,
        elementId: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ): void | ZTComponentErrorEither<NodeType, this>;

    removeActionFrom(
        actionId: string,
        elementId: string
    ): void | ZTComponentErrorEither<NodeType, this>;

    fireActionFor(
        actionId: string,
        elementId: string,
        payload?: unknown
    ): void | ZTComponentErrorEither<NodeType, this>;

    sideEffectFor(
        elementId: string,
        observer: Partial<Observer<HTMLElement>>
    ): Subscription[] | ZTComponentErrorEither<NodeType, this>;
}
