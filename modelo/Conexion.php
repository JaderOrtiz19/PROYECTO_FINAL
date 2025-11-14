<?php
class Conexion
{
    private $conexion;

    public function __construct()
    {
        // Obtener la configuración
        $configPath = __DIR__ . '/../config/config.php';
        
        // Verificar que el archivo existe
        if (!file_exists($configPath)) {
            die("Error: No se encontró el archivo de configuración en: " . $configPath);
        }
        
        // Cargar configuración (usar require en lugar de require_once)
        $config = require $configPath;

        // Verificar que sea un array válido
        if (!is_array($config)) {
            die("Error: El archivo config.php no devuelve un array válido");
        }

        // Crear conexión
        $this->conexion = new mysqli(
            $config['host'] ?? 'localhost',
            $config['usuario'] ?? 'root',
            $config['contrasena'] ?? '',
            $config['base_de_datos'] ?? 'petsos'
        );

        // Verificar errores de conexión
        if ($this->conexion->connect_error) {
            die("Conexión fallida: " . $this->conexion->connect_error);
        }

        // Establecer charset UTF-8
        $this->conexion->set_charset("utf8mb4");
    }

    public function getConexion()
    {
        return $this->conexion;
    }

    public function cerrarConexion()
    {
        if ($this->conexion) {
            $this->conexion->close();
        }
    }
}