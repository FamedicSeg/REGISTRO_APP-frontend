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
  "OP LUNES":          { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "CUMP. MARTES":     { header: "#fbd4b4", cell: "#fbd4b4", color: "#000" },
  "OP MARTES":         { header: "#fbd4b4", cell: "#fbd4b4", color: "#000" },
  "CUMP. MIÉRCOLES":  { header: "#ccc0d9", cell: "#ccc0d9", color: "#000" },
  "OP MIÉRCOLES":      { header: "#ccc0d9", cell: "#ccc0d9", color: "#000" },
  "CUMP. JUEVES":     { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "OP JUEVES":         { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "CUMP. VIERNES":    { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "OP VIERNES":        { header: "#b8cce4", cell: "#b8cce4", color: "#000" },
  "CUMP. SÁBADO":     { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
  "OP SÁBADO":         { header: "#c2d69b", cell: "#c2d69b", color: "#000" },
}

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

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/planificacion");
        setHojas(data);
        setMsg("");
      } catch {
        setMsg("No se pudo cargar la planificación desde OneDrive.");
      }
    })();
  }, []);

  const hojaActual = hojas[activa] || { headers: [], data: [] };

  return (
    <div style={{ padding: 16 }}>
      <div className="btn-volver-container5">
      <button 
        className="btn-volver5"
        onClick={() => nav("/")}>⬅ Volver al Menú Principal</button>
      </div>
      <h2 style={{ marginTop: 10, fontSize: "30px" }}>Planificación Semanal (solo lectura)</h2>

      {msg && <p>{msg}</p>}

      {!msg && (
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