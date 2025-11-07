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

            // Obtener el ID y datos completos para guardarlos en la sesión
            $datos_usuario = $this->modelo->obtenerDatosUsuario($correo_electronico);
            
            $_SESSION['usuario'] = $nombre_usuario;
            $_SESSION['correo_electronico'] = $correo_electronico;
            $_SESSION['telefono'] = $datos_usuario['telefono'] ?? ''; // Asumiendo que obtienes los datos
            $_SESSION['direccion'] = $datos_usuario['direccion'] ?? ''; // Asumiendo que obtienes los datos
            
            // Redirigir a la ruta correcta de index.html
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
        header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin&logout=success');
        exit;
    }

    /**
     * Lógica migrada de ActualizarPerfil.php.
     */
    public function procesarActualizacionPerfil()
    {
        // Asegurar que la sesión esté activa (necesario para $_SESSION['correo_electronico'])
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // 1. Verificar autenticación
        if (!isset($_SESSION['usuario'])) {
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin');
            exit;
        }

        // 2. Verificar que sea una petición POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /PROYECTO_FINAL/vista/auth/perfil.php');
            exit;
        }

        // 3. Obtener y Sanitizar datos
        $correo_electronico = $_SESSION['correo_electronico'];
        $telefono = $_POST['telefono'] ?? '';
        $direccion = $_POST['direccion'] ?? '';

        $telefono = htmlspecialchars(trim($telefono));
        $direccion = htmlspecialchars(trim($direccion));

        try {
            // 4. Actualizar el perfil usando el modelo
            $resultado = $this->modelo->actualizarPerfil($correo_electronico, $telefono, $direccion);
            
            if ($resultado) {
                // Actualizar la sesión con los nuevos datos
                $_SESSION['telefono'] = $telefono;
                $_SESSION['direccion'] = $direccion;
                
                // Redirigir con mensaje de éxito
                header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?success=1');
                exit;
            } else {
                // Redirigir con mensaje de error (fallo de la BD)
                header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?error=actualizacion_fallida');
                exit;
            }
        } catch (Exception $e) {
            // Manejo de errores de excepción
            error_log("Error al actualizar perfil: " . $e->getMessage());
            header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?error=excepcion');
            exit;
        }
    }

    /**
     * Lógica migrada de EliminarCuenta.php.
     */
    public function procesarEliminarCuenta()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // 1. Verificar autenticación
        if (!isset($_SESSION['usuario'])) {
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin');
            exit;
        }
        
        $correo_electronico = $_SESSION['correo_electronico'];

        try {
            // 2. Eliminar la cuenta en la base de datos
            $resultado = $this->modelo->eliminarCuenta($correo_electronico);
            
            if ($resultado) {
                // Limpiar y destruir la sesión
                $_SESSION = array();
                session_destroy();
                
                // Redirigir al login con mensaje
                header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin&cuenta_eliminada=1');
                exit;
            } else {
                // Redirigir con mensaje de error
                header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?error_eliminar=1');
                exit;
            }
        } catch (Exception $e) {
            // Manejo de errores
            error_log("Error al eliminar cuenta: " . $e->getMessage());
            header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?error_eliminar=1');
            exit;
        }
    }
}