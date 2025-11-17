// =================================
// CONFIGURACIÓN - RUTAS API DJANGO
// =================================
const API_CURSOS = "/api/cursos/";
const API_ESTUDIANTES = "/api/estudiantes/";
const API_ACTIVIDADES = "/api/actividades/";
const API_REPORTES = "/api/reportes/";

// =================================
// NAVEGACIÓN
// =================================
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            
            const targetPage = this.getAttribute('data-page');
            
            if (targetPage === 'logout') {
                if (confirm('¿Está seguro que desea cerrar sesión?')) {
                    alert('Sesión cerrada correctamente');
                }
                return;
            }
            
            const pageElement = document.getElementById(targetPage);
            if (pageElement) {
                pageElement.classList.add('active');
                
                switch(targetPage) {
                    case 'courses':
                        cargarTarjetasCursos();
                        break;
                    case 'students':
                        listarEstudiantes();
                        break;
                    case 'activities':
                        listarActividades();
                        break;
                    case 'reports':
                        cargarReportes();
                        break;
                }
            }
        });
    });
    
    cargarEstadisticasGenerales();
    listarCursos();
});

// =================================
// ESTADÍSTICAS GENERALES
// =================================
async function cargarEstadisticasGenerales() {
    try {
        const res = await fetch(`${API_REPORTES}?action=general`);
        const stats = await res.json();
        
        if (stats) {
            document.getElementById('totalCursos').textContent = stats.cursos_activos || 0;
            document.getElementById('totalEstudiantes').textContent = stats.total_estudiantes || 0;
            document.getElementById('totalActividades').textContent = stats.total_actividades || 0;
            document.getElementById('promedioGeneral').textContent = stats.promedio_general || '0.0';
        }
    } catch (err) {
        console.error('Error al cargar estadísticas:', err);
    }
}

// =================================
// FUNCIONALIDAD DE CURSOS
// =================================
const btnNuevo = document.getElementById("btnAgregarCursoDash");
const formDash = document.getElementById("formCursoDash");
const btnCancelar = document.getElementById("cancelarCursoDash");
const btnGuardar = document.getElementById("guardarCursoDash");

if (btnNuevo) {
    btnNuevo.addEventListener("click", () => {
        const isVisible = formDash.style.display !== "none";
        formDash.style.display = isVisible ? "none" : "block";
        
        if (!isVisible) {
            limpiarFormularioCurso();
        }
    });
}

if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
        formDash.style.display = "none";
        limpiarFormularioCurso();
    });
}

if (btnGuardar) {
    btnGuardar.addEventListener("click", guardarCurso);
}

async function guardarCurso() {
    const nombre = document.getElementById("nombreCursoDash").value.trim();
    const codigo = document.getElementById("codigoCursoDash").value.trim();
    const descripcion = document.getElementById("descripcionCursoDash").value.trim();
    const estado = document.getElementById("estadoCursoDash").value;

    if (!nombre || !codigo) {
        alert("⚠️ Por favor completa el nombre y código del curso.");
        return;
    }

    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        const res = await fetch(API_CURSOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                nombre, 
                codigo, 
                descripcion, 
                estado,
                id_docente: 1
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("✅ Curso agregado correctamente");
            limpiarFormularioCurso();
            formDash.style.display = "none";
            listarCursos();
            cargarTarjetasCursos();
            cargarEstadisticasGenerales();
        } else {
            alert("⚠️ Error: " + JSON.stringify(data));
        }
    } catch (err) {
        console.error("Error:", err);
        alert(`❌ Error de conexión: ${err.message}`);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Curso';
    }
}

function limpiarFormularioCurso() {
    document.getElementById("nombreCursoDash").value = "";
    document.getElementById("codigoCursoDash").value = "";
    document.getElementById("descripcionCursoDash").value = "";
    document.getElementById("estadoCursoDash").value = "Activo";
}

