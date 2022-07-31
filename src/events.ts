/**
 * TODO
 *
 *
 *
 *
 *
 *
 * @module
 * @category Events
 */

import {
  ArbitraryEvent,
  BaseUIMediaStateDefaultBreakpointsZT,
  BaseUIMediaStateTypesVariantsZT
} from "./types"
import {
  Observable,
  Observer,
  OperatorFunction,
  Subscription,
  fromEvent,
  map,
  startWith
} from "rxjs"
import { HasEventTargetAddRemove } from "rxjs/internal/observable/fromEvent"

// fixme i actually no longer understand this, review
/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:32 PM
 *
 * @export
 * @class ActiveEvent
 * @typedef {ActiveEvent}
 * @template EventData
 * @category Generic Event Handlers
 */
export class ActiveEvent<Target, EventData> {
  /**
   * Creates an instance of ActiveEvent.
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @constructor
   * @param {string} event
   * @param {(event: ArbitraryEvent<Target>, data?: unknown) => EventData} mapFunction
   */
  constructor(
    event: string,
    target: HasEventTargetAddRemove<ArbitraryEvent<Target>>,
    mapFunction: (event: ArbitraryEvent<Target>, data?: unknown) => EventData
  ) {
    const source = fromEvent(target, event)
    this._stream = source.pipe(map(mapFunction))
    this._subscriptions = {}
    Object.seal(this._stream)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {Observable<EventData>}
   */
  protected _stream: Observable<EventData>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {Record<string, Subscription>}
   */
  protected _subscriptions: Record<string, Subscription>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} id
   * @param {Partial<Observer<EventData>>} observer
   */
  public subscribe(id: string, observer: Partial<Observer<EventData>>): void {
    this._subscriptions[id] = this._stream.subscribe(observer)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} id
   */
  public unsubscribe(id: string): void {
    this._subscriptions[id].unsubscribe()
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
 *
 * @export
 * @class MediaQuery
 * @typedef {MediaQuery}
 * @category UI Event Handlers
 */
export class MediaQuery {
  /**
   * Creates an instance of MediaQuery.
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @constructor
   * @param {string} query
   */
  constructor(query: string) {
    this._query = query
    const mediaQuery = window.matchMedia(query)
    this._stream = fromEvent(mediaQuery, "change").pipe(
      // HACK dunno why i need to specify that the media query list is not an event
      startWith(mediaQuery) as OperatorFunction<Event, MediaQueryList>,
      map((list: typeof mediaQuery) => list.matches)
    )
    Object.seal(this._query)
    Object.seal(this._stream)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {*}
   */
  protected _query

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {Observable<boolean>}
   */
  protected _stream: Observable<boolean>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {Record<string, Subscription>}
   */
  protected _subscriptions: Record<string, Subscription> = {}

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} subscriptionId
   * @param {Partial<Observer<boolean>>} observer
   */
  public subscribe(subscriptionId: string, observer: Partial<Observer<boolean>>): void {
    this._subscriptions[subscriptionId] = this._stream.subscribe(observer)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} id
   */
  public unsubscribe(id: string): void {
    this._subscriptions[id].unsubscribe()
  }
}

/**
 * TODO  -- Description placeholder
 * @date 4/19/2022 - 12:14:32 PM
 *
 * @export
 * @class WidthQuery
 * @typedef {WidthQuery}
 * @extends {MediaQuery}
 * @category UI Event Handlers
 */
export class WidthQuery extends MediaQuery {
  /**
   * Creates an instance of WidthQuery.
   * @date 4/19/2022 - 12:14:32 PM
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
      : ""

    super(query)
  }
}

export class TypeQuery {
  constructor() {
    this._queries = [
      "all",
      "braille",
      "embossed",
      "hadnheld",
      "print",
      "projection",
      "screen",
      "speech",
      "tty",
      "tv"
    ]

    this._queries.forEach((mediaType, index) => {
      this._mediaQueriesValues[index] = false
    })

    Object.seal(this._mediaQueriesValues)

    const mediaQueries = this._queries.map((mediaType) => {
      return window.matchMedia(mediaType)
    })

    const streams = mediaQueries.map((currentQuery) =>
      fromEvent(currentQuery, "change").pipe(
        // HACK dunno why i need to specify that the media query list is not an event
        startWith(currentQuery) as OperatorFunction<Event, MediaQueryList>,
        map((list: typeof currentQuery) => list.matches)
      )
    )

    this._queryObservables = Object.fromEntries(
      streams.map((stream, index) => {
        return [this._queries[index], stream]
      })
    )

    Object.seal(this._queryObservables)

    this._querySubscriptions = streams.map((stream, index) => {
      return stream.subscribe({
        next: (value) => {
          this._mediaQueriesValues[index] = value
        }
      })
    })

    Object.seal(this._querySubscriptions)

    this._filteredQueryObservable = new Observable<string>((Subscriber) => {
      Subscriber.next(this._queries[this._mediaQueriesValues.indexOf(true)])
    })

    Object.seal(this._filteredQueryObservable)
  }

  protected _queries: string[]

  protected _querySubscriptions: Subscription[]

  /**
   * TODO  -- Description placeholderd
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {*}
   */
  protected _mediaQueriesValues: boolean[] = []

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {Observable<boolean>}
   */
  protected _queryObservables: Record<string, Observable<boolean>>

  protected _filteredQueryObservable: Observable<string>

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @protected
   * @type {Record<string, Subscription>}
   */
  protected _subscriptions: Record<string, Subscription> = {}

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} subscriptionId
   * @param {Partial<Observer<boolean>>} observer
   */
  public subscribe(subscriptionId: string, observer: Partial<Observer<string>>): void {
    this._subscriptions[subscriptionId] = this._filteredQueryObservable.subscribe(observer)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} subscriptionId
   * @param {Partial<Observer<boolean>>} observer
   */
  public subscribeToType(
    subscriptionId: string,
    mediaType: BaseUIMediaStateTypesVariantsZT,
    observer: Partial<Observer<boolean>>
  ): void {
    this._subscriptions[subscriptionId] = this._queryObservables[mediaType].subscribe(observer)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} id
   */
  public unsubscribe(id: string): void {
    this._subscriptions[id].unsubscribe()
  }
}

export class BreakpointQuery<T extends BaseUIMediaStateDefaultBreakpointsZT> {
  constructor(breakpoints: T) {
    this._breakpoints = Object.keys(breakpoints)
    this._breakpointObservables = Object.values(breakpoints)
    this._breakpointObservablesObject = breakpoints

    Object.seal(this._breakpoints)

    Object.seal(this._breakpointObservables)

    this._breakpoints.forEach((breakpoint, index) => {
      this._breakpointQueriesValues[index] = false
    })

    Object.seal(this._breakpointQueriesValues)

    this._breakpointObservables.map((breakpoint, index) => {
      return breakpoint.subscribe(this._breakpoints[index], {
        next: (value) => {
          this._breakpointQueriesValues[index] = value
        }
      })
    })

    Object.seal(this._breakpointObservables)

    this._filteredBreakpointObservable = new Observable<string>((subscriber) => {
      subscriber.next(this._breakpoints[this._breakpointQueriesValues.indexOf(true)])
    })

    Object.seal(this._filteredBreakpointObservable)
  }
  protected _breakpointObservables: WidthQuery[]
  protected _breakpointObservablesObject: T
  protected _breakpoints: string[]
  protected _filteredBreakpointObservable: Observable<string>
  protected _breakpointQueriesValues: boolean[] = []
  protected _subscriptions: Record<string, Subscription> = {}
  protected _widthQuerySubscriptions: Record<string, string> = {}

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} subscriptionId
   * @param {Partial<Observer<boolean>>} observer
   */
  public subscribe(subscriptionId: string, observer: Partial<Observer<string>>): void {
    this._subscriptions[subscriptionId] = this._filteredBreakpointObservable.subscribe(observer)
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} subscriptionId
   * @param {Partial<Observer<boolean>>} observer
   */
  public subscribeToType(
    subscriptionId: string,
    breakpoint: string,
    observer: Partial<Observer<boolean>>
  ): void {
    this._breakpointObservablesObject[breakpoint].subscribe(subscriptionId, observer)
    this._widthQuerySubscriptions[subscriptionId] = breakpoint
  }

  /**
   * TODO  -- Description placeholder
   * @date 4/19/2022 - 12:14:32 PM
   *
   * @public
   * @param {string} id
   */
  public unsubscribe(id: string): void {
    if (id in this._subscriptions) {
      this._subscriptions[id].unsubscribe()
      return
    }
    this._breakpointObservablesObject[this._widthQuerySubscriptions[id]].unsubscribe(id)
  }
}
