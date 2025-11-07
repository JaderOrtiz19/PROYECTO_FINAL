<?php
session_start();

// Definir la base URL de tu proyecto.
// ¡Esta línea es la clave para corregir las rutas estáticas!
const BASE_URL = '/PROYECTO_FINAL/'; 

// Verificar si hay sesión activa
if (!isset($_SESSION['usuario'])) {
    // Usamos BASE_URL para redirigir
    header('Location: ' . BASE_URL . 'index.php?action=mostrarLogin');
    exit;
}

// Obtener datos del usuario desde la sesión
$nombre_usuario = $_SESSION['usuario'];
$correo_electronico = $_SESSION['correo_electronico'];

// Obtener datos adicionales si existen
$telefono = $_SESSION['telefono'] ?? '';
$direccion = $_SESSION['direccion'] ?? '';

// Variables para mensajes de feedback
$alerta_mensaje = null;
$alerta_tipo = null;

if (isset($_GET['success']) && $_GET['success'] == 1) {
    $alerta_mensaje = '¡Perfil actualizado con éxito!';
    $alerta_tipo = 'success';
} elseif (isset($_GET['error']) || isset($_GET['error_eliminar'])) {
    $alerta_mensaje = 'Ocurrió un error al intentar actualizar/eliminar el perfil.';
    $alerta_tipo = 'error';
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Perfil - PetSOS</title>
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/styles.css">
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/perfil.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="nav-left">
                <div class="logo">
                    <div class="logo-icon">
                        <img src="<?php echo BASE_URL; ?>assets/images/logo_icon.webp" alt="Logo Icon">
                    </div>
                    <a href="<?php echo BASE_URL; ?>vista/public/index.html" class="logo-text">PetSOS</a>
                </div>
            </div>
            <div class="nav-right">
                <button class="user-avatar-btn" onclick="new AuthSystem().showProfileModal()">
                    <img src="<?php echo BASE_URL; ?>assets/images/Perfill.webp" alt="Avatar" class="user-avatar">
                </button>
            </div>
        </nav>
    </header>

    <main class="profile-main">
        <div class="profile-container">
            <div class="profile-header">
                <h1>Mi Perfil</h1>
                <p>Gestiona y actualiza tu información personal.</p>
            </div>

            <?php if ($alerta_mensaje): ?>
                <div class="alert alert-<?php echo $alerta_tipo; ?>">
                    <?php echo $alerta_mensaje; ?>
                </div>
            <?php endif; ?>
            
            <form id="profileForm" method="POST" action="<?php echo BASE_URL; ?>index.php?action=actualizarPerfil">
                <div class="profile-card">
                    <div class="profile-section">
                        <h2>Información de Cuenta</h2>
                        <div class="form-group">
                            <label for="nombre">Nombre de Usuario</label>
                            <input type="text" id="nombre" name="nombre" value="<?php echo htmlspecialchars($nombre_usuario); ?>" readonly>
                        </div>
                        <div class="form-group">
                            <label for="email">Correo Electrónico</label>
                            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($correo_electronico); ?>" readonly>
                        </div>
                    </div>

                    <div class="profile-section">
                        <h2>Datos de Contacto</h2>
                        <div class="form-group">
                            <label for="telefono">Teléfono</label>
                            <input type="text" id="telefono" name="telefono" value="<?php echo htmlspecialchars($telefono); ?>" readonly placeholder="Añade tu número de teléfono">
                        </div>
                        <div class="form-group">
                            <label for="direccion">Dirección</label>
                            <input type="text" id="direccion" name="direccion" value="<?php echo htmlspecialchars($direccion); ?>" readonly placeholder="Añade tu dirección actual">
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button type="button" class="btn-edit" id="editBtn" onclick="toggleEditMode()">
                            ✏️ Editar Datos
                        </button>
                        
                        <button type="submit" class="btn-save" id="saveBtn" style="display:none;">
                            💾 Guardar Cambios
                        </button>
                    </div>
                </div>
            </form>

            <div class="profile-card danger-zone">
                <div class="profile-section">
                    <h2>Zona de Peligro</h2>
                    <p>Acciones que pueden tener consecuencias irreversibles en tu cuenta.</p>
                    <button type="button" class="btn-danger" onclick="confirmarEliminacion()">
                        ❌ Eliminar Cuenta
                    </button>
                </div>
            </div>
        </div>
    </main>

    <script>
        let editMode = false;

        function toggleEditMode() {
            editMode = !editMode;
            
            const telefonoInput = document.getElementById('telefono');
            const direccionInput = document.getElementById('direccion');
            const editBtn = document.getElementById('editBtn');
            const saveBtn = document.getElementById('saveBtn');

            if (editMode) {
                // Habilitar campos editables
                telefonoInput.removeAttribute('readonly');
                direccionInput.removeAttribute('readonly');
                
                // Cambiar estado visual
                telefonoInput.classList.add('editable');
                direccionInput.classList.add('editable');
                
                // Mostrar botón de guardar y ocultar botón de editar
                editBtn.style.display = 'none';
                saveBtn.style.display = 'inline-block';
            } else {
                // Deshabilitar campos y restaurar estado (aunque el submit recarga la página)
                telefonoInput.setAttribute('readonly', 'readonly');
                direccionInput.setAttribute('readonly', 'readonly');
                
                telefonoInput.classList.remove('editable');
                direccionInput.classList.remove('editable');

                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
            }
        }

        function confirmarEliminacion() {
            if (confirm('⚠️ ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                if (confirm('⚠️ ÚLTIMA ADVERTENCIA: Se eliminarán todos tus datos permanentemente. ¿Continuar?')) {
                    // La eliminación apunta al enrutador central (index.php) usando BASE_URL
                    window.location.href = '<?php echo BASE_URL; ?>index.php?action=eliminarCuenta';
                }
            }
        }

        // Prevenir envío si no está en modo edición (en caso de que alguien fuerce el botón)
        document.getElementById('profileForm').addEventListener('submit', function(e) {
            if (document.getElementById('telefono').hasAttribute('readonly')) {
                e.preventDefault();
                alert('Debes activar el modo de edición primero para guardar cambios.');
            }
        });
    </script>

    <script src="<?php echo BASE_URL; ?>assets/js/auth.js"></script>
</body>
</html>