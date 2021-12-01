import {
  Nsp,
  Socket,
  SocketService,
  SocketSession,
  Namespace,
  Input,
  Args,
} from "@tsed/socketio";
import { SignalPayload } from "../models/signal_payload";
import { User } from "../models/user";
import { EventName } from "../utils/event_name";
import { ResponseEventName } from "../utils/response_event_name";

@SocketService("/voiceChannel")
export class VoiceChannelSocketService {
  @Nsp nsp!: Namespace;

  /**
   * ['voiceChannelID' => ['uid' => 'User']]
   * @type {Map<Map<string,string}
   */
  public voiceChannels: Map<string, Map<string, User>> = new Map<
    string,
    Map<string, User>
  >();

  /**
   * Triggered the namespace is created
   */
  $onNamespaceInit(nsp: Namespace) {}

  /**
   * Triggered when a new client connects to the Namespace.
   */
  $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
    if (socket.handshake.auth) {
      session.set("user", <User>{
        socketID: socket.id,
        uid: socket.handshake.auth.uid,
      });
      socket.join(socket.handshake.auth.uid);
    } else {
      socket.disconnect();
    }
  }

  /**
   * Triggered when a client disconnects from the Namespace.
   * Se elimina el usuario del canal de voz
   * Si el canal de voz  se queda vacio se elimina
   */
  $onDisconnect(@SocketSession session: SocketSession, @Socket socket: Socket) {
    this.leaveRoom(session, socket);
    console.table(this.voiceChannels);
  }

  /**
   * Agrega a un usuario a un canal de voz a través de ID del canal
   * @param voiceChannelID ID del canal de voz a unirse
   * @param session sesión del Socket
   * @returns Usuarios dentro del canal de voz
   */
  @Input(EventName.JOIN_VOICE_CHANNEL)
  joinVoiceChannel(
    @Args(0) voiceChannelID: string,
    @SocketSession session: SocketSession,
    @Socket socket: Socket
  ): any {
    this.joinSocketToVoiceChannel(voiceChannelID, session, socket);
    socket
      .to(voiceChannelID)
      .emit(
        `${ResponseEventName.JOINED_USERS}-${voiceChannelID}`,
        this.getUsersInVoiceChannel(voiceChannelID)
      );
  }

  async joinSocketToVoiceChannel(
    voiceChannelID: string,
    session: SocketSession,
    socket: Socket
  ): Promise<void> {
    const user: User = session.get("user");
    const userVoiceChannel = this.getVoiceChannelIdFromUser(user.uid);

    if (userVoiceChannel === voiceChannelID) return;

    const voiceChannel = this.voiceChannels.get(voiceChannelID);

    if (userVoiceChannel) {
      await this.leaveRoom(session, socket);
    }
    if (voiceChannel) {
      voiceChannel.set(user.uid, user);
    } else {
      this.voiceChannels.set(
        voiceChannelID,
        new Map<string, User>([[user.uid, user]])
      );
    }
    user.currentVoiceChannel = voiceChannelID;
    socket.join(voiceChannelID);
    this.nsp
      .to(voiceChannelID)
      .emit(
        ResponseEventName.ALL_USERS,
        this.getUsersInVoiceChannel(voiceChannelID)
      );
    //socket.emit(ResponseEventName.USER_STATUS,{channelID: user.currentVoiceChannel});
    this.nsp.to(user.uid).emit(ResponseEventName.USER_STATUS, {
      channelID: user.currentVoiceChannel,
    });
    console.table(this.getUsersInVoiceChannel(voiceChannelID));
  }

  @Input(EventName.LEAVE_VOICE_CHANNEL)
  async leaveVoiceChannel(
    @SocketSession session: SocketSession,
    @Socket socket: Socket
  ): Promise<void> {
    await this.leaveRoom(session, socket);
  }

  async leaveRoom(session: SocketSession, socket: Socket): Promise<void> {
    const user: User = session.get("user");
    const userVoiceChannel = this.getVoiceChannelIdFromUser(user.uid);
    console.log(`se desconecto de ${userVoiceChannel}`);

    if (userVoiceChannel) {
      const voiceChannel = this.voiceChannels.get(userVoiceChannel);
      if (voiceChannel) {
        if (voiceChannel.delete(user.uid)) {
          console.log("Usuario eliminado");
        }
        this.nsp
          .to(userVoiceChannel)
          .emit(
            ResponseEventName.ALL_USERS,
            this.getUsersInVoiceChannel(userVoiceChannel)
          );
        if (voiceChannel.size === 0) {
          if (this.voiceChannels.delete(userVoiceChannel)) {
            console.log("Voice channel cerrado");
          }
        }
        await socket.leave(userVoiceChannel);
        user.currentVoiceChannel = undefined;
        this.nsp.to(user.uid).emit(ResponseEventName.USER_STATUS, {});
        console.log(this.voiceChannels);
      }
    }
  }

  @Input(EventName.JOIN_ROOM)
  joinRoom(@Args(0) voiceChannelID: string, @Socket socket: Socket): void {
    this.joinSocketToRoom(voiceChannelID, socket);
  }

  joinSocketToRoom(voiceChannelID: string, socket: Socket): void {
    socket.join(voiceChannelID);
  }

  @Input(EventName.SENDING_SIGNAL)
  sendingSignal(
    @Args(0) payload: SignalPayload,
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    const user: User = session.get("user");
    const voiceChannel = this.getVoiceChannelIdFromUser(user.uid);
    console.log(
      `${user.uid} (${socket.id}) esta enviando su señal a ${payload.userIDToSignal}`
    );
    socket
      .to(payload.userIDToSignal!)
      .emit(`${ResponseEventName.USER_JOINED}-${voiceChannel}`, payload);
  }

  @Input(EventName.RETURNING_SIGNAL)
  returningSignal(
    @Args(0) payload: SignalPayload,
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    const user: User = session.get("user");
    const voiceChannel = this.getVoiceChannelIdFromUser(user.uid);
    console.log(
      `${user.uid} (${socket.id}) esta retornando su señal a ${payload.callerID}`
    );
    payload.userIDToSignal = user.uid;
    socket
      .to(payload.callerID)
      .emit(
        `${ResponseEventName.RECEIVING_RETURNED_SIGNAL}-${voiceChannel}`,
        payload
      );
  }

  @Input(EventName.EMIT_USERS)
  emitUsers(
    @Args(0) voiceChannelID: string,
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    const user: User = session.get("user");
    socket.emit(ResponseEventName.USER_STATUS, {
      channelID: user.currentVoiceChannel,
    });
    socket.emit(
      ResponseEventName.ALL_USERS,
      this.getUsersInVoiceChannel(voiceChannelID)
    );
  }

  public getVoiceChannelIdFromUser(userID: string): string {
    let voiceChannel = "";
    this.voiceChannels.forEach((v, k) => {
      const key = k;
      v.forEach((v, k) => {
        if (userID === k) {
          voiceChannel = key;
        }
      });
    });
    return voiceChannel;
  }

  /**
   * Retorna la lista de usuarios
   * @param voiceChannelID ID del canal de voz
   * @returns JSON {Map<string,string>}
   */
  public getUsersInVoiceChannel(voiceChannelID: string): any {
    if (this.voiceChannels.has(voiceChannelID)) {
      const voiceChannel = this.voiceChannels.get(voiceChannelID)!;
      return Object.fromEntries(voiceChannel);
    } else {
      return {};
    }
  }
}
