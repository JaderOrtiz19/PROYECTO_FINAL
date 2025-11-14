<?php
// Iniciar sesión al principio
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'controlador/ControladorUsuario.php';
require_once 'controlador/ControladorMascota.php';

// Crear instancias de los controladores
$controladorUsuario = new ControladorUsuario();
$controladorMascota = new ControladorMascota();

// Verificar si se ha especificado una acción en la URL
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        // ========================================
        // RUTAS DE USUARIO
        // ========================================
        case 'iniciarSesion':
            if (isset($_POST['correo_electronico']) && isset($_POST['contrasena'])) {
                $controladorUsuario->iniciarSesion($_POST['correo_electronico'], $_POST['contrasena']);
            } else {
                header('Location: /PROYECTO_FINAL/index.php?error=datos_invalidos');
                exit;
            }
            break;

        case 'registrar':
            if (isset($_POST['nombre_usuario']) && isset($_POST['correo_electronico']) && isset($_POST['contrasena'])) {
                $controladorUsuario->registrarUsuario($_POST['nombre_usuario'], $_POST['correo_electronico'], $_POST['contrasena']);
            } else {
                header('Location: /PROYECTO_FINAL/index.php?action=mostrarRegistro&error=datos_invalidos');
                exit;
            }
            break;

        case 'actualizarPerfil':
            $controladorUsuario->procesarActualizacionPerfil();
            break;

        case 'eliminarCuenta':
            $controladorUsuario->procesarEliminarCuenta();
            break;

        case 'mostrarRegistro':
            $controladorUsuario->mostrarRegistro();
            break;

        case 'cerrarSesion':
            $controladorUsuario->cerrarSesion();
            break;

        case 'mostrarLogin':
            $controladorUsuario->mostrarLogin();
            break;

        case 'subirFotoPerfil':
            $controladorUsuario->procesarSubidaFotoPerfil();
            break;

        // ========================================
        // RUTAS DE MASCOTAS
        // ========================================
        case 'reportarMascotaPerdida':
            $controladorMascota->reportarMascotaPerdida();
            break;

        case 'obtenerMascotasPerdidas':
            $controladorMascota->obtenerMascotasPerdidas();
            break;

        case 'obtenerMascota':
            $controladorMascota->obtenerMascota();
            break;

        case 'actualizarEstadoMascota':
            $controladorMascota->actualizarEstado();
            break;

        default:
            $controladorUsuario->mostrarLogin();
            break;
    }
} else {
    // Si el usuario ya tiene sesión activa, redirigir a la página principal
    if (isset($_SESSION['usuario'])) {
        header('Location: /PROYECTO_FINAL/vista/public/index.html');
        exit;
    }

    // Si no hay sesión, mostrar el formulario de inicio de sesión por defecto
    $controladorUsuario->mostrarLogin();
}