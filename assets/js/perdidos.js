// JavaScript para la página de Perdidos
// ==========================================

const lostPetsData = [
    {
        id: 1,
        name: "Toby",
        type: "dog",
        breed: "Pug",
        urgent: true,
        image: "/PROYECTO_FINAL/assets/images/Pug.jpg",
        time: "Hace 2 días",
        distance: 1.5,
        description: "Pug color beige, collar azul. Muy amigable.",
        location: "Santa Marta Centro",
        contact: "300-123-4567"
    },
    {
        id: 3,
        name: "Luna",
        type: "dog",
        breed: "Golden Retriever",
        urgent: true,
        image: "/PROYECTO_FINAL/assets/images/PerroYgatoo.jpg",
        time: "Hace 1 día",
        distance: 2.3,
        description: "Golden Retriever hembra, muy cariñosa.",
        location: "Bello Horizonte",
        contact: "315-555-1234"
    },
    {
        id: 4,
        name: "Max",
        type: "dog",
        breed: "Labrador",
        urgent: false,
        image: "/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg",
        time: "Hace 5 días",
        distance: 3.2,
        description: "Labrador negro, muy juguetón. Responde a su nombre.",
        location: "Rodadero",
        contact: "301-888-9999"
    },
    {
        id: 5,
        name: "Misi",
        type: "cat",
        breed: "Persa",
        urgent: false,
        image: "/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg",
        time: "Hace 3 días",
        distance: 0.8,
        description: "Gato persa blanco, ojos azules.",
        location: "Gaira",
        contact: "315-777-6666"
    },
    {
        id: 6,
        name: "Rocky",
        type: "dog",
        breed: "Pastor Alemán",
        urgent: true,
        image: "/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg",
        time: "Hace 6 horas",
        distance: 4.5,
        description: "Pastor alemán adulto, collar rojo.",
        location: "Mamatoco",
        contact: "300-111-2222"
    }
];

let filteredPets = [...lostPetsData];

document.addEventListener('DOMContentLoaded', function() {
    renderLostPets();
    setupFilters();
    setupSort();
    setupSearch();
});

function renderLostPets() {
    const grid = document.getElementById('pets-grid');
    const resultsCount = document.getElementById('results-count');
    
    if (!grid) return;
    
    resultsCount.textContent = filteredPets.length;
    
    if (filteredPets.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">No se encontraron mascotas perdidas</p>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredPets.map(pet => `
        <div class="pet-card ${pet.urgent ? 'urgent' : ''}">
            <div class="pet-card-image">
                <img src="${pet.image}" alt="${pet.name}" onerror="this.src='/PROYECTO_FINAL/assets/images/ImagenPrincipal.jpg'">
            </div>
            <div class="pet-card-content">
                ${pet.urgent ? '<div class="urgency-badge">URGENTE</div>' : ''}
                <h3 class="pet-name">${pet.name}</h3>
                <p class="pet-details">Perdido: ${pet.breed}</p>
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
    
    // Filtro de urgentes
    const urgentFilter = document.getElementById('urgent-filter');
    if (urgentFilter) {
        urgentFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    let result = [...lostPetsData];
    
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
    
    // Filtrar por urgentes
    const urgentOnly = document.getElementById('urgent-filter').checked;
    if (urgentOnly) {
        result = result.filter(pet => pet.urgent);
    }
    
    filteredPets = result;
    renderLostPets();
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
            } else if (sortValue === 'urgent') {
                filteredPets.sort((a, b) => {
                    if (a.urgent === b.urgent) return 0;
                    return a.urgent ? -1 : 1;
                });
            }
            
            renderLostPets();
        });
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            
            filteredPets = lostPetsData.filter(pet => {
                return pet.name.toLowerCase().includes(query) ||
                       pet.breed.toLowerCase().includes(query) ||
                       pet.location.toLowerCase().includes(query);
            });
            
            renderLostPets();
        });
    }
}

function resetFilters() {
    // Resetear checkboxes
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = true);
    
    // Resetear selects
    document.getElementById('distance-filter').value = 'all';
    document.getElementById('date-filter').value = 'all';
    document.getElementById('urgent-filter').checked = false;
    
    // Resetear búsqueda
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    filteredPets = [...lostPetsData];
    renderLostPets();
}

// Función para mostrar detalles (usa la del script.js principal)
function showPetDetails(petId) {
    const pet = lostPetsData.find(p => p.id === petId);
    if (!pet) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-body">
                <img src="${pet.image}" alt="${pet.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                <h2>${pet.name}</h2>
                <div style="display: inline-block; padding: 0.5rem 1rem; background: #ffebee; color: #c62828; border-radius: 6px; font-weight: 600; margin-bottom: 1rem;">
                    ⚠️ MASCOTA PERDIDA
                </div>
                <p><strong>Tipo:</strong> ${pet.type === 'dog' ? 'Perro' : 'Gato'}</p>
                <p><strong>Raza:</strong> ${pet.breed}</p>
                <p><strong>Ubicación donde se perdió:</strong> ${pet.location}</p>
                <p><strong>Descripción:</strong> ${pet.description}</p>
                <p><strong>Contacto:</strong> ${pet.contact}</p>
                <p><strong>Publicado:</strong> ${pet.time}</p>
                <p><strong>Distancia:</strong> ${pet.distance} km</p>
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button class="btn-primary" onclick="contactOwner('${pet.contact}')">Contactar Dueño</button>
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

function contactOwner(phone) {
    alert(`Contactando al ${phone}...\n\nEn una aplicación real, esto abriría WhatsApp o el marcador telefónico.`);
}

function sharePost(petId) {
    alert('¡Publicación compartida!\n\nGracias por ayudar a difundir esta búsqueda.');
}