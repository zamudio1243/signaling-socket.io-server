import {Configuration} from "@tsed/common";
import "@tsed/platform-express";
import "@tsed/socketio"; // import socket.io Ts.ED module

@Configuration({
  rootDir: __dirname,
  socketIO: {}
})
export class Server {
}