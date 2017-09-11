import { IoEventInfo } from "./../interfaces/socket-io";
export declare class ioEvent {
    /** this is the reference for a io() value */
    private clientSocket;
    /** the actual Rx Subject */
    private _lastEvent;
    /** a reference to the last received event */
    lastEvent: Object;
    /**
     * Responsible for eventCounting and updating data on the ReplaySubject
     * if _onUpdate exists, it will be called with newData as argument
     * @param newData
     */
    private updateData(newData);
    private _onUpdate;
    /**
     * Event information
     * @type {IoEventInfo}
     */
    event: IoEventInfo;
    constructor(name: string, isUnique?: boolean, count?: number, initialState?: string | Object);
    /**
     * The Subscribable (Observable) prop
     * subscribe to this prop to be notified of data update
     *
     * @usage
     *
     * ```
     * const event = new ioEvent('event');
     * const event$ = event.$event.subscribe(() => {});
     * ```
     * @type {Observable}
     */
    event$: any;
    /**
     * returns whether the event has triggered or not
     * @returns {boolean}
     */
    readonly hasTriggered: boolean;
    /**
     * returns if the event is unique or not
     * @returns {boolean}
     */
    readonly isUnique: boolean;
    /**
     * Returns the event name
     * @returns {string}
     */
    readonly name: string;
    /** a callback that should be ran on every state update */
    /**
     * Set this to a function value if you want something to run *after*
     * the value has been updated.
     * @param fn {Function}
     */
    onUpdate: Function;
    /**
     * hook() is an alias to `socket.on()` or `socket.once()` depending on the provided `IoEventInfo`
     * provide a socket-io client socket so the ioEvent can make the hook. It will use that socket
     * from there on, unless @this.clientSocket is not the same as the provided one: Then it will re-hook
     * *without calling unhook*
     * @param clientSocket {Socket}
     */
    hook(clientSocket: any): void;
    /** unhook is an alias for "off", and since we only have one real callback attached to the Emitter
     * we don't need to pass a `fn` argument */
    unhook(): void;
    private _initialState;
    /**
     * Use this to set an initialState to be reset to when connection closes
     * otherwise, false will be the updating value. If your initialState is
     * set an as Object, the new state will be `Object.assign`ed.
     * @param state {any}
     */
    initialState: string | Object;
    /**
     * Reset state updates the ReplaySubject with the initialState;
     * If none exists, `false` is used as default
     */
    resetState(): void;
}
