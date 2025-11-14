// ==========================================
// MAPA INTERACTIVO CON LEAFLET - PetSOS
// ==========================================

let map;
let markers = [];
let selectedLocation = { lat: null, lng: null };

// Configuración por defecto: Santa Marta, Colombia
const DEFAULT_LAT = 11.2408;
const DEFAULT_LNG = -74.1990;
const DEFAULT_ZOOM = 13;

/**
 * Inicializar el mapa principal en la página de inicio
 */
function initMainMap() {
    // Verificar que el contenedor del mapa existe
    if (!document.getElementById('map')) {
        console.warn('Contenedor del mapa no encontrado');
        return;
    }

    // Crear mapa centrado en Santa Marta
    map = L.map('map').setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

    // Agregar tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(map);

    // Cargar mascotas perdidas y agregarlas al mapa
    cargarMascotasEnMapa();
}

/**
 * Cargar mascotas perdidas desde la BD y mostrarlas en el mapa
 */
async function cargarMascotasEnMapa() {
    try {
        const response = await fetch('/PROYECTO_FINAL/index.php?action=obtenerMascotasPerdidas');
        const data = await response.json();

        if (data.success && data.data) {
            data.data.forEach(mascota => {
                // Solo agregar mascotas que tengan coordenadas
                if (mascota.Latitud && mascota.Longitud) {
                    agregarMarcadorMascota(mascota);
                }
            });

            // Si hay mascotas, ajustar el zoom para mostrarlas todas
            if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.1));
            }
        }
    } catch (error) {
        console.error('Error al cargar mascotas en el mapa:', error);
    }
}

/**
 * Agregar marcador de mascota al mapa
 */
function agregarMarcadorMascota(mascota) {
    const lat = parseFloat(mascota.Latitud);
    const lng = parseFloat(mascota.Longitud);

    if (isNaN(lat) || isNaN(lng)) return;

    // URL de la foto
    const fotoUrl = mascota.Foto && mascota.Foto !== 'default-pet.jpg' 
        ? `/PROYECTO_FINAL/assets/images/mascotas/${mascota.Foto}`
        : `/PROYECTO_FINAL/assets/images/Pug.jpg`;

    // Crear icono personalizado con la foto de la mascota
    const iconHtml = `
        <div class="pet-marker ${calcularDiasPerdido(mascota.FechaReporte) <= 3 ? 'urgent' : ''}">
            <img src="${fotoUrl}" alt="${mascota.Nombre}" onerror="this.src='/PROYECTO_FINAL/assets/images/Pug.jpg'">
        </div>
    `;

    const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25]
    });

    // Crear marcador
    const marker = L.marker([lat, lng], { icon: customIcon });

    // Crear contenido del popup
    const diasPerdido = calcularDiasPerdido(mascota.FechaReporte);
    const textoTiempo = diasPerdido === 0 ? 'Hoy' : diasPerdido === 1 ? 'Hace 1 día' : `Hace ${diasPerdido} días`;

    const popupContent = `
        <div class="pet-popup">
            <img src="${fotoUrl}" alt="${mascota.Nombre}" class="pet-popup-image" onerror="this.src='/PROYECTO_FINAL/assets/images/Pug.jpg'">
            <h3 class="pet-popup-name">${mascota.Nombre}</h3>
            <p class="pet-popup-details"><strong>${mascota.Especie}</strong>${mascota.Raza ? ' • ' + mascota.Raza : ''}</p>
            <p class="pet-popup-details">Color: ${mascota.Color || 'No especificado'}</p>
            <p class="pet-popup-location">📍 ${mascota.Ubicacion || 'Ubicación no especificada'}</p>
            <p class="pet-popup-details">${textoTiempo}</p>
            <button class="pet-popup-btn" onclick="verDetallesDesdeMapa(${mascota.idMascota})">Ver Detalles</button>
        </div>
    `;

    marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
    });

    marker.addTo(map);
    markers.push(marker);
}

/**
 * Calcular días perdidos
 */
