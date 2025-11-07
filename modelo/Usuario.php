<?php

require_once 'modelo/Conexion.php';


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
    
    // Cambiamos el bind_result para incluir nombre_usuario
    $stmt->bind_result($nombre_usuario, $contrasena_hashed); 

    $stmt->fetch();
    $stmt->close();
    
    // Si la contraseña es correcta, devuelve el nombre del usuario, sino devuelve false.
    if (isset($contrasena_hashed) && password_verify($contrasena, $contrasena_hashed)) {
        return $nombre_usuario; 
    }
    
    return false;
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
     * Obtener datos completos del usuario
     */
    public function obtenerDatosUsuario($correo_electronico)
    {
        $stmt = $this->conexion->prepare("SELECT nombre_usuario, correo_electronico, telefono, direccion FROM usuario WHERE correo_electronico = ?");
        $stmt->bind_param("s", $correo_electronico);
        $stmt->execute();
        
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }
}
