import { Nodes } from "./actions";
import type {
    DirectlyEditableHTMLProps,
    NodeAction,
    NodeActionRef,
    OnErrorHandler,
    OnLifecycleHandler,
    Transform,
} from "./types";
import {
    map,
    Observable,
    BehaviorSubject,
    Subject,
    Subscription,
    Observer,
} from "rxjs";
import short from "short-uuid";

export class EditableNode<
    EditableHTMLProp extends HTMLElement[DirectlyEditableHTMLProps]
> {
    constructor(
        public readonly initialState: EditableHTMLProp,
        public id: string
    ) {
        this._subscriptions = {};
        this._transforms = {};
        this.initialState = initialState;
        this._state = new BehaviorSubject<EditableHTMLProp>(initialState);
    }

    protected _subscriptions: Record<string, Subscription>;

    protected _state: BehaviorSubject<EditableHTMLProp>;

    protected _transforms: Record<
        string,
        Transform<EditableHTMLProp> | undefined
    >;

    protected _setDirectPropertyObserver(
        nodeProperty: DirectlyEditableHTMLProps,
        transform: Transform<EditableHTMLProp> = (data) => data,
        onError?: Observer<EditableHTMLProp>["error"],
        onLifecycle?: Observer<EditableHTMLProp>["complete"]
    ): void {
        this._subscriptions[nodeProperty] = this._state.subscribe({
            next: (data) => {
                Object.defineProperty(
                    document.getElementById(this.id),
                    nodeProperty,
                    {
                        value: transform(data),
                    }
                );
            },
            error: onError ? onError : () => {},
            complete: onLifecycle ? onLifecycle : () => {},
        });
    }

    protected _unsetDirectPropertyObserver(
        nodeProperty: DirectlyEditableHTMLProps
    ): void {
        if (!this._subscriptions[nodeProperty]) {
            return;
        }
        this._subscriptions[nodeProperty].unsubscribe();
        return;
    }

    public setProperty(
        property: DirectlyEditableHTMLProps,
        transform?: Transform<EditableHTMLProp>,
        onError?: Observer<EditableHTMLProp>["error"],
        onLifecycle?: Observer<EditableHTMLProp>["complete"]
    ): void {
        this._transforms[property] = transform;
        this._setDirectPropertyObserver(
            property,
            transform,
            onError,
            onLifecycle
        );
    }

    public unsetProperty(property: DirectlyEditableHTMLProps): void {
        this._unsetDirectPropertyObserver(property);
    }

    public update(value: EditableHTMLProp): void {
        this._state.next(value);
    }

    public sideEffect(
        observer: Partial<Observer<EditableHTMLProp>>
    ): Subscription {
        return this._state.subscribe(observer);
    }
}

export class State<Data> {
    constructor(public readonly initialState: Data) {
        this.initialState = initialState;
        this._state = new BehaviorSubject<Data>(initialState);
    }

    protected _state: BehaviorSubject<Data>;

    public update(value: Data): void {
        this._state.next(value);
    }

    public subscribe(observer: Partial<Observer<Data>>): Subscription {
        return this._state.subscribe(observer);
    }
}

export class Node {
    constructor(
        protected id: string,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"],
        isComponent?: boolean
    ) {
        // TODO handle the state initialization
        this._isComponent = isComponent ?? false;
        if (this._isComponent) {
            this._nodeElement = () => {
                const element = document.querySelector(
                    `[data-zt-id="${id}"]`
                ) as HTMLElement | null;
                if (!element) {
                    throw new Error(
                        "No elements found; can't add reactivity to a node that does not exist."
                    );
                } else {
                    return element;
                }
            };
        } else {
            this._nodeElement = () => {
                const element = document.getElementById(id);
                if (!element) {
                    throw new Error(
                        "No elements found; can't add reactivity to a node that does not exist."
                    );
                } else {
                    return element;
                }
            };
        }
        this._node = new BehaviorSubject(this._nodeElement());
        this._nodeSubscription = this._node.subscribe({
            next: (node) => {
                this._nodeElement().replaceWith(node);
            },
            error: onError ? onError : () => {},
            complete: onLifecycle ? onLifecycle : () => {},
        });
        this._action = new BehaviorSubject({ id: "" });
        this._actions = {};
        this._actionSubscriptions = {};

        const defaultActionKeys: (keyof typeof Nodes)[] = Object.keys(
            Nodes
        ) as unknown as (keyof typeof Nodes)[];
        defaultActionKeys.forEach((actionKey) => {
            this.addAction(actionKey, Nodes[actionKey]);
        });
    }

