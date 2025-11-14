// ==========================================
// SISTEMA DE MASCOTAS PERDIDAS - PetSOS
// Actualizado con modal de scroll mejorado
// ==========================================

let lostPetsData = [];
let filteredPets = [];

document.addEventListener('DOMContentLoaded', function() {
    cargarMascotasPerdidas();
    setupFilters();
    setupSort();
    setupSearch();
    configurarBotonPublicar();
    mostrarMensajes();
});

async function cargarMascotasPerdidas() {
    try {
        const response = await fetch('/PROYECTO_FINAL/index.php?action=obtenerMascotasPerdidas');
        const data = await response.json();

        if (data.success && data.data) {
            lostPetsData = data.data;
            filteredPets = [...lostPetsData];
            renderLostPets();
            document.getElementById('results-count').textContent = lostPetsData.length;
        } else {
            console.error('Error al cargar mascotas:', data.error);
            mostrarError('No se pudieron cargar las mascotas');
            renderLostPets();
        }
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
        mostrarError('Error de conexión con el servidor');
        renderLostPets();
    }
}

function renderLostPets() {
    const grid = document.getElementById('pets-grid');
    const resultsCount = document.getElementById('results-count');
    
    if (!grid) return;
    
    resultsCount.textContent = filteredPets.length;
    
    if (filteredPets.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">😔 No se encontraron mascotas perdidas</p>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredPets.map(pet => {
        const fotoUrl = pet.Foto && pet.Foto !== 'default-pet.jpg' 
            ? `/PROYECTO_FINAL/assets/images/mascotas/${pet.Foto}`
            : `/PROYECTO_FINAL/assets/images/Pug.jpg`;

        const fechaReporte = new Date(pet.FechaReporte);
        const diasPerdido = Math.floor((new Date() - fechaReporte) / (1000 * 60 * 60 * 24));
        const textoTiempo = diasPerdido === 0 ? 'Hoy' : diasPerdido === 1 ? 'Hace 1 día' : `Hace ${diasPerdido} días`;

        return `
            <div class="pet-card urgent">
                <div class="pet-card-image">
                    <img src="${fotoUrl}" alt="${pet.Nombre}" onerror="this.src='/PROYECTO_FINAL/assets/images/Pug.jpg'">
                </div>
                <div class="pet-card-content">
                    <div class="urgency-badge">PERDIDO</div>
                    <h3 class="pet-name">${pet.Nombre}</h3>
                    <p class="pet-details">${pet.Especie} ${pet.Raza ? '• ' + pet.Raza : ''}</p>
                    <p class="pet-details">Color: ${pet.Color || 'No especificado'}</p>
                    <p class="pet-details">📍 ${pet.Ubicacion || 'Ubicación no especificada'}</p>
                    <p class="pet-meta">${textoTiempo} • Reportado por ${pet.nombre_usuario}</p>
                    <button class="contact-btn" onclick="showPetDetails(${pet.idMascota})">Ver / Contactar</button>
                </div>
            </div>
        `;
    }).join('');
}

function setupFilters() {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    const distanceFilter = document.getElementById('distance-filter');
    if (distanceFilter) {
        distanceFilter.addEventListener('change', applyFilters);
    }
    
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    const urgentFilter = document.getElementById('urgent-filter');
    if (urgentFilter) {
        urgentFilter.addEventListener('change', applyFilters);
    }
}

function applyFilters() {
    let result = [...lostPetsData];
    
    const checkedTypes = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
        .map(cb => cb.dataset.filter);
    
    if (checkedTypes.length > 0) {
        result = result.filter(pet => {
            const tipo = pet.Especie.toLowerCase();
            if (checkedTypes.includes('dog') && (tipo === 'perro' || tipo === 'dog')) return true;
            if (checkedTypes.includes('cat') && (tipo === 'gato' || tipo === 'cat')) return true;
            return false;
        });
    }
    
    const dateValue = document.getElementById('date-filter').value;
    if (dateValue !== 'all') {
        const now = new Date();
        result = result.filter(pet => {
            const fechaReporte = new Date(pet.FechaReporte);
            const diff = now - fechaReporte;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (dateValue === 'today') return days === 0;
            if (dateValue === 'week') return days <= 7;
            if (dateValue === 'month') return days <= 30;
            return true;
        });
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
                filteredPets.sort((a, b) => new Date(b.FechaReporte) - new Date(a.FechaReporte));
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
                return pet.Nombre.toLowerCase().includes(query) ||
                       (pet.Raza && pet.Raza.toLowerCase().includes(query)) ||
                       (pet.Ubicacion && pet.Ubicacion.toLowerCase().includes(query)) ||
                       pet.Especie.toLowerCase().includes(query);
            });
            
            renderLostPets();
        });
    }
}

