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
}
