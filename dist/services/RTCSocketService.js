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
        this.users = new Map();
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
        console.log("New connection, ID =>", socket.id);
        var user = {
            uid: socket.id
        };
        session.set("user", user);
    };
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    RTCSocketService.prototype.$onDisconnect = function (socket) {
    };
    RTCSocketService.prototype.joinRoom = function (name, session) {
        var user = session.get("user");
        console.log("Joinned to the room => ", name);
        user.nombre = name;
        this.users.set(user.id, user);
        console.log(this.users);
        return this.getUsers();
    };
    /**
     * Retorna la lista de usuarios
     * @returns {Array}
     */
    RTCSocketService.prototype.getUsers = function () {
        var users = [];
        this.users.forEach(function (user) {
            users.push(user);
        });
        return users;
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
    __decorate([
        (0, socketio_1.Input)("join-room"),
        (0, socketio_1.Broadcast)("user-joined"),
        __param(0, (0, socketio_1.Args)(0)),
        __param(1, socketio_1.SocketSession)
    ], RTCSocketService.prototype, "joinRoom", null);
    RTCSocketService = __decorate([
        (0, socketio_1.SocketService)("/rtc")
    ], RTCSocketService);
    return RTCSocketService;
}());
exports.RTCSocketService = RTCSocketService;
//# sourceMappingURL=RTCSocketService.js.map