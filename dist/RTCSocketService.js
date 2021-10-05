"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTCSocketService = void 0;
var socketio_1 = require("@tsed/socketio");
var RTCSocketService = /** @class */ (function () {
    function RTCSocketService() {
    }
    /**
     * Triggered the namespace is created
     */
    RTCSocketService.prototype.$onNamespaceInit = function (nsp) {
    };
    /**
     * Triggered when a new client connects to the Namespace.
     */
    RTCSocketService.prototype.$onConnection = function (socket, session) {
        console.log("=====   CONNECTED A CLIENT   =====");
        console.log("===== SOCKET ID " + socket.id + " =====");
        socket.emit("algo", "saludo");
    };
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    RTCSocketService.prototype.$onDisconnect = function (socket) {
    };
    RTCSocketService.prototype.helloAll = function () {
        this.nsp.emit("hi", "everyone!");
    };
    __decorate([
        socketio_1.Nsp
    ], RTCSocketService.prototype, "nsp", void 0);
    __decorate([
        __param(0, socketio_1.Socket),
        __param(1, socketio_1.SocketSession)
    ], RTCSocketService.prototype, "$onConnection", null);
    __decorate([
        __param(0, socketio_1.Socket)
    ], RTCSocketService.prototype, "$onDisconnect", null);
    RTCSocketService = __decorate([
        (0, socketio_1.SocketService)("/rtc")
    ], RTCSocketService);
    return RTCSocketService;
}());
exports.RTCSocketService = RTCSocketService;
//# sourceMappingURL=RTCSocketService.js.map