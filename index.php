<?php
// Iniciar sesión al principio
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'controlador/ControladorUsuario.php';

// Crear una instancia del controlador
$controlador = new ControladorUsuario();

// Verificar si se ha especificado una acción en la URL
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'iniciarSesion':
            // Verificar que los datos del POST existan
            if (isset($_POST['correo_electronico']) && isset($_POST['contrasena'])) {
                $controlador->iniciarSesion($_POST['correo_electronico'], $_POST['contrasena']);
            } else {
                header('Location: /PROYECTO_FINAL/index.php?error=datos_invalidos');
                exit;
            }
            break;

        case 'registrar':
            // Verificar que los datos del POST existan
            if (isset($_POST['nombre_usuario']) && isset($_POST['correo_electronico']) && isset($_POST['contrasena'])) {
                $controlador->registrarUsuario($_POST['nombre_usuario'], $_POST['correo_electronico'], $_POST['contrasena']);
            } else {
                header('Location: /PROYECTO_FINAL/index.php?action=mostrarRegistro&error=datos_invalidos');
                exit;
            }
            break;
            
        // ** NUEVA IMPLEMENTACIÓN **
        case 'actualizarPerfil':
            // Esta acción recibe el POST del formulario de perfil
            $controlador->procesarActualizacionPerfil();
            break;
            
        // ** NUEVA IMPLEMENTACIÓN **
        case 'eliminarCuenta':
            // Esta acción se llama desde el botón de eliminar cuenta
            $controlador->procesarEliminarCuenta();
            break;

        case 'mostrarRegistro':
            // Mostrar el formulario de registro
            $controlador->mostrarRegistro();
            break;

        case 'cerrarSesion':
            // Cerrar sesión
            $controlador->cerrarSesion();
            break;

        case 'mostrarLogin':
            // Mostrar el formulario de login
            $controlador->mostrarLogin();
            break;

        default:
            // Si la acción no es reconocida, mostrar el login
            $controlador->mostrarLogin();
            break;
    }
} else {
    // Si el usuario ya tiene sesión activa, redirigir a la página principal
    if (isset($_SESSION['usuario'])) {
        header('Location: /PROYECTO_FINAL/vista/public/index.html');
        exit;
    }
    
    // Si no hay sesión, mostrar el formulario de inicio de sesión por defecto
    $controlador->mostrarLogin();
}