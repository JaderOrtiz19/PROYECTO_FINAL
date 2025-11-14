<?php
session_start();

// Definir la base URL de tu proyecto
const BASE_URL = '/PROYECTO_FINAL/'; 

// Verificar si hay sesión activa
if (!isset($_SESSION['usuario'])) {
    header('Location: ' . BASE_URL . 'index.php?action=mostrarLogin');
    exit;
}

// Obtener datos del usuario desde la sesión
$nombre_usuario = $_SESSION['usuario'];
$correo_electronico = $_SESSION['correo_electronico'];

// Obtener datos adicionales si existen
$telefono = $_SESSION['telefono'] ?? '';
$direccion = $_SESSION['direccion'] ?? '';

// Obtener foto de perfil
require_once dirname(dirname(dirname(__FILE__))) . '/modelo/Usuario.php';
$usuarioModelo = new Usuario();
$foto_perfil = $usuarioModelo->obtenerFotoPerfil($correo_electronico);
$_SESSION['foto_perfil'] = $foto_perfil;

// Variables para mensajes de feedback
$alerta_mensaje = null;
$alerta_tipo = null;

if (isset($_GET['success'])) {
    switch ($_GET['success']) {
        case '1':
            $alerta_mensaje = '¡Perfil actualizado con éxito!';
            $alerta_tipo = 'success';
            break;
        case 'foto_actualizada':
            $alerta_mensaje = '¡Foto de perfil actualizada con éxito!';
            $alerta_tipo = 'success';
            break;
    }
} elseif (isset($_GET['error'])) {
    switch ($_GET['error']) {
        case 'tipo_invalido':
            $alerta_mensaje = 'Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, WEBP o GIF.';
            $alerta_tipo = 'error';
            break;
        case 'tamano_excedido':
            $alerta_mensaje = 'El archivo es demasiado grande. Tamaño máximo: 5MB.';
            $alerta_tipo = 'error';
            break;
        case 'error_subida':
            $alerta_mensaje = 'Error al subir el archivo. Intenta de nuevo.';
            $alerta_tipo = 'error';
            break;
        case 'no_es_imagen':
            $alerta_mensaje = 'El archivo no es una imagen válida.';
            $alerta_tipo = 'error';
            break;
        default:
            $alerta_mensaje = 'Ocurrió un error al procesar la solicitud.';
            $alerta_tipo = 'error';
    }
}

