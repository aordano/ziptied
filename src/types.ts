import type { WritableKeys, OmitProperties } from "ts-essentials";

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
