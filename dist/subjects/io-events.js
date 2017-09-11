"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var isObject_1 = require("rxjs/util/isObject");
var assign_1 = require("rxjs/util/assign");
var ioEvent = /** @class */ (function () {
    function ioEvent(name, isUnique, count, initialState) {
        /** the actual Rx Subject */
        this._lastEvent = new ReplaySubject_1.ReplaySubject(1);
        /** a reference to the last received event */
        this.lastEvent = {};
        /**
         * Event information
         * @type {IoEventInfo}
         */
        this.event = { name: '', count: 0, once: false };
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
        this.event$ = this._lastEvent.asObservable();
        this._initialState = false;
        this.event.name = name;
        if (count)
            this.event.count = count;
        if (isUnique !== undefined)
            this.event.once = isUnique;
        if (initialState)
            this.initialState = initialState;
        this.clientSocket = false;
    }
    /**
     * Responsible for eventCounting and updating data on the ReplaySubject
     * if _onUpdate exists, it will be called with newData as argument
     * @param newData
     */
    ioEvent.prototype.updateData = function (newData) {
        this._lastEvent.next(newData);
        this.event.count++; /** we will be using "count" has a way of knowing if it has been triggered. */
        if (this._onUpdate)
            this._onUpdate(newData); /** a way for us to extend properly */
        this.lastEvent = newData;
    };
    Object.defineProperty(ioEvent.prototype, "hasTriggered", {
        /**
         * returns whether the event has triggered or not
         * @returns {boolean}
         */
        get: function () { return this.event.count > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ioEvent.prototype, "isUnique", {
        /**
         * returns if the event is unique or not
         * @returns {boolean}
         */
        get: function () { return this.event.once === true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ioEvent.prototype, "name", {
        /**
         * Returns the event name
         * @returns {string}
         */
        get: function () { return this.event.name; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ioEvent.prototype, "onUpdate", {
        /** a callback that should be ran on every state update */
        get: function () { return this._onUpdate; },
        /**
         * Set this to a function value if you want something to run *after*
         * the value has been updated.
         * @param fn {Function}
         */
        set: function (fn) {
            if (typeof fn !== "function")
                throw Error('ioEvent onUpdate prop needs to be of type Function');
            this._onUpdate = fn;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * hook() is an alias to `socket.on()` or `socket.once()` depending on the provided `IoEventInfo`
     * provide a socket-io client socket so the ioEvent can make the hook. It will use that socket
     * from there on, unless @this.clientSocket is not the same as the provided one: Then it will re-hook
     * *without calling unhook*
     * @param clientSocket {Socket}
     */
    ioEvent.prototype.hook = function (clientSocket) {
        var _this = this;
        this.clientSocket = this.clientSocket || clientSocket;
        if (clientSocket && this.clientSocket !== clientSocket)
            this.clientSocket = clientSocket;
        if (!this.clientSocket)
            throw Error('ioEvent has no socket to hook to.');
        if (this.event.once) {
            this.event.count = 0;
            this.clientSocket.once(this.event.name, function (data) { return _this.updateData(data); });
            return;
        }
        this.clientSocket.on(this.event.name, function (data) { return _this.updateData(data); });
    };
    /** unhook is an alias for "off", and since we only have one real callback attached to the Emitter
     * we don't need to pass a `fn` argument */
    ioEvent.prototype.unhook = function () {
        if (this.event.once)
            return;
        this.clientSocket.off(this.event.name);
    };
    Object.defineProperty(ioEvent.prototype, "initialState", {
        get: function () { return this._initialState; },
        /**
         * Use this to set an initialState to be reset to when connection closes
         * otherwise, false will be the updating value. If your initialState is
         * set an as Object, the new state will be `Object.assign`ed.
         * @param state {any}
         */
        set: function (state) {
            if (!this._initialState)
                this._initialState = state;
            else if (isObject_1.isObject(this._initialState))
                this._initialState = assign_1.assign(this._initialState, state);
            else
                this._initialState = state;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Reset state updates the ReplaySubject with the initialState;
     * If none exists, `false` is used as default
     */
    ioEvent.prototype.resetState = function () {
        this.updateData(this._initialState);
    };
    return ioEvent;
}());
exports.ioEvent = ioEvent;
