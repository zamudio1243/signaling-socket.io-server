
import {Nsp, Socket, SocketService, SocketSession, Namespace, Input,  Broadcast} from "@tsed/socketio";

@SocketService("/rtc")
export class RTCSocketService{

    @Nsp nsp!: Namespace;
  
  
   
  
    /**
     * Triggered the namespace is created
     */
    $onNamespaceInit(nsp: Namespace) {
  
    }
  
    /**
     * Triggered when a new client connects to the Namespace.
     */
    $onConnection(@Socket socket: Socket, @SocketSession session: SocketSession) {
        console.log("=====   CONNECTED A CLIENT   =====");
        console.log(`===== SOCKET ID ${socket.id} =====`);
    }
  
    /**
     * Triggered when a client disconnects from the Namespace.
     */
    $onDisconnect(@Socket socket: Socket) {
  
    }

    


    @Input("input:scenario1")
    @Broadcast("output:scenario1")
    async scenario1() {
      return "My message";
    }
  }