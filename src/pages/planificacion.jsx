import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import '../styles/planificacion.css';

const HOJAS = ["PLAN CONFECCION", "PLAN AUTOMATICAS"];

const COLUMN_COLORS = {
  "META LUNES":      { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "META MARTES":     { header: "#fbd4b4", cell: "#fbd4b4", color: "#000" },
  "META MIÉRCOLES":  { header: "#ccc0d9", cell: "#ccc0d9", color: "#000" },
  "META JUEVES":     { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "META VIERNES":    { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "META SÁBADO":     { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
};

const OTHERS_COLORS = {
  "CUMP. LUNES":      { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "% LUNES":          { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "OP LUNES":          { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "CUMP. MARTES":     { header: "#fbd4b4", cell: "#fbd4b4", color: "#000" },
  "% MARTES":          { header: "#fbd4b4", cell: "#fbd4b4", color: "#000" },
  "OP MARTES":         { header: "#fbd4b4", cell: "#fbd4b4", color: "#000" },
  "CUMP. MIÉRCOLES":  { header: "#ccc0d9", cell: "#ccc0d9", color: "#000" },
  "% MIÉRCOLES":       { header: "#ccc0d9", cell: "#ccc0d9", color: "#000" },
  "OP MIÉRCOLES":      { header: "#ccc0d9", cell: "#ccc0d9", color: "#000" },
  "CUMP. JUEVES":     { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "% JUEVES":          { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "OP JUEVES":         { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "% VIERNES":          { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "CUMP. VIERNES":    { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "OP VIERNES":        { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "CUMP. SÁBADO":     { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "% SÁBADO":          { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "OP SÁBADO":         { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
};

const OP_COLORS = {
  "MOD": { fontWeight: 700, color: "#000" },
  "MOD.": { fontWeight: 700, color: "#000"},
  "OP LUNES": { fontWeight: 700, color: "#000" },
  "OP MARTES": { fontWeight: 700, color: "#000" },
  "OP MIÉRCOLES": { fontWeight: 700, color: "#000" },
  "OP JUEVES": { fontWeight: 700, color: "#000" },
  "OP VIERNES": { fontWeight: 700, color: "#000" },
  "OP SÁBADO": { fontWeight: 700, color: "#000" },
  "META LUNES": { fontWeight: 700, color: "#000" },
  "META MARTES": { fontWeight: 700, color: "#000" },
  "META MIÉRCOLES": { fontWeight: 700, color: "#000" },
  "META JUEVES": { fontWeight: 700, color: "#000" },
  "META VIERNES": { fontWeight: 700, color: "#000" },
  "META SÁBADO": { fontWeight: 700, color: "#000" },
};

function TablaHoja({ headers, data }) {
  if (!headers || headers.length === 0)
    return <p style={{ padding: 12, color: "#888" }}>Sin datos.</p>;
  return (
    <div className="tabla-hoja">
      <table className = "tabla-planif" >
        <thead className="tabla-planif-head">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  position: "sticky",
                  top: 0,
                  background: COLUMN_COLORS[String(h)]?.header ?? OTHERS_COLORS[String(h)]?.header ?? "#045357",
                  borderBottom: "1px solid #ddd",
                  //color: "#fff",
                  color: COLUMN_COLORS[String(h)]?.color ?? OTHERS_COLORS[String(h)]?.color ?? "#fff",
                  fontWeight: COLUMN_COLORS[String(h)]?.fontWeight ?? OTHERS_COLORS[String(h)]?.fontWeight ?? 600,
                  padding: 10,
                  textAlign: "center",
                  //fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {String(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabla-planif-body">
          {data.map((row, idx) => (
            <tr key={idx}>
              {headers.map((h, i) => (
                <td
                  key={i}
                  style={{
                    borderBottom: "1px solid #121212",
                    background: COLUMN_COLORS[String(h)]?.cell ?? (idx % 2 === 0 ? "#f9f9f9" : "#fff"),
                    color: OP_COLORS[String(h)]?.color ?? "#000",
                    fontWeight: OP_COLORS[String(h)]?.fontWeight ?? 100,
                    textAlign: "center",
                    padding: 10,
                    whiteSpace: "nowrap",
                  }}
                >
                  {String(row[String(h)] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Planificacion() {
  const nav = useNavigate();
  const [hojas, setHojas] = useState({});
  const [activa, setActiva] = useState(HOJAS[0]);
  const [msg, setMsg] = useState("Cargando...");
  const [modo, setModo] = useState("live");
  const [semanas, setSemanas] = useState([]);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState("");
  const [fechaInicioGuardar, setFechaInicioGuardar] = useState("");
  const [fechaFinGuardar, setFechaFinGuardar] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [msgGuardar, setMsgGuardar] = useState("");

  const cargarEnVivo = async () => {
    setMsg("Cargando...");
    setHojas({});
    try {
      const { data } = await api.get("/planificacion");
      setHojas(data);
      setMsg("");
    } catch {
      setMsg("No se pudo cargar la planificación desde OneDrive.");
    }
  };

  const cargarSemanas = async () => {
    try {
      const { data } = await api.get("/estadisticas/semanas-planificadas");
      setSemanas(data.semanas || []);
    } catch {
      setSemanas([]);
    }
  };

  const cargarSemanaGuardada = async (valor) => {
    if (!valor) return;
    const [fechaInicio, fechaFin] = valor.split("|");
    setMsg("Cargando...");
    setHojas({});
    try {
      const { data } = await api.get(
        `/estadisticas/planificacion-completa?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
      );
      setHojas(data);
      setMsg("");
    } catch {
      setMsg("No hay planificación guardada para esa semana.");
    }
  };

  const guardarSemanaActual = async () => {
    if (!fechaInicioGuardar || !fechaFinGuardar) {
      setMsgGuardar("⚠️ Ingresa la fecha de inicio y fin de la semana.");
      return;
    }
    setGuardando(true);
    setMsgGuardar("");
    try {
      const { data } = await api.post("/estadisticas/guardar-planificacion-completa", {
        fecha_inicio: fechaInicioGuardar,
        fecha_fin: fechaFinGuardar,
      });
      setMsgGuardar(`✅ ${data.mensaje}`);
      cargarSemanas();
    } catch (err) {
      setMsgGuardar(`❌ ${err.response?.data?.error || err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    if (modo === "live") {
      cargarEnVivo();
    } else {
      setHojas({});
      setMsg("");
      setSemanaSeleccionada("");
      cargarSemanas();
    }
  }, [modo]);

  const hojaActual = hojas[activa] || { headers: [], data: [] };

  return (
    <div style={{ padding: 16 }}>
      <div className="btn-volver-container5">
        <button className="btn-volver5" onClick={() => nav("/")}>⬅ Volver al Menú Principal</button>
      </div>
      <h2 style={{ marginTop: 10, fontSize: "30px" }}>Planificación Semanal (solo lectura)</h2>

      {/* Selector de modo */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => setModo("live")}
          style={{
            padding: "7px 18px", borderRadius: 6, border: "1.5px solid #045357",
            background: modo === "live" ? "#045357" : "#fff",
            color: modo === "live" ? "#fff" : "#045357",
            fontWeight: 600, cursor: "pointer"
          }}
        >
          🔴 Planificación Semanal Actual
        </button>
        <button
          onClick={() => setModo("saved")}
          style={{
            padding: "7px 18px", borderRadius: 6, border: "1.5px solid #045357",
            background: modo === "saved" ? "#045357" : "#fff",
            color: modo === "saved" ? "#fff" : "#045357",
            fontWeight: 600, cursor: "pointer"
          }}
        >
          📅 Ver semana guardada
        </button>
      </div>

      {/* Panel de semana guardada */}
      {modo === "saved" && (
        <div style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          {/* Selector de semana */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <label style={{ fontWeight: 600 }}>Semana:</label>
            <select
              value={semanaSeleccionada}
              onChange={(e) => {
                setSemanaSeleccionada(e.target.value);
                cargarSemanaGuardada(e.target.value);
              }}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", minWidth: 260 }}
            >
              <option value="">— Selecciona una semana —</option>
              {semanas.map((s) => (
                <option key={`${s.fecha_inicio}|${s.fecha_fin}`} value={`${s.fecha_inicio}|${s.fecha_fin}`}>
                  {s.fecha_inicio} → {s.fecha_fin}
                </option>
              ))}
            </select>
            {semanas.length === 0 && (
              <span style={{ color: "#888", fontSize: 13 }}>No hay semanas guardadas aún.</span>
            )}
          </div>

          {/* Guardar semana actual del Excel */}
          <div style={{ borderTop: "1px solid #ddd", paddingTop: 12 }}>
            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Guardar Planificación Actual del Excel:</p>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <label style={{ fontSize: 12, color: "#555" }}>Fecha inicio de semana</label>
                <input
                  type="date"
                  value={fechaInicioGuardar}
                  onChange={(e) => setFechaInicioGuardar(e.target.value)}
                  style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <label style={{ fontSize: 12, color: "#555" }}>Fecha fin de semana</label>
                <input
                  type="date"
                  value={fechaFinGuardar}
                  onChange={(e) => setFechaFinGuardar(e.target.value)}
                  style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid #ccc" }}
                />
              </div>
              <button
                onClick={guardarSemanaActual}
                disabled={guardando}
                style={{
                  padding: "7px 16px", borderRadius: 6,
                  background: guardando ? "#aaa" : "#045357",
                  color: "#fff", border: "none",
                  fontWeight: 600, cursor: guardando ? "not-allowed" : "pointer"
                }}
              >
                {guardando ? "Guardando..." : "Guardar semana"}
              </button>
            </div>
            {msgGuardar && (
              <p style={{ marginTop: 8, fontSize: 13, color: msgGuardar.startsWith("✅") ? "green" : "#c00" }}>
                {msgGuardar}
              </p>
            )}
          </div>
        </div>
      )}

      {msg && <p>{msg}</p>}

      {!msg && Object.keys(hojas).length > 0 && (
        <div style={{ marginTop: 12 }}>
          {/* Pestañas */}
          <div style={{ display: "flex", gap: 0 }}>
            {HOJAS.map((h) => (
              <button
                key={h}
                onClick={() => setActiva(h)}
                style={{
                  padding: "8px 20px",
                  border: "1px solid #ddd",
                  borderBottom: activa === h ? "1px solid #fff" : "1px solid #ddd",
                  borderRadius: "8px 8px 0 0",
                  background: activa === h ? "#fff" : "#2e2b2b",
                  color: activa === h ? "#000" : "#fff",
                  fontWeight: activa === h ? 700 : 400,
                  cursor: "pointer",
                  marginRight: 4,
                  position: "relative",
                  bottom: -1,
                }}
              >
                {h}
              </button>
            ))}
          </div>
          <TablaHoja headers={hojaActual.headers} data={hojaActual.data} />
        </div>
      )}
    </div>
  );
}