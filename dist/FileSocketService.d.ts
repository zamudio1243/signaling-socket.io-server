import { SocketSession } from "@tsed/socketio";
import * as SocketIO from "socket.io";
export declare class FileSocketService {
    nsp: SocketIO.Namespace;
    /**
     * Triggered the namespace is created
     */
    $onNamespaceInit(nsp: SocketIO.Namespace): void;
    /**
     * Triggered when a new client connects to the Namespace.
     */
    $onConnection(socket: SocketIO.Socket, session: SocketSession): void;
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    $onDisconnect(socket: SocketIO.Socket): void;
}
