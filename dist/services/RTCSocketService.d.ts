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
     */
    $onDisconnect(socket: Socket): void;
    /**
     * Agrega a un usuario a un canal de voz a través de ID del canal
     * @param voiceChannelID ID del canal de voz a unirse
     * @param session sesión del Socket
     * @returns Usuarios dentro del canal de voz
     */
    joinRoom(voiceChannelID: string, session: SocketSession): Map<string, string>;
    /**
     * Retorna la lista de usuarios
     * @returns JSON {Map<string,string>}
     */
    getUsersInVoiceChannel(voiceChannelID: string): any;
}
