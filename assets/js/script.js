const petsData = [
    {
        id: 1,
        name: "Toby",
        type: "dog",
        breed: "Pug",
        status: "lost",
        urgent: true,
        image: "/PROYECTO_FINAL/assets/images/Pug.jpg",
        time: "Hace 2 días",
        distance: "1.5 Km",
        description: "Pug color beige, collar azul. Muy amigable.",
        location: "Santa Marta Centro",
        contact: "300-123-4567"
    },
    {
        id: 2,
        name: "Michu",
        type: "cat",
        breed: "Siamés",
        status: "found",
        urgent: false,
        image: "/PROYECTO_FINAL/assets/images/Siames.webp",
        time: "Hace 5 horas",
        distance: "1 Km",
        description: "Gato siamés con ojos azules, muy tranquilo.",
        location: "Rodadero",
        contact: "301-987-6543"
    },
    {
        id: 3,
        name: "Luna",
        type: "dog",
        breed: "Golden Retriever",
        status: "lost",
        urgent: true,
        image: "/PROYECTO_FINAL/assets/images/PerroYgatoo.jpg",
        time: "Hace 1 día",
        distance: "2.3 Km",
        description: "Golden Retriever hembra, muy cariñosa.",
        location: "Bello Horizonte",
        contact: "315-555-1234"
    }
];

// Estado de la aplicación
let currentFilter = 'all';
let searchQuery = '';
let notifications = [
    { id: 1, message: "Nueva mascota encontrada cerca de ti", read: false },
    { id: 2, message: "Alguien comentó en tu publicación", read: false }
];

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupSearchListeners();
    setupFilterTabs();
    setupButtons();
    setupNotifications();
    renderPets();
    updateNotificationBadge();
}

// ==========================================
// BÚSQUEDA
// ==========================================

function setupSearchListeners() {
    // Búsqueda principal en header
    const mainSearchInput = document.querySelector('.search-input');
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value.toLowerCase();
            renderPets();
        });
    }

    // Búsqueda en mapa
    const mapSearchInput = document.querySelector('.map-search-input');
    if (mapSearchInput) {
        mapSearchInput.addEventListener('input', function(e) {
            const query = e.target.value;
            console.log('Buscando en mapa:', query);
            // Aquí integrarías con una API de mapas real
        });
    }
}

// ==========================================
// FILTROS Y PESTAÑAS
// ==========================================

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover clase active de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Agregar clase active al tab clickeado
            this.classList.add('active');
            
            // Actualizar filtro
            const tabText = this.textContent.toLowerCase();
            if (tabText === 'todos') {
                currentFilter = 'all';
            } else if (tabText === 'perdidos') {
                currentFilter = 'lost';
            } else if (tabText === 'encontrados') {
                currentFilter = 'found';
            } else if (tabText === 'urgente') {
                currentFilter = 'urgent';
            }
            
            renderPets();
        });
    });
}

// ==========================================
// RENDERIZADO DE MASCOTAS
// ==========================================

