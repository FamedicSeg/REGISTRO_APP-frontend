import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

// Componente Campo - Versión controlada SIN errores
const Campo = ({ label, campo, type = "text", modoEdicion, puedeEditar, value, onChange }) => {
  const handleChange = (e) => {
    onChange(campo, e.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 15 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{label}</span>
      {modoEdicion && puedeEditar ? (
        <input
          type={type}
          value={value || ""}
          onChange={handleChange}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            width: "100%",
            fontSize: 14
          }}
        />
      ) : (
        <div style={{ background: "#f3f4f6", padding: "8px 12px", borderRadius: 8, fontSize: 14 }}>
          {value || "-"}
        </div>
      )}
    </div>
  );
};

// Componente Select - Versión controlada SIN errores
const SelectField = ({ label, campo, options, modoEdicion, puedeEditar, value, onChange }) => {
  const handleChange = (e) => {
    onChange(campo, e.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 15 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{label}</span>
      {modoEdicion && puedeEditar ? (
        <select
          value={value || ""}
          onChange={handleChange}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            width: "100%",
            fontSize: 14,
            backgroundColor: "white"
          }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <div style={{ background: "#f3f4f6", padding: "8px 12px", borderRadius: 8, fontSize: 14 }}>
          {options.find(opt => opt.value === value)?.label || value || "-"}
        </div>
      )}
    </div>
  );
};