async function listarCursos() {
    try {
        const res = await fetch(API_CURSOS);
        const cursos = await res.json();
        const tbody = document.getElementById("tbodyCursos");
        
        if (!tbody) return;

        if (cursos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        No hay cursos registrados.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = cursos.map(c => `
            <tr>
                <td>${escapeHtml(c.nombre)}</td>
                <td>${escapeHtml(c.codigo)}</td>
                <td>${c.num_estudiantes || 0}</td>
                <td>${c.num_actividades || 0}</td>
                <td>${c.promedio ? parseFloat(c.promedio).toFixed(2) : '-'}</td>
                <td>
                    <span class="status ${c.estado === 'Activo' ? 'active' : 'pending'}">
                        ${escapeHtml(c.estado)}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn-icon edit" title="Editar" onclick="alert('Función en desarrollo')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" title="Eliminar" onclick="eliminarCurso(${c.id_curso})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

    } catch (err) {
        console.error("Error al listar cursos:", err);
    }
}

async function eliminarCurso(id) {
    if (!confirm("¿Seguro que deseas eliminar este curso?")) return;

    try {
        const res = await fetch(`${API_CURSOS}${id}/`, { 
            method: "DELETE" 
        });

        if (res.ok) {
            alert("✅ Curso eliminado correctamente");
            listarCursos();
            cargarTarjetasCursos();
            cargarEstadisticasGenerales();
        } else {
            const data = await res.json();
            alert("⚠️ Error: " + JSON.stringify(data));
        }
    } catch (err) {
        console.error("Error:", err);
        alert("❌ No se pudo eliminar el curso.");
    }
}

async function cargarTarjetasCursos() {
    try {
        const res = await fetch(API_CURSOS);
        const cursos = await res.json();
        
        const container = document.getElementById("courseCardsContainer");
        if (!container) return;

        if (cursos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-book" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No hay cursos registrados.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = cursos.map(c => `
            <div class="course-card">
                <div class="course-header">
                    <h3>${escapeHtml(c.nombre)}</h3>
                    <p>Código: ${escapeHtml(c.codigo)}</p>
                </div>
                <div class="course-body">
                    <p>${escapeHtml(c.descripcion || 'Sin descripción')}</p>
                    <div class="course-stats">
                        <div class="course-stat">
                            <div class="course-stat-value">${c.num_estudiantes || 0}</div>
                            <div class="course-stat-label">Estudiantes</div>
                        </div>
                        <div class="course-stat">
                            <div class="course-stat-value">${c.num_actividades || 0}</div>
                            <div class="course-stat-label">Actividades</div>
                        </div>
                        <div class="course-stat">
                            <div class="course-stat-value">${c.promedio ? parseFloat(c.promedio).toFixed(1) : '-'}</div>
                            <div class="course-stat-label">Promedio</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");

    } catch (err) {
        console.error("Error:", err);
    }
}

// =================================
// FUNCIONALIDAD DE ESTUDIANTES
// =================================
let estudianteEditando = null;

const formEstudiante = document.getElementById("formEstudiante");
const btnAgregarEstudiante = document.getElementById("btnAgregarEstudiante");
const btnCancelarEstudiante = document.getElementById("cancelarEstudiante");
const btnGuardarEstudiante = document.getElementById("guardarEstudiante");

if (btnAgregarEstudiante) {
    btnAgregarEstudiante.addEventListener("click", () => {
        estudianteEditando = null;
        document.getElementById("tituloFormEstudiante").textContent = "Nuevo Estudiante";
        formEstudiante.style.display = formEstudiante.style.display === "none" ? "block" : "none";
        
        if (formEstudiante.style.display === "block") {
            limpiarFormularioEstudiante();
            cargarCursosEnSelect();
        }
    });
}

if (btnCancelarEstudiante) {
    btnCancelarEstudiante.addEventListener("click", () => {
        formEstudiante.style.display = "none";
        limpiarFormularioEstudiante();
        estudianteEditando = null;
    });
}

if (btnGuardarEstudiante) {
    btnGuardarEstudiante.addEventListener("click", guardarEstudiante);
}

async function guardarEstudiante() {
    const nombre = document.getElementById("nombreEstudiante").value.trim();
    const id_curso = document.getElementById("cursoEstudiante").value;
    const nota_final = document.getElementById("notaEstudiante").value;

    if (!nombre) {
        alert("⚠️ El nombre es obligatorio.");
        return;
    }

    btnGuardarEstudiante.disabled = true;
    btnGuardarEstudiante.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        let url = API_ESTUDIANTES;
        let method = "POST";
        
        if (estudianteEditando) {
            url = `${API_ESTUDIANTES}${estudianteEditando}/`;
            method = "PUT";
        }

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                nombre, 
                id_curso: id_curso || null, 
                nota_final: nota_final || null 
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert(estudianteEditando ? "✅ Actualizado" : "✅ Estudiante agregado");
            limpiarFormularioEstudiante();
            formEstudiante.style.display = "none";
            estudianteEditando = null;
            listarEstudiantes();
            cargarEstadisticasGenerales();
        } else {
            alert("⚠️ Error: " + JSON.stringify(data));
        }
    } catch (err) {
        console.error("Error:", err);
        alert("❌ Error de conexión.");
    } finally {
        btnGuardarEstudiante.disabled = false;
        btnGuardarEstudiante.innerHTML = '<i class="fas fa-save"></i> Guardar Estudiante';
    }
}

