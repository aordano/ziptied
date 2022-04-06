import type {
    NodeAction,
    OnErrorHandler,
    OnLifecycleHandler,
    Transform,
} from "./types";
import { fromEvent, Subscription, Observer } from "rxjs";
import short from "short-uuid";
import { Node, StatefulNode, State } from "./base";

abstract class BaseComponentTemplate {
    constructor(
        protected className: string,
        ids: string[],
        _elements: Record<string, Node>
    ) {
        this.ids = ids;
        this._elements = _elements;
    }

    // TODO Add method to check if there are new elements with the class name and regenerate them

    protected _elements: Record<string, Node>;

    public ids: string[];

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
            this._elements[id].removeAction(actionId);
        });
    }

    public fireAction(actionId: string, payload?: unknown) {
        this.ids.forEach((id) => {
            this._elements[id].fireAction(actionId, payload);
        });
    }

    public get actionsList() {
        return this._elements[this.ids[0]].actionsList;
    }

    public sideEffect(
        observer: Partial<Observer<HTMLElement>>
    ): Subscription[] {
        const subs: Subscription[] = [];
        this.ids.forEach((id) => {
            subs.push(this._elements[id].sideEffect(observer));
        });
        return subs;
    }
}

class ComponentTemplate extends BaseComponentTemplate {
    constructor(
        protected className: string,
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
            const newId = short.generate();
            const doesExist = () => {
                const node = document.querySelector(`[data-zt-id="${newId}"]`);
                return !!node;
            };
            if (!doesExist()) {
                element.dataset.ztId = newId;
            }
            ids.push(newId);
            elements[newId] = new Node(newId, onError, onLifecycle, true);
        });
        super(className, ids, elements);
    }
}

class StatefulComponentTemplate<StateData> extends BaseComponentTemplate {
    constructor(
        protected className: string,
        initialState: StateData,
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
            const newId = short.generate();
            const doesExist = () => {
                const node = document.querySelector(`[data-zt-id="${newId}"]`);
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
        });
        super(className, ids, elements);
    }

    // TODO add return types
    public getLocalState(id: string) {
        // TODO handle using State
        //return this._elements[id].state;
    }

    // TODO add method to set the local state

    // TODO add method to transform the local state
}

abstract class BaseComponent<Template extends BaseComponentTemplate> {
    constructor(
        name: string,
        components: Template,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        // TODO Handle SharedState initialization
        this._name = `zt-${name}`;
        this._components = components;
    }

    protected _name: string;

    protected _components: Template;

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

    // FIXME for some reason the event stuff is not working
    public onEventGlobal(
        event: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        console.info(
            `Added global event listener to component ${this._name} for "${event}"`
        );

        this._components.addAction(`on${event}`, action);
        fromEvent(window, event).subscribe({
            next: (event) => {
                console.info(
                    `Received global event "${event.type}" on component "${this._name}"`
                );
                this._components.fireAction(`on${event}`, event);
            },
            error: onError,
            complete: onLifecycle,
        });
    }

    public onEventLocal(
        event: string,
        action: NodeAction<any>,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        console.info(
            `Added local event listener to component ${this._name} for "${event}"`
        );

        this._components.addAction(`on${event}`, action);

        this._components.ids.forEach((elementId) => {
            const element = document.querySelector(
                `[data-zt-id="${elementId}"]`
            ) as HTMLElement | null;
            if (element) {
                fromEvent(element, event).subscribe({
                    next: (event) => {
                        console.info(
                            `Received local event "${event.type}" on component "${this._name}" with id "${elementId}"`
                        );
                        this._components.fireAction(`on${event}`, event);
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
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const template = new ComponentTemplate(name, onError, onLifecycle);
        super(name, template, onError, onLifecycle);
    }
}

export class StatefulComponent<
    SharedState
> extends BaseComponent<ComponentTemplate> {
    constructor(
        name: string,
        initialSharedState: SharedState,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const template = new ComponentTemplate(name, onError, onLifecycle);
        super(name, template, onError, onLifecycle);
        this._sharedState = new State(initialSharedState);
    }

    protected _sharedState: State<SharedState>;

    // TODO add return type SharedState
    get sharedState() {
        // TODO update to actually use the State
        return this._sharedState;
    }

    set sharedState(data) {
        throw new Error(
            "Shared state is readonly. Use the methods to modify it."
        );
    }

    // TODO add return types
    public setSharedState(state: SharedState) {
        // TODO update to actually use the State
        //this._sharedState = state;
    }

    // TODO add return types
    public transformSharedState(transform: Transform<SharedState>) {
        // TODO update to actually use the State
        //this._sharedState = transform(this._sharedState);
    }
}

export class DeepStatefulComponent<
    LocalState,
    SharedState
> extends BaseComponent<StatefulComponentTemplate<SharedState>> {
    constructor(
        name: string,
        initialLocalState: LocalState,
        initialSharedState: SharedState,
        onError?: Observer<HTMLElement>["error"],
        onLifecycle?: Observer<HTMLElement>["complete"]
    ) {
        const template = new StatefulComponentTemplate<LocalState>(
            name,
            initialLocalState,
            onError,
            onLifecycle
        );
        super(name, template, onError, onLifecycle);
        this._sharedState = new State(initialSharedState);
    }

    protected _sharedState: State<SharedState>;

    // TODO add return type SharedState
    get sharedState() {
        // TODO update to actually use the State
        return this._sharedState;
    }

    set sharedState(data) {
        throw new Error(
            "Shared state is readonly. Use the methods to modify it."
        );
    }

    // TODO add return types
    public setSharedState(state: SharedState) {
        // TODO update to actually use the State
        //this._sharedState = state;
    }

    // TODO add return types
    public transformSharedState(transform: Transform<SharedState>) {
        // TODO update to actually use the State
        //this._sharedState = transform(this._sharedState);
    }

    // TODO add way to handle the local state of each element
    public onEventLocalStateful(
        event: string,
        action: NodeAction<any>,
        state: LocalState,
        onError?: OnErrorHandler,
        onLifecycle?: OnLifecycleHandler
    ) {
        // TODO
    }
}
