import { Signal } from "./signal";



export interface SignalPayload{
    signal: Signal;
    uid: string;
    socketID: string;
}