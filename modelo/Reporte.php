<?php
require_once 'modelo/Conexion.php';

class Reporte
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = (new Conexion())->getConexion();
    }

    /**
     * Crear un nuevo reporte
     */
    public function crearReporte($tipo, $descripcion, $idMascota, $idUsuario)
    {
        $stmt = $this->conexion->prepare(
            "INSERT INTO reportes (Tipo, Descripcion, idMascota, idUsuario, estado) 
             VALUES (?, ?, ?, ?, 'Activo')"
        );

        $stmt->bind_param("ssii", $tipo, $descripcion, $idMascota, $idUsuario);
        return $stmt->execute();
    }

    /**
     * Obtener todos los reportes activos
     */
    public function obtenerReportesActivos($tipo = null)
    {
        if ($tipo) {
            $query = "SELECT r.*, m.Nombre as nombre_mascota, m.Especie, m.Raza, m.Foto, 
                             u.nombre_usuario, u.telefono, u.correo_electronico
                      FROM reportes r
                      INNER JOIN mascotas m ON r.idMascota = m.idMascota
                      INNER JOIN usuario u ON r.idUsuario = u.idUsuario
                      WHERE r.estado = 'Activo' AND r.Tipo = ?
                      ORDER BY r.Fecha DESC";
            
            $stmt = $this->conexion->prepare($query);
            $stmt->bind_param("s", $tipo);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $query = "SELECT r.*, m.Nombre as nombre_mascota, m.Especie, m.Raza, m.Foto,
                             u.nombre_usuario, u.telefono, u.correo_electronico
                      FROM reportes r
                      INNER JOIN mascotas m ON r.idMascota = m.idMascota
                      INNER JOIN usuario u ON r.idUsuario = u.idUsuario
                      WHERE r.estado = 'Activo'
                      ORDER BY r.Fecha DESC";
            
            $result = $this->conexion->query($query);
        }

        $reportes = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $reportes[] = $row;
            }
        }

        return $reportes;
    }

    /**
     * Obtener un reporte por ID
     */
    public function obtenerReportePorId($idReporte)
    {
        $stmt = $this->conexion->prepare(
            "SELECT r.*, m.*, u.nombre_usuario, u.telefono, u.correo_electronico
             FROM reportes r
             INNER JOIN mascotas m ON r.idMascota = m.idMascota
             INNER JOIN usuario u ON r.idUsuario = u.idUsuario
             WHERE r.idReporte = ?"
        );

        $stmt->bind_param("i", $idReporte);
        $stmt->execute();
        $result = $stmt->get_result();

        return $result->fetch_assoc();
    }

    /**
     * Actualizar estado de un reporte
     */
    public function actualizarEstado($idReporte, $nuevoEstado)
    {
        $stmt = $this->conexion->prepare("UPDATE reportes SET estado = ? WHERE idReporte = ?");
        $stmt->bind_param("si", $nuevoEstado, $idReporte);
        return $stmt->execute();
    }

    /**
     * Eliminar un reporte
     */
    public function eliminarReporte($idReporte, $idUsuario)
    {
        // Verificar que el reporte pertenece al usuario
        $stmt = $this->conexion->prepare("SELECT idUsuario FROM reportes WHERE idReporte = ?");
        $stmt->bind_param("i", $idReporte);
        $stmt->execute();
        $result = $stmt->get_result();
        $reporte = $result->fetch_assoc();

        if ($reporte && $reporte['idUsuario'] == $idUsuario) {
            $stmt2 = $this->conexion->prepare("DELETE FROM reportes WHERE idReporte = ?");
            $stmt2->bind_param("i", $idReporte);
            return $stmt2->execute();
        }

        return false;
    }

    /**
     * Obtener reportes de un usuario
     */
    public function obtenerReportesPorUsuario($idUsuario)
    {
        $stmt = $this->conexion->prepare(
            "SELECT r.*, m.Nombre as nombre_mascota, m.Especie, m.Raza, m.Foto
             FROM reportes r
             INNER JOIN mascotas m ON r.idMascota = m.idMascota
             WHERE r.idUsuario = ?
             ORDER BY r.Fecha DESC"
        );

        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $result = $stmt->get_result();

        $reportes = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $reportes[] = $row;
            }
        }

        return $reportes;
    }

    /**
     * Obtener estadísticas de reportes
     */
    public function obtenerEstadisticas()
    {
        $query = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activos,
                    SUM(CASE WHEN estado = 'Resuelto' THEN 1 ELSE 0 END) as resueltos,
                    SUM(CASE WHEN Tipo = 'Perdido' THEN 1 ELSE 0 END) as perdidos,
                    SUM(CASE WHEN Tipo = 'Encontrado' THEN 1 ELSE 0 END) as encontrados
                  FROM reportes";

        $result = $this->conexion->query($query);
        return $result->fetch_assoc();
    }
}