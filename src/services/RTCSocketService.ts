
import {Nsp, Socket, SocketService, SocketSession, Namespace, Input, Args} from "@tsed/socketio";
import { SignalPayload } from "../models/signalpayload";
import { User } from "../models/user";

@SocketService("/voiceChannel")
export class RTCSocketService{

    @Nsp nsp!: Namespace;

    /**
     * ['voiceChannelID' => ['socketID' => 'User']]
     * @type {Map<Map<string,string}
     */
    public voiceChannels: Map<string, Map<string,User>> = new Map<string, Map<string,User>> ();


    /**
     * Triggered the namespace is created
     */
    $onNamespaceInit(nsp: Namespace) {
  
    }
  
    /**
     * Triggered when a new client connects to the Namespace.
     */
    $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
      console.log("New connection in voice channel, ID =>", socket.id);
      if(socket.handshake.auth){
        session.set("user", <User>{
          socketID: socket.id,
          uid: socket.handshake.auth.uid
        });
      }
      else{
        socket.disconnect();
      }
    }
  
    /**
     * Triggered when a client disconnects from the Namespace.
     * Se elimina el usuario del canal de voz
     * Si el canal de voz  se queda vacio se elimina
     */
    $onDisconnect(@SocketSession session: SocketSession, @Socket socket: Socket) {
      this.leaveRoom(session,socket);
      console.table(this.voiceChannels);
    }

    /**
     * Agrega a un usuario a un canal de voz a través de ID del canal 
     * @param voiceChannelID ID del canal de voz a unirse
     * @param session sesión del Socket
     * @returns Usuarios dentro del canal de voz
     */
    @Input("join-voice-channel")
    joinVoiceChannel(
       @Args(0) voiceChannelID: string,
       @SocketSession session: SocketSession,
       @Socket socket: Socket
    ): void {
      this.joinRoom(voiceChannelID,session,socket);
    }

    joinRoom(
      voiceChannelID: string,
      session: SocketSession,
      socket: Socket
    ): void {
      const user: User = session.get("user");
      if( user.currentVoiceChannel === voiceChannelID) return;

      const voiceChannel = this.voiceChannels.get(voiceChannelID);
      if(user.currentVoiceChannel){
        this.leaveRoom(session,socket);
      }
      if(voiceChannel){
        voiceChannel.set(user.socketID, user);
      }
      else{
        this.voiceChannels.set(voiceChannelID,new Map<string,User>(
          [
            [
              user.socketID, user
            ]
          ]
        ));
      }
      user.currentVoiceChannel = voiceChannelID;
      console.log(`${voiceChannelID}-users-in-code-channel`);
      this.nsp.emit(`${voiceChannelID}-users-in-voice-channel`,this.getUsersInVoiceChannel(voiceChannelID));
      socket.emit('user-status',{channelID: user.currentVoiceChannel});
    }

    @Input("leave-voice-channel")
    leaveVoiceChannel(
       @SocketSession session: SocketSession,
       @Socket socket: Socket
    ): void {
      this.leaveRoom(session,socket);
    }

    @Input("emit-users")
    emitUsers(
      @Args(0) voiceChannelID: string,
      @Socket socket: Socket,
      @SocketSession session: SocketSession
   ): void {
    const user: User = session.get("user");
    socket.emit('user-status',{channelID: user.currentVoiceChannel});
    this.nsp.emit(`${voiceChannelID}-users-in-voice-channel`,this.getUsersInVoiceChannel(voiceChannelID));
   }



    leaveRoom(session: SocketSession, socket: Socket){
      const user: User = session.get("user");
      if(user.currentVoiceChannel){
        const voiceChannel = this.voiceChannels.get(user.currentVoiceChannel);
        if(voiceChannel){
          if(voiceChannel.delete(user.socketID)){
            console.log("Usuario eliminado");
          }
          this.nsp.emit(`${user.currentVoiceChannel}-users-in-voice-channel`,this.getUsersInVoiceChannel(user.currentVoiceChannel));
          if(voiceChannel.size === 0){
            if(this.voiceChannels.delete(user.currentVoiceChannel)){
              console.log("Voice channel cerrado");
            }
          }
          user.currentVoiceChannel= undefined;
          socket.emit('user-status',{});
        }
      }

    }

    @Input("sending-signal")
    sendingSignal(
      @Args(0) payload: SignalPayload,
      @SocketSession session: SocketSession
    ): void {
      const user: User = session.get("user");
      if(user.currentVoiceChannel){
        console.log("sending-signal")
        console.table(payload);
        this.nsp.emit(`${payload.uid}-signal-sent`,payload);
      }
    }

    @Input("returning-signal")
    returningSignal(
      @Args(0) payload: SignalPayload,
      @SocketSession session: SocketSession
    ): void {
      const user: User = session.get("user");
      console.log("returning-signal")
      console.table(payload);
      if(user.currentVoiceChannel){
        this.nsp.emit(`${payload.socketID}-returned-signal`,payload);
      }
    }

    

    /**
     * Retorna la lista de usuarios
     * @param voiceChannelID ID del canal de voz
     * @returns JSON {Map<string,string>}
     */
    public getUsersInVoiceChannel(voiceChannelID: string): any{
      if(this.voiceChannels.has(voiceChannelID)){
        const result = Object.fromEntries(this.voiceChannels.get(voiceChannelID)!)
        console.table(result);
        return result;
      }
      else{
        return {};
      }
    }
  }

