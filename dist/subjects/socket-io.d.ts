import { ioEvent } from "./io-events";
import { Subscription } from 'rxjs';
export declare class IO {
    /** this will be set as a reference to io.Socket */
    private socket;
    private address;
    private opts;
    /** events will be used to push which events we should be listening to */
    private events;
    private _socketState;
    /**
     * The Subscribable (Observable) prop
     * subscribe to this prop to be notified of data update
     * @type {Observable}
     */
    event$: any;
    /** this prop will pretty much control the "is connected" or not.
     * it also controls whether or not we should issue this.socket.disconnect() */
    private _connected;
    /**
     * returns an event by matching ioEvent.name against the provided argument string
     * @param name {string} `the name of the event`
     * @param isUnique {boolean}
     * @returns {ioEvent | boolean}
     */
    private getEvent(name, isUnique?);
    constructor(address?: string, opts?: any);
    /** a reference to the raw socket returned from io(), if connected */
    readonly raw: any;
    /** an alias for `this.Socket.emit();`
     * which will only emit if connected. */
    emit(eventName: string, data?: Object): void;
    /** check if Event exists so we don't pollute the events list with dupes
     * EVEN if it's a `once` event, as one change will trigger all listeners */
    eventExists(ioEvent: ioEvent): boolean;
    /**
     * pushes an ioEvent to be heard and returns the event,
     * or the existing event - if that's true
     * @usage
     *
     * ```typescript
     * const helloWorld = new ioEvent('hello-world);
     * const helloWorld$ = this.listenToEvent(helloWorld)
     *   .event$.subcribe(newState => console.log(newState));
     * ```
     * @param ioEvent
     * @returns {ioEvent}
     */
    listenToEvent(ioEvent: ioEvent): ioEvent;
    /**
     * A function that receives an array of either strings or IoEventInfo
     * and returns the equivalent subscription after having transformed the
     * input into a @ioEvent and having issued `this.listenToEvent`.
     *
     * Think of this as a bulk listenToEvent that can be deconstructed.
     *
     * @usage
     *
     *```typescript
     *
     * const {helloWorld$, dondeEsLaBiblioteca$} = this.socket.listen([
     *   'hello-world',
     *   {name:'where-is-the-library', once: true}
     * ]);
     *
     * helloWorld$.subscribe(newState => console.debug('helloWorld$',newState));
     * dondeEsLaBiblioteca$.subscribe(newState => console.debug('dondeEsLaBiblioteca$',newState));
     *```
     * @param eventsArray {(string|IoEventInfo)[]}
     * @returns {Subscription[]}
     */
    listen(eventsArray: any[]): Subscription[];
    /**
     * Removes an ioEvent from the listening queue
     * @param ioEventName {string}
     */
    unhook(ioEventName: string): void;
    /**
     * Makes a new connection to the @SOCKET_URL const and sets up a `on connect` by default
     * which will in turn update the @this._socketState Subject with the containing
     * the received data as an argument (as well as the event-name)
     * @param forceNew Whether to force a new socket connection
     */
    connect(string: any, forceNew?: boolean): void;
    /**
     * Closes the socket connection
     */
    disconnect(): void;
    /**
     * check if socket is connected
     * @returns {boolean}
     */
    /**
     * Sends a new connection status event
     * @param value Connection status
     */
    connected: boolean;
}
