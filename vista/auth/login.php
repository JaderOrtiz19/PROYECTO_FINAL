<?php
// Iniciar sesión solo si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Si ya tiene sesión activa, redirigir a la página principal
if(isset($_SESSION['usuario'])) {
    header("Location: /PROYECTO_FINAL/vista/public/index.html");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - PetSOS</title>
    <link rel="stylesheet" href="/PROYECTO_FINAL/assets/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="navbar">
            <a href="/PROYECTO_FINAL/vista/public/index.html" class="logo">
                <div class="logo-icon">
                    <img src="/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg" alt="PetSOS Logo">
                </div>
                <span class="logo-text">PetSOS</span>
            </a>
            
            <ul class="nav-links">
                <li><a href="/PROYECTO_FINAL/vista/public/index.html">Inicio</a></li>
                <li><a href="/PROYECTO_FINAL/vista/public/perdidos.html">Perdidos</a></li>
                <li><a href="/PROYECTO_FINAL/vista/public/encontrados.html">Encontrados</a></li>
                <li><a href="/PROYECTO_FINAL/vista/public/refugios.html">Refugios</a></li>
            </ul>

            <div class="auth-buttons">
                <a href="/PROYECTO_FINAL/index.php?action=mostrarLogin" class="btn-login">Iniciar Sesión</a>
                <a href="/PROYECTO_FINAL/index.php?action=mostrarRegistro" class="btn-signup">Registrarse</a>
            </div>
        </nav>
    </header>

    <!-- Main Content -->
    <div class="login-container">
        <div class="login-box">
            <div class="welcome-text">
                <h1>Bienvenido a PetSOS</h1>
                <p>Encuentra tu mascota perdida o ayuda a una a encontrar su hogar.</p>
            </div>

            <!-- Tab Buttons -->
            <div class="tab-buttons">
                <button class="tab-btn active" onclick="showLoginTab()">Iniciar Sesión</button>
                <button class="tab-btn" onclick="showSignupTab()">Registrarse</button>
            </div>

            <!-- Mensajes de error/éxito -->
            <?php
            if(isset($_GET['error'])) {
                if($_GET['error'] == 'credenciales') {
                    echo '<div class="alert alert-error">Credenciales incorrectas. Inténtalo de nuevo.</div>';
                } else if($_GET['error'] == 'datos_invalidos') {
                    echo '<div class="alert alert-error">Datos inválidos. Por favor completa todos los campos.</div>';
                } else {
                    echo '<div class="alert alert-error">Error al procesar la solicitud.</div>';
                }
            }
            if(isset($_GET['registro']) && $_GET['registro'] == 'exitoso') {
                echo '<div class="alert alert-success">¡Registro exitoso! Ya puedes iniciar sesión.</div>';
            }
            if(isset($_GET['logout']) && $_GET['logout'] == 'success') {
                echo '<div class="alert alert-success">Sesión cerrada correctamente.</div>';
            }
            ?>

            <!-- Login Form -->
            <form class="login-form active" id="loginForm" method="POST" action="/PROYECTO_FINAL/index.php?action=iniciarSesion">
                <div class="form-group">
                    <input type="email" name="correo_electronico" id="loginEmail" class="form-input" placeholder="Correo electrónico" required>
                </div>

                <div class="form-group">
                    <input type="password" name="contrasena" id="loginPassword" class="form-input" placeholder="Contraseña" required>
                </div>

                <div class="forgot-password">
                    <a href="#">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" class="btn-submit">Iniciar Sesión</button>

                <div class="divider">O continuar con</div>

                <div class="social-buttons">
                    <button type="button" class="social-btn" onclick="socialLogin('facebook')">
                        <svg class="social-icon" fill="#1877f2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </button>
                    <button type="button" class="social-btn" onclick="socialLogin('google')">
                        <svg class="social-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    </button>
                </div>
            </form>

            <!-- Signup Form -->
            <form class="signup-form" id="signupForm" method="POST" action="/PROYECTO_FINAL/index.php?action=registrar">
                <div class="form-group">
                    <input type="text" name="nombre_usuario" id="signupName" class="form-input" placeholder="Nombre completo" required>
                </div>

                <div class="form-group">
                    <input type="email" name="correo_electronico" id="signupEmail" class="form-input" placeholder="Correo electrónico" required>
                </div>

                <div class="form-group">
                    <input type="password" name="contrasena" id="signupPassword" class="form-input" placeholder="Contraseña" required minlength="6">
                </div>

                <div class="form-group">
                    <input type="password" id="signupConfirm" class="form-input" placeholder="Confirmar contraseña" required minlength="6">
                </div>

                <button type="submit" class="btn-submit">Registrarse</button>

                <div class="divider">O continuar con</div>

                <div class="social-buttons">
                    <button type="button" class="social-btn" onclick="socialLogin('facebook')">
                        <svg class="social-icon" fill="#1877f2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </button>
                    <button type="button" class="social-btn" onclick="socialLogin('google')">
                        <svg class="social-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="/PROYECTO_FINAL/assets/js/login.js"></script>
    
    <script>
        // Función para cambiar entre tabs
        function showLoginTab() {
            document.getElementById('loginForm').classList.add('active');
            document.getElementById('signupForm').classList.remove('active');
            document.querySelectorAll('.tab-btn')[0].classList.add('active');
            document.querySelectorAll('.tab-btn')[1].classList.remove('active');
        }

        function showSignupTab() {
            document.getElementById('signupForm').classList.add('active');
            document.getElementById('loginForm').classList.remove('active');
            document.querySelectorAll('.tab-btn')[1].classList.add('active');
            document.querySelectorAll('.tab-btn')[0].classList.remove('active');
        }

        // Validación de contraseñas en registro
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            const password = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('signupConfirm').value;
            
            if(password !== confirm) {
                e.preventDefault();
                alert('Las contraseñas no coinciden');
                return false;
            }
            
            if(password.length < 6) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 6 caracteres');
                return false;
            }
        });

        // Función placeholder para login social
        function socialLogin(provider) {
            alert('Login con ' + provider + ' - Funcionalidad por implementar');
        }

        // Auto-cerrar alertas después de 5 segundos
        document.addEventListener('DOMContentLoaded', function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                setTimeout(() => {
                    alert.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => alert.remove(), 300);
                }, 5000);
            });
        });
    </script>

    <style>
        /* Estilos para las alertas */
        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-size: 14px;
            animation: slideIn 0.3s ease;
        }

        .alert-error {
            background-color: #fee;
            color: #c33;
            border-left: 4px solid #c33;
        }

        .alert-success {
            background-color: #efe;
            color: #3c3;
            border-left: 4px solid #3c3;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-10px);
            }
        }

        /* Asegurar que solo un formulario sea visible */
        .login-form, .signup-form {
            display: none;
        }

        .login-form.active, .signup-form.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    </style>
</body>
</html>