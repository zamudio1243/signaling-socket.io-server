
import {Nsp, Socket, SocketService, SocketSession, Namespace, Input,  Broadcast, Args} from "@tsed/socketio";

@SocketService("/voiceChannel")
export class RTCSocketService{

    @Nsp nsp!: Namespace;

    /**
     * ['voiceChannelID' => ['socketID' => 'uid']]
     * @type {Map<Map<string,string}
     */
    public voiceChannels: Map<string, Map<string,string>> = new Map<string, Map<string,string>> ();
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
      
    
      if(this.voiceChannels.has(voiceChannelID)){
        this.voiceChannels.forEach((value,key)=>{
          if(key === voiceChannelID){
            value.set(userSocketID,'uid');
          }
      });
      }
      else{
        const userMap: Map<string,string> = new Map();
        userMap.set(userSocketID,'uid');
        this.voiceChannels.set(voiceChannelID, userMap);
      }

      let channelIDFromUser: string = '';
      this.voiceChannels.forEach((value,key,_) => {
        if(value.has(userSocketID)) channelIDFromUser = key;
      });

      return this.getUsersInVoiceChannel(channelIDFromUser);
    }
    
    /**
     * Retorna la lista de usuarios
     * @returns JSON {Map<string,string>}
     */
    public getUsersInVoiceChannel(voiceChannelID: string): any{
      const result = Object.fromEntries(this.voiceChannels.get(voiceChannelID)!)
      return result;
    }
  }