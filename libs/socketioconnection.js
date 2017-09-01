"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var io = require('socket.io-client');
var SocketIoConnection = (function () {
    function SocketIoConnection(config) {
        this.connection = io.connect(config.url, config.socketio);
    }
    SocketIoConnection.prototype.on = function (ev, fn) {
        this.connection.on(ev, fn);
    };
    SocketIoConnection.prototype.emit = function () {
        this.connection.emit.apply(this.connection, arguments);
    };
    SocketIoConnection.prototype.getSessionid = function () {
        return this.connection.id;
    };
    SocketIoConnection.prototype.disconnect = function () {
        return this.connection.disconnect();
    };
    return SocketIoConnection;
}());
exports.default = SocketIoConnection;
