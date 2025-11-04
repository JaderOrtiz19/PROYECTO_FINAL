// JavaScript para la página de Encontrados
// ==========================================

const foundPetsData = [
    {
        id: 2,
        name: "Michu",
        type: "cat",
        breed: "Siamés",
        image: "/PROYECTO_FINAL/assets/images/Siames.webp",
        time: "Hace 5 horas",
        distance: 1.0,
        description: "Gato siamés con ojos azules, muy tranquilo. Fue encontrado en el parque.",
        location: "Rodadero",
        contact: "301-987-6543"
    },
    {
        id: 7,
        name: "Sin identificar",
        type: "dog",
        breed: "Mestizo pequeño",
        image: "/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg",
        time: "Hace 1 día",
        distance: 2.1,
        description: "Perro pequeño mestizo, muy amigable. Encontrado en la playa.",
        location: "El Rodadero",
        contact: "315-222-3333"
    },
    {
        id: 8,
        name: "Desconocido",
        type: "cat",
        breed: "Gato común",
        image: "/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg",
        time: "Hace 3 horas",
        distance: 0.5,
        description: "Gato atigrado, parece doméstico. Encontrado en zona residencial.",
        location: "Santa Marta Centro",
        contact: "300-444-5555"
    },
    {
        id: 9,
        name: "Desconocido",
        type: "dog",
        breed: "Schnauzer",
        image: "/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg",
        time: "Hace 2 días",
        distance: 3.8,
        description: "Schnauzer gris, bien cuidado. Encontrado cerca del mercado.",
        location: "Mamatoco",
        contact: "301-666-7777"
    },
    {
        id: 10,
        name: "Sin nombre",
        type: "cat",
        breed: "Angora",
        image: "/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg",
        time: "Hace 12 horas",
        distance: 1.8,
        description: "Gato angora blanco, muy limpio y cuidado.",
        location: "Gaira",
        contact: "315-888-9999"
    }
];

let filteredPets = [...foundPetsData];

document.addEventListener('DOMContentLoaded', function() {
    renderFoundPets();
    setupFilters();
    setupSort();
    setupSearch();
});

function renderFoundPets() {
    const grid = document.getElementById('pets-grid');
    const resultsCount = document.getElementById('results-count');
    
    if (!grid) return;
    
    resultsCount.textContent = filteredPets.length;
    
    if (filteredPets.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">No se encontraron mascotas</p>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredPets.map(pet => `
        <div class="pet-card found">
            <div class="pet-card-image">
                <img src="${pet.image}" alt="${pet.name}" onerror="this.src='/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg'">
            </div>
            <div class="pet-card-content">
                <div class="found-badge">ENCONTRADO</div>
                <h3 class="pet-name">${pet.name}</h3>
                <p class="pet-details">Encontrado: ${pet.breed}</p>
                <p class="pet-meta">${pet.time} • ${pet.distance} Km de distancia</p>
                <button class="contact-btn" onclick="showPetDetails(${pet.id})">Ver / Contactar</button>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    // Filtros de tipo de animal
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // Filtro de distancia
    const distanceFilter = document.getElementById('distance-filter');
    if (distanceFilter) {
        distanceFilter.addEventListener('change', applyFilters);
    }
    
    // Filtro de fecha
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    let result = [...foundPetsData];
    
    // Filtrar por tipo
    const checkedTypes = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
        .map(cb => cb.dataset.filter);
    
    if (checkedTypes.length > 0) {
        result = result.filter(pet => checkedTypes.includes(pet.type));
    }
    
    // Filtrar por distancia
    const distanceValue = document.getElementById('distance-filter').value;
    if (distanceValue !== 'all') {
        const maxDistance = parseFloat(distanceValue);
        result = result.filter(pet => pet.distance <= maxDistance);
    }
    
    filteredPets = result;
    renderFoundPets();
}

function setupSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            
            if (sortValue === 'recent') {
                // Por ahora mantener orden original
                filteredPets = [...filteredPets];
            } else if (sortValue === 'distance') {
                filteredPets.sort((a, b) => a.distance - b.distance);
            }
            
            renderFoundPets();
        });
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            
            filteredPets = foundPetsData.filter(pet => {
                return pet.name.toLowerCase().includes(query) ||
                       pet.breed.toLowerCase().includes(query) ||
                       pet.location.toLowerCase().includes(query);
            });
            
            renderFoundPets();
        });
    }
}

function resetFilters() {
    // Resetear checkboxes
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = true);
    
    // Resetear selects
    document.getElementById('distance-filter').value = 'all';
    document.getElementById('date-filter').value = 'all';
    
    // Resetear búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    filteredPets = [...foundPetsData];
    renderFoundPets();
}

// Función para mostrar detalles
function showPetDetails(petId) {
    const pet = foundPetsData.find(p => p.id === petId);
    if (!pet) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-body">
                <img src="${pet.image}" alt="${pet.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                <h2>${pet.name}</h2>
                <div style="display: inline-block; padding: 0.5rem 1rem; background: #e8f5e8; color: #2e7d32; border-radius: 6px; font-weight: 600; margin-bottom: 1rem;">
                    ✓ MASCOTA ENCONTRADA
                </div>
                <p><strong>Tipo:</strong> ${pet.type === 'dog' ? 'Perro' : 'Gato'}</p>
                <p><strong>Raza:</strong> ${pet.breed}</p>
                <p><strong>Ubicación donde fue encontrado:</strong> ${pet.location}</p>
                <p><strong>Descripción:</strong> ${pet.description}</p>
                <p><strong>Contacto de quien encontró:</strong> ${pet.contact}</p>
                <p><strong>Publicado:</strong> ${pet.time}</p>
                <p><strong>Distancia:</strong> ${pet.distance} km</p>
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                    <strong>⚠️ Importante:</strong> Si reconoces a esta mascota, contacta al número indicado. 
                    Por seguridad, prepárate para demostrar que eres el dueño con fotos, documentos veterinarios o detalles específicos.
                </div>
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick="contactFinder('${pet.contact}')">Contactar Quien Encontró</button>
                    <button class="btn-secondary" onclick="sharePost(${pet.id})">Compartir</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
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

function contactFinder(phone) {
    alert(`Contactando al ${phone}...\n\nRecuerda: Prepara pruebas de propiedad antes de reclamar la mascota (fotos anteriores, documentos veterinarios, etc.)`);
}

function sharePost(petId) {
    alert('¡Publicación compartida!\n\nGracias por ayudar a reunir esta mascota con su familia.');
}