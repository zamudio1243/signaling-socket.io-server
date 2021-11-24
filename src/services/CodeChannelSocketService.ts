import {
  Args,
  Emit,
  Input,
  Namespace,
  Nsp,
  Socket,
  SocketService,
  SocketSession,
} from "@tsed/socketio";
import { CursorCoordinates } from "../models/coordinates";
import { User } from "../models/user";
import sha256 from "crypto-js/sha256";
import { EventName } from "../utils/event_name";
import { ResponseEventName } from "../utils/response_event_name";
import { Code } from "../models/code";

@SocketService("/codeChannel")
export class CodeChannelSocketService {
  @Nsp nsp!: Namespace;

  /**
   * ['codeChannelID' => ['uid' => 'User']]
   * @type {Map<Map<string,string}
   */
  public codeChannels: Map<string, Map<string, User>> = new Map<
    string,
    Map<string, User>
  >();

  /**
   * ['codeChannelID' => 'uid']
   * @type {Map<Map<string,string}
   */
  public drivers: Map<string, string> = new Map<string, string>();
  public cursorPointers: Map<string, CursorCoordinates[]> = new Map<
    string,
    CursorCoordinates[]
  >();
  public code: Map<string, Code> = new Map<string, Code>();

  /**
   * Triggered the namespace is created
   */
  $onNamespaceInit(nsp: Namespace) {}

