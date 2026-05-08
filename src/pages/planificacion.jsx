import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Planificacion() {
  const nav = useNavigate();
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState("Cargando...");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/planificacion");
        setHeaders(data.headers || []);
        setData(data.data || []);
        setMsg("");
      } catch {
        setMsg("No se pudo cargar la planificación. Revisa planificacion.xlsx en el backend.");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => nav("/")}>⬅ Volver</button>
      <h2 style={{ marginTop: 10 }}>Planificación (solo lectura)</h2>

      {msg && <p>{msg}</p>}

      {!msg && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            overflow: "auto",
            maxHeight: "70vh",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#f3f4f6",
                      borderBottom: "1px solid #ddd",
                      padding: 10,
                      textAlign: "left",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {headers.map((h, i) => (
                    <td
                      key={i}
                      style={{
                        borderBottom: "1px solid #eee",
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
      )}
    </div>
  );
}