"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var io_events_1 = require("./io-events");
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var io = require("socket.io-client");
var isObject_1 = require("rxjs/util/isObject");
var SOCKET_URL = "http://localhost:5000";
var IO = /** @class */ (function () {
    function IO() {
        /** events will be used to push which events we should be listening to */
        this.events = [];
        this._socketState = new ReplaySubject_1.ReplaySubject(1);
        /**
         * The Subscribable (Observable) prop
         * subscribe to this prop to be notified of data update
         * @type {Observable}
         */
        this.event$ = this._socketState.asObservable();
        /** this prop will pretty much control the "is connected" or not.
         * it also controls whether or not we should issue this.socket.disconnect() */
        this._connected = false;
    }
    /**
     * returns an event by matching ioEvent.name against the provided argument string
     * @param name {string} `the name of the event`
     * @param isUnique {boolean}
     * @returns {ioEvent | boolean}
     */
    IO.prototype.getEvent = function (name, isUnique) {
        var foundEvent;
        this.events.some(function (ioEvent) {
            if (isUnique === ioEvent.isUnique && name === ioEvent.name) {
                foundEvent = ioEvent;
                return true;
            }
        });
        return foundEvent;
    };
    Object.defineProperty(IO.prototype, "raw", {
        /** a reference to the raw socket returned from io(), if connected */
        get: function () { return this.connected && this.socket; },
        enumerable: true,
        configurable: true
    });
    /** an alias for `this.Socket.emit();`
     * which will only emit if connected. */
    IO.prototype.emit = function (eventName, data) {
        if (this.connected) {
            this.socket.emit(eventName, data);
        }
    };
    /** check if Event exists so we don't pollute the events list with dupes
     * EVEN if it's a `once` event, as one change will trigger all listeners */
    IO.prototype.eventExists = function (ioEvent) {
        return this.events.some(function (_ioEvent) {
            if (!_ioEvent.hasTriggered && !ioEvent.hasTriggered && ioEvent.isUnique &&
                _ioEvent.name === ioEvent.name)
                return false;
            return !_ioEvent.isUnique && _ioEvent.name === ioEvent.name;
        });
    };
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
    IO.prototype.listenToEvent = function (ioEvent) {
        if (!this.eventExists(ioEvent)) {
            this.events.push(ioEvent);
            if (this.connected)
                ioEvent.hook(this.socket);
        }
        else
            ioEvent = this.getEvent(ioEvent.name, ioEvent.isUnique);
        return ioEvent;
    };
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
    IO.prototype.listen = function (eventsArray) {
        var _this = this;
        return eventsArray.map(function (event) {
            var _event;
            if (isObject_1.isObject(event)) {
                var type = event;
                _event = new io_events_1.ioEvent(type.name, type.once, type.count);
            }
            else
                _event = new io_events_1.ioEvent(event);
            var event$ = _this.listenToEvent(_event).event$;
            return event$;
        });
    };
    ;
    /**
     * Removes an ioEvent from the listening queue
     * @param ioEventName {string}
     */
    IO.prototype.unhook = function (ioEventName) {
        this.events = this.events.filter(function (event) {
            if (event.name === ioEventName) {
                event.unhook();
                return false;
            }
            else
                return true;
        });
    };
    /**
     * Makes a new connection to the @SOCKET_URL const and sets up a `on connect` by default
     * which will in turn update the @this._socketState Subject with the containing
     * the received data as an argument (as well as the event-name)
     * @param address {String}     defaults to "http://localhost:5000"
     * @param forceNew {Boolean}
     */
    IO.prototype.connect = function (address, forceNew, opts) {
        var _this = this;
        if (this.connected && !forceNew)
            return;
        else if (this.connected && forceNew)
            this.connected = false;
        this.socket = io(address || SOCKET_URL, opts);
        this.socket.on('connect', function () {
            // Set the private state, we send our own connect event with the socket id
            _this._connected = true;
            _this._socketState.next({ connected: true, id: _this.socket.id || 0 });
            _this.events.forEach(function (ioEvent) {
                /** this is where we hook our previously new()ed ioEvents to the socket.
                 * This is so we can have one listener per event. as opposed to one event
                 * to all listeners (that would kinda defeat the "io" part of "SocketIO")
                 * */
                ioEvent.hook(_this.socket);
            });
            _this.socket.on('disconnect', function () {
                _this.connected = false;
            });
        });
        return this.socket;
    };
    ;
    /**
     * Closes the socket connection
     */
    IO.prototype.disconnect = function () {
        if (this._connected) {
            this.socket.disconnect();
            this.connected = false;
        }
    };
    ;
    Object.defineProperty(IO.prototype, "connected", {
        /**
         * check if socket is connected
         * @returns {boolean}
         */
        get: function () { return this._connected; },
        /**
         * Sends a new connection status event
         * @param value Connection status
         */
        set: function (value) {
            this._connected = value;
            this._socketState.next({ connected: value });
        },
        enumerable: true,
        configurable: true
    });
    ;
    return IO;
}());
exports.IO = IO;
