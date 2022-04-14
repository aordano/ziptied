import type {
    NodeAction,
    NodeActionRequired,
    OnErrorHandler,
    OnLifecycleHandler,
    Transform,
    ZTComponentErrorEither,
    IBaseComponentTemplate,
    ZTStatefulComponentError,
} from "./types";
import {
    canonicalize,
    unsafeID,
    elementAccessCheck,
    buildAccessError,
} from "./util";
import { fromEvent, Subscription, Observer } from "rxjs";
import { Node, StatefulNode, State } from "./base";

abstract class BaseComponentTemplate<NodeType extends Node>
    implements IBaseComponentTemplate<NodeType>
{
    constructor(
        className: string,
        ids: string[],
        _elements: Record<string, NodeType>
    ) {
        this.name = className;
        this.ids = ids;
        this._elements = _elements;
    }

    // TODO Add method to check if there are new elements with the class name and regenerate them

    protected _elements: Record<string, NodeType>;

    public name;

    public ids;

    public actionsListOf(id: string) {
        return this._elements[id] ? this._elements[id].actionsList : [];
    }

    public addAction(
        actionId: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        this.ids.forEach((id) => {
            this._elements[id].addAction(
                actionId,
                action,
                onError,
                onLifecycle
            );
        });
    }

    public removeAction(actionId: string) {
        this.ids.forEach((id) => {
            if (
                elementAccessCheck(
                    actionId,
                    "action",
                    this.name,
                    this.actionsListOf(id)
                )
            ) {
                this._elements[id].removeAction(actionId);
            }
        });
    }

    public fireAction(actionId: string, payload?: unknown) {
        this.ids.forEach((id) => {
            if (
                elementAccessCheck(
                    actionId,
                    "action",
                    this.name,
                    this.actionsListOf(id)
                )
            ) {
                this._elements[id].fireAction(actionId, payload);
            } else {
                return buildAccessError<NodeType, this>(
                    this,
                    "ENOACTION",
                    "Unable to fire action",
                    id
                );
            }
        });
    }

    public sideEffect(observer: Partial<Observer<HTMLElement>>) {
        const subs: Subscription[] = [];
        this.ids.forEach((id) => {
            subs.push(this._elements[id].sideEffect(observer));
        });
        return subs;
    }

    public addActionFor(
        actionId: string,
        elementId: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ): void | ZTComponentErrorEither<NodeType, this> {
        if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
            if (
                !elementAccessCheck(
                    actionId,
                    "action",
                    this.name,
                    this.actionsListOf(elementId)
                )
            ) {
                this._elements[elementId].addAction(
                    actionId,
                    action,
                    onError,
                    onLifecycle
                );
            } else {
                return buildAccessError<NodeType, this>(
                    this,
                    "EEXISTSACTION",
                    "Unable to add already existing action",
                    elementId
                );
            }
        } else {
            return buildAccessError<NodeType, this>(
                this,
                "ENOELEMENT",
                "Unable to add action to nonexistant element",
                elementId
            );
        }
    }

    public removeActionFrom(
        actionId: string,
        elementId: string
    ): void | ZTComponentErrorEither<NodeType, this> {
        if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
            if (
                elementAccessCheck(
                    actionId,
                    "action",
                    this.name,
                    this.actionsListOf(elementId)
                )
            ) {
                this._elements[elementId].removeAction(actionId);
            } else {
                return buildAccessError<NodeType, this>(
                    this,
                    "ENOACTION",
                    "Unable to remove nonexistant action",
                    elementId
                );
            }
        } else {
            return buildAccessError<NodeType, this>(
                this,
                "ENOELEMENT",
                "Unable to remove action from nonexistant element",
                elementId
            );
        }
    }

    public fireActionFor(
        actionId: string,
        elementId: string,
        payload?: unknown
    ): void | ZTComponentErrorEither<NodeType, this> {
        if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
            if (
                elementAccessCheck(
                    actionId,
                    "action",
                    this.name,
                    this.actionsListOf(elementId)
                )
            ) {
                this._elements[elementId].fireAction(actionId, payload);
            } else {
                return buildAccessError<NodeType, this>(
                    this,
                    "ENOACTION",
                    "Unable to fire nonexistant action",
                    elementId
                );
            }
        } else {
            return buildAccessError<NodeType, this>(
                this,
                "ENOELEMENT",
                "Unable to fire action from nonexistant element",
                elementId
            );
        }
    }

    public sideEffectFor(
        elementId: string,
        observer: Partial<Observer<HTMLElement>>
    ): Subscription[] | ZTComponentErrorEither<NodeType, this> {
        if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
            const subs: Subscription[] = [];
            subs.push(this._elements[elementId].sideEffect(observer));
            return subs;
        }
        return buildAccessError<Node, this>(
            this,
            "ENOELEMENT",
            "Unable to attach side effect",
            elementId
        );
    }
}