// Ruta de la foto de perfil
$ruta_foto = BASE_URL . 'assets/images/usuarios/' . $foto_perfil;
if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/PROYECTO_FINAL/assets/images/usuarios/' . $foto_perfil)) {
    $ruta_foto = BASE_URL . 'assets/images/Perfill.webp';
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
    <style>
        /* Estilos adicionales para la foto de perfil */
        .profile-photo-section {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid #f1f5f9;
        }

        .profile-photo-container {
            position: relative;
            width: 150px;
            height: 150px;
            margin: 0 auto 1rem;
        }

        .profile-photo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .photo-upload-overlay {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }

        .photo-upload-overlay:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .photo-upload-overlay::before {
            content: '📷';
            font-size: 1.5rem;
        }

        #fileInput {
            display: none;
        }

        .photo-info {
            color: #64748b;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }

        .preview-container {
            display: none;
            margin-top: 1rem;
            text-align: center;
        }

        .preview-image {
            max-width: 200px;
            max-height: 200px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
        }

        .preview-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .btn-upload {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-upload:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-cancel {
            padding: 0.75rem 1.5rem;
            background: #e5e7eb;
            color: #374151;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-cancel:hover {
            background: #d1d5db;
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="nav-left">
                <div class="logo">
                    <div class="logo-icon">
                        <img src="<?php echo BASE_URL; ?>assets/images/ImagenPrincipal.jpg" alt="Logo Icon">
                    </div>
                    <a href="<?php echo BASE_URL; ?>vista/public/index.html" class="logo-text">PetSOS</a>
                </div>
            </div>
            <div class="nav-right">
                <div class="profile-dropdown">
                    <div class="profile-avatar">
                        <img src="<?php echo $ruta_foto; ?>" alt="Avatar">
                    </div>
                    <span class="user-name"><?php echo htmlspecialchars($nombre_usuario); ?></span>
                    <div class="dropdown-arrow"></div>
                </div>
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
            
            <div class="profile-card">
                <!-- Sección de Foto de Perfil -->
                <div class="profile-photo-section">
                    <h2>Foto de Perfil</h2>
                    <div class="profile-photo-container">
                        <img src="<?php echo $ruta_foto; ?>" alt="Foto de perfil" class="profile-photo" id="currentPhoto">
                        <div class="photo-upload-overlay" onclick="document.getElementById('fileInput').click()"></div>
                    </div>
                    <p class="photo-info">Haz clic en la cámara para cambiar tu foto</p>
                    <p class="photo-info">Formatos: JPG, PNG, WEBP, GIF | Tamaño máximo: 5MB</p>
                    
                    <!-- Formulario oculto para subir foto -->
                    <form id="photoForm" action="<?php echo BASE_URL; ?>index.php?action=subirFotoPerfil" method="POST" enctype="multipart/form-data" style="display: none;">
                        <input type="file" id="fileInput" name="foto_perfil" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" onchange="previewImage(event)">
                    </form>

                    <!-- Preview de la nueva foto -->
                    <div id="previewContainer" class="preview-container">
                        <h3 style="margin-bottom: 1rem; color: #334155;">Vista previa:</h3>
                        <img id="previewImage" class="preview-image" alt="Vista previa">
                        <div class="preview-actions">
                            <button class="btn-upload" onclick="uploadPhoto()">✓ Subir Foto</button>
                            <button class="btn-cancel" onclick="cancelUpload()">✕ Cancelar</button>
                        </div>
                    </div>
                </div>

                <!-- Formulario de datos de perfil -->
                <form id="profileForm" method="POST" action="<?php echo BASE_URL; ?>index.php?action=actualizarPerfil">
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
                </form>
            </div>

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
        let selectedFile = null;

        function toggleEditMode() {
            editMode = !editMode;
            
            const telefonoInput = document.getElementById('telefono');
            const direccionInput = document.getElementById('direccion');
            const editBtn = document.getElementById('editBtn');
            const saveBtn = document.getElementById('saveBtn');

            if (editMode) {
                telefonoInput.removeAttribute('readonly');
                direccionInput.removeAttribute('readonly');
                telefonoInput.classList.add('editable');
                direccionInput.classList.add('editable');
                editBtn.style.display = 'none';
                saveBtn.style.display = 'inline-block';
            } else {
                telefonoInput.setAttribute('readonly', 'readonly');
                direccionInput.setAttribute('readonly', 'readonly');
                telefonoInput.classList.remove('editable');
                direccionInput.classList.remove('editable');
                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';
            }
        }

        function previewImage(event) {
            const file = event.target.files[0];
            
            if (!file) return;

            // Validar tipo de archivo
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('❌ Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, WEBP o GIF.');
                event.target.value = '';
                return;
            }

            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('❌ El archivo es demasiado grande. Tamaño máximo: 5MB.');
                event.target.value = '';
                return;
            }

            selectedFile = file;

            // Mostrar preview
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('previewImage').src = e.target.result;
                document.getElementById('previewContainer').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }

        function uploadPhoto() {
            if (!selectedFile) {
                alert('No hay archivo seleccionado');
                return;
            }

            // Confirmar subida
            if (confirm('¿Deseas subir esta foto como tu nueva imagen de perfil?')) {
                document.getElementById('photoForm').submit();
            }
        }

        function cancelUpload() {
            document.getElementById('fileInput').value = '';
            document.getElementById('previewContainer').style.display = 'none';
            selectedFile = null;
        }

        function confirmarEliminacion() {
            if (confirm('⚠️ ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                if (confirm('⚠️ ÚLTIMA ADVERTENCIA: Se eliminarán todos tus datos permanentemente. ¿Continuar?')) {
                    window.location.href = '<?php echo BASE_URL; ?>index.php?action=eliminarCuenta';
                }
            }
        }

        document.getElementById('profileForm').addEventListener('submit', function(e) {
            if (document.getElementById('telefono').hasAttribute('readonly')) {
                e.preventDefault();
                alert('Debes activar el modo de edición primero para guardar cambios.');
            }
        });

        // Auto-cerrar alertas
        document.addEventListener('DOMContentLoaded', function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                setTimeout(() => {
                    alert.style.transition = 'opacity 0.3s ease';
                    alert.style.opacity = '0';
                    setTimeout(() => alert.remove(), 300);
                }, 5000);
            });
        });
    </script>

    <script src="<?php echo BASE_URL; ?>assets/js/auth.js"></script>
</body>
</html>