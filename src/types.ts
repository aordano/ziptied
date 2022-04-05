import type { WritableKeys, OmitProperties } from "ts-essentials";

export type DirectlyEditableHTMLProps = WritableKeys<
    OmitProperties<HTMLElement, object | Function>
>;

export type DirectlyEditableStyleProps = WritableKeys<HTMLElement["style"]>;

export type NodeAction<Payload> = (
    node: HTMLElement,
    payload?: Payload
) => HTMLElement;

export interface NodeActionRef<Payload> {
    id: string;
    payload?: Payload;
}

// TODO Extend this adding metadata and stuff
export type OnErrorHandler = (error: Error) => void;

// TODO Extend this adding metadata and stuff
export type OnLifecycleHandler = () => void;
