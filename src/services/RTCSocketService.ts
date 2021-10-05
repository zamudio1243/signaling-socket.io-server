
import {Nsp, Socket, SocketService, SocketSession, Namespace, Input,  Broadcast, Emit, Args} from "@tsed/socketio";
import { $log } from "../../node_modules/@tsed/logger/lib";
import { User } from "../models/user";

@SocketService("/rtc")
export class RTCSocketService{

    @Nsp nsp!: Namespace;

    public users: Map<string, User> = new Map<string, User> ()

    public socketToRoom: any = {};

    /**
     * Triggered the namespace is created
     */
    $onNamespaceInit(nsp: Namespace) {
  
    }
  
    /**
     * Triggered when a new client connects to the Namespace.
     */
    $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
      $log.debug("New connection, ID =>", socket.id);
      const user: User = {
        uid: socket.id
      }
      session.set("user", user);
    }
  
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    $onDisconnect(@Socket socket: Socket) {
  
    }

    @Broadcast("all users")
    async allUsers(): Promise<void>{

    }


    @Input("join-room")
    @Broadcast("user-joined")
    joinRoom(
      @Args(0) name: string,
       @SocketSession session: SocketSession
    ): User[]
       {
      const user = session.get("user");
      $log.debug("Joinned to the room => ", name);

      user.nombre = name;
      this.users.set(user.id, user);

      return this.getUsers();
    }
    


    @Input("input:scenario1")
    @Broadcast("output:scenario1")
    async scenario1() {
      return "My message";
    }

    /**
     * Retorna la lista de usuarios
     * @returns {Array}
     */
    public getUsers(): User[]{
      const users: User[] = [];
      this.users.forEach(user => {
        users.push(user);
      });

      return users;
    }
  }