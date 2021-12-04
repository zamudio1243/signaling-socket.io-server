import { Configuration } from "@tsed/common";
import "@tsed/platform-express";
import "@tsed/socketio"; // import socket.io Ts.ED module
import cors from "cors";
import { Compiler } from "./services/Compiler";
import bodyParser from "body-parser";

@Configuration({
  rootDir: __dirname,
  socketIO: {},
  mount: {
    "/rest": [Compiler],
  },
  middlewares: [
    cors({
      origin: "*"
    }),
    bodyParser.json(),
    bodyParser.urlencoded()
  ]
})
export class Server {}
