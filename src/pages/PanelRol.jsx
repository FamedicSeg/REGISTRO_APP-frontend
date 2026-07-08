import { useEffect, useState, useMemo } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/panelRol.css";
import AdminUsuarios from "./AdminUsuarios";
import ModalRechazo from "./ModalRechazo";

export default function PanelRol() {

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipoFecha, setFiltroTipoFecha] = useState("todos"); // "todos" | "dia" | "semana"
  const [filtroFechaSeleccionada, setFiltroFechaSeleccionada] = useState("");
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [_aprobando, setAprobando] = useState(false);
  const [_mostrarAdmin, _setMostrarAdmin] = useState(false);
  const [modalRechazoOpen, setModalRechazoOpen] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  const nav = useNavigate();

  const [user] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  const rol = user?.rol || "";

  // Función para obtener el título mostrado según el rol
  const getTituloPanel = () => {
    if (rol === "JEFE DE PRODUCCIÓN") return "JEFE DE OPERACIONES";
    return rol;
  };

  const esAnalista = rol === "ANALISTA DE PRODUCCIÓN";
  const esSupervisor = rol === "SUPERVISOR";
  const esLider = ["LÍDER", "LIDER"].includes(rol);

  // ===============================
  // HELPERS FILTRO FECHA
  // ===============================

  const normalizarFecha = (fechaStr) => {
    if (!fechaStr) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
      const [d, m, y] = fechaStr.split("/");
      return `${y}-${m}-${d}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) return fechaStr.substring(0, 10);
    const date = new Date(fechaStr);
    if (!isNaN(date)) return date.toISOString().substring(0, 10);
    return fechaStr;
  };

  const getWeekRange = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDay();
    const diffStart = day === 0 ? -6 : 1 - day;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() + diffStart);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { startOfWeek, endOfWeek };
  };

  const puedeEliminar = useMemo(() => 
    rol === "LÍDER" || rol === "JEFE DE PRODUCCIÓN",
  [rol]);

  const cargarRegistros = async () => {
    if (!user) return;
    try {
      setCargando(true);
      const res = await api.get("/registros/mi-perfil", {
        params: {
          nombre: user.nombre,
          rol: user.rol
        }
      });
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error cargando registros:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, [user]);

  // ===============================
  // ELIMINAR REGISTRO
  // ===============================

  const eliminarRegistro = async (id, estadoActual) => {
    if (estadoActual !== "pendiente_SUPERVISOR") {
      alert("Solo se pueden eliminar registros en estado Pendiente Supervisor");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await api.delete(`/registros/${id}`);
      alert("Registro eliminado correctamente");
      await cargarRegistros();
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
      alert(err.response?.data?.error || "Error al eliminar el registro");
    }
  };

  // ===============================
  // FILTRO DE REGISTROS
  // ===============================

  const registrosFiltrados =
    ["ADMINISTRADOR","JEFE DE PRODUCCIÓN","ANALISTA DE PRODUCCIÓN","SUPERVISOR","LÍDER"].includes(rol)
      ? registros.filter((r) => {
          // ANALISTA DE PRODUCCIÓN, SUPERVISOR y LÍDER no ven registros Aprobados
          if ((esLider || esSupervisor || esAnalista) && r.estado?.toLowerCase().includes("aprob")) {
            return false;
          }

          // Filtro por fecha (día o semana)
          if (filtroTipoFecha !== "todos" && filtroFechaSeleccionada) {
            const fechaNorm = normalizarFecha(r.fecha);
            if (filtroTipoFecha === "dia") {
              if (fechaNorm !== filtroFechaSeleccionada) return false;
            } else if (filtroTipoFecha === "semana") {
              const { startOfWeek, endOfWeek } = getWeekRange(filtroFechaSeleccionada);
              const fechaRegistro = new Date(fechaNorm + "T00:00:00");
              if (fechaRegistro < startOfWeek || fechaRegistro > endOfWeek) return false;
            }
          }

          const texto = filtroTexto.toLowerCase();
          if (Array.isArray(r.maquinasSeleccionadas)) {
            const encontrado = r.maquinasSeleccionadas.some((m) =>
              String(m?.label || m?.nombre || m?.id || "")
                .toLowerCase()
                .includes(texto)
            );
            if (encontrado) return true;
          }
          return Object.values(r).some((val) =>
            String(val || "").toLowerCase().includes(texto)
          );
        })
      : registros;

  const registrosPorEstadoSinOrden = registrosFiltrados.filter((r) => {
    const estado = (r.estado || "pendiente").toLowerCase();
    if (filtroEstado === "pendientes") return estado.includes("pendiente");
    if (filtroEstado === "aprobados") return estado.includes("aprob");
    if (filtroEstado === "pendiente_supervisor") return estado.includes("supervisor");
    if (filtroEstado === "pendiente_analista_produccion") return estado.includes("analista");
    if (filtroEstado === "rechazados") return estado.includes("rechazado");
    return true;
  });

  const ordenarPorFecha = rol === "ANALISTA DE PRODUCCIÓN" || rol === "JEFE DE PRODUCCIÓN";

  const registrosPorEstado = ordenarPorFecha
    ? [...registrosPorEstadoSinOrden].sort((a, b) => {
        const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
        const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
        return fechaA - fechaB;
      })
    : registrosPorEstadoSinOrden;

  const _counts = useMemo(() => {
    const acc = {
      aprobados: 0,
      pSupervisor: 0,
      pAnalista: 0,
      rechazados: 0
    };
    registros.forEach((r) => {
      const s = (r.estado || "").toLowerCase();
      if (s.includes("aprob")) acc.aprobados++;
      if (s.includes("supervisor")) acc.pSupervisor++;
      if (s.includes("analista")) acc.pAnalista++;
      if (s.includes("rechazado")) acc.rechazados++;
    });
    acc.total = registros.length;
    return acc;
  }, [registros]);

  // Funciones para determinar estado
  const esEstadoPendienteSupervisor = (estado) => {
    return estado?.toLowerCase().includes("supervisor");
  };

  const esEstadoPendienteAnalista = (estado) => {
    return estado?.toLowerCase().includes("analista");
  };

  const verDetalle = (id) => {
    nav(`/admin/registros/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    nav("/login");
  };

  const _verificar = async (id) => {
    if (!window.confirm("¿Verificar este registro?")) return;
    try {
      await api.put(`/registros/${id}/verificar`, {
        nombre: user.nombre,
        rol: user.rol
      });
      await cargarRegistros();
    } catch (err) {
      console.error(err);
      alert("Error al verificar el registro");
    }
  };

  const aprobar = async (id) => {
    if (!window.confirm("¿Aprobar este registro?")) return;
    try {
      setAprobando(true);
      const response = await api.put(`/registros/${id}/aprobar`, {
        usuario: user.nombre,
        rol: user.rol
      });
      if (response.data.registro) {
        setRegistros(prev =>
          prev.map(r => r.id === id ? response.data.registro : r)
        );
      } else {
        await cargarRegistros();
      }
      alert("Registro aprobado correctamente");
    } catch (err) {
      console.error("❌ Error:", err.response?.data || err);
      alert(err.response?.data?.error || "Error al aprobar");
    } finally {
      setAprobando(false);
    }
  };

  const handleRechazarClick = (registro) => {
    setRegistroSeleccionado(registro);
    setModalRechazoOpen(true);
  };

  const handleRechazado = async () => {
    await cargarRegistros();
  };

  if (!user) {
    return <div>No hay usuario logueado</div>;
  }

  if (rol === "ADMINISTRADOR") {
    return (
      <div className="panel-container">
        <div className="panel-header">
          <div>
            <h2>Panel de {getTituloPanel()}</h2>
            <h3>SISTEMA GESTIÓN DE REGISTROS</h3>
          </div>
          <button className="panel-btn panel-btn-logout" onClick={handleLogout}>
            Salir
          </button>
        </div>
        <AdminUsuarios />
      </div>
    );
  }

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div>
          <h2>Panel de {getTituloPanel()}</h2>
          <h3>SISTEMA GESTIÓN DE REGISTROS</h3>
        </div>
        
        {/* 🆕 BOTÓN PARA ESTADÍSTICAS SEMANALES - Solo JEFE DE PRODUCCIÓN */}
        {(rol === "JEFE DE PRODUCCIÓN") && (
          <button
            onClick={() => nav("/estadistica-semanal")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4c9aaf",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              marginRight: "10px"
            }}
          >
            📊 Ver Estadística Semanal
          </button>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>

          {/* ── Fila 1: buscador + filtro de estado (oculto para ANALISTA) ── */}
          {(!esAnalista && !esSupervisor) && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{
              display: "flex",
              gap: "6px",
              backgroundColor: "#f5f5f5",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}>
              {[
                { valor: "todos", label: "Todos" },
                { valor: "pendientes", label: "En Proceso" },
                { valor: "aprobados", label: "Aprobados" },
                { valor: "rechazados", label: "Rechazados" }
              ].map(opcion => (
                <button
                  key={opcion.valor}
                  onClick={() => setFiltroEstado(opcion.valor)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: filtroEstado === opcion.valor ? "#007bff" : "#fff",
                    color: filtroEstado === opcion.valor ? "#fff" : "#333",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: filtroEstado === opcion.valor ? "600" : "500",
                    transition: "all 0.3s ease",
                    boxShadow: filtroEstado === opcion.valor ? "0 2px 8px rgba(0,123,255,0.3)" : "none"
                  }}
                >
                  {opcion.label}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* ── Filtro por texto (solo ANALISTA) ── */}
          {(esAnalista || esSupervisor) && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>🔍 Buscar:</span>
            <input
              type="text"
              placeholder="Buscar por código, módulo, responsable..."
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "13px",
                width: "280px",
                outline: "none"
              }}
            />
            {filtroTexto && (
              <button
                onClick={() => setFiltroTexto("")}
                style={{
                  padding: "7px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#666"
                }}
              >
                ✕ Limpiar
              </button>
            )}
          </div>
          )}
        </div>

        {!esLider && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>
          {/* ── Fila 2: filtro por fecha (nuevo) ── */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#555", fontWeight: "500" }}>📅 Fecha:</span>
            <div style={{
              display: "flex",
              gap: "4px",
              backgroundColor: "#f5f5f5",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}>
              {[
                { valor: "todos",  label: "Todos" },
                { valor: "dia",    label: "Día" },
                { valor: "semana", label: "Semana" }
              ].map(op => (
                <button
                  key={op.valor}
                  onClick={() => { setFiltroTipoFecha(op.valor); setFiltroFechaSeleccionada(""); }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: filtroTipoFecha === op.valor ? "#2563eb" : "#fff",
                    color: filtroTipoFecha === op.valor ? "#fff" : "#333",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: filtroTipoFecha === op.valor ? "600" : "500",
                    transition: "all 0.3s ease",
                    boxShadow: filtroTipoFecha === op.valor ? "0 2px 8px rgba(37,99,235,0.3)" : "none"
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {filtroTipoFecha !== "todos" && (
              <input
                type="date"
                value={filtroFechaSeleccionada}
                onChange={(e) => setFiltroFechaSeleccionada(e.target.value)}
                style={{
                  padding: "7px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "#333",
                  width: "160px"
                }}
              />
            )}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {filtroTipoFecha === "semana" && filtroFechaSeleccionada && (() => {
              const { startOfWeek, endOfWeek } = getWeekRange(filtroFechaSeleccionada);
              const fmt = (d) => d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
              return (
                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "500" }}>
                  {fmt(startOfWeek)} — {fmt(endOfWeek)}
                </span>
              );
            })()}

            {filtroTipoFecha !== "todos" && filtroFechaSeleccionada && (
              <button
                onClick={() => setFiltroFechaSeleccionada("")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#666"
                }}
              >
                ✕ Limpiar
              </button>
            )}
          </div>
          </div>
        </div>
        )}
        
        <button className="panel-btn panel-btn-logout" onClick={handleLogout}>
          Salir
        </button>
      </div>
      

      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: "16px", fontWeight: "500" }}>⏳ Cargando registros...</div>
        </div>
      ) : registrosPorEstado.length === 0 ? (
        <div style={{ 
          padding: 40, 
          textAlign: "center", 
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ fontSize: "16px", fontWeight: "500", color: "#6b7280" }}>
            No hay registros que mostrar
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>
          <table className="panel-data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>OP</th>
                <th>Área</th>
                <th>Módulo</th>
                <th>Responsable</th>
                <th>Código Producto</th>
                {esAnalista && <th>Descripción Producto</th>}
                <th>Lote</th>
                {esAnalista && <th>Cantidad Planificada</th>}
                {esAnalista && <th>Cantidad Elaborada</th>}
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrosPorEstado.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>#{r.op}</td>
                  <td>{r.area}</td>
                  <td>{r.modulo}</td>
                  <td>{r.responsable}</td>
                  <td>{r.codigo_producto}</td>
                  {esAnalista && <td>{r.descripcion}</td>}
                  <td>{r.loteUnido}</td>
                  {esAnalista && <td>{r.cantidad_planificada}</td>}
                  {esAnalista && <td>{r.cantidad_elaborado}</td>}
                  <td>
                    <span className={`panel-estado ${r.estado}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {/* VER - Disponible para todos siempre */}
                      <button
                        className="panel-btn panel-btn-view"
                        onClick={() => verDetalle(r.id)}
                      >
                        Ver
                      </button>
                      
                      {/* ELIMINAR - Solo LÍDER/JEFE en estado pendiente_SUPERVISOR */}
                      {puedeEliminar && esEstadoPendienteSupervisor(r.estado) && (
                        <button 
                          style={{ 
                            padding: "6px 12px", 
                            background: "#dc2626", 
                            color: "white", 
                            border: "none", 
                            borderRadius: 6, 
                            cursor: "pointer", 
                            fontWeight: 600, 
                            fontSize: 13, 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 5 
                          }} 
                          onClick={() => eliminarRegistro(r.id, r.estado)}
                        >
                          🗑️ Eliminar
                        </button>
                      )}

                      {/* APROBAR - Solo ANALISTA en estado pendiente_ANALISTA */}
                      {esAnalista && esEstadoPendienteAnalista(r.estado) && (
                        <button
                          className="panel-btn panel-btn-success"
                          onClick={() => aprobar(r.id)}
                        >
                          ✓ Aprobar
                        </button>
                      )}

                      {/* RECHAZAR - ANALISTA en pendiente_ANALISTA */}
                      {(
                        (esAnalista && esEstadoPendienteAnalista(r.estado))
                      ) && (
                        <button
                          className="panel-btn panel-btn-danger"
                          onClick={() => handleRechazarClick(r)}
                        >
                          ✕ Rechazar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalRechazo
        isOpen={modalRechazoOpen}
        onClose={() => setModalRechazoOpen(false)}
        registroId={registroSeleccionado?.id}
        onRechazado={handleRechazado}
        usuario={user}
      />
    </div>
  );
}