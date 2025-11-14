<?php
// Permitir acceso desde cualquier origen (solo para desarrollo)
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Iniciar sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar si hay sesión activa
if (isset($_SESSION['usuario'])) {
    // Obtener foto de perfil
    require_once __DIR__ . '/modelo/Usuario.php';
    $usuarioModelo = new Usuario();
    $foto_perfil = $usuarioModelo->obtenerFotoPerfil($_SESSION['correo_electronico']);
    
    $ruta_foto = '/PROYECTO_FINAL/assets/images/usuarios/' . $foto_perfil;
    if (!file_exists($_SERVER['DOCUMENT_ROOT'] . $ruta_foto)) {
        $ruta_foto = '/PROYECTO_FINAL/assets/images/Perfill.webp';
    }
    
    echo json_encode([
        'loggedIn' => true,  
        'nombre' => $_SESSION['usuario'],  
        'correo_electronico' => $_SESSION['correo_electronico'] ?? '',
        'avatar' => $ruta_foto
    ]);
} else {
    echo json_encode([
        'loggedIn' => false  
    ]);
}
?>