function resetFilters() {
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = true);
    document.getElementById('distance-filter').value = 'all';
    document.getElementById('date-filter').value = 'all';
    document.getElementById('urgent-filter').checked = false;
    
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    filteredPets = [...lostPetsData];
    renderLostPets();
}

async function showPetDetails(idMascota) {
    try {
        const response = await fetch(`/PROYECTO_FINAL/index.php?action=obtenerMascota&id=${idMascota}`);
        const data = await response.json();

        if (data.success && data.data) {
            mostrarModalDetalles(data.data);
        } else {
            alert('No se pudieron cargar los detalles');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles');
    }
}

/**
 * Modal mejorado con scroll personalizado
 */
function mostrarModalDetalles(pet) {
    const fotoUrl = pet.Foto && pet.Foto !== 'default-pet.jpg' 
        ? `/PROYECTO_FINAL/assets/images/mascotas/${pet.Foto}`
        : `/PROYECTO_FINAL/assets/images/Pug.jpg`;

    const fechaReporte = new Date(pet.FechaReporte);
    const diasPerdido = Math.floor((new Date() - fechaReporte) / (1000 * 60 * 60 * 24));
    const textoTiempo = diasPerdido === 0 ? 'Hoy' : diasPerdido === 1 ? 'Hace 1 día' : `Hace ${diasPerdido} días`;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-body">
                <img src="${fotoUrl}" alt="${pet.Nombre}" 
                     style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem;"
                     onerror="this.src='/PROYECTO_FINAL/assets/images/Pug.jpg'">
                
                <h2 style="margin: 0.5rem 0;">${pet.Nombre}</h2>
                <div style="display: inline-block; padding: 0.5rem 1rem; background: #ffebee; color: #c62828; border-radius: 6px; font-weight: 600; margin-bottom: 1rem;">
                    ⚠️ MASCOTA PERDIDA
                </div>
                
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                    <h3 style="margin-top: 0;">📋 Información</h3>
                    <p><strong>Especie:</strong> ${pet.Especie}</p>
                    <p><strong>Raza:</strong> ${pet.Raza || 'No especificada'}</p>
                    <p><strong>Color:</strong> ${pet.Color || 'No especificado'}</p>
                    <p><strong>Edad:</strong> ${pet.Edad || 'No especificada'}</p>
                    <p><strong>Sexo:</strong> ${pet.Sexo || 'No especificado'}</p>
                    <p><strong>Ubicación donde se perdió:</strong> ${pet.Ubicacion || 'No especificada'}</p>
                    <p><strong>Descripción:</strong><br>${pet.Descripcion || 'Sin descripción'}</p>
                    <p><strong>Reportado:</strong> ${textoTiempo}</p>
                </div>

                <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                    <h3 style="margin-top: 0;">📞 Información de Contacto</h3>
                    <p><strong>Reportado por:</strong> ${pet.nombre_usuario}</p>
                    <p><strong>Teléfono:</strong> ${pet.telefono || 'No disponible'}</p>
                    <p><strong>Correo:</strong> ${pet.correo_electronico}</p>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn-primary" onclick="contactOwner('${pet.telefono || ''}')" style="flex: 1; padding: 1rem; border: none; border-radius: 8px; cursor: pointer;">
                        📞 Contactar Dueño
                    </button>
                    <button class="btn-secondary" onclick="sharePost(${pet.idMascota})" style="flex: 1; padding: 1rem; border: none; border-radius: 8px; cursor: pointer;">
                        📤 Compartir
                    </button>
                </div>
                
                <button onclick="closeModal()" class="btn-primary" style="width: 100%; margin-top: 1rem; padding: 1rem; border: none; border-radius: 8px; cursor: pointer; background: #64748b;">
                    Cerrar
                </button>
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

function configurarBotonPublicar() {
    const botonPublicar = document.querySelector('.publish-btn');
    if (botonPublicar) {
        botonPublicar.onclick = mostrarFormularioReporte;
    }
}

function mostrarFormularioReporte() {
    const modalHTML = `
        <div class="modal-overlay" onclick="cerrarModalSiClickFuera(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="closeModal()">&times;</button>
                <div class="modal-body">
                    <h2 style="text-align: center; margin-bottom: 1.5rem;">🐾 Reportar Mascota Perdida</h2>
                    
                    <form id="formReporteMascota" action="/PROYECTO_FINAL/index.php?action=reportarMascotaPerdida" method="POST" enctype="multipart/form-data">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Nombre de la Mascota *</label>
                                <input type="text" name="nombre" required class="form-input" placeholder="Ej: Max, Luna">
                            </div>

                            <div class="form-group">
                                <label>Especie *</label>
                                <select name="especie" required class="form-input">
                                    <option value="">Seleccionar...</option>
                                    <option value="Perro">Perro</option>
                                    <option value="Gato">Gato</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Raza</label>
                                <input type="text" name="raza" class="form-input" placeholder="Ej: Labrador, Siamés">
                            </div>

                            <div class="form-group">
                                <label>Color</label>
                                <input type="text" name="color" class="form-input" placeholder="Ej: Negro, Blanco con manchas">
                            </div>

                            <div class="form-group">
                                <label>Edad Aproximada</label>
                                <input type="text" name="edad" class="form-input" placeholder="Ej: 2 años, Cachorro">
                            </div>

                            <div class="form-group">
                                <label>Sexo</label>
                                <select name="sexo" class="form-input">
                                    <option value="Macho">Macho</option>
                                    <option value="Hembra">Hembra</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Ubicación donde se perdió *</label>
                            <input type="text" name="ubicacion" required class="form-input" placeholder="Ej: Parque Central, Calle 45 con Carrera 20">
                        </div>

                        <div class="form-group">
                            <label>Ubicación exacta en el mapa (Opcional pero recomendado)</label>
                            <button type="button" id="btnSelectorUbicacion" class="btn-select-location" onclick="abrirSelectorUbicacion()">
                                Seleccionar en el mapa
                            </button>
                            <input type="hidden" id="latitudInput" name="latitud">
                            <input type="hidden" id="longitudInput" name="longitud">
                        </div>

                        <div class="form-group">
                            <label>Descripción detallada *</label>
                            <textarea name="descripcion" required class="form-input" rows="4" placeholder="Describe características especiales, comportamiento, última vez que lo viste, etc."></textarea>
                        </div>

                        <div class="form-group">
                            <label>Foto de la Mascota</label>
                            <input type="file" name="foto" accept="image/*" class="form-input" onchange="previsualizarImagen(event)">
                            <div id="preview-container" style="margin-top: 1rem; display: none;">
                                <img id="preview-image" style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;">
                            </div>
                        </div>

                        <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; margin-top: 1rem;">
                            📢 Publicar Reporte
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function previsualizarImagen(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview-image');
            const container = document.getElementById('preview-container');
            if (preview && container) {
                preview.src = e.target.result;
                container.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function cerrarModalSiClickFuera(event) {
    if (event.target === event.currentTarget) {
        closeModal();
    }
}

function contactOwner(phone) {
    if (phone && phone !== 'No disponible') {
        const mensaje = encodeURIComponent('Hola, vi tu reporte de mascota perdida en PetSOS. ¿Sigue perdida?');
        window.open(`https://wa.me/57${phone}?text=${mensaje}`, '_blank');
    } else {
        alert('Teléfono no disponible. Por favor usa el correo electrónico para contactar.');
    }
}

function sharePost(petId) {
    const url = `${window.location.origin}/PROYECTO_FINAL/vista/public/perdidos.html?id=${petId}`;
    const texto = 'Ayuda a encontrar esta mascota perdida en PetSOS';
    
    if (navigator.share) {
        navigator.share({
            title: 'Mascota Perdida - PetSOS',
            text: texto,
            url: url
        }).then(() => {
            mostrarNotificacion('¡Gracias por compartir!', 'success');
        }).catch(err => console.log('Error al compartir:', err));
    } else {
        navigator.clipboard.writeText(url).then(() => {
            mostrarNotificacion('¡Enlace copiado al portapapeles!', 'success');
        });
    }
}

function mostrarMensajes() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('success') === 'reporte_creado') {
        mostrarNotificacion('¡Reporte creado exitosamente! Tu mascota ha sido publicada.', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => cargarMascotasPerdidas(), 1000);
    }
    
    if (params.get('error')) {
        const errores = {
            'campos_vacios': 'Por favor completa todos los campos obligatorios',
            'registro_fallido': 'Error al crear el reporte. Intenta nuevamente',
            'usuario_no_encontrado': 'Usuario no encontrado. Inicia sesión nuevamente'
        };
        mostrarNotificacion(errores[params.get('error')] || 'Error desconocido', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notif = document.createElement('div');
    notif.className = `alert alert-${tipo}`;
    notif.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; min-width: 300px; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    
    if (tipo === 'success') {
        notif.style.background = '#d1fae5';
        notif.style.color = '#065f46';
        notif.style.border = '2px solid #10b981';
    } else if (tipo === 'error') {
        notif.style.background = '#fee2e2';
        notif.style.color = '#991b1b';
        notif.style.border = '2px solid #ef4444';
    }
    
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.transition = 'opacity 0.3s ease';
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}