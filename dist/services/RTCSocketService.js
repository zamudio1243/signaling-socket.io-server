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
        /**
         * ['voiceChannelID' => ['socketID' => 'uid']]
         * @type {Map<Map<string,string}
         */
        this.voiceChannels = new Map();
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
        session.set("user", socket.id);
    };
    /**
     * Triggered when a client disconnects from the Namespace.
     * Se elimina el usuario del canal de voz
     * Si el canal de voz  se queda vacio se elimina
     */
    RTCSocketService.prototype.$onDisconnect = function (socket) {
        this.voiceChannels.forEach(function (value, key, map) {
            if (value.has(socket.id)) {
                value.delete(socket.id);
                if (value.size === 0) {
                    map.delete(key);
                }
            }
        });
        console.table(this.voiceChannels);
    };
    /**
     * Agrega a un usuario a un canal de voz a través de ID del canal
     * @param voiceChannelID ID del canal de voz a unirse
     * @param session sesión del Socket
     * @returns Usuarios dentro del canal de voz
     */
    RTCSocketService.prototype.joinRoom = function (voiceChannelID, session, socket) {
        var userSocketID = session.get("user");
        if (this.voiceChannels.has(voiceChannelID)) {
            this.voiceChannels.forEach(function (value, key) {
                if (key === voiceChannelID) {
                    value.set(userSocketID, 'uid');
                }
            });
        }
        else {
            var userMap = new Map();
            userMap.set(userSocketID, 'uid');
            this.voiceChannels.set(voiceChannelID, userMap);
        }
        var channelIDFromUser = '';
        this.voiceChannels.forEach(function (value, key, _) {
            if (value.has(userSocketID))
                channelIDFromUser = key;
        });
        socket.broadcast.emit(voiceChannelID + "-users-in-voice-channel", this.getUsersInVoiceChannel(channelIDFromUser));
    };
    RTCSocketService.prototype.sendingSignal = function (payload, session) {
        return this.emitSignal(payload);
    };
    RTCSocketService.prototype.emitSignal = function (signal) {
        return signal;
    };
    /**
     * Retorna la lista de usuarios
     * @returns JSON {Map<string,string>}
     */
    RTCSocketService.prototype.getUsersInVoiceChannel = function (voiceChannelID) {
        var result = Object.fromEntries(this.voiceChannels.get(voiceChannelID));
        console.table(result);
        return result;
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
        (0, socketio_1.Input)("join-voice-channel"),
        __param(0, (0, socketio_1.Args)(0)),
        __param(1, socketio_1.SocketSession),
        __param(2, socketio_1.Socket)
    ], RTCSocketService.prototype, "joinRoom", null);
    __decorate([
        (0, socketio_1.Input)("sending-signal"),
        (0, socketio_1.Emit)("user-joined"),
        __param(0, (0, socketio_1.Args)(0)),
        __param(1, socketio_1.SocketSession)
    ], RTCSocketService.prototype, "sendingSignal", null);
    RTCSocketService = __decorate([
        (0, socketio_1.SocketService)("/voiceChannel")
    ], RTCSocketService);
    return RTCSocketService;
}());
exports.RTCSocketService = RTCSocketService;
//# sourceMappingURL=RTCSocketService.js.map