// ==========================================
// LOGIN PAGE SCRIPTS
// ==========================================

function showLoginTab() {
    // Cambiar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    
    // Mostrar formulario de login
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function showSignupTab() {
    // Cambiar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    
    // Mostrar formulario de registro
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validación simple
    if (!email || !password) {
        showAlert('Por favor completa todos los campos');
        return false;
    }
    
    // Extraer nombre del email (antes del @)
    const userName = email.split('@')[0];
    const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    
    // Crear datos de usuario
    const userData = {
        name: capitalizedName,
        email: email,
        avatar: '/PROYECTO_FINAL/assets/images/Perfill.webp'
    };
    
    // Guardar sesión en sessionStorage
    sessionStorage.setItem('petsos_user', JSON.stringify(userData));
    
    // Mostrar mensaje de éxito
    showSuccessMessage();
    
    // Redirigir a index después de 1.5 segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
    
    return false;
}

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    
    // Validaciones
    if (!name || !email || !password || !confirm) {
        showAlert('Por favor completa todos los campos');
        return false;
    }
    
    if (password !== confirm) {
        showAlert('Las contraseñas no coinciden');
        return false;
    }
    
    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    // Crear datos de usuario
    const userData = {
        name: name,
        email: email,
        avatar: '/PROYECTO_FINAL/assets/images/Perfill.webp'
    };
    
    // Guardar sesión
    sessionStorage.setItem('petsos_user', JSON.stringify(userData));
    
    // Mostrar mensaje de éxito
    showSuccessMessage('¡Registro exitoso!');
    
    // Redirigir
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
    
    return false;
}

function socialLogin(platform) {
    const platformNames = {
        'facebook': 'Facebook',
        'google': 'Google'
    };
    
    // Simular login social (en producción esto conectaría con OAuth)
    const userData = {
        name: 'Usuario de ' + platformNames[platform],
        email: 'usuario@' + platform + '.com',
        avatar: '/PROYECTO_FINAL/assets/images/Perfill.webp'
    };
    
    sessionStorage.setItem('petsos_user', JSON.stringify(userData));
    
    showSuccessMessage('Conectando con ' + platformNames[platform] + '...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function showAlert(message) {
    // Crear alerta personalizada
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    alertBox.textContent = message;
    
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alertBox.remove(), 300);
    }, 3000);
}

function showSuccessMessage(message = '¡Inicio de sesión exitoso!') {
    const successBox = document.createElement('div');
    successBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    successBox.textContent = message;
    
    document.body.appendChild(successBox);
    
    setTimeout(() => {
        successBox.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => successBox.remove(), 300);
    }, 1500);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);