import {ioEvent} from "./io-events";
import {IoEventInfo, SocketState} from './../interfaces/socket-io';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import * as io from 'socket.io-client';
import {isObject} from 'rxjs/util/isObject';
import {Subscription} from 'rxjs';

const SOCKET_URL = "http://localhost:5000";

export class IO {
    /** this will be set as a reference to io.Socket */
    private socket: any;

    /** events will be used to push which events we should be listening to */
    private events: ioEvent[] = [];

    private _socketState: ReplaySubject<SocketState> = new ReplaySubject<SocketState>(1);

    /**
     * The Subscribable (Observable) prop
     * subscribe to this prop to be notified of data update
     * @type {Observable}
     */
    public event$: any = this._socketState.asObservable();

    /** this prop will pretty much control the "is connected" or not.
     * it also controls whether or not we should issue this.socket.disconnect() */
    private _connected: boolean = false;

    /**
     * returns an event by matching ioEvent.name against the provided argument string
     * @param name {string} `the name of the event`
     * @param isUnique {boolean}
     * @returns {ioEvent | boolean}
     */
    private getEvent(name: string, isUnique?: boolean) {
        let foundEvent;
        this.events.some(ioEvent => {
            if (isUnique === ioEvent.isUnique && name === ioEvent.name) {
                foundEvent = ioEvent;
                return true;
            }
        });
        return foundEvent;
    }
    constructor() {}
    
    /** a reference to the raw socket returned from io(), if connected */
    public get raw() { return this.connected && this.socket }

    /** an alias for `this.Socket.emit();`
     * which will only emit if connected. */
    public emit(eventName: string, data?: Object) {
        if (this.connected) {
            this.socket.emit(eventName, data);
        }
    }

    /** check if Event exists so we don't pollute the events list with dupes
     * EVEN if it's a `once` event, as one change will trigger all listeners */
    public eventExists(ioEvent :ioEvent) :boolean {
        return this.events.some(_ioEvent => {
            if (!_ioEvent.hasTriggered && !ioEvent.hasTriggered && ioEvent.isUnique &&
                _ioEvent.name === ioEvent.name) return false;

            return !_ioEvent.isUnique && _ioEvent.name === ioEvent.name;
        });
    }

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
    public listenToEvent(ioEvent: ioEvent) :ioEvent {
        if (!this.eventExists(ioEvent)) {
            this.events.push(ioEvent);
            if (this.connected) ioEvent.hook(this.socket)
        }
        else ioEvent = this.getEvent(ioEvent.name, ioEvent.isUnique);
        return ioEvent;
    }

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
    public listen(eventsArray: any[]): Subscription[] {
        return eventsArray.map((event:string|IoEventInfo) => {
            let _event: ioEvent;
            if (isObject(event)) {
                let type = <IoEventInfo>event;
                _event = new ioEvent(type.name, type.once, type.count);
            } else _event = new ioEvent(event);
            let event$ = this.listenToEvent(_event).event$;
            return event$;
        });
    };

    /**
     * Removes an ioEvent from the listening queue
     * @param ioEventName {string}
     */
    public unhook(ioEventName: string) {
        this.events = this.events.filter((event: ioEvent) => {
            if (event.name === ioEventName) {
                event.unhook();
                return false;
            } else return true;
        });
    }

    /**
     * Makes a new connection to the @SOCKET_URL const and sets up a `on connect` by default
     * which will in turn update the @this._socketState Subject with the containing
     * the received data as an argument (as well as the event-name)
     * @param address {String}     defaults to "http://localhost:5000"
     * @param forceNew {Boolean}
     */
    public connect(address?: string, forceNew?:boolean, opts?: any) :void {
        if (this.connected && !forceNew) return;
        else if (this.connected && forceNew) this.connected = false;

        this.socket = io(address || SOCKET_URL, opts);
        this.socket.once('connect', () => {
			// Set the private state, we send our own connect event with the socket id
            this._connected = true;
            this._socketState.next({connected: true, id: this.socket.id || 0 });

            this.events.forEach(ioEvent => {
                /** this is where we hook our previously new()ed ioEvents to the socket.
                 * This is so we can have one listener per event. as opposed to one event
                 * to all listeners (that would kinda defeat the "io" part of "SocketIO")
                 * */
                ioEvent.hook(this.socket);
            });

			this.socket.on('connect', () => {
				this.connected = true;
			});

            this.socket.on('disconnect', () => {
                this.connected = false;
            });
        });

		return this.socket;
    };

	/**
	 * Closes the socket connection
	 */
	public disconnect() :void {
        if (this._connected) {
            this.socket.disconnect();
			this.connected = false;
        }
	};

    /**
     * check if socket is connected
     * @returns {boolean}
     */
    public get connected() {return this._connected; }

    /**
	 * Sends a new connection status event
     * @param value Connection status
     */
    public set connected(value: boolean) {
        this._connected = value;
        this._socketState.next({connected: value});
    };
    
}
