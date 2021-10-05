/**
 * Modelo del usuario
 */
 export interface User {
    /**
     * ID único del usuario
     */
    uid?: string,
    /**
     * Nombre del usuario
     */
    nombre?: string,
    /**
     * Apellido del usuario
     */
    apellido?: string,
    /**
     * URL de la imagen de perfil del usuario
     */
    fotoURL?: string,
}
  