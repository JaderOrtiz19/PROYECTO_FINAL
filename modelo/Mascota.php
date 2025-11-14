<?php
require_once 'modelo/Conexion.php';

class Mascota
{
    private $conexion;

    public function __construct()
    {
        $this->conexion = (new Conexion())->getConexion();
    }

    /**
     * Registrar una nueva mascota y crear el reporte
     */
    public function registrarMascotaPerdida($datos)
    {
        // Iniciar transacción
        $this->conexion->begin_transaction();

        try {
            // 1. Insertar la mascota
            $stmt = $this->conexion->prepare(
                "INSERT INTO mascotas (Nombre, Especie, Raza, Color, Edad, Sexo, Descripcion, Foto, Estado, idUsuario, FechaReporte, Ubicacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Perdido', ?, NOW(), ?)"
            );

            $stmt->bind_param(
                "ssssssssis",  // <-- Cambié la 'i' a la posición correcta
                $datos['nombre'],
                $datos['especie'],
                $datos['raza'],
                $datos['color'],
                $datos['edad'],
                $datos['sexo'],
                $datos['descripcion'],
                $datos['foto'],
                $datos['idUsuario'],    // Este es el INT
                $datos['ubicacion']      // Este es STRING
            );

            if (!$stmt->execute()) {
                throw new Exception("Error al registrar la mascota");
            }

            // Obtener el ID de la mascota insertada
            $idMascota = $this->conexion->insert_id;

            // 2. Crear el reporte
            $stmt2 = $this->conexion->prepare(
                "INSERT INTO reportes (Tipo, Descripcion, idMascota, idUsuario, estado) 
                VALUES ('Perdido', ?, ?, ?, 'Activo')"
            );

            $stmt2->bind_param("sii", $datos['descripcion'], $idMascota, $datos['idUsuario']);

            if (!$stmt2->execute()) {
                throw new Exception("Error al crear el reporte");
            }

            // Confirmar transacción
            $this->conexion->commit();
            return $idMascota;

        } catch (Exception $e) {
            // Revertir cambios en caso de error
            $this->conexion->rollback();
            error_log("Error en registrarMascotaPerdida: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener todas las mascotas perdidas
     */
    public function obtenerMascotasPerdidas()
    {
        $query = "SELECT m.*, u.nombre_usuario, u.telefono, u.correo_electronico, r.Fecha as fecha_reporte
                  FROM mascotas m
                  INNER JOIN usuario u ON m.idUsuario = u.idUsuario
                  INNER JOIN reportes r ON m.idMascota = r.idMascota
                  WHERE m.Estado = 'Perdido' AND r.estado = 'Activo'
                  ORDER BY m.FechaReporte DESC";

        $result = $this->conexion->query($query);

        $mascotas = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $mascotas[] = $row;
            }
        }

        return $mascotas;
    }

    /**
     * Obtener una mascota por ID
     */
    public function obtenerMascotaPorId($idMascota)
    {
        $stmt = $this->conexion->prepare(
            "SELECT m.*, u.nombre_usuario, u.telefono, u.correo_electronico, r.Fecha as fecha_reporte
             FROM mascotas m
             INNER JOIN usuario u ON m.idUsuario = u.idUsuario
             LEFT JOIN reportes r ON m.idMascota = r.idMascota
             WHERE m.idMascota = ?"
        );

        $stmt->bind_param("i", $idMascota);
        $stmt->execute();
        $result = $stmt->get_result();

        return $result->fetch_assoc();
    }

    /**
     * Actualizar estado de mascota (marcar como encontrada)
     */
    public function actualizarEstado($idMascota, $nuevoEstado)
    {
        $stmt = $this->conexion->prepare("UPDATE mascotas SET Estado = ? WHERE idMascota = ?");
        $stmt->bind_param("si", $nuevoEstado, $idMascota);

        if ($stmt->execute()) {
            // También actualizar el reporte
            $stmt2 = $this->conexion->prepare("UPDATE reportes SET estado = 'Resuelto' WHERE idMascota = ?");
            $stmt2->bind_param("i", $idMascota);
            $stmt2->execute();
            return true;
        }

        return false;
    }

    /**
     * Eliminar mascota y su reporte
     */
    public function eliminarMascota($idMascota, $idUsuario)
    {
        // Verificar que la mascota pertenece al usuario
        $stmt = $this->conexion->prepare("SELECT idUsuario FROM mascotas WHERE idMascota = ?");
        $stmt->bind_param("i", $idMascota);
        $stmt->execute();
        $result = $stmt->get_result();
        $mascota = $result->fetch_assoc();

        if ($mascota && $mascota['idUsuario'] == $idUsuario) {
            // Eliminar reporte primero (por la clave foránea)
            $stmt2 = $this->conexion->prepare("DELETE FROM reportes WHERE idMascota = ?");
            $stmt2->bind_param("i", $idMascota);
            $stmt2->execute();

            // Eliminar mascota
            $stmt3 = $this->conexion->prepare("DELETE FROM mascotas WHERE idMascota = ?");
            $stmt3->bind_param("i", $idMascota);
            return $stmt3->execute();
        }

        return false;
    }

    /**
     * Obtener mascotas de un usuario específico
     */
    public function obtenerMascotasPorUsuario($idUsuario)
    {
        $stmt = $this->conexion->prepare(
            "SELECT m.*, r.Fecha as fecha_reporte, r.estado as estado_reporte
             FROM mascotas m
             LEFT JOIN reportes r ON m.idMascota = r.idMascota
             WHERE m.idUsuario = ?
             ORDER BY m.FechaReporte DESC"
        );

        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        $result = $stmt->get_result();

        $mascotas = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $mascotas[] = $row;
            }
        }

        return $mascotas;
    }
}