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
    echo json_encode([
        'loggedIn' => true,  
        'nombre' => $_SESSION['usuario'],  
        'correo_electronico' => $_SESSION['correo_electronico'] ?? '',
        'avatar' => '/PROYECTO_FINAL/assets/images/Perfill.webp'
    ]);
} else {
    echo json_encode([
        'loggedIn' => false  
    ]);
}
?>