class ComponentTemplate extends BaseComponentTemplate<Node> {
    constructor(
        protected className: string,
        prepare?: NodeAction<any>,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const ids: string[] = [];
        const elements: Record<string, Node> = {};
        Array.from(
            // Might look hacky to select by class instead of attribute but makes
            // bolting the component to elements much much easier and cleaner
            document.getElementsByClassName(
                className
            ) as HTMLCollectionOf<HTMLElement>
        ).forEach((element) => {
            const newId = unsafeID(20);
            const doesExist = () => {
                const node = document.querySelector(
                    `[data-${canonicalize("id")}="${newId}"]`
                );
                return !!node;
            };
            if (!doesExist()) {
                element.dataset.ztId = newId;
            }
            ids.push(newId);
            elements[newId] = new Node(newId, onError, onLifecycle, true);
            if (prepare) {
                elements[newId].addAction("prepare", prepare);
                elements[newId].fireAction("prepare");
            }
        });
        super(className, ids, elements);
    }
}

class StatefulComponentTemplate extends BaseComponentTemplate<StatefulNode> {
    constructor(
        protected className: string,
        initialState: any,
        prepare?: NodeAction<any>,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const ids: string[] = [];
        const elements: Record<string, StatefulNode> = {};
        Array.from(
            // Might look hacky to select by class instead of attribute but makes
            // bolting the component to elements much much easier and cleaner
            document.getElementsByClassName(
                className
            ) as HTMLCollectionOf<HTMLElement>
        ).forEach((element) => {
            const newId = unsafeID(20);
            const doesExist = () => {
                const node = document.querySelector(
                    `[data-${canonicalize("id")}="${newId}"]`
                );
                return !!node;
            };
            if (!doesExist()) {
                element.dataset.ztId = newId;
            }
            ids.push(newId);
            elements[newId] = new StatefulNode(
                newId,
                initialState,
                onError,
                onLifecycle,
                true
            );
            if (prepare) {
                elements[newId].addAction("prepare", prepare);
                elements[newId].fireAction("prepare");
            }
        });
        super(className, ids, elements);
    }

    public getLocalState(
        id: string,
        stateKey?: string
    ): any | ZTComponentErrorEither<StatefulNode, this> {
        if (elementAccessCheck(id, "element", this.name, this.ids)) {
            return this._elements[id].getState(stateKey);
        }
        return buildAccessError<StatefulNode, this>(
            this,
            "ENOELEMENT",
            "Unable to get state from element",
            id,
            undefined,
            "getState"
        );
    }

    public getLocalStateObject(
        id: string,
        stateKey?: string
    ): State<any> | ZTComponentErrorEither<StatefulNode, this> {
        if (elementAccessCheck(id, "element", this.name, this.ids)) {
            return this._elements[id].getStateObject(stateKey);
        }
        return buildAccessError<StatefulNode, this>(
            this,
            "ENOELEMENT",
            "Unable to get state from element",
            id,
            undefined,
            "getState"
        );
    }

    public setLocalState(
        id: string,
        newState: any,
        stateKey?: string
    ): void | ZTComponentErrorEither<StatefulNode, this> {
        if (elementAccessCheck(id, "element", this.name, this.ids)) {
            this._elements[id].setState(newState, stateKey);
        }
        return buildAccessError<StatefulNode, this>(
            this,
            "ENOELEMENT",
            "Unable to set element state",
            id,
            undefined,
            "setState"
        );
    }

    public transformLocalState(
        id: string,
        transform: Transform<any>,
        stateKey?: string
    ): void | ZTComponentErrorEither<StatefulNode, this> {
        if (elementAccessCheck(id, "element", this.name, this.ids)) {
            this._elements[id].transformState(transform, stateKey);
        }
        return buildAccessError<StatefulNode, this>(
            this,
            "ENOELEMENT",
            "Unable to transform element state",
            id,
            undefined,
            "transformState"
        );
    }

