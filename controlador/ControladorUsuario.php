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
     * Subir foto de perfil
     */
    public function procesarSubidaFotoPerfil()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Verificar autenticación
        if (!isset($_SESSION['usuario'])) {
            header('Location: /PROYECTO_FINAL/index.php?action=mostrarLogin');
            exit;
        }

        // Verificar que sea POST y que haya archivo
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['foto_perfil'])) {
            header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?error=archivo_no_encontrado');
            exit;
        }

        $correo_electronico = $_SESSION['correo_electronico'];
        $archivo = $_FILES['foto_perfil'];

        // Validar el archivo
        $resultado = $this->validarYSubirFoto($archivo);

        if ($resultado['success']) {
            // Actualizar en la base de datos
            if ($this->modelo->actualizarFotoPerfil($correo_electronico, $resultado['nombre_archivo'])) {
                // Actualizar sesión
                $_SESSION['foto_perfil'] = $resultado['nombre_archivo'];

                header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?success=foto_actualizada');
                exit;
            } else {
                header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?error=db_error');
                exit;
            }
        } else {
            header('Location: /PROYECTO_FINAL/vista/auth/perfil.php?error=' . $resultado['error']);
            exit;
        }
    }

    /**
     * Validar y subir foto
     */
    private function validarYSubirFoto($archivo)
    {
        // Directorio de destino
        $directorioDestino = $_SERVER['DOCUMENT_ROOT'] . '/PROYECTO_FINAL/assets/images/usuarios/';

        // Crear directorio si no existe
        if (!file_exists($directorioDestino)) {
            mkdir($directorioDestino, 0777, true);
        }

        // Validar errores de subida
        if ($archivo['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'error_subida'];
        }

        // Validar tipo de archivo
        $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $archivo['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $tiposPermitidos)) {
            return ['success' => false, 'error' => 'tipo_invalido'];
        }

        // Validar tamaño (máximo 5MB)
        $tamañoMaximo = 5 * 1024 * 1024; // 5MB
        if ($archivo['size'] > $tamañoMaximo) {
            return ['success' => false, 'error' => 'tamano_excedido'];
        }

        // Validar dimensiones de imagen
        $imagenInfo = getimagesize($archivo['tmp_name']);
        if ($imagenInfo === false) {
            return ['success' => false, 'error' => 'no_es_imagen'];
        }

        // Generar nombre único
        $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
        $nombreArchivo = 'perfil_' . time() . '_' . uniqid() . '.' . $extension;
        $rutaCompleta = $directorioDestino . $nombreArchivo;

        // Mover archivo
        if (move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
            // Opcional: Redimensionar imagen para optimizar
            $this->redimensionarImagen($rutaCompleta, 400, 400);

            return ['success' => true, 'nombre_archivo' => $nombreArchivo];
        }

        return ['success' => false, 'error' => 'error_mover_archivo'];
    }

    /**
     * Redimensionar imagen (opcional pero recomendado)
     */
    private function redimensionarImagen($rutaArchivo, $anchoMax, $altoMax)
    {
        // Obtener información de la imagen
        list($anchoOriginal, $altoOriginal, $tipo) = getimagesize($rutaArchivo);

        // Calcular nuevas dimensiones manteniendo proporción
        $ratio = min($anchoMax / $anchoOriginal, $altoMax / $altoOriginal);
        $nuevoAncho = round($anchoOriginal * $ratio);
        $nuevoAlto = round($altoOriginal * $ratio);

        // Crear imagen según el tipo
        switch ($tipo) {
            case IMAGETYPE_JPEG:
                $imagenOriginal = imagecreatefromjpeg($rutaArchivo);
                break;
            case IMAGETYPE_PNG:
                $imagenOriginal = imagecreatefrompng($rutaArchivo);
                break;
            case IMAGETYPE_GIF:
                $imagenOriginal = imagecreatefromgif($rutaArchivo);
                break;
            case IMAGETYPE_WEBP:
                $imagenOriginal = imagecreatefromwebp($rutaArchivo);
                break;
            default:
                return false;
        }

        // Crear nueva imagen redimensionada
        $imagenNueva = imagecreatetruecolor($nuevoAncho, $nuevoAlto);

        // Preservar transparencia para PNG y GIF
        if ($tipo == IMAGETYPE_PNG || $tipo == IMAGETYPE_GIF) {
            imagealphablending($imagenNueva, false);
            imagesavealpha($imagenNueva, true);
            $transparente = imagecolorallocatealpha($imagenNueva, 255, 255, 255, 127);
            imagefilledrectangle($imagenNueva, 0, 0, $nuevoAncho, $nuevoAlto, $transparente);
        }

        // Copiar y redimensionar
        imagecopyresampled($imagenNueva, $imagenOriginal, 0, 0, 0, 0, $nuevoAncho, $nuevoAlto, $anchoOriginal, $altoOriginal);

        // Guardar según el tipo
        switch ($tipo) {
            case IMAGETYPE_JPEG:
                imagejpeg($imagenNueva, $rutaArchivo, 85);
                break;
            case IMAGETYPE_PNG:
                imagepng($imagenNueva, $rutaArchivo, 8);
                break;
            case IMAGETYPE_GIF:
                imagegif($imagenNueva, $rutaArchivo);
                break;
            case IMAGETYPE_WEBP:
                imagewebp($imagenNueva, $rutaArchivo, 85);
                break;
        }

        // Liberar memoria
        imagedestroy($imagenOriginal);
        imagedestroy($imagenNueva);

        return true;
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