import { Socket, SocketSession, Namespace } from "@tsed/socketio";
export declare class RTCSocketService {
    nsp: Namespace;
    /**
     * ['voiceChannelID' => ['socketID' => 'uid']]
     * @type {Map<Map<string,string}
     */
    voiceChannels: Map<string, Map<string, string>>;
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
     * Se elimina el usuario del canal de voz
     * Si el canal de voz  se queda vacio se elimina
     */
    $onDisconnect(socket: Socket): void;
    /**
     * Agrega a un usuario a un canal de voz a través de ID del canal
     * @param voiceChannelID ID del canal de voz a unirse
     * @param session sesión del Socket
     * @returns Usuarios dentro del canal de voz
     */
    joinRoom(voiceChannelID: string, session: SocketSession, socket: Socket): void;
    sendingSignal(payload: Signal, session: SocketSession): Signal;
    emitSignal(signal: Signal): Signal;
    /**
     * Retorna la lista de usuarios
     * @returns JSON {Map<string,string>}
     */
    getUsersInVoiceChannel(voiceChannelID: string): any;
}
interface Signal {
    signal: string;
    voiceChannel: string;
}
export {};
