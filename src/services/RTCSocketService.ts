
import {Nsp, Socket, SocketService, SocketSession, Namespace, Input,  Broadcast, Args} from "@tsed/socketio";
import { User } from "../models/user";

@SocketService("/rtc")
export class RTCSocketService{

    @Nsp nsp!: Namespace;

    public users: Map<string, User> = new Map<string, User> ();
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

    @Input("join-room")
    @Broadcast("user-joined")
    joinRoom(
      @Args(0) name: string,
       @SocketSession session: SocketSession
    ): User[]
       {
      const user = session.get("user") as User;
      console.log("Joinned to the room => ", name);

      user.nombre = name;
      this.users.set(user.uid!, user);

      console.log(this.users);

      return this.getUsers();
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