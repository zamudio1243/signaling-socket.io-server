import { Socket, SocketSession, Namespace } from "@tsed/socketio";
import { User } from "../models/user";
export declare class RTCSocketService {
    nsp: Namespace;
    users: Map<string, User>;
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
    joinRoom(name: string, session: SocketSession): User[];
    /**
     * Retorna la lista de usuarios
     * @returns {Array}
     */
    getUsers(): User[];
}
