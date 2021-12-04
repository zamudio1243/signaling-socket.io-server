import { Configuration } from "@tsed/common";
import "@tsed/platform-express";
import "@tsed/socketio"; // import socket.io Ts.ED module
import { Compiler } from "./services/Compiler";
@Configuration({
  rootDir: __dirname,
  socketIO: {},
  mount: {
    "/rest": [Compiler],
  },
})
export class Server {}
