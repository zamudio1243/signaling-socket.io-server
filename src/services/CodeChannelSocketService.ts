import { Args, Input, Namespace, Nsp, Socket, SocketService, SocketSession} from "@tsed/socketio";
import { CursorCoordinates } from "../models/coordinates";
import { User } from "../models/user";

@SocketService("/codeChannel")
export class CodeChannelSocketService{

    @Nsp nsp!: Namespace;

    /**
     * ['codeChannelID' => ['socketID' => 'User']]
     * @type {Map<Map<string,string}
     */
    public codeChannels: Map<string, Map<string,User>> = new Map<string, Map<string,User>> ();

    public cursorPointers: Map<string, CursorCoordinates[]> = new Map<string, CursorCoordinates[]>();
    public code: Map<string, string> = new Map<string, string> ();
    /**
     * Triggered the namespace is created
     */
    $onNamespaceInit(nsp: Namespace) {
  
    }
  
    /**
     * Triggered when a new client connects to the Namespace.
     */
    $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
      console.log("New connection in code channel, ID =>", socket.id);
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
     * Se elimina el usuario del canal de código
     * Si el canal de código  se queda vacio se elimina
     */
    $onDisconnect(@SocketSession session: SocketSession, @Socket socket: Socket) {
      this.leaveRoom(session,socket);
      console.table(this.codeChannels);
    }

    /**
     * Agrega a un usuario a un canal de código a través de ID del canal 
     * @param codeChannelID ID del canal de código a unirse
     * @param session sesión del Socket
     * @returns Usuarios dentro del canal de código
     */
    @Input("join-code-channel")
    joinCodeChannel(
       @Args(0) codeChannelID: string,
       @SocketSession session: SocketSession,
       @Socket socket: Socket
    ): void {
      this.joinRoom(codeChannelID,session,socket);
    }

    joinRoom(
      codeChannelID: string,
      session: SocketSession,
      socket: Socket
    ): void {
      const user: User = session.get("user");
      if( user.currentCodeChannel === codeChannelID) return;

      const codeChannel = this.codeChannels.get(codeChannelID);
      if(user.currentCodeChannel){
        this.leaveRoom(session,socket);
      }
      if(codeChannel){
        codeChannel.set(user.socketID, user);
      }
      else{
        this.codeChannels.set(codeChannelID,new Map<string,User>(
          [
            [
              user.socketID, user
            ]
          ]
        ));
      }
      user.currentCodeChannel = codeChannelID;
      console.log(`${codeChannelID}-users-in-code-channel`);
      this.nsp.emit(`${codeChannelID}-users-in-code-channel`,this.getUsersInCodeChannel(codeChannelID));
      socket.emit('user-status',{channelID: user.currentCodeChannel});
    }

    @Input("leave-code-channel")
    leaveCodeChannel(
       @SocketSession session: SocketSession,
       @Socket socket: Socket
    ): void {
      this.leaveRoom(session,socket);
    }

    @Input("emit-users")
    emitUsers(
      @Args(0) codeChannelID: string,
      @Socket socket: Socket,
      @SocketSession session: SocketSession
   ): void {
    const user: User = session.get("user");
    socket.emit('user-status',{channelID: user.currentCodeChannel});
    this.nsp.emit(`${codeChannelID}-users-in-code-channel`,this.getUsersInCodeChannel(codeChannelID));
   }



    leaveRoom(session: SocketSession, socket: Socket){
      const user: User = session.get("user");
      if(user.currentCodeChannel){
        const codeChannel = this.codeChannels.get(user.currentCodeChannel);
        if(codeChannel){
          if(codeChannel.delete(user.socketID)){
            console.log("Usuario eliminado");
          }
          this.nsp.emit(`${user.currentCodeChannel}-users-in-code-channel`,this.getUsersInCodeChannel(user.currentCodeChannel));
          if(codeChannel.size === 0){
            if(this.codeChannels.delete(user.currentCodeChannel)){
              console.log("Code channel cerrado");
            }
          }
          user.currentCodeChannel= undefined;
          socket.emit('user-status',{});
        }
      }
    }

    /**
     * Retorna la lista de usuarios
     * @param codeChannelID ID del canal de código
     * @returns JSON {Map<string,string>}
     */
     public getUsersInCodeChannel(codeChannelID: string): any{
      if(this.codeChannels.has(codeChannelID)){
        const result = Object.fromEntries(this.codeChannels.get(codeChannelID)!);
        console.table(result);
        return result;
      }
      else{
        return {};
      }
    }

    /**
     * Evia coordenadas de un usuario en el canal de codigo 
     * @param coordinates coordinadas del usuario 
     * @param session sesión del Socket
     * @returns coordinadas del usuario en el canal de codigo
     */
     @Input("sent-coordinates")
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
        const currentCoordinates = this.cursorPointers.get(user.currentCodeChannel!);
        const cursorCoordinates = currentCoordinates?.find((cursor)=> {
            return cursor.userID === coordinates.userID
        });

        if (cursorCoordinates) {
          cursorCoordinates.x = coordinates.x
          cursorCoordinates.y = coordinates.y
          cursorCoordinates.scroll = coordinates.scroll
        }
        else{
          currentCoordinates?.push(coordinates)
        }
        
      }
      else{
        this.cursorPointers.set(user.currentCodeChannel!,[coordinates] )
      }
      this.nsp.emit(`${user.currentCodeChannel}-coordinates`,this.cursorPointers.get(user.currentCodeChannel!));
    }
    
    @Input("send-code")
    sendCode(
      @Args(0)code: string,
      socket: Socket,
      session: SocketSession
    ): void {
      const user: User = session.get("user");
      if (user.currentCodeChannel) {
        this.code.set(user.currentCodeChannel,code);
        this.nsp.emit(
          `${user.currentCodeChannel}-code`,
           this.getDatafromCodeChannel(user.currentCodeChannel)
        );
      }
    }

    getDatafromCodeChannel(
      codeChannelID: string,
    ): string{
      if (this.code.has(codeChannelID)) {
        return this.code.get(codeChannelID)!;
      }
      else{
        return ''
      }
    }
  }