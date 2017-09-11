"use strict";
/**
 * Created by Mosh Mage on 12/15/2016.
 * ##Thanks to
 * - http://stackoverflow.com/questions/34376854/delegation-eventemitter-or-observable-in-angular2/35568924#35568924
 * - http://www.syntaxsuccess.com/viewarticle/socket.io-with-rxjs-in-angular-2.0
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./subjects/socket-io"));
__export(require("./subjects/io-events"));