  /**
   * Triggered when a new client connects to the Namespace.
   */
  $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
    console.log("New connection in code channel, ID =>", socket.id);
    if (socket.handshake.auth) {
      session.set("user", <User>{
        socketID: socket.id,
        uid: socket.handshake.auth.uid,
        connectionDate: new Date(),
      });
      socket.join(socket.handshake.auth.uid);
    } else {
      socket.disconnect();
    }
  }

  /**
   * Triggered when a client disconnects from the Namespace.
   * Se elimina el usuario del canal de código
   * Si el canal de código  se queda vacio se elimina
   */
  $onDisconnect(@SocketSession session: SocketSession, @Socket socket: Socket) {
    this.leaveRoom(session, socket);
    console.table(this.codeChannels);
  }

  /**
   * Agrega a un usuario a un canal de código a través de ID del canal
   * @param codeChannelID ID del canal de código a unirse
   * @param session sesión del Socket
   * @returns Usuarios dentro del canal de código
   */
  @Input(EventName.JOIN_CODE_CHANNEL)
  @Emit(ResponseEventName.CODE_JOINED_USERS)
  joinCodeChannel(
    @Args(0) codeChannelID: string,
    @SocketSession session: SocketSession,
    @Socket socket: Socket
  ): any {
    this.joinSocketToCodeChannel(codeChannelID, session, socket);
    return this.getUsersInCodeChannel(codeChannelID);
  }

  joinSocketToCodeChannel(
    codeChannelID: string,
    session: SocketSession,
    socket: Socket
  ): void {
    const user: User = session.get("user");

    if (user.currentCodeChannel === codeChannelID) return;

    const codeChannel = this.codeChannels.get(codeChannelID);

    if (user.currentCodeChannel) {
      this.leaveRoom(session, socket);
    }
    if (codeChannel) {
      //if(codeChannel.has(user.uid)) return;

      codeChannel.set(user.uid, user);
    } else {
      this.codeChannels.set(
        codeChannelID,
        new Map<string, User>([[user.uid, user]])
      );
      this.drivers.set(codeChannelID, user.uid);
    }
    user.currentCodeChannel = codeChannelID;
    socket.join(codeChannelID);
    this.nsp
      .to(codeChannelID)
      .emit(
        ResponseEventName.CODE_ALL_USERS,
        this.getUsersInCodeChannel(codeChannelID)
      );
    this.nsp
      .to(codeChannelID)
      .emit(ResponseEventName.DRIVER, this.getDriver(codeChannelID));
    socket.emit(ResponseEventName.CODE_USER_STATUS, {
      channelID: user.currentCodeChannel,
    });
  }

  @Input(EventName.LEAVE_CODE_CHANNEL)
  leaveCodeChannel(
    @SocketSession session: SocketSession,
    @Socket socket: Socket
  ): void {
    this.leaveRoom(session, socket);
  }

  leaveRoom(session: SocketSession, socket: Socket) {
    const user: User = session.get("user");
    const currentCodeChannel = user.currentCodeChannel;
    if (currentCodeChannel) {
      const codeChannel = this.codeChannels.get(currentCodeChannel);
      if (codeChannel) {
        if (codeChannel.delete(user.uid)) {
          console.log("Usuario eliminado");
        }
        this.nsp
          .to(currentCodeChannel)
          .emit(
            ResponseEventName.CODE_ALL_USERS,
            this.getUsersInCodeChannel(currentCodeChannel)
          );

        if (this.drivers.get(currentCodeChannel) === user.uid) {
          var users: User[] = [];
          codeChannel.forEach((v, k, m) => {
            users.push(v);
          });
          users.sort((a, b) => {
            const sort = 0;
            if (a.connectionDate && b.connectionDate) {
              const dates =
                b.connectionDate.getTime() - a.connectionDate.getTime();
              return dates;
            }
            return sort;
          });
          if (users[0]) {
            this.changeDriver(currentCodeChannel, users[0].uid);
          }
        }

        if (codeChannel.size === 0) {
          if (this.codeChannels.delete(currentCodeChannel)) {
            console.log("Code channel cerrado");
          }
        }
        user.currentCodeChannel = undefined;
        socket.emit(ResponseEventName.CODE_USER_STATUS, {});
        this.nsp.to(user.uid).emit(ResponseEventName.CODE_USER_STATUS, {});
      }
    }
  }

  @Input(EventName.CODE_JOIN_ROOM)
  joinRoom(@Args(0) codeChannelID: string, @Socket socket: Socket): void {
    this.joinSocketToRoom(codeChannelID, socket);
  }

  joinSocketToRoom(codeChannelID: string, socket: Socket) {
    socket.join(codeChannelID);
  }

  @Input(EventName.CODE_EMIT_USERS)
  emitUsers(
    @Args(0) codeChannelID: string,
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    const user: User = session.get("user");
    socket.emit(ResponseEventName.CODE_USER_STATUS, {
      channelID: user.currentCodeChannel,
    });
    socket.emit(
      ResponseEventName.CODE_ALL_USERS,
      this.getUsersInCodeChannel(codeChannelID)
    );
    socket.emit(ResponseEventName.DRIVER, this.getDriver(codeChannelID));
  }

  /**
   * Envia coordenadas de un usuario en el canal de codigo
   * Envia coordenadas de un usuario en el canal de codigo
   * Envia coordenadas de un usuario en el canal de codigo
   * @param coordinates coordinadas del usuario
   * @param coordinates coordinadas del usuario
   * @param coordinates coordinadas del usuario
   * @param session sesión del Socket
   * @returns coordinadas del usuario en el canal de codigo
   */
  @Input(EventName.SENT_COORDINATES)
  sentCoordinates(
    @Args(0) coordinates: CursorCoordinates,
    @SocketSession session: SocketSession,
    @Socket socket: Socket
  ): void {
    this.sendCoordinates(coordinates, session, socket);
  }

  sendCoordinates(
    coordinates: CursorCoordinates,
    session: SocketSession,
    socket: Socket
  ): void {
    const user: User = session.get("user");
    if (this.cursorPointers.has(user.currentCodeChannel!)) {
      const currentCoordinates = this.cursorPointers.get(
        user.currentCodeChannel!
      );
      const cursorCoordinates = currentCoordinates?.find((cursor) => {
        return cursor.userID === coordinates.userID;
      });
      if (cursorCoordinates) {
        cursorCoordinates.x = coordinates.x;
        cursorCoordinates.y = coordinates.y;
        cursorCoordinates.scroll = coordinates.scroll;
      } else {
        currentCoordinates?.push(coordinates);
      }
    } else {
      this.cursorPointers.set(user.currentCodeChannel!, [coordinates]);
    }
    if (user.currentCodeChannel) {
      const channel = user.currentCodeChannel;
      this.nsp
        .to(channel)
        .emit(ResponseEventName.COORDINAES, this.cursorPointers.get(channel));
    }
  }

  @Input(EventName.SEND_CODE)
  sendCode(
    @Args(0)
    codeData: {
      channelID: string;
      code: string;
      extension: string;
      path: string;
    },
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    const user: User = session.get("user");
    const currentCodeChannel = user.currentCodeChannel;

    if (this.drivers.get(currentCodeChannel!) !== user.uid) {
      return;
    }
    if (currentCodeChannel) {
      let code: Code | undefined = undefined
      if(this.code.has(currentCodeChannel) && codeData.path === this.code.get(currentCodeChannel)?.path){
        code = <Code> {
          ...this.code.get(currentCodeChannel),
          currentHash: this.getCodeHash(codeData.code),
          data: codeData.code,
          extension: codeData.extension,
        }
      }
      else{
        code = <Code>{
          data: codeData.code,
          extension: codeData.extension,
          hash: this.getCodeHash(codeData.code),
          currentHash: this.getCodeHash(codeData.code),
          path: codeData.path
        }
      }
      
      this.code.set(codeData.channelID, code);
      this.nsp
        .to(codeData.channelID)
        .emit(
          ResponseEventName.CODE,
          this.getDatafromCodeChannel(codeData.channelID)
        );
    }
  }

  getCodeHash(code: string): string {
    const encryp = sha256(code).toString();
    return encryp;
  }

  @Input(EventName.REQUEST_DRIVER)
  eventRequetDriver(
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    this.requestDriver(socket, session);
  }

  requestDriver(socket: Socket, session: SocketSession): void {
    const user: User = session.get("user");
    if (user.currentCodeChannel) {
      socket
        .to(this.getDriver(user.currentCodeChannel))
        .emit(ResponseEventName.REQUEST_FROM_NAV, user.uid);
    }
  }

  @Input(EventName.ACCEPT_REQUEST)
  eventAcceptRequest(
    @Args(0) newdriverID: string,
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    const user: User = session.get("user");
    if (user.currentCodeChannel) {
      this.changeDriver(user.currentCodeChannel, newdriverID);
    }
  }

  @Input(EventName.GET_DRIVER)
  eventGetDriver(
    @Args(0) codeChannelID: string,
    @Socket socket: Socket,
    @SocketSession session: SocketSession
  ): void {
    socket.emit(ResponseEventName.DRIVER, this.getDriver(codeChannelID));
  }

  changeDriver(codeChannelID: string, newdriverID: string): void {
    if (this.drivers.has(codeChannelID)) {
      this.drivers.set(codeChannelID, newdriverID);
      this.nsp
        .to(codeChannelID)
        .emit(ResponseEventName.DRIVER, this.getDriver(codeChannelID));
    }
  }

  getDatafromCodeChannel(codeChannelID: string): Code {
    if (this.code.has(codeChannelID)) {
      return this.code.get(codeChannelID)!;
    } else {
      return { data: "", extension: "", hash: "", currentHash: "", path: ""};
    }
  }

  /**
   * Retorna la lista de usuarios
   * @param codeChannelID ID del canal de código
   * @returns JSON {Map<string,string>}
   */
  public getUsersInCodeChannel(codeChannelID: string): any {
    if (this.codeChannels.has(codeChannelID)) {
      const result = Object.fromEntries(this.codeChannels.get(codeChannelID)!);
      return result;
    } else {
      return {};
    }
  }

  public getDriver(codeChannelID: string): string {
    if (this.drivers.has(codeChannelID)) {
      return this.drivers.get(codeChannelID)!;
    } else {
      return "";
    }
  }
}
