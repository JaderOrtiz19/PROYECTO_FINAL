<?php
// Usar ruta absoluta basada en __DIR__ en lugar de ruta relativa
require_once __DIR__ . '/Conexion.php';

class Usuario
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = (new Conexion())->getConexion();
    }

    public function registrar($nombre_usuario, $correo_electronico, $contrasena)
    {
        $contrasena_hashed = password_hash($contrasena, PASSWORD_DEFAULT);
        $stmt = $this->conexion->prepare("INSERT INTO usuario (nombre_usuario, correo_electronico, contrasena) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $nombre_usuario, $correo_electronico, $contrasena_hashed);
        return $stmt->execute();
    }

    public function verificarCredenciales($correo_electronico, $contrasena)
    {
        $stmt = $this->conexion->prepare("SELECT nombre_usuario, contrasena FROM usuario WHERE correo_electronico = ?");
        $stmt->bind_param("s", $correo_electronico);
        $stmt->execute();

        $stmt->bind_result($nombre_usuario, $contrasena_hashed);
        $stmt->fetch();
        $stmt->close();

        if (isset($contrasena_hashed) && password_verify($contrasena, $contrasena_hashed)) {
            return $nombre_usuario;
        }

        return false;
    }

    /**
     * Actualizar foto de perfil
     */
    public function actualizarFotoPerfil($correo_electronico, $nombreArchivo)
    {
        $stmt = $this->conexion->prepare("UPDATE usuario SET foto_perfil = ? WHERE correo_electronico = ?");
        $stmt->bind_param("ss", $nombreArchivo, $correo_electronico);
        return $stmt->execute();
    }

    /**
     * Obtener foto de perfil
     */
    public function obtenerFotoPerfil($correo_electronico)
    {
        $stmt = $this->conexion->prepare("SELECT foto_perfil FROM usuario WHERE correo_electronico = ?");
        $stmt->bind_param("s", $correo_electronico);
        $stmt->execute();
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();

        return $usuario ? $usuario['foto_perfil'] : 'default-avatar.jpg';
    }

    /**
     * Actualizar perfil de usuario (teléfono y dirección)
     */
    public function actualizarPerfil($correo_electronico, $telefono, $direccion)
    {
        $stmt = $this->conexion->prepare("UPDATE usuario SET telefono = ?, direccion = ? WHERE correo_electronico = ?");
        $stmt->bind_param("sss", $telefono, $direccion, $correo_electronico);
        return $stmt->execute();
    }

    /**
     * Eliminar cuenta de usuario
     */
    public function eliminarCuenta($correo_electronico)
    {
        $stmt = $this->conexion->prepare("DELETE FROM usuario WHERE correo_electronico = ?");
        $stmt->bind_param("s", $correo_electronico);
        return $stmt->execute();
    }

    /**
     * Obtener datos completos del usuario (INCLUYE idUsuario)
     */
    public function obtenerDatosUsuario($correo_electronico)
    {
        $stmt = $this->conexion->prepare("SELECT idUsuario, nombre_usuario, correo_electronico, telefono, direccion FROM usuario WHERE correo_electronico = ?");
        $stmt->bind_param("s", $correo_electronico);
        $stmt->execute();

        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    /**
     * Obtener idUsuario por correo electrónico
     */
    public function obtenerIdUsuario($correo_electronico)
    {
        $stmt = $this->conexion->prepare("SELECT idUsuario FROM usuario WHERE correo_electronico = ?");
        $stmt->bind_param("s", $correo_electronico);
        $stmt->execute();
        $result = $stmt->get_result();
        $usuario = $result->fetch_assoc();

        return $usuario ? $usuario['idUsuario'] : null;
    }
}