    public sideEffectStateful(
        action: NodeAction<any>,
        stateKey: string
    ): Subscription[] {
        const subs: Subscription[] = [];
        this.ids.forEach((id) => {
            subs.push(this._elements[id].sideEffectStateful(action, stateKey));
        });
        return subs;
    }

    public sideEffectStatefulFor<LocalState>(
        elementId: string,
        action: NodeAction<LocalState>
    ): Subscription[] | ZTComponentErrorEither<StatefulNode, this> {
        const subs: Subscription[] = [];
        if (elementAccessCheck(elementId, "element", this.name, this.ids)) {
            subs.push(this._elements[elementId].sideEffectStateful(action));
            return subs;
        }
        return buildAccessError<StatefulNode, this>(
            this,
            "ENOELEMENT",
            "Unable to attach side effect to element",
            elementId,
            undefined,
            "sideEffectStatefulFor"
        );
    }
}

abstract class BaseComponent<Template extends BaseComponentTemplate<Node>> {
    constructor(components: Template) {
        // TODO Handle SharedState initialization
        this._components = components;
    }

    protected _components: Template;

    get name(): string {
        return this._components.name;
    }

    get dangerouslyGetComponentTemplate(): Template {
        // TODO add way to enable or disable access to this option
        return this._components;
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
    public onLoad(
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        this._components.addAction("onLoad", action);
        fromEvent(window, "load").subscribe({
            next: () => {
                this._components.fireAction("onLoad");
            },
            error: onError,
            complete: onLifecycle,
        });
    }

    public addAction<Data>(name: string, action: NodeAction<Data>) {
        this._components.addAction(name, action);
    }

    public fireAction(name: string) {
        this._components.fireAction(name);
    }

    public instantAction<Data>(action: NodeAction<Data>) {
        this._components.addAction(
            `RESERVED_${canonicalize("anonymous")}`,
            action
        );
        this._components.fireAction(`RESERVED_${canonicalize("anonymous")}`);
    }

    public onUpdate(
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        this._components.addAction("onUpdate", action);
        this._components.sideEffect({
            next: () => {
                this._components.fireAction("onUpdate");
            },
            error: onError,
            complete: onLifecycle,
        });
    }

    public addSideEffect<Data>(
        effectName: string,
        action: NodeAction<Data>,
        stateHolder: State<Data>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        // console.info(
        //     `Added global effect "${effectName}" to component ${this._name}`
        // );

        this._components.addAction(effectName, action);
        stateHolder.subscribe({
            next: (data) => this._components.fireAction(effectName, data),
            error: onError,
            complete: onLifecycle,
        });
    }

    // FIXME for some reason the event stuff is not working
    public onEvent(
        event: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        // console.info(
        //     `Added global event listener to component ${this._name} for "${event}"`
        // );

        this._components.addAction(`on${event}`, action);
        fromEvent(window, event).subscribe({
            next: (event) => {
                // console.info(
                //     `Received global event "${event.type}" on component "${this._name}"`
                // );
                this._components.fireAction(`on${event}`, event);
            },
            error: onError,
            complete: onLifecycle,
        });
    }

    public onEventLocal<LocalEvent extends Event>(
        eventName: string,
        action: NodeAction<LocalEvent>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        // console.info(
        //     `Added local event listener to component ${this._name} for "${eventName}"`
        // );

        this._components.addAction(eventName, action);

        this._components.ids.forEach((elementId: string) => {
            const element = document.querySelector(
                `[data-${canonicalize("id")}="${elementId}"]`
            ) as HTMLElement | null;
            if (element) {
                fromEvent(element, eventName).subscribe({
                    next: (event) => {
                        // console.info(
                        //     `Received local event "${event.type}" on component "${this._name}" with id "${elementId}"`
                        // );
                        this._components.fireActionFor(
                            eventName,
                            elementId,
                            event
                        );
                    },
                    error: onError,
                    complete: onLifecycle,
                });
            }
        });
    }
}

export class Component extends BaseComponent<ComponentTemplate> {
    constructor(
        name: string,
        prepare?: NodeAction<any>,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const template = new ComponentTemplate(
            canonicalize(name),
            prepare,
            onError,
            onLifecycle
        );
        super(template);
    }
}

export class StatefulComponent<
    SharedState
> extends BaseComponent<ComponentTemplate> {
    constructor(
        name: string,
        initialSharedState: SharedState,
        prepare?: NodeAction<SharedState>,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const template = new ComponentTemplate(
            canonicalize(name),
            prepare,
            onError,
            onLifecycle
        );
        super(template);
        this._sharedState = new State(initialSharedState);
        this._sharedStateValue = initialSharedState;
        this._sharedState.subscribe({
            next: (value) => (this._sharedStateValue = value),
        });
    }

    protected _sharedState: State<SharedState>;

    protected _sharedStateValue: SharedState;

    get sharedState(): SharedState {
        return this._sharedStateValue;
    }

    set sharedState(data) {
        throw new Error(
            "Shared state is readonly. Use the methods to modify it."
        );
    }

    get sharedStateObject(): State<SharedState> {
        return this._sharedState;
    }

    public setSharedState(newState: SharedState): void {
        this._sharedState.update(newState);
    }

    public transformSharedState(transform: Transform<SharedState>): void {
        this._sharedState.update(transform(this._sharedStateValue));
    }

    public addStatefulAction<SharedState>(
        name: string,
        action: NodeActionRequired<SharedState>
    ) {
        this._components.addAction(name, (node: HTMLElement) =>
            action(node, this.sharedState as unknown as SharedState)
        );
    }
}

export class DeepStatefulComponent<
    SharedState
> extends BaseComponent<StatefulComponentTemplate> {
    constructor(
        name: string,
        initialLocalState: any,
        initialSharedState: SharedState,
        prepare?: NodeAction<{ shared: SharedState; local: any }>,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const template = new StatefulComponentTemplate(
            canonicalize(name),
            initialLocalState,
            prepare,
            onError,
            onLifecycle
        );
        super(template);
        this._sharedState = new State(initialSharedState);
        this._sharedStateValue = initialSharedState;
        this._sharedState.subscribe({
            next: (value) => (this._sharedStateValue = value),
        });
    }

    protected _sharedState: State<SharedState>;

    protected _sharedStateValue: SharedState;

    get sharedState(): SharedState {
        return this._sharedStateValue;
    }

    set sharedState(data) {
        throw new Error(
            "Shared state is readonly. Use the methods to modify it."
        );
    }

    get sharedStateObject(): State<SharedState> {
        return this._sharedState;
    }

    public setSharedState(newState: SharedState): void {
        this._sharedState.update(newState);
    }

    public transformSharedState(transform: Transform<SharedState>): void {
        this._sharedState.update(transform(this._sharedStateValue));
    }

    public addStatefulAction<SharedState>(
        name: string,
        action: NodeActionRequired<SharedState>
    ) {
        this._components.addAction(name, (node: HTMLElement) =>
            action(node, this.sharedState as unknown as SharedState)
        );
    }

    public addSideEffectStateful<LocalState, SharedState>(
        effectName: string,
        action: NodeAction<{ local: LocalState; shared: SharedState }>,
        stateHolder: State<SharedState>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        // console.info(
        //     `Added global effect "${effectName}" to component ${this._name}`
        // );

        this._components.addAction(effectName, action);
        stateHolder.subscribe({
            next: (data) => this._components.fireAction(effectName, data),
            error: onError,
            complete: onLifecycle,
        });
    }

    // TODO add better way to handle the local state of each element
    public onEventLocalStateful(
        event: string,
        state: any,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        // console.info(
        //     `Added local event listener to component ${this._name} for "${event}"`
        // );

        const statefulAction = (node: HTMLElement): HTMLElement => {
            return action(node, state);
        };

        this._components.addAction(`on${event}`, statefulAction);

        this._components.ids.forEach((elementId) => {
            const element = document.querySelector(
                `[data-${canonicalize("id")}="${elementId}"]`
            ) as HTMLElement | null;
            if (element) {
                fromEvent(element, event).subscribe({
                    next: (event) => {
                        // console.info(
                        //     `Received local event "${event.type}" on component "${this._name}" with id "${elementId}"`
                        // );
                        this._components.fireAction(`on${event}`, event);
                    },
                    error: onError,
                    complete: onLifecycle,
                });
            }
        });
    }
}
