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
exports.FileSocketService = void 0;
var socketio_1 = require("@tsed/socketio");
var FileSocketService = /** @class */ (function () {
    function FileSocketService() {
    }
    /**
     * Triggered the namespace is created
     */
    FileSocketService.prototype.$onNamespaceInit = function (nsp) {
    };
    /**
     * Triggered when a new client connects to the Namespace.
     */
    FileSocketService.prototype.$onConnection = function (socket, session) {
    };
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    FileSocketService.prototype.$onDisconnect = function (socket) {
    };
    __decorate([
        socketio_1.Nsp
    ], FileSocketService.prototype, "nsp", void 0);
    __decorate([
        __param(0, socketio_1.Socket),
        __param(1, socketio_1.SocketSession)
    ], FileSocketService.prototype, "$onConnection", null);
    __decorate([
        __param(0, socketio_1.Socket)
    ], FileSocketService.prototype, "$onDisconnect", null);
    FileSocketService = __decorate([
        (0, socketio_1.SocketService)("/files")
    ], FileSocketService);
    return FileSocketService;
}());
exports.FileSocketService = FileSocketService;
//# sourceMappingURL=FileSocketService.js.map