function renderPets() {
    const petCardsContainer = document.querySelector('.pet-cards');
    if (!petCardsContainer) return;

    // Filtrar mascotas
    let filteredPets = petsData.filter(pet => {
        // Filtro por búsqueda
        const matchesSearch = pet.name.toLowerCase().includes(searchQuery) ||
                            pet.breed.toLowerCase().includes(searchQuery) ||
                            pet.location.toLowerCase().includes(searchQuery);
        
        // Filtro por categoría
        let matchesFilter = true;
        if (currentFilter === 'lost') {
            matchesFilter = pet.status === 'lost';
        } else if (currentFilter === 'found') {
            matchesFilter = pet.status === 'found';
        } else if (currentFilter === 'urgent') {
            matchesFilter = pet.urgent === true;
        }
        
        return matchesSearch && matchesFilter;
    });

    // Renderizar
    petCardsContainer.innerHTML = filteredPets.map(pet => `
        <div class="pet-card ${pet.urgent ? 'urgent' : ''} ${pet.status}">
            <div class="pet-card-image">
                <img src="${pet.image}" alt="${pet.name}" onerror="this.src='/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg'">
            </div>
            <div class="pet-card-content">
                ${pet.urgent ? '<div class="urgency-badge">URGENTE</div>' : ''}
                ${pet.status === 'found' ? '<div class="found-badge">ENCONTRADO</div>' : ''}
                <h3 class="pet-name">${pet.name}</h3>
                <p class="pet-details">${pet.status === 'lost' ? 'Perdido' : 'Encontrado'}: ${pet.breed}</p>
                <p class="pet-meta">${pet.time} • ${pet.distance} de distancia</p>
                <button class="contact-btn" onclick="showPetDetails(${pet.id})">Ver / Contactar</button>
            </div>
        </div>
    `).join('');

    // Mostrar mensaje si no hay resultados
    if (filteredPets.length === 0) {
        petCardsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <p>No se encontraron mascotas con los criterios seleccionados.</p>
            </div>
        `;
    }
}

// ==========================================
// MODAL DE DETALLES DE MASCOTA
// ==========================================

function showPetDetails(petId) {
    const pet = petsData.find(p => p.id === petId);
    if (!pet) return;

    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-body">
                <img src="${pet.image}" alt="${pet.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                <h2>${pet.name}</h2>
                <p><strong>Tipo:</strong> ${pet.type === 'dog' ? 'Perro' : 'Gato'}</p>
                <p><strong>Raza:</strong> ${pet.breed}</p>
                <p><strong>Estado:</strong> ${pet.status === 'lost' ? 'Perdido' : 'Encontrado'}</p>
                <p><strong>Ubicación:</strong> ${pet.location}</p>
                <p><strong>Descripción:</strong> ${pet.description}</p>
                <p><strong>Contacto:</strong> ${pet.contact}</p>
                <p><strong>Publicado:</strong> ${pet.time}</p>
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick="contactOwner('${pet.contact}')">Contactar</button>
                    <button class="btn-secondary" onclick="sharePost(${pet.id})">Compartir</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar al hacer click fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function contactOwner(phone) {
    alert(`Contactando al ${phone}...\n\nEn una aplicación real, esto abriría WhatsApp o el marcador telefónico.`);
}

function sharePost(petId) {
    alert('Funcionalidad de compartir activada!\n\nEn una aplicación real, esto abriría opciones para compartir en redes sociales.');
}

// ==========================================
// MODAL DE REPORTAR MASCOTA
// ==========================================

function setupButtons() {
    // Botón "Reportar Mascota Perdida"
    const lostPetBtns = document.querySelectorAll('.btn-primary:not(.contact-btn)');
    lostPetBtns.forEach(btn => {
        if (btn.textContent.includes('Perdida')) {
            btn.addEventListener('click', () => showReportModal('lost'));
        }
    });

    // Botón "Reportar Mascota Encontrada"
    const foundPetBtns = document.querySelectorAll('.btn-secondary');
    foundPetBtns.forEach(btn => {
        if (btn.textContent.includes('Encontrada')) {
            btn.addEventListener('click', () => showReportModal('found'));
        }
    });

    // Botón "Publicar Aviso" del header
    const publishBtn = document.querySelector('.publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', () => showReportModal('lost'));
    }

    // Enlace "Ver Todo"
    const viewAllLink = document.querySelector('.view-all');
    if (viewAllLink) {
        viewAllLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentFilter = 'all';
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('.tab').classList.add('active');
            renderPets();
        });
    }

    // Enlaces de navegación
    setupNavLinks();
}

function showReportModal(type) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-body">
                <h2>Reportar Mascota ${type === 'lost' ? 'Perdida' : 'Encontrada'}</h2>
                <form id="reportForm" style="margin-top: 1.5rem;">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre:</label>
                        <input type="text" id="petName" required style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Tipo:</label>
                        <select id="petType" required style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            <option value="">Selecciona...</option>
                            <option value="dog">Perro</option>
                            <option value="cat">Gato</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Raza:</label>
                        <input type="text" id="petBreed" required style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Ubicación:</label>
                        <input type="text" id="petLocation" required style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Descripción:</label>
                        <textarea id="petDescription" required rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Teléfono de contacto:</label>
                        <input type="tel" id="petContact" required style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="checkbox" id="isUrgent">
                            <span>Marcar como urgente</span>
                        </label>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem; font-size: 1rem;">Publicar Reporte</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // Manejar envío del formulario
    document.getElementById('reportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitReport(type);
    });
}

function submitReport(type) {
    const name = document.getElementById('petName').value;
    const petType = document.getElementById('petType').value;
    const breed = document.getElementById('petBreed').value;
    const location = document.getElementById('petLocation').value;
    const description = document.getElementById('petDescription').value;
    const contact = document.getElementById('petContact').value;
    const isUrgent = document.getElementById('isUrgent').checked;

    // Crear nueva mascota
    const newPet = {
        id: petsData.length + 1,
        name: name,
        type: petType,
        breed: breed,
        status: type,
        urgent: isUrgent,
        image: '/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg',
        time: 'Hace unos momentos',
        distance: '0 Km',
        description: description,
        location: location,
        contact: contact
    };

    petsData.unshift(newPet); // Agregar al inicio
    
    closeModal();
    renderPets();
    
    // Mostrar mensaje de éxito
    showNotification(`¡Reporte publicado exitosamente! ${name} ha sido reportado como ${type === 'lost' ? 'perdido' : 'encontrado'}.`);
}

// ==========================================
// NOTIFICACIONES
// ==========================================

function setupNotifications() {
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', showNotificationsPanel);
    }
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const notificationIcon = document.querySelector('.notification-icon');
    
    if (notificationIcon && unreadCount > 0) {
        // Agregar badge si no existe
        if (!notificationIcon.querySelector('.notification-badge')) {
            const badge = document.createElement('div');
            badge.className = 'notification-badge';
            badge.textContent = unreadCount;
            notificationIcon.style.position = 'relative';
            notificationIcon.appendChild(badge);
        } else {
            notificationIcon.querySelector('.notification-badge').textContent = unreadCount;
        }
    }
}

function showNotificationsPanel() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-body">
                <h2>Notificaciones</h2>
                <div style="margin-top: 1rem;">
                    ${notifications.map(notif => `
                        <div style="padding: 1rem; border-bottom: 1px solid #e0e0e0; ${notif.read ? 'opacity: 0.6;' : ''}">
                            <p style="margin: 0;">${notif.message}</p>
                            ${!notif.read ? '<span style="color: #1e88e5; font-size: 0.8rem;">• Nueva</span>' : ''}
                        </div>
                    `).join('')}
                </div>
                <button onclick="markAllAsRead()" class="btn-secondary" style="width: 100%; margin-top: 1rem;">Marcar todas como leídas</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    closeModal();
    showNotification('Todas las notificaciones han sido marcadas como leídas');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: #1e88e5;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


// ==========================================
// NAVEGACIÓN
// ==========================================

function setupNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent.trim().toLowerCase();
            
            // Mapear texto a páginas
            const pageMap = {
                'perdidos': 'perdidos.html',
                'encontrados': 'encontrados.html',
                'refugios': 'refugios.html',
                'recursos': 'recursos.html'
            };
            
            if (pageMap[text]) {
                window.location.href = pageMap[text];
            }
        });
    });

    // Links del footer
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent.trim();
            console.log('Navegando a:', text);
            showNotification(`Navegando a: ${text}`);
        });
    });

    // Vista del mapa
    const mapViewLink = document.querySelector('.map-view');
    if (mapViewLink) {
        mapViewLink.addEventListener('click', function(e) {
            e.preventDefault();
            const mapSection = document.querySelector('.map-section');
            if (mapSection) {
                mapSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// ==========================================
// ESTILOS ADICIONALES
// ==========================================

// Agregar estilos para modales y notificaciones
const styles = document.createElement('style');
styles.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: slideUp 0.3s ease-out;
    }

    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        line-height: 1;
        padding: 0;
        width: 30px;
        height: 30px;
    }

    .modal-close:hover {
        color: #333;
    }

    .modal-body h2 {
        margin-top: 0;
        color: #333;
    }

    .profile-menu-item {
        width: 100%;
        padding: 0.75rem;
        border: none;
        background: #f5f5f5;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: background 0.2s;
    }

    .profile-menu-item:hover {
        background: #e0e0e0;
    }

    .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #d32f2f;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

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

document.head.appendChild(styles);