    protected _isComponent: boolean;

    protected _nodeElement: () => HTMLElement;

    protected _nodeSubscription: Subscription;

    protected _actionSubscriptions: Record<string, Subscription>;

    protected _node: BehaviorSubject<HTMLElement>;

    protected _action: BehaviorSubject<NodeActionRef<any>>;

    protected _actions: Record<string, NodeAction<any>>;

    public addAction(
        actionId: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        this._actions[actionId] = action;
        this._actionSubscriptions[actionId] = this._action.subscribe({
            next: (data) => {
                if (data.id === actionId) {
                    this._node.next(action(this._nodeElement(), data.payload));
                }
                return data;
            },
            error: onError,
            complete: onLifecycle,
        });
    }

    public removeAction(actionId: string) {
        this._actionSubscriptions[actionId].unsubscribe();
        delete this._actions[actionId];
    }

    public fireAction(actionId: string, payload?: any) {
        this._action.next({ id: actionId, payload: payload });
    }

    public get actionsList() {
        return Object.keys(this._actions);
    }

    public sideEffect(observer: Partial<Observer<HTMLElement>>): Subscription {
        return this._node.subscribe(observer);
    }
}

export class StatefulNode extends Node {
    constructor(
        protected id: string,
        initialState: any,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"],
        isComponent?: boolean
    ) {
        super(id, onError, onLifecycle, isComponent);

        this._states = {};
        this._stateValues = {};
        this._states["default"] = new State(initialState);
        this._states["default"].subscribe({
            next: (value) => (this._stateValues["default"] = value),
        });
    }

    protected _states: Record<string, State<any>>;

    protected _stateValues: Record<string, any>;

    public getState(stateKey?: string): any {
        return this._stateValues[stateKey ?? "default"];
    }

    public getStateObject(stateKey?: string): State<any> {
        return this._states[stateKey ?? "default"];
    }

    public setState(newState: unknown, stateKey?: string): void {
        // console.log(
        //     `Setting state for node ${this.id}, key ${stateKey}, with the data ${newState}`
        // );
        if (this._states[stateKey ?? "default"]) {
            this._states[stateKey ?? "default"].update(newState);
        } else {
            this._states[stateKey ?? "default"] = new State(newState);
            this._states[stateKey ?? "default"].subscribe({
                next: (value) =>
                    (this._stateValues[stateKey ?? "default"] = value),
            });
        }
    }

    public transformState(
        transform: Transform<unknown>,
        stateKey?: string
    ): void {
        this._states[stateKey ?? "default"].update(
            transform(this._stateValues[stateKey ?? "default"])
        );
    }

    public sideEffectStateful(
        action: NodeAction<any>,
        stateKey?: string
    ): Subscription {
        return this._states[stateKey ?? "default"].subscribe({
            next: (state) => {
                action(this._nodeElement(), state);
            },
        });
    }
}

export class Stream<Data> {
    constructor() {
        this._state = new Subject<Data>();
    }

    protected _state: Subject<Data>;

    public subscribe(
        transform: (data: unknown) => Data,
        observer: Observer<Data>
    ): Subscription {
        return this._state.pipe(map(transform)).subscribe(observer);
    }

    public add(value: Data): void {
        this._state.next(value);
    }
}

// TODO fix the typings of window and shit
// TODO clean, fix and extend this properly
// TODO make a more decent startup script