async function listarEstudiantes() {
    try {
        const res = await fetch(API_ESTUDIANTES);
        const estudiantes = await res.json();
        const tbody = document.getElementById("tbodyEstudiantes");
        
        if (!tbody) return;

        if (estudiantes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px;">
                        No hay estudiantes registrados.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = estudiantes.map(e => {
            const nota = e.nota_final !== null ? parseFloat(e.nota_final).toFixed(1) : '-';
            let estadoHtml = '-';
            
            if (e.nota_final !== null) {
                if (e.nota_final >= 3.0) {
                    estadoHtml = '<span class="status active">Aprobado</span>';
                } else {
                    estadoHtml = '<span class="status pending">Reprobado</span>';
                }
            }
            
            return `
                <tr>
                    <td>${e.id_estudiante}</td>
                    <td>${escapeHtml(e.nombre)}</td>
                    <td>${escapeHtml(e.curso_nombre || 'Sin curso')}</td>
                    <td>${nota}</td>
                    <td>${estadoHtml}</td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon edit" title="Editar" onclick="editarEstudiante(${e.id_estudiante})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" title="Eliminar" onclick="eliminarEstudiante(${e.id_estudiante})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (err) {
        console.error("Error:", err);
    }
}

async function cargarCursosEnSelect() {
    try {
        const res = await fetch(API_CURSOS);
        const cursos = await res.json();
        
        const selectEstudiante = document.getElementById("cursoEstudiante");
        const selectActividad = document.getElementById("cursoActividad");
        
        const opciones = '<option value="">Seleccione un curso</option>' + 
            cursos.map(c => `<option value="${c.id_curso}">${c.nombre} (${c.codigo})</option>`).join("");
        
        if (selectEstudiante) selectEstudiante.innerHTML = opciones;
        if (selectActividad) selectActividad.innerHTML = opciones;
    } catch (err) {
        console.error("Error:", err);
    }
}

async function editarEstudiante(id) {
    try {
        const res = await fetch(`${API_ESTUDIANTES}${id}/`);
        const estudiante = await res.json();
        
        if (res.ok && estudiante) {
            estudianteEditando = id;
            document.getElementById("tituloFormEstudiante").textContent = "Editar Estudiante";
            document.getElementById("nombreEstudiante").value = estudiante.nombre || "";
            document.getElementById("notaEstudiante").value = estudiante.nota_final || "";
            
            await cargarCursosEnSelect();
            document.getElementById("cursoEstudiante").value = estudiante.id_curso || "";
            
            formEstudiante.style.display = "block";
        }
    } catch (err) {
        console.error("Error:", err);
        alert("❌ Error al cargar estudiante.");
    }
}

async function eliminarEstudiante(id) {
    if (!confirm("¿Eliminar este estudiante?")) return;

    try {
        const res = await fetch(`${API_ESTUDIANTES}${id}/`, { method: "DELETE" });

        if (res.ok) {
            alert("✅ Estudiante eliminado");
            listarEstudiantes();
            cargarEstadisticasGenerales();
        } else {
            alert("⚠️ Error al eliminar");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("❌ Error.");
    }
}

function limpiarFormularioEstudiante() {
    document.getElementById("nombreEstudiante").value = "";
    document.getElementById("cursoEstudiante").value = "";
    document.getElementById("notaEstudiante").value = "";
}

// =================================
// FUNCIONALIDAD DE ACTIVIDADES
// =================================
let actividadEditando = null;

const formActividad = document.getElementById("formActividad");
const btnAgregarActividad = document.getElementById("btnAgregarActividad");
const btnCancelarActividad = document.getElementById("cancelarActividad");
const btnGuardarActividad = document.getElementById("guardarActividad");

if (btnAgregarActividad) {
    btnAgregarActividad.addEventListener("click", () => {
        actividadEditando = null;
        document.getElementById("tituloFormActividad").textContent = "Nueva Actividad";
        formActividad.style.display = formActividad.style.display === "none" ? "block" : "none";
        
        if (formActividad.style.display === "block") {
            limpiarFormularioActividad();
            cargarCursosEnSelect();
        }
    });
}

if (btnCancelarActividad) {
    btnCancelarActividad.addEventListener("click", () => {
        formActividad.style.display = "none";
        limpiarFormularioActividad();
        actividadEditando = null;
    });
}

if (btnGuardarActividad) {
    btnGuardarActividad.addEventListener("click", guardarActividad);
}

async function guardarActividad() {
    const nombre = document.getElementById("nombreActividad").value.trim();
    const tipo = document.getElementById("tipoActividad").value;
    const id_curso = document.getElementById("cursoActividad").value;
    const fecha_entrega = document.getElementById("fechaActividad").value;
    const porcentaje = document.getElementById("porcentajeActividad").value;
    const estado = document.getElementById("estadoActividad").value;

    if (!nombre || !id_curso) {
        alert("⚠️ Nombre y curso son obligatorios.");
        return;
    }

    btnGuardarActividad.disabled = true;
    btnGuardarActividad.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
        let url = API_ACTIVIDADES;
        let method = "POST";
        
        if (actividadEditando) {
            url = `${API_ACTIVIDADES}${actividadEditando}/`;
            method = "PUT";
        }

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                nombre, 
                tipo, 
                id_curso, 
                fecha_entrega: fecha_entrega || null, 
                porcentaje: porcentaje || 0, 
                estado 
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert(actividadEditando ? "✅ Actualizada" : "✅ Actividad agregada");
            limpiarFormularioActividad();
            formActividad.style.display = "none";
            actividadEditando = null;
            listarActividades();
            cargarEstadisticasGenerales();
        } else {
            alert("⚠️ Error: " + JSON.stringify(data));
        }
    } catch (err) {
        console.error("Error:", err);
        alert("❌ Error de conexión.");
    } finally {
        btnGuardarActividad.disabled = false;
        btnGuardarActividad.innerHTML = '<i class="fas fa-save"></i> Guardar Actividad';
    }
}

async function listarActividades() {
    try {
        const res = await fetch(API_ACTIVIDADES);
        const actividades = await res.json();
        const tbody = document.getElementById("tbodyActividades");
        
        if (!tbody) return;

        if (actividades.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">
                        No hay actividades registradas.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = actividades.map(a => `
            <tr>
                <td>${escapeHtml(a.nombre)}</td>
                <td>${escapeHtml(a.tipo)}</td>
                <td>${escapeHtml(a.curso_nombre || 'Sin curso')}</td>
                <td>${a.fecha_entrega ? formatearFecha(a.fecha_entrega) : '-'}</td>
                <td>${a.porcentaje}%</td>
                <td>
                    <span class="status ${a.estado === 'Activo' ? 'active' : 'pending'}">
                        ${escapeHtml(a.estado)}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn-icon edit" title="Editar" onclick="editarActividad(${a.id_actividad})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" title="Eliminar" onclick="eliminarActividad(${a.id_actividad})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

    } catch (err) {
        console.error("Error:", err);
    }
}

async function editarActividad(id) {
    try {
        const res = await fetch(`${API_ACTIVIDADES}${id}/`);
        const actividad = await res.json();
        
        if (res.ok && actividad) {
            actividadEditando = id;
            document.getElementById("tituloFormActividad").textContent = "Editar Actividad";
            document.getElementById("nombreActividad").value = actividad.nombre || "";
            document.getElementById("tipoActividad").value = actividad.tipo || "Tarea";
            document.getElementById("fechaActividad").value = actividad.fecha_entrega || "";
            document.getElementById("porcentajeActividad").value = actividad.porcentaje || 0;
            document.getElementById("estadoActividad").value = actividad.estado || "Activo";
            
            await cargarCursosEnSelect();
            document.getElementById("cursoActividad").value = actividad.id_curso || "";
            
            formActividad.style.display = "block";
        }
    } catch (err) {
        console.error("Error:", err);
        alert("❌ Error al cargar actividad.");
    }
}

async function eliminarActividad(id) {
    if (!confirm("¿Eliminar esta actividad?")) return;

    try {
        const res = await fetch(`${API_ACTIVIDADES}${id}/`, { method: "DELETE" });

        if (res.ok) {
            alert("✅ Actividad eliminada");
            listarActividades();
            cargarEstadisticasGenerales();
        } else {
            alert("⚠️ Error al eliminar");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("❌ Error.");
    }
}

function limpiarFormularioActividad() {
    document.getElementById("nombreActividad").value = "";
    document.getElementById("tipoActividad").value = "Tarea";
    document.getElementById("cursoActividad").value = "";
    document.getElementById("fechaActividad").value = "";
    document.getElementById("porcentajeActividad").value = "";
    document.getElementById("estadoActividad").value = "Activo";
}

// =================================
// REPORTES Y GRÁFICOS
// =================================
let chartEstudiantesCurso, chartRendimiento, chartPromediosCurso;
let reportesCache = null;
let reportesCacheTime = 0;
const CACHE_DURATION = 30000;

async function cargarReportes() {
    mostrarCargandoReportes(true);
    
    try {
        const ahora = Date.now();
        if (reportesCache && (ahora - reportesCacheTime) < CACHE_DURATION) {
            renderizarReportes(reportesCache);
            return;
        }
        
        const [estudiantesPorCurso, rendimiento, cursosStats, topEstudiantes] = await Promise.all([
            fetch(`${API_REPORTES}?action=estudiantes_por_curso`).then(r => r.json()),
            fetch(`${API_REPORTES}?action=rendimiento`).then(r => r.json()),
            fetch(`${API_REPORTES}?action=cursos_estadisticas`).then(r => r.json()),
            fetch(`${API_REPORTES}?action=top_estudiantes`).then(r => r.json())
        ]);
        
        reportesCache = { estudiantesPorCurso, rendimiento, cursosStats, topEstudiantes };
        reportesCacheTime = ahora;
        
        renderizarReportes(reportesCache);
        
    } catch (err) {
        console.error("Error al cargar reportes:", err);
        mostrarErrorReportes();
    } finally {
        mostrarCargandoReportes(false);
    }
}

function renderizarReportes(datos) {
    cargarGraficoEstudiantesCurso(datos.estudiantesPorCurso.slice(0, 10));
    cargarGraficoRendimiento(datos.rendimiento);
    cargarGraficoPromediosCurso(datos.promedio);
    cursosStats.slice(0, 8);
    cargarTopEstudiantes(datos.topEstudiantes);
    actualizarResumenReportes();
}

async function actualizarResumenReportes() {
    try {
        const res = await fetch(`${API_REPORTES}?action=general`);
        const stats = await res.json();
        
        const elementos = {
            'resumenCursos': stats.cursos_activos || 0,
            'resumenEstudiantes': stats.total_estudiantes || 0,
            'resumenActividades': stats.total_actividades || 0,
            'resumenPromedio': stats.promedio_general || '0.0'
        };
        
        Object.keys(elementos).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = elementos[id];
        });
    } catch (err) {
        console.error("Error al actualizar resumen:", err);
    }
}

function cargarGraficoEstudiantesCurso(data) {
    try {
        const ctx = document.getElementById('chartEstudiantesCurso');
        if (!ctx) return;
        
        if (chartEstudiantesCurso) {
            chartEstudiantesCurso.destroy();
            chartEstudiantesCurso = null;
        }
        
        const labels = data.map(d => {
            const nombre = d.curso || 'Sin nombre';
            return nombre.length > 20 ? nombre.substring(0, 20) + '...' : nombre;
        });
        
        chartEstudiantesCurso = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Estudiantes',
                    data: data.map(d => d.cantidad),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error en gráfico estudiantes:", err);
    }
}

function cargarGraficoRendimiento(data) {
    try {
        const ctx = document.getElementById('chartRendimiento');
        if (!ctx) return;
        
        if (chartRendimiento) {
            chartRendimiento.destroy();
            chartRendimiento = null;
        }
        
        chartRendimiento = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.estado),
                datasets: [{
                    data: data.map(d => d.cantidad),
                    backgroundColor: [
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(149, 165, 166, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 15,
                            padding: 10
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error en gráfico rendimiento:", err);
    }
}

function cargarGraficoPromediosCurso(data) {
    try {
        const ctx = document.getElementById('chartPromediosCurso');
        if (!ctx) return;
        
        if (chartPromediosCurso) {
            chartPromediosCurso.destroy();
            chartPromediosCurso = null;
        }
        
        const labels = data.map(d => {
            const nombre = d.nombre || 'Sin nombre';
            return nombre.length > 15 ? nombre.substring(0, 15) + '...' : nombre;
        });
        
        chartPromediosCurso = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Promedio',
                    data: data.map(d => d.promedio || 0),
                    backgroundColor: 'rgba(243, 156, 18, 0.7)',
                    borderColor: 'rgba(243, 156, 18, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true,
                        max: 5,
                        ticks: { stepSize: 1 }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Error en gráfico promedios:", err);
    }
}

async function cargarTopEstudiantes(data) {
    try {
        const container = document.getElementById('topEstudiantes');
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay datos disponibles</p>';
            return;
        }
        
        const top10 = data.slice(0, 10);
        
        container.innerHTML = `
            <table style="width: 100%; font-size: 0.9rem;">
                <thead>
                    <tr style="border-bottom: 2px solid #eee;">
                        <th style="text-align: left; padding: 8px; width: 10%;">#</th>
                        <th style="text-align: left; padding: 8px;">Estudiante</th>
                        <th style="text-align: center; padding: 8px; width: 15%;">Nota</th>
                    </tr>
                </thead>
                <tbody>
                    ${top10.map((e, i) => `
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 8px;">
                                <span style="background: ${i < 3 ? '#f39c12' : '#3498db'}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.8rem; font-weight: bold;">${i + 1}</span>
                            </td>
                            <td style="padding: 8px;">
                                <div style="font-weight: 500;">${escapeHtml(e.estudiante)}</div>
                                <div style="font-size: 0.8rem; color: #777;">${escapeHtml(e.curso)}</div>
                            </td>
                            <td style="text-align: center; padding: 8px;">
                                <span style="font-weight: bold; color: #27ae60; font-size: 1.1rem;">${parseFloat(e.promedio).toFixed(1)}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (err) {
        console.error("Error:", err);
    }
}

function mostrarCargandoReportes(mostrar) {
    const containers = ['chartEstudiantesCurso', 'chartRendimiento', 'chartPromediosCurso', 'topEstudiantes'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el && mostrar) {
            el.style.opacity = '0.5';
        } else if (el) {
            el.style.opacity = '1';
        }
    });
}

function mostrarErrorReportes() {
    const mensaje = '<div style="text-align: center; padding: 20px; color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> Error al cargar reportes</div>';
    ['topEstudiantes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = mensaje;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            if (targetPage !== 'reports') {
                if (chartEstudiantesCurso) {
                    chartEstudiantesCurso.destroy();
                    chartEstudiantesCurso = null;
                }
                if (chartRendimiento) {
                    chartRendimiento.destroy();
                    chartRendimiento = null;
                }
                if (chartPromediosCurso) {
                    chartPromediosCurso.destroy();
                    chartPromediosCurso = null;
                }
            }
        });
    });
});

