import { Socket, SocketSession, Namespace } from "@tsed/socketio";
export declare class RTCSocketService {
    nsp: Namespace;
    /**
     * Triggered the namespace is created
     */
    $onNamespaceInit(nsp: Namespace): void;
    /**
     * Triggered when a new client connects to the Namespace.
     */
    $onConnection(socket: Socket, session: SocketSession): void;
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    $onDisconnect(socket: Socket): void;
    helloAll(): void;
}
