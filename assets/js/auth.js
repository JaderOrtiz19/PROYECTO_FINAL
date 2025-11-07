// ==========================================
// SISTEMA DE AUTENTICACIÓN - PetSOS
// ==========================================

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // ✅ RUTA CORREGIDA: Usar ruta absoluta desde la raíz
            const response = await fetch('/PROYECTO_FINAL/get_session.php');
            const data = await response.json();
            
            if (data.loggedIn) {
                // Establecer el usuario actual con el nombre real
                this.currentUser = {
                    name: data.nombre,
                    email: data.correo_electronico || 'sesion@iniciada.com',
                    avatar: data.avatar || '/PROYECTO_FINAL/assets/images/Perfill.webp'
                };
                this.updateUIForLoggedInUser();
            } else {
                this.updateUIForGuest();
            }
        } catch (error) {
            console.error("Error al verificar la sesión:", error);
            this.updateUIForGuest();
        }
    }

    // Guardar usuario en memoria (simulación de sesión)
    login(userData) {
        this.currentUser = {
            name: userData.name || 'Usuario',
            email: userData.email || 'usuario@email.com',
            avatar: userData.avatar || '/PROYECTO_FINAL/assets/images/Perfill.webp'
        };
        
        this.updateUIForLoggedInUser();
        return true;
    }

    // Cerrar sesión
    logout() {
        // Llamar al servidor para cerrar la sesión PHP
        window.location.href = '/PROYECTO_FINAL/index.php?action=cerrarSesion';
    }

    // Verificar si hay sesión activa
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Actualizar UI para usuario logueado
    updateUIForLoggedInUser() {
        const profileDropdown = document.querySelector('.profile-dropdown');
        if (!profileDropdown) return;

        const user = this.currentUser;
        
        profileDropdown.innerHTML = `
            <div class="profile-avatar">
                <img src="${user.avatar}" alt="Avatar">
            </div>
            <span class="user-name">${user.name}</span>
            <div class="dropdown-arrow"></div>
        `;
        
        profileDropdown.onclick = () => this.showLoggedInMenu();
    }

    // Actualizar UI para invitado (sin sesión)
    updateUIForGuest() {
        const profileDropdown = document.querySelector('.profile-dropdown');
        if (!profileDropdown) return;

        profileDropdown.innerHTML = `
            <div class="profile-avatar">
                <img src="/PROYECTO_FINAL/assets/images/Perfill.webp" alt="Avatar">
            </div>
            <span class="user-name">Invitado</span>
            <div class="dropdown-arrow"></div>
        `;
        
        profileDropdown.onclick = () => this.showGuestMenu();
    }

    // Mostrar menú para usuario logueado
    showLoggedInMenu() {
        const user = this.currentUser;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 300px;">
                <button class="modal-close" onclick="authSystem.closeModal()">&times;</button>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <img src="${user.avatar}" alt="Perfil" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0;">${user.name}</h3>
                        <p style="color: #666; font-size: 0.9rem;">${user.email}</p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button onclick="authSystem.goToProfile()" class="profile-menu-item">Mi Perfil</button>
                        <button onclick="authSystem.goToMyPosts()" class="profile-menu-item">Mis Publicaciones</button>
                        <button onclick="authSystem.goToSettings()" class="profile-menu-item">Configuración</button>
                        <button onclick="authSystem.logout()" class="profile-menu-item" style="color: #d32f2f;">Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Mostrar menú para invitado
    showGuestMenu() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 300px;">
                <button class="modal-close" onclick="authSystem.closeModal()">&times;</button>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <img src="/PROYECTO_FINAL/assets/images/Perfill.webp" alt="Perfil" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 0.5rem;">
                        <h3 style="margin: 0;">Bienvenido a PetSOS</h3>
                        <p style="color: #666; font-size: 0.9rem;">Inicia sesión para acceder a todas las funciones</p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button onclick="authSystem.goToLogin()" class="profile-menu-item" style="background: #1e88e5; color: white;">Iniciar Sesión</button>
                        <button onclick="authSystem.goToSignup()" class="profile-menu-item">Registrarse</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Cerrar modal
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // Navegación
    goToLogin() {
        window.location.href = '/PROYECTO_FINAL/index.php?action=mostrarLogin';
    }

    goToSignup() {
        window.location.href = '/PROYECTO_FINAL/index.php?action=mostrarRegistro';
    }

    goToProfile() {
        this.closeModal();
        // Redirigir a la página de perfil
        window.location.href = '/PROYECTO_FINAL/vista/auth/perfil.php';
    }

    goToMyPosts() {
        this.closeModal();
        if (typeof showNotification === 'function') {
            showNotification('Navegando a Mis Publicaciones...');
        }
    }

    goToSettings() {
        this.closeModal();
        if (typeof showNotification === 'function') {
            showNotification('Navegando a Configuración...');
        }
    }
}

// Instancia global del sistema de autenticación
let authSystem;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AuthSystem();
});