<?php
require_once 'modelo/Mascota.php';

class ControladorMascota
{
    private $modelo;

    public function __construct()
    {
        $this->modelo = new Mascota();
    }

    /**
     * Procesar el formulario de reporte de mascota perdida
     */
    public function reportarMascotaPerdida()
    {
        // Verificar sesión
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['usuario'])) {
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin');
            exit;
        }

        // Verificar que sea POST
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /PROYECTO_FINAL/vista/public/perdidos.html');
            exit;
        }

        // Obtener ID del usuario
        $correoElectronico = $_SESSION['correo_electronico'];
        require_once 'modelo/Usuario.php';
        $usuarioModelo = new Usuario();
        $datosUsuario = $usuarioModelo->obtenerDatosUsuario($correoElectronico);
        
        if (!$datosUsuario) {
            header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?error=usuario_no_encontrado');
            exit;
        }

        // Obtener y sanitizar datos del formulario
        $datos = [
            'nombre' => htmlspecialchars(trim($_POST['nombre'] ?? '')),
            'especie' => htmlspecialchars(trim($_POST['especie'] ?? '')),
            'raza' => htmlspecialchars(trim($_POST['raza'] ?? '')),
            'color' => htmlspecialchars(trim($_POST['color'] ?? '')),
            'edad' => htmlspecialchars(trim($_POST['edad'] ?? '')),
            'sexo' => htmlspecialchars(trim($_POST['sexo'] ?? 'Macho')),
            'descripcion' => htmlspecialchars(trim($_POST['descripcion'] ?? '')),
            'ubicacion' => htmlspecialchars(trim($_POST['ubicacion'] ?? '')),
            'idUsuario' => $datosUsuario['idUsuario'] ?? 0,
            'foto' => null
        ];

        // Validar datos obligatorios
        if (empty($datos['nombre']) || empty($datos['especie']) || empty($datos['descripcion']) || empty($datos['ubicacion'])) {
            header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?error=campos_vacios');
            exit;
        }

        // Manejar subida de foto
        if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
            $fotoNombre = $this->subirFoto($_FILES['foto']);
            if ($fotoNombre) {
                $datos['foto'] = $fotoNombre;
            }
        }

        // Si no hay foto, usar una por defecto
        if (empty($datos['foto'])) {
            $datos['foto'] = 'default-pet.jpg';
        }

        try {
            $idMascota = $this->modelo->registrarMascotaPerdida($datos);
            
            if ($idMascota) {
                header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?success=reporte_creado&id=' . $idMascota);
                exit;
            } else {
                header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?error=registro_fallido');
                exit;
            }
        } catch (Exception $e) {
            error_log("Error al reportar mascota: " . $e->getMessage());
            header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?error=excepcion');
            exit;
        }
    }

    /**
     * Obtener todas las mascotas perdidas (AJAX)
     */
    public function obtenerMascotasPerdidas()
    {
        header('Content-Type: application/json');
        
        try {
            $mascotas = $this->modelo->obtenerMascotasPerdidas();
            echo json_encode([
                'success' => true,
                'data' => $mascotas
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtener una mascota específica (AJAX)
     */
    public function obtenerMascota()
    {
        header('Content-Type: application/json');
        
        if (!isset($_GET['id'])) {
            echo json_encode(['success' => false, 'error' => 'ID no proporcionado']);
            exit;
        }

        try {
            $mascota = $this->modelo->obtenerMascotaPorId($_GET['id']);
            
            if ($mascota) {
                echo json_encode([
                    'success' => true,
                    'data' => $mascota
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'Mascota no encontrada'
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Actualizar estado de mascota
     */
    public function actualizarEstado()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['usuario'])) {
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin');
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /PROYECTO_FINAL/vista/public/perdidos.html');
            exit;
        }

        $idMascota = $_POST['idMascota'] ?? 0;
        $nuevoEstado = $_POST['estado'] ?? 'Encontrado';

        try {
            $resultado = $this->modelo->actualizarEstado($idMascota, $nuevoEstado);
            
            if ($resultado) {
                header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?success=estado_actualizado');
                exit;
            } else {
                header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?error=actualizacion_fallida');
                exit;
            }
        } catch (Exception $e) {
            error_log("Error al actualizar estado: " . $e->getMessage());
            header('Location: /PROYECTO_FINAL/vista/public/perdidos.html?error=excepcion');
            exit;
        }
    }

    /**
     * Subir foto al servidor
     */
    private function subirFoto($archivo)
    {
        $directorioDestino = $_SERVER['DOCUMENT_ROOT'] . '/PROYECTO_FINAL/assets/images/mascotas/';
        
        // Crear directorio si no existe
        if (!file_exists($directorioDestino)) {
            mkdir($directorioDestino, 0777, true);
        }

        // Validar tipo de archivo
        $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!in_array($archivo['type'], $tiposPermitidos)) {
            return false;
        }

        // Validar tamaño (max 5MB)
        if ($archivo['size'] > 5 * 1024 * 1024) {
            return false;
        }

        // Generar nombre único
        $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
        $nombreArchivo = 'mascota_' . time() . '_' . uniqid() . '.' . $extension;
        $rutaCompleta = $directorioDestino . $nombreArchivo;

        // Mover archivo
        if (move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
            return $nombreArchivo;
        }

        return false;
    }
}