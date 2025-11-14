// ==========================================
// SISTEMA DE MASCOTAS DESTACADAS - PÁGINA INICIO
// Con modal de scroll mejorado
// ==========================================

let mascotasDestacadas = [];
let filtroActivo = 'all';

document.addEventListener('DOMContentLoaded', function() {
    cargarMascotasDestacadas();
    configurarFiltrosTabs();
    configurarBotonesHero();
});

async function cargarMascotasDestacadas() {
    try {
        const response = await fetch('/PROYECTO_FINAL/index.php?action=obtenerMascotasPerdidas');
        const data = await response.json();

        if (data.success && data.data) {
            mascotasDestacadas = data.data;
            renderizarMascotasDestacadas();
        } else {
            console.error('Error al cargar mascotas:', data.error);
            mostrarMensajeVacio('No se pudieron cargar las mascotas perdidas');
        }
    } catch (error) {
        console.error('Error al cargar mascotas:', error);
        mostrarMensajeVacio('Error de conexión con el servidor');
    }
}

function renderizarMascotasDestacadas() {
    const container = document.querySelector('.pet-cards');
    if (!container) return;

    let mascotasFiltradas = [...mascotasDestacadas];

    if (filtroActivo === 'lost') {
        mascotasFiltradas = mascotasDestacadas.filter(m => m.Estado === 'Perdido');
    } else if (filtroActivo === 'found') {
        mascotasFiltradas = [];
    } else if (filtroActivo === 'urgent') {
        mascotasFiltradas = mascotasDestacadas.filter(m => {
            const fechaReporte = new Date(m.FechaReporte);
            const diasPerdido = Math.floor((new Date() - fechaReporte) / (1000 * 60 * 60 * 24));
            return diasPerdido <= 3;
        });
    }

    if (mascotasFiltradas.length === 0) {
        if (filtroActivo === 'found') {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                    <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">📋 Sección en construcción</p>
                    <p>La funcionalidad de mascotas encontradas estará disponible próximamente</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                    <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">🐾 No hay mascotas para mostrar</p>
                    <p>Sé el primero en reportar una mascota perdida</p>
                </div>
            `;
        }
        return;
    }

    const mascotasMostrar = mascotasFiltradas.slice(0, 6);

    container.innerHTML = mascotasMostrar.map(pet => {
        const fotoUrl = pet.Foto && pet.Foto !== 'default-pet.jpg' 
            ? `/PROYECTO_FINAL/assets/images/mascotas/${pet.Foto}`
            : `/PROYECTO_FINAL/assets/images/Pug.jpg`;

        const fechaReporte = new Date(pet.FechaReporte);
        const diasPerdido = Math.floor((new Date() - fechaReporte) / (1000 * 60 * 60 * 24));
        const textoTiempo = diasPerdido === 0 ? 'Hoy' : diasPerdido === 1 ? 'Hace 1 día' : `Hace ${diasPerdido} días`;
        const esUrgente = diasPerdido <= 3;

        return `
            <div class="pet-card ${esUrgente ? 'urgent' : ''}">
                <div class="pet-card-image">
                    <img src="${fotoUrl}" alt="${pet.Nombre}" onerror="this.src='/PROYECTO_FINAL/assets/images/Pug.jpg'">
                </div>
                <div class="pet-card-content">
                    ${esUrgente ? '<div class="urgency-badge">URGENTE</div>' : '<div class="urgency-badge" style="background: #ff9800;">PERDIDO</div>'}
                    <h3 class="pet-name">${pet.Nombre}</h3>
                    <p class="pet-details">Perdido: ${pet.Especie}${pet.Raza ? ' • ' + pet.Raza : ''}</p>
                    <p class="pet-details" style="font-size: 0.85rem; color: #666;">📍 ${pet.Ubicacion || 'Ubicación no especificada'}</p>
                    <p class="pet-meta">${textoTiempo} • Reportado por ${pet.nombre_usuario}</p>
                    <button class="contact-btn" onclick="verDetallesMascota(${pet.idMascota})">Ver / Contactar</button>
                </div>
            </div>
        `;
    }).join('');
}

function configurarFiltrosTabs() {
    const tabs = document.querySelectorAll('.filter-tabs .tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const texto = this.textContent.trim().toLowerCase();
            if (texto === 'todos') {
                filtroActivo = 'all';
            } else if (texto === 'perdidos') {
                filtroActivo = 'lost';
            } else if (texto === 'encontrados') {
                filtroActivo = 'found';
            } else if (texto === 'urgente') {
                filtroActivo = 'urgent';
            }
            
            renderizarMascotasDestacadas();
        });
    });
}

function configurarBotonesHero() {
    const btnReportarPerdida = document.querySelector('.btn-primary');
    if (btnReportarPerdida && btnReportarPerdida.textContent.includes('Perdida')) {
        btnReportarPerdida.addEventListener('click', function() {
            window.location.href = '/PROYECTO_FINAL/vista/public/perdidos.html';
        });
    }

    const btnReportarEncontrada = document.querySelector('.btn-secondary');
    if (btnReportarEncontrada && btnReportarEncontrada.textContent.includes('Encontrada')) {
        btnReportarEncontrada.addEventListener('click', function() {
            mostrarNotificacion('La funcionalidad de mascotas encontradas estará disponible próximamente', 'info');
        });
    }

    const btnPublicar = document.querySelector('.publish-btn');
    if (btnPublicar) {
        btnPublicar.addEventListener('click', function() {
            window.location.href = '/PROYECTO_FINAL/vista/public/perdidos.html';
        });
    }

    const verTodoLink = document.querySelector('.view-all');
    if (verTodoLink) {
        verTodoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/PROYECTO_FINAL/vista/public/perdidos.html';
        });
    }
}

async function verDetallesMascota(idMascota) {
    try {
        const response = await fetch(`/PROYECTO_FINAL/index.php?action=obtenerMascota&id=${idMascota}`);
        const data = await response.json();

        if (data.success && data.data) {
            mostrarModalDetalles(data.data);
        } else {
            mostrarNotificacion('No se pudieron cargar los detalles', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al cargar los detalles', 'error');
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
            <button class="modal-close" onclick="cerrarModal()">&times;</button>
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
                    <button class="btn-primary" onclick="contactarDueno('${pet.telefono || ''}')" style="flex: 1; padding: 1rem; border: none; border-radius: 8px; cursor: pointer;">
                        📞 Contactar Dueño
                    </button>
                    <button class="btn-secondary" onclick="compartirPublicacion(${pet.idMascota})" style="flex: 1; padding: 1rem; border: none; border-radius: 8px; cursor: pointer;">
                        📤 Compartir
                    </button>
                </div>
                
                <button onclick="cerrarModal()" class="btn-primary" style="width: 100%; margin-top: 1rem; padding: 1rem; border: none; border-radius: 8px; cursor: pointer; background: #64748b;">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModal();
        }
    });
}

function cerrarModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function contactarDueno(telefono) {
    if (telefono && telefono !== 'No disponible') {
        const mensaje = encodeURIComponent('Hola, vi tu reporte de mascota perdida en PetSOS. ¿Sigue perdida?');
        window.open(`https://wa.me/57${telefono}?text=${mensaje}`, '_blank');
    } else {
        mostrarNotificacion('Teléfono no disponible. Por favor usa el correo electrónico para contactar.', 'info');
    }
}

function compartirPublicacion(petId) {
    const url = `${window.location.origin}/PROYECTO_FINAL/vista/public/perdidos.html?id=${petId}`;
    const texto = '¡Ayuda a encontrar esta mascota perdida en PetSOS!';
    
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
    } else {
        notif.style.background = '#e3f2fd';
        notif.style.color = '#1565c0';
        notif.style.border = '2px solid #2196f3';
    }
    
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.transition = 'opacity 0.3s ease';
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

function mostrarMensajeVacio(mensaje) {
    const container = document.querySelector('.pet-cards');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">😔 ${mensaje}</p>
            </div>
        `;
    }
}