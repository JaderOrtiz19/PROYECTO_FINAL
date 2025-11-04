<?php
require_once 'modelo/Usuario.php';

class ControladorUsuario
{
    private $modelo;

    public function __construct()
    {
        $this->modelo = new Usuario();
    }

    public function mostrarLogin()
    {
        require 'vista/auth/login.php';
    }

    public function iniciarSesion($correo_electronico, $contrasena)
    {
        $nombre_usuario = $this->modelo->verificarCredenciales($correo_electronico, $contrasena);

        if ($nombre_usuario) {
            // Iniciar sesión
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $_SESSION['usuario'] = $nombre_usuario;
            $_SESSION['correo_electronico'] = $correo_electronico;
            
            // CORRECCIÓN: Redirigir a la ruta correcta de index.html
            $nombre_url = urlencode($nombre_usuario);
            header("Location: /PROYECTO_FINAL/vista/public/index.html?login=success&user={$nombre_url}"); 
            exit;

        } else {
            // Error de credenciales
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin&error=credenciales');
            exit;
        }
    }

    public function mostrarRegistro()
    {
        require 'vista/auth/registro.php';
    }

    public function registrarUsuario($nombre_usuario, $correo_electronico, $contrasena)
    {
        if ($this->modelo->registrar($nombre_usuario, $correo_electronico, $contrasena)) {
            // Redirigir al login con mensaje de éxito
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin&registro=exitoso');
            exit;
        } else {
            // Redirigir al registro con mensaje de error
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarRegistro&error=1');
            exit;
        }
    }
    
    public function cerrarSesion()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Limpiar todas las variables de sesión
        $_SESSION = array();
        
        // Destruir la sesión
        session_destroy();
        
        // Redirigir al login
        header('Location: /PROYECTO_FINAL/index.php?logout=success');
        exit;
    }
}
?>