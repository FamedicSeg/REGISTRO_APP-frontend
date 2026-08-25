import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function AdminCatalogoSemanal() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [catalogos, setCatalogos] = useState([]);
  const [catalogoSeleccionado, setCatalogoSeleccionado] = useState(null);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const cargarCatalogos = async () => {
    try {
      setCargandoCatalogos(true);
      const response = await api.get("/catalogos-semanales");
      setCatalogos(response.data.data || []);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudieron cargar los catálogos guardados." });
      console.error("El error es:", error)
    } finally {
      setCargandoCatalogos(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const verCatalogo = async (catalogo) => {
    try {
      setCargandoDetalle(true);
      const response = await api.get(
        `/catalogos-semanales/${catalogo.fecha_inicio}/${catalogo.fecha_fin}`
      );
      setCatalogoSeleccionado(response.data.data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cargar el catálogo seleccionado." });
      console.error("El error es el siguiente:", error)
    } finally {
      setCargandoDetalle(false);
    }
  };

  const guardarCatalogo = async (event) => {
    event.preventDefault();
    setMensaje(null);

    if (!fechaInicio || !fechaFin) {
      setMensaje({ tipo: "error", texto: "Selecciona la fecha de inicio y la fecha de fin." });
      return;
    }

    if (fechaInicio > fechaFin) {
      setMensaje({ tipo: "error", texto: "La fecha de inicio no puede ser posterior a la fecha fin." });
      return;
    }

    try {
      setGuardando(true);
      await api.post("/catalogos-semanales", {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
      setMensaje({
        tipo: "exito",
        texto: `Catálogo guardado para el período ${fechaInicio} al ${fechaFin}.`,
      });
      await cargarCatalogos();
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: error.response?.data?.error || "No se pudo guardar el catálogo semanal.",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="admin-catalogo-card">
      <div className="admin-catalogo-header">
        <div>
          <h2>Catálogo semanal</h2>
          <p>Guarda una copia de Modulos, Insumos y Lote para usarla después por fecha de registro.</p>
        </div>
      </div>

      <form className="admin-catalogo-form" onSubmit={guardarCatalogo}>
        <label>
          Fecha de inicio
          <input
            type="date"
            value={fechaInicio}
            onChange={(event) => setFechaInicio(event.target.value)}
            required
          />
        </label>
        <label>
          Fecha fin
          <input
            type="date"
            value={fechaFin}
            onChange={(event) => setFechaFin(event.target.value)}
            required
          />
        </label>
        <button className="admin-btn-catalogo" type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar catálogo"}
        </button>
      </form>

      {mensaje && (
        <p className={`admin-catalogo-mensaje ${mensaje.tipo}`} role="status">
          {mensaje.texto}
        </p>
      )}

      <div className="admin-catalogo-lista">
        <h3>Catálogos guardados</h3>
        {cargandoCatalogos ? (
          <p className="admin-catalogo-vacio">Cargando períodos...</p>
        ) : catalogos.length === 0 ? (
          <p className="admin-catalogo-vacio">Todavía no hay catálogos guardados.</p>
        ) : (
          <div className="admin-catalogo-periodos">
            {catalogos.map((catalogo) => (
              <button
                className="admin-catalogo-periodo"
                key={`${catalogo.fecha_inicio}-${catalogo.fecha_fin}`}
                onClick={() => verCatalogo(catalogo)}
                type="button"
              >
                {catalogo.fecha_inicio} al {catalogo.fecha_fin}
                <span>Ver información</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {cargandoDetalle && <p className="admin-catalogo-vacio">Cargando información...</p>}

      {catalogoSeleccionado && !cargandoDetalle && (
        <div className="admin-catalogo-detalle">
          <h3>
            Información del período {catalogoSeleccionado.fecha_inicio} al {catalogoSeleccionado.fecha_fin}
          </h3>
          {Object.entries({
            MODULOS: catalogoSeleccionado.modulos,
            INSUMOS: catalogoSeleccionado.insumos,
            LOTE: catalogoSeleccionado.lote,
          }).map(([archivo, hojas]) => (
            <div className="admin-catalogo-archivo" key={archivo}>
              <h4>{archivo}</h4>
              {Object.entries(hojas).map(([hoja, contenido]) => (
                <div key={hoja}>
                  <h5>{hoja} ({contenido.data.length} registros)</h5>
                  <div className="admin-catalogo-tabla-scroll">
                    <table className="admin-catalogo-tabla">
                      <thead>
                        <tr>{contenido.headers.map((header) => <th key={header}>{header}</th>)}</tr>
                      </thead>
                      <tbody>
                        {contenido.data.map((fila, index) => (
                          <tr key={`${hoja}-${index}`}>
                            {contenido.headers.map((header) => <td key={header}>{fila[header]}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