function calcularDiasPerdido(fechaReporte) {
    const fecha = new Date(fechaReporte);
    const ahora = new Date();
    return Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24));
}

/**
 * Ver detalles desde el mapa (reutiliza función existente)
 */
function verDetallesDesdeMapa(idMascota) {
    if (typeof verDetallesMascota === 'function') {
        verDetallesMascota(idMascota);
    } else if (typeof showPetDetails === 'function') {
        showPetDetails(idMascota);
    }
}

// ==========================================
// SELECTOR DE UBICACIÓN PARA FORMULARIO
// ==========================================

let mapSelector;
let markerSelector;

/**
 * Abrir modal para seleccionar ubicación
 */
function abrirSelectorUbicacion() {
    const modalHTML = `
        <div class="location-modal-overlay" id="locationModal">
            <div class="location-modal-content" onclick="event.stopPropagation()">
                <div class="location-modal-header">
                    <h3>📍 Selecciona la ubicación donde se perdió</h3>
                    <p>Haz clic en el mapa para marcar el lugar exacto</p>
                </div>
                
                <div id="locationInfo" class="location-info" style="display: none;">
                    <strong>Ubicación seleccionada:</strong> <span id="selectedCoords"></span>
                </div>

                <div id="mapSelector"></div>

                <div class="location-modal-actions">
                    <button class="btn-cancel-location" onclick="cerrarSelectorUbicacion()">Cancelar</button>
                    <button class="btn-confirm-location" onclick="confirmarUbicacion()" id="btnConfirm" disabled>Confirmar Ubicación</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Esperar a que el DOM se actualice
    setTimeout(() => {
        inicializarMapSelector();
    }, 100);
}

/**
 * Inicializar mapa selector
 */
function inicializarMapSelector() {
    // Crear mapa centrado en Santa Marta
    mapSelector = L.map('mapSelector').setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(mapSelector);

    // Crear marcador draggable
    markerSelector = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
        draggable: true,
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(mapSelector);

    // Evento al hacer clic en el mapa
    mapSelector.on('click', function(e) {
        markerSelector.setLatLng(e.latlng);
        actualizarUbicacionSeleccionada(e.latlng.lat, e.latlng.lng);
    });

    // Evento al arrastrar el marcador
    markerSelector.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        actualizarUbicacionSeleccionada(pos.lat, pos.lng);
    });

    // Marcar ubicación inicial
    actualizarUbicacionSeleccionada(DEFAULT_LAT, DEFAULT_LNG);

    // Forzar actualización del tamaño del mapa
    setTimeout(() => {
        mapSelector.invalidateSize();
    }, 100);
}

/**
 * Actualizar ubicación seleccionada
 */
function actualizarUbicacionSeleccionada(lat, lng) {
    selectedLocation = { lat, lng };
    
    document.getElementById('locationInfo').style.display = 'block';
    document.getElementById('selectedCoords').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    document.getElementById('btnConfirm').disabled = false;
}

/**
 * Confirmar ubicación seleccionada
 */
function confirmarUbicacion() {
    if (selectedLocation.lat && selectedLocation.lng) {
        // Guardar en inputs ocultos del formulario
        document.getElementById('latitudInput').value = selectedLocation.lat;
        document.getElementById('longitudInput').value = selectedLocation.lng;

        // Actualizar texto del botón
        const btnSelector = document.getElementById('btnSelectorUbicacion');
        if (btnSelector) {
            btnSelector.textContent = `✓ Ubicación seleccionada: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`;
            btnSelector.style.background = '#4caf50';
        }

        cerrarSelectorUbicacion();
    }
}

/**
 * Cerrar selector de ubicación
 */
function cerrarSelectorUbicacion() {
    const modal = document.getElementById('locationModal');
    if (modal) {
        if (mapSelector) {
            mapSelector.remove();
            mapSelector = null;
        }
        modal.remove();
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si estamos en la página principal (con mapa)
    if (document.getElementById('map')) {
        initMainMap();
    }
});

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('location-modal-overlay')) {
        cerrarSelectorUbicacion();
    }
});