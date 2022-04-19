/**
 * TODO
 *
 *
 *
 *
 *
 *
 * @module
 */

import {
    map,
    fromEvent,
    Observable,
    Subscription,
    Observer,
    startWith,
    OperatorFunction,
} from "rxjs";

// fixme i actually no longer understand this, review
/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:32 PM
 * @author Ágata Ordano
 *
 * @export
 * @class ActiveEvent
 * @typedef {ActiveEvent}
 * @template EventData
 */
export class ActiveEvent<EventData> {
    /**
     * Creates an instance of ActiveEvent.
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @constructor
     * @param {string} event
     * @param {(event: Event, data?: unknown) => EventData} mapFunction
     */
    constructor(
        event: string,
        mapFunction: (event: Event, data?: unknown) => EventData
    ) {
        const source = fromEvent(window, event);
        this._stream = source.pipe(map(mapFunction));
        this._subscriptions = {};
    }

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @protected
     * @type {Observable<EventData>}
     */
    protected _stream: Observable<EventData>;

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @protected
     * @type {Record<string, Subscription>}
     */
    protected _subscriptions: Record<string, Subscription>;

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @public
     * @param {string} id
     * @param {Partial<Observer<EventData>>} observer
     */
    public subscribe(id: string, observer: Partial<Observer<EventData>>): void {
        this._subscriptions[id] = this._stream.subscribe(observer);
    }

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @public
     * @param {string} id
     */
    public unsubscribe(id: string): void {
        this._subscriptions[id].unsubscribe();
    }
}

// fixme i actually no longer understand this, review, but now it does not even work
// export class ActiveCustomEvent<
//     EventData,
//     EventImplementation extends Event,
//     Target extends
//         | HasEventTargetAddRemove<EventImplementation>
//         | ArrayLike<HasEventTargetAddRemove<EventImplementation>>
// > {
//     constructor(
//         event: string,
//         target: Target,
//         mapFunction: (value: Target, data?: unknown) => EventData,
//         middleware?: OperatorFunction<EventImplementation, Target>
//     ) {
//         const source = fromEvent(target, event);
//         this._stream = middleware
//             ? source.pipe(middleware, map(mapFunction))
//             : source.pipe(target, map(mapFunction));
//     }

//     protected _stream: Observable<EventData>;

//     protected _subscriptions: Record<string, Subscription>;

//     public subscribe(id: string, observer: Partial<Observer<EventData>>): void {
//         this._subscriptions[id] = this._stream.subscribe(observer);
//     }

//     public unsubscribe(id: string): void {
//         this._subscriptions[id].unsubscribe();
//     }
// }
/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:32 PM
 * @author Ágata Ordano
 *
 * @export
 * @class MediaQuery
 * @typedef {MediaQuery}
 */
export class MediaQuery {
    /**
     * Creates an instance of MediaQuery.
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @constructor
     * @param {string} query
     */
    constructor(query: string) {
        this._query = query;
        const mediaQuery = window.matchMedia(query);
        this._stream = fromEvent(mediaQuery, "change").pipe(
            // HACK dunno why i need to specify that the media query list is not an event
            startWith(mediaQuery) as OperatorFunction<Event, MediaQueryList>,
            map((list: typeof mediaQuery) => list.matches)
        );
    }

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @protected
     * @type {*}
     */
    protected _query;

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @protected
     * @type {Observable<boolean>}
     */
    protected _stream: Observable<boolean>;

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @protected
     * @type {Record<string, Subscription>}
     */
    protected _subscriptions: Record<string, Subscription> = {};

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @public
     * @param {string} subscriptionId
     * @param {Partial<Observer<boolean>>} observer
     */
    public subscribe(
        subscriptionId: string,
        observer: Partial<Observer<boolean>>
    ): void {
        this._subscriptions[subscriptionId] = this._stream.subscribe(observer);
    }

    /**
     * TODO  -- Description placeholder
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @public
     * @param {string} id
     */
    public unsubscribe(id: string): void {
        this._subscriptions[id].unsubscribe();
    }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:32 PM
 * @author Ágata Ordano
 *
 * @export
 * @class WidthQuery
 * @typedef {WidthQuery}
 * @extends {MediaQuery}
 */
export class WidthQuery extends MediaQuery {
    /**
     * Creates an instance of WidthQuery.
     * @date 4/19/2022 - 12:14:32 PM
     * @author Ágata Ordano
     *
     * @constructor
     * @param {?number} [max]
     * @param {?number} [min]
     */
    constructor(max?: number, min?: number) {
        const query = max
            ? min
                ? `(max-width: ${max}px) and (min-width: ${min}px)`
                : `(max-width: ${max}px)`
            : min
            ? `(min-width: ${min}px)`
            : "";

        super(query);
    }
}
