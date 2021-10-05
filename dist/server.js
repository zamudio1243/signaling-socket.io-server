"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var common_1 = require("@tsed/common");
require("@tsed/platform-express");
require("@tsed/socketio"); // import socket.io Ts.ED module
var Server = /** @class */ (function () {
    function Server() {
    }
    Server = __decorate([
        (0, common_1.Configuration)({
            rootDir: __dirname,
            socketIO: {}
        })
    ], Server);
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map