/**
 * Modelo del usuario
 */
 export interface User {
    /**
     * ID único del usuario
     */
    socketID: string;
    uid: string;
    currentVoiceChannel?: string;
    currentCodeChannel?: string;
}
  