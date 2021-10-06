
import {Nsp, Socket, SocketService, SocketSession, Namespace, Input,  Broadcast, Args} from "@tsed/socketio";

@SocketService("/channelVoice")
export class RTCSocketService{

    @Nsp nsp!: Namespace;

    /**
     * ['channelVoiceID' => ['socketID' => 'uid']]
     * @type {Map<Map<string,string}
     */
    public channelVoice: Map<string, Map<string,string>> = new Map<string, Map<string,string>> ();
    /**
     * Triggered the namespace is created
     */
    $onNamespaceInit(nsp: Namespace) {
  
    }
  
    /**
     * Triggered when a new client connects to the Namespace.
     */
    $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
      console.log("New connection, ID =>", socket.id);
      session.set("user", socket.id);
    }
  
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    $onDisconnect(@Socket socket: Socket) {
  
    }

    /**
     * Agrega a un usuario a un canal de voz a través de ID del canal 
     * @param voiceChannelID ID del canal de voz a unirse
     * @param session sesión del Socket
     * @returns Usuarios dentro del canal de voz
     */
    @Input("join-voice-channel")
    @Broadcast("users-in-voice-channel")
    joinRoom(
       @Args(0) voiceChannelID: string,
       @SocketSession session: SocketSession
    ): Map<string,string>
       {
      const userSocketID = session.get("user");

      const userInVoiceChannel: Map<string,string> = new Map<string,string>();
      userInVoiceChannel.set(userSocketID,'uid');

      this.channelVoice.set(voiceChannelID,userInVoiceChannel)

      return this.getUsersInVoiceChannel(voiceChannelID);
    }
    
    /**
     * Retorna la lista de usuarios
     * @returns {Map<string,string>}
     */
    public getUsersInVoiceChannel(voiceChannelID: string): Map<string,string>{
      return this.channelVoice.get(voiceChannelID)!;
    }
  }