// =================================
// BÚSQUEDAS
// =================================
const buscarCursoInput = document.getElementById("buscarCurso");
if (buscarCursoInput) {
    buscarCursoInput.addEventListener("input", function() {
        const termino = this.value.toLowerCase();
        const filas = document.querySelectorAll("#tbodyCursos tr");
        
        filas.forEach(fila => {
            const texto = fila.textContent.toLowerCase();
            fila.style.display = texto.includes(termino) ? "" : "none";
        });
    });
}

const buscarEstudianteInput = document.getElementById("buscarEstudiante");
if (buscarEstudianteInput) {
    buscarEstudianteInput.addEventListener("input", function() {
        const termino = this.value.toLowerCase();
        const filas = document.querySelectorAll("#tbodyEstudiantes tr");
        
        filas.forEach(fila => {
            const texto = fila.textContent.toLowerCase();
            fila.style.display = texto.includes(termino) ? "" : "none";
        });
    });
}

const buscarActividadInput = document.getElementById("buscarActividad");
if (buscarActividadInput) {
    buscarActividadInput.addEventListener("input", function() {
        const termino = this.value.toLowerCase();
        const filas = document.querySelectorAll("#tbodyActividades tr");
        
        filas.forEach(fila => {
            const texto = fila.textContent.toLowerCase();
            fila.style.display = texto.includes(termino) ? "" : "none";
        });
    });
}

// =================================
// UTILIDADES
// =================================
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatearFecha(fecha) {
    if (!fecha) return '-';
    const d = new Date(fecha + 'T00:00:00');
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
}