// Componente para item de array - Simplificado CON PRESERVACIÓN DE CAMPOS
const ArrayItem = ({ item, index, camposEditables, onUpdate, onDelete, modoEdicion, puedeEditar }) => {
  const handleChange = (campo, valor) => {
    onUpdate(index, campo, valor);
  };

  return (
    <div style={{
      marginBottom: 15,
      padding: 15,
      background: "#f9fafb",
      borderRadius: 8,
      position: "relative",
      border: "1px solid #e5e7eb"
    }}>
      {modoEdicion && puedeEditar && (
        <button
          onClick={() => onDelete(index)}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#ef4444",
            border: "none",
            color: "white",
            cursor: "pointer",
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Eliminar"
        >
          ✕
        </button>
      )}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))` }}>
        {camposEditables.map(campo => (
          <div key={campo}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 4, display: "block" }}>
              {campo.replace(/_/g, ' ').toUpperCase()}
            </label>
            {modoEdicion && puedeEditar ? (
              <input
                value={item[campo] !== undefined && item[campo] !== null ? item[campo] : ""}
                onChange={(e) => handleChange(campo, e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  width: "100%",
                  fontSize: 13
                }}
                placeholder={`Ingresa ${campo}`}
              />
            ) : (
              <div style={{
                padding: "6px 10px",
                background: "white",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                fontSize: 13
              }}>
                {item[campo] !== undefined && item[campo] !== null ? item[campo] : "-"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente ArrayDisplay optimizado
const ArrayDisplay = ({ 
  titulo, 
  datos, 
  modoEdicion, 
  puedeEditar, 
  items = [], 
  onItemsChange,
  camposEditables = [],
  renderItem 
}) => {
  const agregarItem = useCallback(() => {
    const nuevoItem = {
      id: Date.now() + Math.random(),
      ...camposEditables.reduce((acc, campo) => ({ ...acc, [campo]: "" }), {})
    };
    const nuevosItems = [...items, nuevoItem];
    onItemsChange(datos, nuevosItems);
  }, [items, camposEditables, datos, onItemsChange]);

  const actualizarItem = useCallback((index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    onItemsChange(datos, nuevosItems);
  }, [items, datos, onItemsChange]);

  const eliminarItem = useCallback((index) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    onItemsChange(datos, nuevosItems);
  }, [items, datos, onItemsChange]);

  const cardStyle = {
    border: "1px solid #e5e7eb",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    background: "#ffffff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  };

  return (
    <div style={cardStyle}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 20,
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: 12
      }}>
        <h3 style={{ margin: 0, color: "#1f2937", fontSize: 18 }}>{titulo}</h3>
        {modoEdicion && puedeEditar && (
          <button
            onClick={agregarItem}
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13
            }}
          >
            <span style={{ fontSize: 18 }}>+</span> Agregar
          </button>
        )}
      </div>
      
      {Array.isArray(items) && items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item, index) => (
            modoEdicion && puedeEditar ? (
              <ArrayItem
                key={item.id || `item-${index}`}
                item={item}
                index={index}
                camposEditables={camposEditables}
                onUpdate={actualizarItem}
                onDelete={eliminarItem}
                modoEdicion={modoEdicion}
                puedeEditar={puedeEditar}
              />
            ) : (
              <div key={item.id || `item-${index}`} style={{ 
                padding: 12, 
                background: "#f9fafb", 
                borderRadius: 8,
                border: "1px solid #e5e7eb"
              }}>
                {renderItem(item, index)}
              </div>
            )
          ))}
        </div>
      ) : (
        <p style={{ color: "#6b7280", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
          No hay {titulo.toLowerCase()} registrados
        </p>
      )}
    </div>
  );
};

export default function AdminDetalleRegistro() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const modoInicial = queryParams.get("edit") === "true";

  const [registro, setRegistro] = useState(null);
  const [form, setForm] = useState({});
  const [modoEdicion, setModoEdicion] = useState(modoInicial);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const rol = user?.rol || "";

  const turnoOptions = [
    { value: "Día", label: "Día" },
    { value: "Noche", label: "Noche" }
  ];

  const areaOptions = [
    { value: "Confección", label: "CONFECCIÓN" },
    { value: "Automática", label: "AUTOMÁTICAS" }
  ];

  const moduloOptions = [
    "Módulo 1", "Módulo 2", "Módulo 3", "Módulo 4", "Módulo 5",
    "Módulo 6", "Módulo 7", "Módulo 8", "Módulo 9", "Módulo 10",
    "Módulo 11", "Módulo 12", "Módulo 13", "varios 1", "varios 2",
    "Estampado", "Botas Simples", "SPA", "Mascarillas", "GPA",
    "Sellado", "Corte", "Metblown"
  ].map(m => ({ value: m, label: m }));

  const destinoOptions = [
    { value: "CLIENTE", label: "CLIENTE" },
    { value: "STOCK", label: "STOCK" }
  ];

  const siNoOptions = [
    { value: "SÍ", label: "SI" },
    { value: "NO", label: "NO" }
  ];

  const leyendaOptions = [
    { value: "IESS", label: "IESS" },
    { value: "MSP", label: "MSP" },
    { value: "RP", label: "RP" },
    { value: "OTRA", label: "OTRA" }
  ];

  const getPanelRoute = useCallback(() => {
    switch(rol) {
      case "SUPERVISOR": return "/supervisor";
      case "LÍDER": return "/lider";
      case "ANALISTA DE PRODUCCIÓN": return "/analista_produccion";
      case "JEFE DE PRODUCCIÓN": return "/jefe_produccion";
      default: return "/panel-rol";
    }
  }, [rol]);

  const puedeEditar = useMemo(() => 
    rol === "LÍDER",
  [rol]);

  const puedeEliminar = useMemo(() => 
    rol === "LÍDER" || rol === "JEFE DE PRODUCCIÓN",
  [rol]);

  // Función para parsear arrays que vienen como JSON strings
  const parsearArrays = (datos) => {
    const datosLimpios = { ...datos };

    // Arrays que pueden venir como JSON strings
    const camposArray = [
      'insumos',
      'etiquetas',
      'integrantes',
      'reposicion_no_conforme',
      'maquinarias',
      'actividades_por_integrante',
      'detalles_actividades'
    ];

    camposArray.forEach(campo => {
      if (datosLimpios[campo]) {
        if (typeof datosLimpios[campo] === 'string') {
          // ✅ detalles_actividades es TEXT plano con \n, NO JSON - dejarlo como string
          if (campo !== 'detalles_actividades') {
            try {
              datosLimpios[campo] = JSON.parse(datosLimpios[campo]);
              // ✅ Si es maquinarias y no tiene la estructura esperada, normalizarla
              if (campo === 'maquinarias' && Array.isArray(datosLimpios[campo])) {
                datosLimpios[campo] = datosLimpios[campo].map(item => ({
                  ...item,
                  numero_maquinaria: Array.isArray(item.numero_maquinaria) 
                    ? item.numero_maquinaria 
                    : (item.numero_maquinaria ? [item.numero_maquinaria] : [])
                }));
              }
            } catch (e) {
              console.error(`Error parseando ${campo}:`, e);
              datosLimpios[campo] = campo === 'actividades_por_integrante' ? {} : [];
            }
          }
        }
      } else {
        // Si el campo no existe, asignar valor por defecto
        datosLimpios[campo] = campo === 'actividades_por_integrante' ? {} : [];
      }
    });

    return datosLimpios;
  };

  useEffect(() => {
    const cargarRegistro = async () => {
      try {
        setCargando(true);
        const res = await api.get(`/registros/${id}`);
        const datosRegistro = res.data.registro || res.data;

        // Parsear todos los arrays que vienen como JSON strings
        const datosParsados = parsearArrays(datosRegistro);

        // Convertir actividades_por_integrante de array a objeto si es necesario
        if (datosParsados.actividades_por_integrante &&
            Array.isArray(datosParsados.actividades_por_integrante)) {
          const obj = {};
          datosParsados.actividades_por_integrante.forEach((item, idx) => {
            obj[idx] = item;
          });
          datosParsados.actividades_por_integrante = obj;
        }

        setRegistro(datosParsados);
        setForm({
          ...datosParsados
        });
      } catch(error) {
        console.error("Error cargando registro:", error);
        alert("Error al cargar el registro");
      } finally {
        setCargando(false);
      }
    };
    cargarRegistro();
  }, [id]);

  useEffect(() => {
    if (modoInicial && !puedeEditar && registro) {
      alert("No tienes permisos para editar este registro");
      navigate(`/admin/registros/${id}`);
    }
  }, [modoInicial, puedeEditar, registro, id, navigate]);

  const handleChange = useCallback((campo, valor) => {
    setForm(prev => {
      const nuevoForm = { ...prev, [campo]: valor };
      // Cuando se editen lotePrincipal o loteSecundario, recalcular loteUnido
      if (campo === 'lotePrincipal' || campo === 'loteSecundario') {
        nuevoForm.loteUnido = (nuevoForm.lotePrincipal || "") + (nuevoForm.loteSecundario || "");
      }
      return nuevoForm;
    });
  }, []);

  const handleArrayChange = useCallback((campo, nuevoArray) => {
    setForm(prev => ({ ...prev, [campo]: nuevoArray }));
  }, []);

  const eliminarRegistro = async () => {
    const confirmar = window.confirm(
      "⚠️ ¿Está seguro que desea eliminar este registro?\n\nEsta acción no se puede deshacer."
    );

    if (!confirmar) return;

    try {
      setGuardando(true);
      const response = await api.delete(`/registros/${id}`);
      if (response.status === 200) {
        alert("✅ Registro eliminado correctamente");
        navigate(getPanelRoute());
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("Error eliminando registro:", error);
      let mensajeError = "Error al eliminar el registro";
      if (error.response) {
        mensajeError = error.response.data?.error || mensajeError;
      } else if (error.request) {
        mensajeError = "No se recibió respuesta del servidor";
      } else {
        mensajeError = error.message;
      }
      alert(mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);

      // Convertir actividades_por_integrante a JSON string si es necesario
      let actividadesParaEnviar = form.actividades_por_integrante;
      if (typeof actividadesParaEnviar === 'object' && !Array.isArray(actividadesParaEnviar)) {
        actividadesParaEnviar = JSON.stringify(actividadesParaEnviar);
      } else if (Array.isArray(actividadesParaEnviar)) {
        // Convertir array a objeto
        const obj = {};
        actividadesParaEnviar.forEach((item, idx) => {
          obj[idx] = item;
        });
        actividadesParaEnviar = JSON.stringify(obj);
      }

      // Validar y limpiar arrays - PRESERVANDO TODOS LOS CAMPOS
      const validarArray = (arr) => {
        if (!arr) return [];
        if (typeof arr === 'string') {
          try {
            const parsed = JSON.parse(arr);
            // Asegurar que cada item sea un objeto con todos sus campos
            return Array.isArray(parsed) ? parsed.map(item => ({
              ...item, // PRESERVAR TODO
              id: item.id || Date.now() + Math.random()
            })) : [];
          } catch (e) {
            console.error("Error parseando array:", e);
            return [];
          }
        }
        // Si ya es array, preservar campos
        return Array.isArray(arr) ? arr.map(item => ({
          ...item, // PRESERVAR TODO
          id: item.id || Date.now() + Math.random()
        })) : [];
      };

      const datosAEnviar = {
        ...registro,
        ...form,
        rol: user.rol,
        nombre: user.nombre,
        estado: registro.estado === "rechazado" ? "pendiente_SUPERVISOR" : registro.estado,
        // Asegurar que los arrays estén correctamente estructurados
        insumos: validarArray(form.insumos),
        etiquetas: validarArray(form.etiquetas),
        integrantes: validarArray(form.integrantes),
        reposicion_no_conforme: validarArray(form.reposicion_no_conforme),
        maquinarias: validarArray(form.maquinarias),
        detalles_actividades: validarArray(form.detalles_actividades),
        actividades_por_integrante: actividadesParaEnviar
      };

      console.log("Lotes a guardar:", {
        lotePrincipal: form.lotePrincipal,
        loteSecundario: form.loteSecundario,
        loteUnido: form.loteUnido
      });
      console.log(" MAQUINARIAS A ENVIAR:", datosAEnviar.maquinarias);
      console.log(" Datos a guardar:", datosAEnviar);

      const response = await api.put(`/registros/${id}`, datosAEnviar);
      if (response.status === 200) {
        alert("Registro actualizado correctamente");
        navigate(getPanelRoute());
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      let mensajeError = "Error al guardar cambios";
      if (error.response) {
        mensajeError = error.response.data?.error || mensajeError;
      } else if (error.request) {
        mensajeError = "No se recibió respuesta del servidor";
      } else {
        mensajeError = error.message;
      }
      alert(mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  const cardStyle = useMemo(() => ({
    border: "1px solid #e5e7eb",
    padding: 24,
    borderRadius: 12,
    marginBottom: 25,
    background: "#ffffff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  }), []);

  const sectionTitleStyle = {
    margin: "0 0 20px 0", 
    color: "#1f2937", 
    fontSize: 18,
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 12
  };

  if (cargando) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 18, color: "#6b7280" }}>
      Cargando registro...
    </div>
  );
  
  if (!registro) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 18, color: "#6b7280" }}>
      No se encontró el registro
    </div>
  );

  return (
    <div style={{ padding: 30, maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: "2px solid #e5e7eb"
      }}>
        <div>
          <h2 style={{ margin: 0, color: "#111827", fontSize: 28 }}>Registro #{registro.id}</h2>
        </div>
        <div style={{ 
          padding: "8px 16px",
          borderRadius: 20,
          background: registro.estado?.includes("aprobado") ? "#dcfce7" : registro.estado?.includes("rechazado") ? "#fee2e2" : "#fef3c7",
          color: registro.estado?.includes("aprobado") ? "#166534" : registro.estado?.includes("rechazado") ? "#991b1b" : "#92400e",
          fontWeight: 600,
          fontSize: 14
        }}>
          {registro.estado || "Pendiente"}
        </div>
      </div>

      {/* INFO GENERAL */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Información General</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
          <Campo label="Fecha" campo="fecha" type="date" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.fecha} onChange={handleChange} />
          <Campo label="OP" campo="op" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.op} onChange={handleChange} />
          <SelectField label="Turno" campo="turno" options={turnoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.turno} onChange={handleChange} />
          <SelectField label="Área" campo="area" options={areaOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.area} onChange={handleChange} />
          <SelectField label="Módulo" campo="modulo" options={moduloOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.modulo} onChange={handleChange} />
          <Campo label="Responsable" campo="responsable" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.responsable} onChange={handleChange} />
          <Campo label="Supervisor" campo="supervisor" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.supervisor} onChange={handleChange} />
          <Campo label="Personal Asignado" campo="personal_asignado" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.personal_asignado} onChange={handleChange} />
          <Campo label="Personal Otro" campo="personal_otro" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.personal_otro} onChange={handleChange} />
          <Campo label="Personal Presente" campo="personal_presente" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.personal_presente} onChange={handleChange} />
          <Campo label="Referencia" campo="codigo_producto" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.codigo_producto} onChange={handleChange} />
          <Campo label="Descripción" campo="descripcion" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.descripcion} onChange={handleChange} />
          <Campo label="Hora Planificada" campo="hora_planificada" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.hora_planificada} onChange={handleChange} />
          <Campo label="Cantidad Planificada" campo="cantidad_planificada" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_planificada} onChange={handleChange} />
          <Campo label="Lote Primario" campo="lotePrincipal" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.lotePrincipal} onChange={handleChange} />
          <Campo label="Lote Secundario" campo="loteSecundario" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.loteSecundario} onChange={handleChange} />
          <Campo label="Lote Unido" campo="loteUnido" modoEdicion={false} puedeEditar={false} value={form.loteUnido} onChange={handleChange} />
        </div>
        {!modoEdicion && (
          <div style={{ marginTop: 15, padding: 10, background: "#e9ecef", borderRadius: 8, display: "inline-block" }}>
            <strong>Lotes:</strong> Lote: {registro.loteUnido || "-"}
          </div>
        )}
      </div>

      {/* INSUMOS */}
      <ArrayDisplay
        titulo="Insumos"
        datos="insumos"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.insumos || []) : (registro.insumos || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["tipo_insumo", "descripcion_insumo", "cantidad_insumo", "lote_insumo", "entrega", "recepcion"]}
        renderItem={(i) => (
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 5 }}>{i.tipo_insumo} — {i.descripcion_insumo}</div>
            <div style={{ fontSize: 12, color: "#666", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <span>Cantidad: {i.cantidad_insumo} {i.descrip_cant_insumo}</span>
              <span>Lote: {i.lote_insumo}</span>
              <span>Entrega: {i.entrega}</span>
              <span>Recepción: {i.recepcion}</span>
            </div>
          </div>
        )}
      />

      {/* REPOSICIÓN NO CONFORME */}
      <ArrayDisplay
        titulo="REPOSICIÓN NO CONFORME"
        datos="reposicion_no_conforme"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.reposicion_no_conforme || []) : (registro.reposicion_no_conforme || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["codigo_insumo", "descripcion_insumo", "cantidad", "descrip_cant_insumo", "lote", "entrega", "recepcion"]}
        renderItem={(i) => (
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 5 }}>{i.codigo_insumo} — {i.descripcion_insumo}</div>
            <div style={{ fontSize: 12, color: "#666", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <span>Cantidad: {i.cantidad} {i.descrip_cant_insumo}</span>
              <span>Lote: {i.lote}</span>
              <span>Entrega: {i.entrega}</span>
              <span>Recepción: {i.recepcion}</span>
            </div>
          </div>
        )}
      />

      {/* ETIQUETAS */}
      <ArrayDisplay
        titulo="ETIQUETAS"
        datos="etiquetas"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.etiquetas || []) : (registro.etiquetas || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["descripcion_etiqueta", "cantidad_etiqueta", "observacion_etiqueta", "entrega_etiqueta", "recepcion_etiqueta"]}
        renderItem={(e) => (
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 5 }}>{e.descripcion_etiqueta}</div>
            <div style={{ fontSize: 12, color: "#666", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <span>Cantidad: {e.cantidad_etiqueta}</span>
              <span>Entrega: {e.entrega_etiqueta}</span>
              <span>Recepción: {e.recepcion_etiqueta}</span>
            </div>
          </div>
        )}
      />

      {/* CANTIDADES */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Cantidades</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
          <Campo label="Cantidad Elaborada" campo="cantidad_elaborado" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_elaborado} onChange={handleChange} />
          <Campo label="Cantidad en Proceso" campo="cantidad_proceso" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_proceso} onChange={handleChange} />
          <Campo label="Cantidad Merma" campo="cantidad_merma" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_merma} onChange={handleChange} />
          <Campo label="Fecha Final Producto" campo="fecha_final_producto" type="date" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.fecha_final_producto} onChange={handleChange} />
        </div>
      </div>

      {/* TIEMPOS Y CONFECCIÓN */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Confección y Automáticas</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
          <Campo label="Hora Inicio" campo="hora_inicio" type="time" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.hora_inicio} onChange={handleChange} />
          <Campo label="Hora Fin" campo="hora_fin" type="time" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.hora_fin} onChange={handleChange} />
          <SelectField label="Destino" campo="destino" options={destinoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.destino} onChange={handleChange} />
          {form.destino === "CLIENTE" && (
            <Campo label="Nombre Cliente" campo="cliente" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cliente} onChange={handleChange} />
          )}
          <SelectField label="Estéril" campo="esteril" options={siNoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.esteril} onChange={handleChange} />
          <SelectField label="Leyenda" campo="leyenda" options={siNoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.leyenda} onChange={handleChange} />
          {form.leyenda === "SÍ" && (
            <SelectField label="Tipo Leyenda" campo="leyenda_si" options={leyendaOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.leyenda_si} onChange={handleChange} />
          )}
          {form.leyenda_si === "OTRA" && (
            <Campo label="Descripción Leyenda" campo="leyenda_otra" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.leyenda_otra} onChange={handleChange} />
          )}
        </div>
      </div>

      {/* MAQUINARIA */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>MAQUINARIAS</h3>
        {(() => {
          const maqList = modoEdicion ? (form.maquinarias || []) : (registro.maquinarias || []);
          
          const actualizarMaquinaria = (index, campo, valor) => {
            const nuevos = [...maqList];
            nuevos[index] = { ...nuevos[index], [campo]: valor };
            handleArrayChange("maquinarias", nuevos);
          };

          const eliminarMaquinaria = (index) => {
            const nuevos = maqList.filter((_, i) => i !== index);
            handleArrayChange("maquinarias", nuevos);
          };

          const agregarMaquinaria = () => {
            const nuevos = [...maqList, { 
              id: Date.now(),
              maquinaria: "", 
              cantidad_maquinaria: "", 
              numero_maquinaria: [] 
            }];
            handleArrayChange("maquinarias", nuevos);
          };

          const actualizarNumerosMaquina = (index, value) => {
            const numeros = value.split(',').map(n => n.trim()).filter(n => n);
            const nuevos = [...maqList];
            nuevos[index] = { ...nuevos[index], numero_maquinaria: numeros };
            handleArrayChange("maquinarias", nuevos);
          };

          if (maqList.length === 0) {
            return (
              <div style={{ textAlign: "center", padding: 20, background: "#f9fafb", borderRadius: 8 }}>
                <p style={{ color: "#6b7280", margin: 0 }}>No hay maquinaria registrada</p>
                {modoEdicion && puedeEditar && (
                  <button onClick={agregarMaquinaria} style={{ marginTop: 12, padding: "6px 12px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                    + Agregar Maquinaria
                  </button>
                )}
              </div>
            );
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {modoEdicion && puedeEditar && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button onClick={agregarMaquinaria} style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 18 }}>+</span> Agregar Maquinaria
                  </button>
                </div>
              )}

              {maqList.map((m, i) => (
                <div key={m.id || i} style={{ padding: 16, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", position: "relative" }}>
                  {modoEdicion && puedeEditar && (
                    <button onClick={() => eliminarMaquinaria(i)} style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", border: "none", color: "white", cursor: "pointer", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }} title="Eliminar">
                      ✕
                    </button>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 15 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>MAQUINARIA</span>
                      {modoEdicion && puedeEditar ? (
                        <input type="text" value={m.maquinaria || ""} onChange={(e) => actualizarMaquinaria(i, "maquinaria", e.target.value)} style={{ marginTop: 4, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", width: "100%", fontSize: 14 }} placeholder="Ej: Máquina de coser" />
                      ) : (
                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>{m.maquinaria || "-"}</div>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>CANTIDAD</span>
                      {modoEdicion && puedeEditar ? (
                        <input type="number" min="0" value={m.cantidad_maquinaria || ""} onChange={(e) => actualizarMaquinaria(i, "cantidad_maquinaria", e.target.value)} style={{ marginTop: 4, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", width: "100%", fontSize: 14 }} placeholder="Ej: 5" />
                      ) : (
                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>{m.cantidad_maquinaria || "-"}</div>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>N° MÁQUINAS</span>
                      {modoEdicion && puedeEditar ? (
                        <input type="text" value={Array.isArray(m.numero_maquinaria) ? m.numero_maquinaria.join(", ") : (m.numero_maquinaria || "")} onChange={(e) => actualizarNumerosMaquina(i, e.target.value)} style={{ marginTop: 4, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", width: "100%", fontSize: 14 }} placeholder="Ej: 1, 2, 3 (separados por coma)" />
                      ) : (
                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>
                          {Array.isArray(m.numero_maquinaria) && m.numero_maquinaria.length > 0 ? m.numero_maquinaria.join(", ") : (m.numero_maquinaria || "-")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* DETALLES DE ACTIVIDADES */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>📋 DETALLES DE ACTIVIDADES</h3>
        {(() => {
          let detalles = modoEdicion ? form.detalles_actividades : registro.detalles_actividades;

          console.log("Detalles raw:", detalles, "Type:", typeof detalles);

          // Si es string JSON, intentar parsearlo
          if (typeof detalles === 'string' && detalles) {
            // Evitar convertir "[object Object]" literal
            if (detalles === "[object Object]") {
              detalles = [];
            } else if (detalles.startsWith('[') || detalles.startsWith('{')) {
              // Intentar parsear como JSON
              try {
                const parsed = JSON.parse(detalles);
                detalles = Array.isArray(parsed) ? parsed : [parsed];
              } catch (error) {
                console.log('Error parseando detalles_actividades:', error);
                // Si falla, dividir por líneas
                detalles = detalles.split('\n')
                  .map(d => String(d).trim())
                  .filter(d => d && d.length > 0);
              }
            } else {
              // Es plain text con saltos de línea
              detalles = detalles.split('\n')
                .map(d => String(d).trim())
                .filter(d => d && d.length > 0);
            }
          }
          // Si es array, convertir a strings
          else if (Array.isArray(detalles)) {
            detalles = detalles.map(d => String(d).trim()).filter(d => d);
          }
          // Si es objeto (no array), intentar convertir a array
          else if (typeof detalles === 'object' && detalles !== null) {
            detalles = Object.values(detalles).map(d => String(d).trim()).filter(d => d);
          } else {
            detalles = [];
          }

          // Limpiar detalles vacíos
          detalles = detalles.filter(d => d && String(d).trim());

          console.log("Detalles procesados:", detalles);

          if (detalles.length === 0) {
            return (
              <div style={{ marginTop: 12, textAlign: "center", padding: 20, background: "#f9fafb", borderRadius: 8 }}>
                <p style={{ color: "#6b7280", margin: 0 }}>No hay detalles de actividades registrados</p>
              </div>
            );
          }

          return (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              {detalles.map((detalle, idx) => {
                // Obtener actividades_por_integrante
                let actividades = modoEdicion ? form.actividades_por_integrante : registro.actividades_por_integrante;
                
                // Parsear si es string
                if (typeof actividades === 'string') {
                  try {
                    actividades = JSON.parse(actividades);
                  } catch {
                    actividades = {};
                  }
                }

                // Filtrar integrantes con esta actividad
                const integrantesConActividad = Object.values(actividades || {}).filter(integrante => 
                  integrante.actividades?.some(act => act.actividad === detalle.trim())
                );

                // Calcular totales
                const totalPlanificado = integrantesConActividad.reduce((sum, integrante) => {
                  const actividadEnIntegrante = integrante.actividades.find(act => act.actividad === detalle.trim());
                  return sum + (parseInt(actividadEnIntegrante?.cantidad_planificada) || 0);
                }, 0);

                const totalElaborado = integrantesConActividad.reduce((sum, integrante) => {
                  const actividadEnIntegrante = integrante.actividades.find(act => act.actividad === detalle.trim());
                  return sum + (parseInt(actividadEnIntegrante?.cantidad_elaborada) || 0);
                }, 0);

                return (
                  <div
                    key={idx}
                    style={{
                      padding: "16px",
                      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                      border: "1px solid #7dd3fc",
                      borderRadius: 8,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                      <div style={{ 
                        minWidth: 28, 
                        height: 28, 
                        background: "#0284c7", 
                        color: "white",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 12,
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, fontSize: 15, color: "#0c4a6e", fontWeight: 600, wordBreak: "break-word" }}>
                        {String(detalle).trim()}
                      </div>
                    </div>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      paddingLeft: 40,
                      fontSize: 13
                    }}>
                      <div style={{ background: "#dbeafe", padding: "8px 12px", borderRadius: 6, border: "1px solid #93c5fd" }}>
                        <span style={{ color: "#1e40af", fontWeight: 600 }}>Planificada:</span> <span style={{ color: "#0c4a6e" }}>{totalPlanificado}</span>
                      </div>
                      <div style={{ background: "#dbeafe", padding: "8px 12px", borderRadius: 6, border: "1px solid #93c5fd" }}>
                        <span style={{ color: "#1e40af", fontWeight: 600 }}>Elaborada:</span> <span style={{ color: "#0c4a6e" }}>{totalElaborado}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ACTIVIDADES POR INTEGRANTE */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>DETALLES DE ACTIVIDADES POR INTEGRANTE</h3>
        {(() => {
          let rawData = modoEdicion ? form.actividades_por_integrante : registro.actividades_por_integrante;

          // Parsear si viene como string
          if (typeof rawData === 'string') {
            try {
              rawData = JSON.parse(rawData);
            } catch (error) {
              console.log('Error parseando actividades_por_integrante:', error);
              rawData = {};
            }
          }

          // Convertir array a objeto si es necesario
          if (Array.isArray(rawData)) {
            const obj = {};
            rawData.forEach((item, idx) => {
              if (item && item.nombre) {
                obj[idx] = item;
              }
            });
            rawData = obj;
          }

          const integrantes = rawData && typeof rawData === 'object' ? Object.values(rawData).filter(i => i && i.nombre) : [];

          const actualizarActividadIntegrante = (integranteIdx, actividadIdx, campo, valor) => {
            const nuevaData = JSON.parse(JSON.stringify(rawData));
            const keys = Object.keys(nuevaData);
            const key = keys[integranteIdx];
            if (nuevaData[key]?.actividades?.[actividadIdx]) {
              nuevaData[key].actividades[actividadIdx][campo] = valor;
              handleArrayChange('actividades_por_integrante', nuevaData);
            }
          };

          if (integrantes.length === 0) {
            return <div style={{ marginTop: 25, textAlign: "center", padding: 20, background: "#f9fafb", borderRadius: 8 }}><p style={{ color: "#6b7280", margin: 0 }}>No hay actividades registradas por integrante</p></div>;
          }
          return (
            <div style={{ marginTop: 25, display: "flex", flexDirection: "column", gap: 16 }}>
              {integrantes.map((integrante, idx) => (
                <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", padding: "12px 20px", color: "white" }}>
                    <h4 style={{ margin: 0, fontSize: 16 }}>{integrante.nombre}</h4>
                    <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 13 }}>{integrante.cargo}</p>
                  </div>
                  <div style={{ padding: 16, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                          <th style={{ padding: 10, textAlign: "left", fontSize: 12 }}>ACTIVIDAD</th>
                          <th style={{ padding: 10, textAlign: "center", fontSize: 12 }}>HORAS</th>
                          <th style={{ padding: 10, textAlign: "center", fontSize: 12 }}>PLANIF.</th>
                          <th style={{ padding: 10, textAlign: "center", fontSize: 12 }}>ELABOR.</th>
                          <th style={{ padding: 10, textAlign: "center", fontSize: 12 }}>OBSERVACIONES</th>
                          {modoEdicion && puedeEditar && <th style={{ padding: 10, textAlign: "center", fontSize: 12 }}>ACCIÓN</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {integrante.actividades?.map((act, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: 10, fontSize: 13 }}>{act.actividad || "-"}</td>
                            <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                              {modoEdicion && puedeEditar ? (
                                <input
                                  type="number"
                                  value={act.horas_persona || 0}
                                  onChange={(e) => actualizarActividadIntegrante(idx, i, 'horas_persona', e.target.value)}
                                  style={{ width: 50, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12 }}
                                />
                              ) : (
                                (act.horas_persona || 0) + "h"
                              )}
                            </td>
                            <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                              {modoEdicion && puedeEditar ? (
                                <input
                                  type="number"
                                  value={act.cantidad_planificada || 0}
                                  onChange={(e) => actualizarActividadIntegrante(idx, i, 'cantidad_planificada', e.target.value)}
                                  style={{ width: 50, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12 }}
                                />
                              ) : (
                                act.cantidad_planificada || 0
                              )}
                            </td>
                            <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                              {modoEdicion && puedeEditar ? (
                                <input
                                  type="number"
                                  value={act.cantidad_elaborada || 0}
                                  onChange={(e) => actualizarActividadIntegrante(idx, i, 'cantidad_elaborada', e.target.value)}
                                  style={{ width: 50, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12 }}
                                />
                              ) : (
                                act.cantidad_elaborada || 0
                              )}
                            </td>
                            <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                              {modoEdicion && puedeEditar ? (
                                <input
                                  type="text"
                                  value={act.observaciones_integrante || ''}
                                  onChange={(e) => actualizarActividadIntegrante(idx, i, 'observaciones_integrante', e.target.value)}
                                  style={{ width: 150, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12 }}
                                />
                              ) : (
                                act.observaciones_integrante || '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* INTEGRANTES */}
      <ArrayDisplay
        titulo="INTEGRANTES"
        datos="integrantes"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.integrantes || []) : (registro.integrantes || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["nombre", "cargo"]}
        renderItem={(n) => (
          <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{n.nombre}</span>
            <span style={{ color: "#6b7280" }}>—</span>
            <span style={{ color: "#4b5563" }}>{n.cargo}</span>
          </div>
        )}
      />

      {/* OBSERVACIONES */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>OBSERVACIONES</h3>
        <Campo label="" campo="observaciones" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.observaciones} onChange={handleChange} />
      </div>

      {/* ESTADO Y MOTIVO DE RECHAZO */}
      {registro.estado === "rechazado" && registro.motivo_rechazo && (
        <div style={{ ...cardStyle, background: "#fef2f2", border: "1px solid #fecaca" }}>
          <h3 style={{ ...sectionTitleStyle, color: "#991b1b", borderBottomColor: "#fecaca" }}>⚠️ INFORMACIÓN DE RECHAZO</h3>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "#991b1b", fontSize: 14 }}>Motivo del Rechazo:</div>
            <div style={{ padding: 12, background: "white", borderRadius: 8, color: "#7f1d1d", fontSize: 14 }}>{registro.motivo_rechazo}</div>
          </div>
          {registro.rechazado_por && (
            <div style={{ fontSize: 13, color: "#b91c1c" }}>Rechazado por: <strong>{registro.rechazado_por}</strong> - {new Date(registro.fecha_rechazo).toLocaleString()}</div>
          )}
        </div>
      )}
      
      {/* BOTONES DE ACCIÓN */}
      <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap", padding: 20, background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        {puedeEditar && !modoEdicion && (
          <button style={{ padding: "12px 24px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 15 }} onClick={() => setModoEdicion(true)}>
            ✏️ Editar Registro
          </button>
        )}
        {modoEdicion && puedeEditar && (
          <>
            <button style={{ padding: "12px 24px", background: "#16a34a", color: "white", border: "none", borderRadius: 8, cursor: guardando ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 15, opacity: guardando ? 0.7 : 1 }} onClick={guardarCambios} disabled={guardando}>
              {guardando ? "⏳ Guardando..." : "💾 Guardar Cambios"}
            </button>
            <button style={{ padding: "12px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 15 }} onClick={() => { setModoEdicion(false); setForm(registro); }}>
              ❌ Cancelar
            </button>
          </>
        )}
        {puedeEliminar && !modoEdicion && registro.estado === "pendiente_SUPERVISOR" && (
          <button style={{ padding: "12px 24px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 5 }} onClick={eliminarRegistro}>
            🗑️ Eliminar Registro
          </button>
        )}
        {puedeEliminar && !modoEdicion && registro.estado !== "pendiente_SUPERVISOR" && (
          <button style={{ padding: "12px 24px", background: "#9ca3af", color: "white", border: "none", borderRadius: 8, cursor: "not-allowed", fontWeight: 600, fontSize: 15, opacity: 0.6, display: "flex", alignItems: "center", gap: 5 }} disabled title="Solo se pueden eliminar registros en estado Pendiente">
            🗑️ Eliminar Registro
          </button>
        )}
        <button style={{ padding: "12px 24px", background: "#6b7280", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 15 }} onClick={() => navigate(getPanelRoute())}>
          ← Volver al Panel
        </button>
      </div>
    </div>
  );
}