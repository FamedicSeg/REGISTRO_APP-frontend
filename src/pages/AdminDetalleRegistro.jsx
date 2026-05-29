import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import logo_safemed from "../assets/logo_safemed.jpg";
import logo3 from "../assets/logo3.png";
import "../styles/detallesRegistro.css";

const Campo = ({ label, campo, type = "text", modoEdicion, puedeEditar, value, onChange }) => {
  const handleChange = (e) => {
    let valor = e.target.value;
    // Convertir a mayúsculas para ciertos campos
    if (campo === 'codigo_producto' || campo === 'responsable' || campo === 'supervisor' || 
    campo === 'cliente' || campo === 'lotePrincipal' || campo === 'loteSecundario' || 
    type === 'text' || type === 'textarea') {
      valor = valor.toUpperCase();
    }
    onChange(campo, valor);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 15 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>{label}</span>
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
            fontSize: 14,
            textTransform: "uppercase"
          }}
        />
      ) : (
        <div style={{ background: "#f3f4f6", padding: "8px 12px", borderRadius: 8, fontSize: 14, whiteSpace: "pre-wrap", textTransform: 'uppercase' }}>
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
      <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>{label}</span>
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

// Componente para item de array - CON AUTOMATIZACIÓN
const ArrayItem = ({ item, index, camposEditables, onUpdate, onDelete, modoEdicion, puedeEditar, listaInsumos = [] }) => {
  const [loadingDesc, setLoadingDesc] = useState(false);

  const handleChange = (campo, valor) => {
    let valorFinal = valor.toUpperCase();
    // Convertir a mayúsculas campos de texto
    if (campo === 'tipo_insumo' || campo === 'descripcion_insumo' || campo === 'lote_insumo' ||
        campo === 'entrega' || campo === 'recepcion' || campo === 'codigo_insumo' ||
        campo === 'descrip_cant_insumo' || campo === 'lote') {
      valorFinal = valor.toUpperCase();
    }
    onUpdate(index, campo, valorFinal);
  };

  const buscarDescripcion = async (codigo) => {
    if (!codigo || codigo.trim() === "") return;
    setLoadingDesc(true);
    try {
      const { data } = await api.get("/productos/detalle", {
        params: { codigo: codigo.trim() }
      });
      onUpdate(index, "descripcion_insumo", data?.descripcion?.toUpperCase() || "");
    } catch (error) {
      console.error("Error obteniendo descripción:", error);
    } finally {
      setLoadingDesc(false);
    }
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
            <label style={{ fontSize: 11, fontWeight: 600, color: "#000000", marginBottom: 4, display: "block" }}>
              {campo.replace(/_/g, ' ').toUpperCase()}
            </label>
            {modoEdicion && puedeEditar ? (
              campo === 'tipo_insumo' || campo === 'codigo_insumo' ? (
                <>
                  <input
                    list={`insumos-list-${index}`}
                    value={item[campo] !== undefined && item[campo] !== null ? item[campo] : ""}
                    onChange={(e) => handleChange(campo, e.target.value)}
                    onBlur={() => buscarDescripcion(item[campo])}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      width: "100%",
                      fontSize: 13,
                      textTransform: "uppercase"
                    }}
                    placeholder={`Ingresa ${campo}`}
                  />
                  <datalist id={`insumos-list-${index}`}>
                    <option value="">SELECCIONE UN INSUMO...</option>
                    {listaInsumos.map(insumo => (
                      <option key={insumo.codigo || insumo} value={insumo.codigo || insumo}>
                        {insumo.codigo || insumo} - {insumo.descripcion || ""}
                      </option>
                    ))}
                  </datalist>
                </>
              ) : (
                <input
                  value={item[campo] !== undefined && item[campo] !== null ? item[campo] : ""}
                  onChange={(e) => handleChange(campo, e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    width: "100%",
                    fontSize: 13,
                    textTransform: campo === 'descripcion_insumo' ? 'uppercase' : 'none'
                  }}
                  placeholder={`Ingresa ${campo}`}
                />
              )
            ) : (
              <div style={{
                padding: "6px 10px",
                background: "white",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                textTransform: 'uppercase'
              }}>
                {item[campo] !== undefined && item[campo] !== null ? item[campo] : "-"}
              </div>
            )}
            {loadingDesc && <span style={{ fontSize: 10, color: "#666" }}>Cargando...</span>}
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
  renderItem,
  backgroundColor = "#ffffff",
  listaInsumos = []
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
    background: backgroundColor,
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
              background: "#4B5563",
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
                listaInsumos={listaInsumos}
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
  const [listaInsumos, setListaInsumos] = useState([]);
  const [actividadesConHoras, _setActividadesConHoras] = useState([]);
  const [manualHorasPersona, setManualHorasPersona] = useState({});

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

  // Función para convertir decimal a HH:MM
  const decimalParaHorasMinutos = (decimal) => {
    if (isNaN(decimal) || decimal <= 0) return '';
    const horas = Math.floor(decimal);
    const minutos = Math.round((decimal - horas) * 60);
    if (minutos >= 60) return `${horas + 1}:00`;
    if (minutos === 0) return `${horas}:00`;
    return `${horas}:${minutos.toString().padStart(2, '0')}`;
  };

  // Función para cargar cantidad por hora de actividad
  const cargarCantidadPorHora = useCallback(async (actividad) => {
    if (!actividad) return null;
    try {
      const response = await api.get("/actividad/cantidadPorHora", {
        params: { actividad }
      });
      return response.data.cantidad_por_hora;
    } catch (error) {
      console.error("Error cargando cantidad base:", error);
      return null;
    }
  }, []);

  // Función para cargar insumos por producto
  const cargarInsumosPorProducto = useCallback(async (codigoProducto) => {
    if (!codigoProducto || codigoProducto.length < 3) {
      setListaInsumos([]);
      return;
    }
    try {
      const { data } = await api.get("/insumos/producto", {
        params: { codigo: codigoProducto },
      });
      let lista = [];
      if (data && Array.isArray(data.insumos)) {
        lista = data.insumos;
      } else if (Array.isArray(data)) {
        lista = data;
      }
      setListaInsumos(lista);
    } catch (error) {
      console.error("Error cargando insumos:", error);
      setListaInsumos([]);
    }
  }, []);

  const getPanelRoute = useCallback(() => {
    switch(rol) {
      case "SUPERVISOR": return "/supervisor";
      case "LÍDER": return "/lider";
      case "ANALISTA DE PRODUCCIÓN": return "/analista_produccion";
      case "JEFE DE PRODUCCIÓN": return "/jefe_produccion";
      default: return "/panel-rol";
    }
  }, [rol]);

  const puedeEditar = useMemo(() => rol === "LÍDER", [rol]);
  const puedeEliminar = useMemo(() => rol === "LÍDER" || rol === "JEFE DE PRODUCCIÓN", [rol]);
  const isSupervisor = rol === "SUPERVISOR";
  const estadoPendienteAnalista = registro?.estado === "pendiente_ANALISTA_PRODUCCION";
  const estadoAprobado = registro?.estado?.includes("aprobado");

  // Función para formatear texto a mayúsculas
  const formatearMayusculas = (texto) => {
    if (!texto) return texto;
    return texto.toUpperCase();
  };

  // Función para parsear arrays que vienen como JSON strings
  const parsearArrays = (datos) => {
    const datosLimpios = { ...datos };
    const camposArray = ['insumos', 'etiquetas', 'integrantes', 'reposicion_no_conforme', 'maquinarias'];

    camposArray.forEach(campo => {
      if (datosLimpios[campo]) {
        if (typeof datosLimpios[campo] === 'string') {
          try {
            datosLimpios[campo] = JSON.parse(datosLimpios[campo]);
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
            datosLimpios[campo] = [];
          }
        }
      } else {
        datosLimpios[campo] = [];
      }
    });

    // Manejar detalles_actividades
    if (datosLimpios.detalles_actividades) {
      if (typeof datosLimpios.detalles_actividades === 'string') {
        if (datosLimpios.detalles_actividades.startsWith('[') || datosLimpios.detalles_actividades.startsWith('{')) {
          try {
            const parsed = JSON.parse(datosLimpios.detalles_actividades);
            datosLimpios.detalles_actividades = Array.isArray(parsed) ? parsed : [parsed];
          } catch (error) {
            datosLimpios.detalles_actividades = datosLimpios.detalles_actividades
              .split('\n')
              .map(d => formatearMayusculas(d.trim()))
              .filter(d => d);
            console.error('Error parseando detalles_actividades:', error);
          }
        } else {
          datosLimpios.detalles_actividades = datosLimpios.detalles_actividades
            .split('\n')
            .map(d => formatearMayusculas(d.trim()))
            .filter(d => d);
        }
      } else if (Array.isArray(datosLimpios.detalles_actividades)) {
        datosLimpios.detalles_actividades = datosLimpios.detalles_actividades.map(d => 
          typeof d === 'string' ? formatearMayusculas(d.trim()) : d
        );
      }
    } else {
      datosLimpios.detalles_actividades = [];
    }

    // Manejar actividades_por_integrante
    if (datosLimpios.actividades_por_integrante) {
      if (typeof datosLimpios.actividades_por_integrante === 'string') {
        try {
          const parsed = JSON.parse(datosLimpios.actividades_por_integrante);
          datosLimpios.actividades_por_integrante = parsed;
        } catch (e) {
          console.error('Error parseando actividades_por_integrante:', e);
          datosLimpios.actividades_por_integrante = {};
        }
      }
      if (Array.isArray(datosLimpios.actividades_por_integrante)) {
        const obj = {};
        datosLimpios.actividades_por_integrante.forEach((item, idx) => {
          obj[idx] = item;
        });
        datosLimpios.actividades_por_integrante = obj;
      }
      if (typeof datosLimpios.actividades_por_integrante === 'object') {
        Object.keys(datosLimpios.actividades_por_integrante).forEach(key => {
          const integrante = datosLimpios.actividades_por_integrante[key];
          if (integrante) {
            if (integrante.nombre) integrante.nombre = formatearMayusculas(integrante.nombre);
            if (integrante.cargo) integrante.cargo = formatearMayusculas(integrante.cargo);
            if (!integrante.actividades) integrante.actividades = [];
            integrante.actividades = integrante.actividades.map(act => ({
              ...act,
              actividad: act.actividad ? formatearMayusculas(act.actividad) : act.actividad
            }));
          }
        });
      }
    } else {
      datosLimpios.actividades_por_integrante = {};
    }

    return datosLimpios;
  };

  useEffect(() => {
    const cargarRegistro = async () => {
      try {
        setCargando(true);
        const res = await api.get(`/registros/${id}`);
        const datosRegistro = res.data.registro || res.data;
        const datosParsados = parsearArrays(datosRegistro);
        setRegistro(datosParsados);
        setForm(JSON.parse(JSON.stringify(datosParsados)));
        if (datosParsados.codigo_producto) {
          await cargarInsumosPorProducto(datosParsados.codigo_producto);
        }
      } catch(error) {
        console.error("Error cargando registro:", error);
        alert("Error al cargar el registro");
      } finally {
        setCargando(false);
      }
    };
    cargarRegistro();
  }, [id, cargarInsumosPorProducto]);

  useEffect(() => {
    if (modoInicial && !puedeEditar && registro) {
      alert("No tienes permisos para editar este registro");
      navigate(`/admin/registros/${id}`);
    }
  }, [modoInicial, puedeEditar, registro, id, navigate]);

  // Cargar insumos cuando cambia el código de producto
  useEffect(() => {
    if (form.codigo_producto) {
      cargarInsumosPorProducto(form.codigo_producto);
    }
  }, [form.codigo_producto, cargarInsumosPorProducto]);

  const handleChange = useCallback((campo, valor) => {
    setForm(prev => {
      const nuevoForm = { ...prev, [campo]: valor };
      if (campo === 'lotePrincipal' || campo === 'loteSecundario') {
        nuevoForm.loteUnido = (nuevoForm.lotePrincipal || "") + (nuevoForm.loteSecundario || "");
      }
      return nuevoForm;
    });
  }, []);

  const handleArrayChange = useCallback((campo, nuevoArray) => {
    setForm(prev => ({ ...prev, [campo]: nuevoArray }));
  }, []);

  const handleActividadesPorIntegranteChange = useCallback((nuevoValor) => {
    setForm(prev => ({ ...prev, actividades_por_integrante: nuevoValor }));
  }, []);

  const validarArray = useCallback((arr) => {
    if (!arr) return [];
    if (typeof arr === 'string') {
      try {
        const parsed = JSON.parse(arr);
        return Array.isArray(parsed) ? parsed.map(item => ({
          ...item,
          id: item.id || Date.now() + Math.random()
        })) : [];
      } catch (e) {
        console.error('Error parseando array:', e);
        return [];
      }
    }
    return Array.isArray(arr) ? arr.map(item => ({
      ...item,
      id: item.id || Date.now() + Math.random()
    })) : [];
  }, []);

  const prepararDatosParaEnvio = useCallback((estadoFinal) => {
    const estadoAEnviar = estadoFinal ?? (registro.estado === "rechazado" ? "pendiente_SUPERVISOR" : registro.estado);
    
    let detallesParaEnviar = form.detalles_actividades;
    if (!detallesParaEnviar) detallesParaEnviar = [];
    if (!Array.isArray(detallesParaEnviar)) {
      if (typeof detallesParaEnviar === 'string') {
        try {
          detallesParaEnviar = JSON.parse(detallesParaEnviar);
        } catch {
          detallesParaEnviar = [detallesParaEnviar];
        }
      } else {
        detallesParaEnviar = [];
      }
    }
    detallesParaEnviar = JSON.stringify(detallesParaEnviar);
    
    let actividadesParaEnviar = form.actividades_por_integrante;
    if (typeof actividadesParaEnviar === 'object') {
      actividadesParaEnviar = JSON.stringify(actividadesParaEnviar);
    }

    return {
      ...registro,
      ...form,
      rol: user.rol,
      nombre: user.nombre,
      estado: estadoAEnviar,
      insumos: validarArray(form.insumos),
      etiquetas: validarArray(form.etiquetas),
      integrantes: validarArray(form.integrantes),
      reposicion_no_conforme: validarArray(form.reposicion_no_conforme),
      maquinarias: validarArray(form.maquinarias),
      detalles_actividades: detallesParaEnviar,
      actividades_por_integrante: actividadesParaEnviar,
      observaciones: form.observaciones
    };
  }, [form, registro, user.rol, user.nombre, validarArray]);

  const actualizarEstadoRegistro = async (nuevoEstado, confirmMessage) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    try {
      setGuardando(true);
      const datosAEnviar = prepararDatosParaEnvio(nuevoEstado);
      const response = await api.put(`/registros/${id}`, datosAEnviar);
      if (response.status === 200) {
        const datosActualizados = response.data.registro || response.data;
        const datosParsados = parsearArrays(datosActualizados);
        setRegistro(datosParsados);
        setForm(JSON.parse(JSON.stringify(datosParsados)));
        alert(`Registro actualizado a ${nuevoEstado}`);
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Error al actualizar el estado");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarRegistro = async () => {
    const confirmar = window.confirm("⚠️ ¿Está seguro que desea eliminar este registro?\n\nEsta acción no se puede deshacer.");
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
      alert("Error al eliminar el registro");
    } finally {
      setGuardando(false);
    }
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);
      const datosAEnviar = prepararDatosParaEnvio();
      const response = await api.put(`/registros/${id}`, datosAEnviar);
      if (response.status === 200) {
        const datosActualizados = response.data.registro || response.data;
        const datosParsados = parsearArrays(datosActualizados);
        setRegistro(datosParsados);
        setForm(JSON.parse(JSON.stringify(datosParsados)));
        setModoEdicion(false);
        alert("Registro actualizado correctamente");
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      alert("Error al guardar cambios");
    } finally {
      setGuardando(false);
    }
  };

  const actualizarDetalleActividad = (index, nuevoValor) => {
    const nuevosDetalles = [...(form.detalles_actividades || [])];
    nuevosDetalles[index] = nuevoValor.toUpperCase();
    handleArrayChange("detalles_actividades", nuevosDetalles);
  };

  const agregarNuevaActividad = () => {
    const nuevosDetalles = [...(form.detalles_actividades || []), ""];
    handleArrayChange("detalles_actividades", nuevosDetalles);
  };

  const eliminarDetalleActividad = (index) => {
    const nuevosDetalles = (form.detalles_actividades || []).filter((_, i) => i !== index);
    handleArrayChange("detalles_actividades", nuevosDetalles);
  };

  const cardStyle = useMemo(() => ({
    padding: 24,
    borderRadius: 12,
    marginBottom: 25,
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
    <div className="registro-container" style={{ padding: 30, maxWidth: 1400, margin: "0 auto" }}>
      <header>
        <div className="logo-left">
          <img src={logo_safemed} alt="logo" className="logo" />
        </div>
        <h1>REGISTRO DE CONFECCIÓN O AUTOMÁTICAS - EMPAQUE Y CONTROL DE ACTIVIDADES</h1>
        <div className="logo-right">
          <img src={logo3} alt="logo2" className="logo" />
        </div>
      </header>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: "2px solid #e5e7eb",
        backgroundColor: "#e9ecf2"
      }}>
        <div>
          <h2 style={{ margin: 0, color: "black", fontSize: 28 }}>Registro #{registro.op}</h2>
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
      </header>

      {/* INFO GENERAL */}
      <div className="card" style={cardStyle}>
        <div className="grid4">
          <Campo label="Fecha" campo="fecha" type="date" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.fecha} onChange={handleChange} />
          <Campo label="OP" campo="op" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.op} onChange={handleChange} />
          <SelectField label="Turno" campo="turno" options={turnoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.turno} onChange={handleChange} />
          <SelectField label="Área" campo="area" options={areaOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.area} onChange={handleChange} />
          <SelectField label="Módulo" campo="modulo" options={moduloOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.modulo} onChange={handleChange} />
        </div>
        <div className="cabecera2">
          <div className="grid2">
            <Campo label="Responsable" campo="responsable" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.responsable} onChange={handleChange} />
            <Campo label="Supervisor" campo="supervisor" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.supervisor} onChange={handleChange} />
          </div>
        </div>  
        <div className="cabecera2">
          <div className="grid3">
            <Campo label="Personal Asignado" campo="personal_asignado" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.personal_asignado} onChange={handleChange} />
            <Campo label="Personal Otro" campo="personal_otro" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.personal_otro} onChange={handleChange} />
            <Campo label="Personal Presente" campo="personal_presente" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.personal_presente} onChange={handleChange} />
          </div>
        </div>
        <div className="cabecera2">
          <div className="grid6">
            <Campo label="Referencia" campo="codigo_producto" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.codigo_producto} onChange={handleChange} />
            <Campo label="Descripción" campo="descripcion" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.descripcion} onChange={handleChange} />
            <Campo label="Hora Planificada" campo="hora_planificada" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.hora_planificada} onChange={handleChange} />
            <Campo label="Cantidad Planificada" campo="cantidad_planificada" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_planificada} onChange={handleChange} />
            <Campo label="Lote Primario" campo="lotePrincipal" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.lotePrincipal} onChange={handleChange} />
            <Campo label="N°" campo="loteSecundario" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.loteSecundario} onChange={handleChange} />
          </div>
        </div>
        {!modoEdicion && (
          <div style={{ marginTop: 15, padding: 10, background: "#e9ecef", borderRadius: 8, display: "inline-block" }}>
            <strong>Lote:</strong> {registro.loteUnido || "-"}
          </div>
        )}
      </div>

      {/* INSUMOS */}
      <div className="subtitle2">
        <h3>ENTREGA Y RECEPCIÓN DE MATERIA PRIMA E INSUMOS</h3>
      </div>
      <ArrayDisplay
        titulo="Insumos"
        datos="insumos"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.insumos || []) : (registro.insumos || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["tipo_insumo", "descripcion_insumo", "cantidad_insumo", "lote_insumo", "entrega", "recepcion"]}
        backgroundColor="#3498db"
        listaInsumos={listaInsumos}
        renderItem={(i) => (
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 5, textTransform: "uppercase" }}>{i.tipo_insumo} — {i.descripcion_insumo}</div>
            <div style={{ fontSize: 12, color: "#000000", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              <span>Cantidad: {i.cantidad_insumo}</span>
              <span>Lote: {i.lote_insumo}</span>
              <span>Entrega: {i.entrega}</span>
              <span>Recepción: {i.recepcion}</span>
            </div>
          </div>
        )}
      />

      {/* REPOSICIÓN NO CONFORME */}
      <div className="subtitle2">
        <h3>REPOSICIÓN NO CONFORME</h3>
      </div>
      <ArrayDisplay
        titulo="Reposiciones"
        datos="reposicion_no_conforme"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.reposicion_no_conforme || []) : (registro.reposicion_no_conforme || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["codigo_insumo", "descripcion_insumo", "cantidad", "descrip_cant_insumo", "lote", "entrega", "recepcion"]}
        backgroundColor="#3498db"
        listaInsumos={listaInsumos}
        renderItem={(i) => (
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 5, textTransform: "uppercase" }}>{i.codigo_insumo} — {i.descripcion_insumo}</div>
            <div style={{ fontSize: 12, color: "#000000", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              <span>Cantidad: {i.cantidad} {i.descrip_cant_insumo}</span>
              <span>Lote: {i.lote}</span>
              <span>Entrega: {i.entrega}</span>
              <span>Recepción: {i.recepcion}</span>
            </div>
          </div>
        )}
      />

      {/* ETIQUETAS */}
      <div className="subtitle2">
        <h3>ENTREGA Y RECEPCIÓN DE ETIQUETAS EN MESA</h3>
      </div>
      <ArrayDisplay
        titulo="Etiquetas"
        datos="etiquetas"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.etiquetas || []) : (registro.etiquetas || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["descripcion_etiqueta", "cantidad_etiqueta", "entrega_etiqueta", "recepcion_etiqueta"]}
        backgroundColor="#3498db"
        renderItem={(e) => (
          <div style={{ fontSize: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 5, textTransform: "uppercase" }}>{e.descripcion_etiqueta}</div>
            <div style={{ fontSize: 12, color: "#000000", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <span>Cantidad: {e.cantidad_etiqueta}</span>
              <span>Entrega: {e.entrega_etiqueta}</span>
              <span>Recepción: {e.recepcion_etiqueta}</span>
            </div>
          </div>
        )}
      />

      {/* DOS COLUMNAS: CANTIDAD PRODUCTO Y CONFECCIÓN Y AUTOMÁTICAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        
        {/* COLUMNA DERECHA - CONFECCIÓN Y AUTOMÁTICAS */}
        <div>
          <div className="subtitle2" style={{ marginBottom: "10px" }}>
            <h3>CONFECCIÓN Y AUTOMÁTICAS</h3>
          </div>
          <div className="card" style={{ padding: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Campo label="H. INICIO" campo="hora_inicio" type="time" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.hora_inicio} onChange={handleChange} />
                <Campo label="H. FIN" campo="hora_fin" type="time" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.hora_fin} onChange={handleChange} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <SelectField label="PARA" campo="destino" options={destinoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.destino} onChange={handleChange} />
                {form.destino === "CLIENTE" && (
                  <Campo label="N. CLIENTE" campo="cliente" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cliente} onChange={handleChange} />
                )}
                {form.destino !== "CLIENTE" && <div></div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <SelectField label="ESTÉRIL" campo="esteril" options={siNoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.esteril} onChange={handleChange} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <SelectField label="LEYENDA" campo="leyenda" options={siNoOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.leyenda} onChange={handleChange} />
                {form.leyenda === "SÍ" && (
                  <SelectField label="TIPO LEYENDA" campo="leyenda_si" options={leyendaOptions} modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.leyenda_si} onChange={handleChange} />
                )}
                {form.leyenda !== "SÍ" && <div></div>}
              </div>

              {form.leyenda_si === "OTRA" && (
                <Campo label="DESCRIPCIÓN LEYENDA" campo="leyenda_otra" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.leyenda_otra} onChange={handleChange} />
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA IZQUIERDA - CANTIDAD PRODUCTO */}
        <div>
          <div className="subtitle2" style={{ marginBottom: "10px"}}>
            <h3>CANTIDAD PRODUCTO</h3>
          </div>
          <div className="card" style={{ padding: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <Campo label="ELABORADO" campo="cantidad_elaborado" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_elaborado} onChange={handleChange} />
              <Campo label="PROCESO" campo="cantidad_proceso" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_proceso} onChange={handleChange} />
              <Campo label="MERMA" campo="cantidad_merma" type="number" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.cantidad_merma} onChange={handleChange} />
              <Campo label="FECHA FINAL DE PRODUCTO TERMINADO" campo="fecha_final_producto" type="date" modoEdicion={modoEdicion} puedeEditar={puedeEditar} value={form.fecha_final_producto} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* MAQUINARIA */}
      <div className="subtitle2">
        <h3>MAQUINARIAS</h3>
      </div>
      <div className="card" style={cardStyle}>
        {(() => {
          const maqList = modoEdicion ? (form.maquinarias || []) : (registro.maquinarias || []);
          
          const actualizarMaquinaria = (index, campo, valor) => {
            const nuevos = [...maqList];
            nuevos[index] = { ...nuevos[index], [campo]: campo === 'maquinaria' ? valor.toUpperCase() : valor };
            handleArrayChange("maquinarias", nuevos);
          };

          const eliminarMaquinaria = (index) => {
            const nuevos = maqList.filter((_, i) => i !== index);
            handleArrayChange("maquinarias", nuevos);
          };

          const agregarMaquinaria = () => {
            const nuevos = [...maqList, { id: Date.now(), maquinaria: "", cantidad_maquinaria: "", numero_maquinaria: [] }];
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
                  <button onClick={agregarMaquinaria} style={{ marginTop: 12, padding: "6px 12px", background: "#4B5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
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
                  <button onClick={agregarMaquinaria} style={{ padding: "8px 16px", background: "#4B5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
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
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>MAQUINARIA</span>
                      {modoEdicion && puedeEditar ? (
                        <input type="text" value={m.maquinaria || ""} onChange={(e) => actualizarMaquinaria(i, "maquinaria", e.target.value)} style={{ marginTop: 4, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", width: "100%", fontSize: 14, textTransform: "uppercase" }} placeholder="Ej: Máquina de coser" />
                      ) : (
                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500, textTransform: "uppercase" }}>{m.maquinaria || "-"}</div>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>CANTIDAD</span>
                      {modoEdicion && puedeEditar ? (
                        <input type="number" min="0" value={m.cantidad_maquinaria || ""} onChange={(e) => actualizarMaquinaria(i, "cantidad_maquinaria", e.target.value)} style={{ marginTop: 4, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", width: "100%", fontSize: 14 }} placeholder="Ej: 5" />
                      ) : (
                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>{m.cantidad_maquinaria || "-"}</div>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#000000" }}>N° MÁQUINAS</span>
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
      <div className="subtitle2" style={{ marginTop: 30 }}>
        <h3>DETALLES DE ACTIVIDADES</h3>
      </div>
      <div className="card" style={cardStyle}>
        {(() => {
          let detalles = modoEdicion ? form.detalles_actividades : registro.detalles_actividades;
          
          if (!detalles || (typeof detalles === 'object' && Object.keys(detalles).length === 0)) {
            detalles = [];
          }
          
          if (!Array.isArray(detalles)) {
            if (typeof detalles === 'object') {
              detalles = Object.values(detalles);
            } else {
              detalles = [];
            }
          }

          detalles = detalles.map(d => typeof d === 'string' ? d : String(d || ''));

          if (detalles.length === 0) {
            return (
              <div style={{ marginTop: 12, textAlign: "center", padding: 20, background: "#f9fafb", borderRadius: 8 }}>
                <p style={{ color: "#6b7280", margin: 0 }}>No hay detalles de actividades registrados</p>
                {modoEdicion && puedeEditar && (
                  <button onClick={agregarNuevaActividad} style={{ marginTop: 12, padding: "6px 12px", background: "#4B5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                    + Agregar Actividad
                  </button>
                )}
              </div>
            );
          }

          return (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              {modoEdicion && puedeEditar && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button onClick={agregarNuevaActividad} style={{ padding: "8px 16px", background: "#4B5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 18 }}>+</span> Agregar Actividad
                  </button>
                </div>
              )}
              {detalles.map((detalle, idx) => {
                const actividadesPorIntegrante = modoEdicion ? form.actividades_por_integrante : registro.actividades_por_integrante;
                let actividades = {};
                
                if (typeof actividadesPorIntegrante === 'string') {
                  try {
                    actividades = JSON.parse(actividadesPorIntegrante);
                  } catch {
                    actividades = {};
                  }
                } else if (typeof actividadesPorIntegrante === 'object') {
                  actividades = actividadesPorIntegrante;
                }

                const textoDetalle = String(detalle).trim();
                const integrantesConActividad = Object.values(actividades || {}).filter(integrante => 
                  integrante?.actividades?.some(act => String(act.actividad || '').trim() === textoDetalle)
                );

                const totalPlanificado = integrantesConActividad.reduce((sum, integrante) => {
                  const actividadEnIntegrante = integrante.actividades.find(act => String(act.actividad || '').trim() === textoDetalle);
                  const valor = parseFloat(actividadEnIntegrante?.cantidad_planificada);
                  return sum + (isNaN(valor) ? 0 : valor);
                }, 0);

                const totalElaborado = integrantesConActividad.reduce((sum, integrante) => {
                  const actividadEnIntegrante = integrante.actividades.find(act => String(act.actividad || '').trim() === textoDetalle);
                  const valor = parseFloat(actividadEnIntegrante?.cantidad_elaborada);
                  return sum + (isNaN(valor) ? 0 : valor);
                }, 0);

                return (
                  <div key={idx} style={{ padding: "16px", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "1px solid #7dd3fc", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.04)", position: "relative" }}>
                    {modoEdicion && puedeEditar && (
                      <button onClick={() => eliminarDetalleActividad(idx)} style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", border: "none", color: "white", cursor: "pointer", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }} title="Eliminar actividad">✕</button>
                    )}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                      <div style={{ minWidth: 28, height: 28, background: "#0284c7", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 12, flexShrink: 0 }}>{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        {modoEdicion && puedeEditar ? (
                          <input type="text" value={detalle} onChange={(e) => actualizarDetalleActividad(idx, e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 15, fontWeight: 600, color: "#0c4a6e", textTransform: "uppercase" }} placeholder="EJ: CORTADO DE MANGAS" />
                        ) : (
                          <div style={{ fontSize: 15, color: "#0c4a6e", fontWeight: 600, wordBreak: "break-word", textTransform: "uppercase" }}>{detalle}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingLeft: 40, fontSize: 13 }}>
                      <div style={{ background: "#dbeafe", padding: "8px 12px", borderRadius: 6, border: "1px solid #93c5fd" }}><span style={{ color: "#1e40af", fontWeight: 600 }}>Planificada:</span> <span style={{ color: "#0c4a6e" }}>{totalPlanificado > 0 ? totalPlanificado : "-"}</span></div>
                      <div style={{ background: "#dbeafe", padding: "8px 12px", borderRadius: 6, border: "1px solid #93c5fd" }}><span style={{ color: "#1e40af", fontWeight: 600 }}>Elaborada:</span> <span style={{ color: "#0c4a6e" }}>{totalElaborado > 0 ? totalElaborado : "-"}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ACTIVIDADES POR INTEGRANTE */}
      <div className="subtitle2" style={{ marginBottom: "10px" }}>
        <h3>DETALLES DE ACTIVIDADES POR INTEGRANTE</h3>
      </div>
      <div className="card" style={cardStyle}>
        {(() => {
          let rawData = modoEdicion ? form.actividades_por_integrante : registro.actividades_por_integrante;
          
          if (typeof rawData === 'string') {
            try {
              rawData = JSON.parse(rawData);
            } catch (error) {
              console.log('Error parseando actividades_por_integrante:', error);
              rawData = {};
            }
          }
          
          if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
            rawData = {};
          }
          
          const listaIntegrantes = Object.values(rawData).filter(i => i && i.nombre);
          
          const actualizarActividad = async (integranteKey, actividadIndex, campo, valor) => {
            const nuevaData = JSON.parse(JSON.stringify(rawData));
            const integrante = nuevaData[integranteKey];
            if (integrante && integrante.actividades && integrante.actividades[actividadIndex]) {
              let valorFormateado = valor;
              if (campo === 'actividad') {
                valorFormateado = valor.toUpperCase();
              } else if (campo === 'cantidad_planificada') {
                // Calcular horas automáticamente
                const actividad = integrante.actividades[actividadIndex].actividad;
                if (actividad && valor) {
                  const cantidadBase = await cargarCantidadPorHora(actividad);
                  const esManual = manualHorasPersona[`${integranteKey}_${actividadIndex}`];
                  if (!esManual && cantidadBase) {
                    const decimal = parseFloat(valor) / cantidadBase;
                    const horasCalculadas = decimalParaHorasMinutos(decimal);
                    if (horasCalculadas) {
                      integrante.actividades[actividadIndex]['horas_persona'] = horasCalculadas;
                    }
                  }
                }
              }
              integrante.actividades[actividadIndex][campo] = valorFormateado;
              handleActividadesPorIntegranteChange(nuevaData);
            }
          };
          
          const agregarActividadAIntegrante = (integranteKey) => {
            const nuevaData = JSON.parse(JSON.stringify(rawData));
            if (!nuevaData[integranteKey].actividades) {
              nuevaData[integranteKey].actividades = [];
            }
            nuevaData[integranteKey].actividades.push({
              actividad: "",
              horas_persona: "",
              cantidad_planificada: "",
              cantidad_elaborada: "",
              observaciones_integrante: ""
            });
            handleActividadesPorIntegranteChange(nuevaData);
          };
          
          const eliminarActividad = (integranteKey, actividadIndex) => {
            const nuevaData = JSON.parse(JSON.stringify(rawData));
            nuevaData[integranteKey].actividades = nuevaData[integranteKey].actividades.filter((_, i) => i !== actividadIndex);
            handleActividadesPorIntegranteChange(nuevaData);
          };
          
          const actualizarNombreActividad = (integranteKey, actividadIndex, nuevoNombre) => {
            const nuevaData = JSON.parse(JSON.stringify(rawData));
            if (nuevaData[integranteKey]?.actividades?.[actividadIndex]) {
              nuevaData[integranteKey].actividades[actividadIndex].actividad = nuevoNombre.toUpperCase();
              handleActividadesPorIntegranteChange(nuevaData);
            }
          };
          
          if (listaIntegrantes.length === 0) {
            return (
              <div style={{ marginTop: 25, textAlign: "center", padding: 20, background: "#f9fafb", borderRadius: 8 }}>
                <p style={{ color: "#6b7280", margin: 0 }}>No hay actividades registradas por integrante</p>
                {modoEdicion && puedeEditar && (
                  <button onClick={() => { const nuevasActividades = { ...rawData }; const nuevoKey = Date.now(); nuevasActividades[nuevoKey] = { nombre: "NUEVO INTEGRANTE", cargo: "", actividades: [] }; handleActividadesPorIntegranteChange(nuevasActividades); }} style={{ marginTop: 12, padding: "6px 12px", background: "#4B5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>+ Agregar Integrante</button>
                )}
              </div>
            );
          }
          
          return (
            <div style={{ marginTop: 25, display: "flex", flexDirection: "column", gap: 16 }}>
              {modoEdicion && puedeEditar && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button onClick={() => { const nuevasActividades = { ...rawData }; const nuevoKey = Date.now(); nuevasActividades[nuevoKey] = { nombre: "NUEVO INTEGRANTE", cargo: "", actividades: [] }; handleActividadesPorIntegranteChange(nuevasActividades); }} style={{ padding: "8px 16px", background: "#4B5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 18 }}>+</span> Agregar Integrante</button>
                </div>
              )}
              
              {listaIntegrantes.map((integrante) => {
                const integranteKey = Object.keys(rawData).find(key => rawData[key] === integrante);
                
                const actualizarNombreIntegrante = (nuevoNombre) => {
                  const nuevaData = JSON.parse(JSON.stringify(rawData));
                  nuevaData[integranteKey].nombre = nuevoNombre.toUpperCase();
                  handleActividadesPorIntegranteChange(nuevaData);
                };
                
                const actualizarCargoIntegrante = (nuevoCargo) => {
                  const nuevaData = JSON.parse(JSON.stringify(rawData));
                  nuevaData[integranteKey].cargo = nuevoCargo.toUpperCase();
                  handleActividadesPorIntegranteChange(nuevaData);
                };
                
                const eliminarIntegrante = () => {
                  const nuevaData = JSON.parse(JSON.stringify(rawData));
                  delete nuevaData[integranteKey];
                  handleActividadesPorIntegranteChange(nuevaData);
                };
                
                return (
                  <div key={integranteKey} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative" }}>
                    {modoEdicion && puedeEditar && (
                      <button onClick={eliminarIntegrante} style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", border: "none", color: "white", cursor: "pointer", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, fontSize: 12 }} title="Eliminar integrante">✕</button>
                    )}
                    <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", padding: "12px 20px", color: "white" }}>
                      {modoEdicion && puedeEditar ? (
                        <>
                          <input type="text" value={integrante.nombre || ""} onChange={(e) => actualizarNombreIntegrante(e.target.value.toUpperCase())} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "none", fontSize: 16, fontWeight: 600, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.9)", color: "#1e3a5f", textTransform: "uppercase" }} placeholder="NOMBRE DEL INTEGRANTE" />
                          <input type="text" value={integrante.cargo || ""} onChange={(e) => actualizarCargoIntegrante(e.target.value.toUpperCase())} style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "none", fontSize: 13, backgroundColor: "rgba(255,255,255,0.7)", color: "#1e3a5f", textTransform: "uppercase" }} placeholder="CARGO" />
                        </>
                      ) : (
                        <>
                          <h4 style={{ margin: 0, fontSize: 16, textTransform: "uppercase" }}>{integrante.nombre}</h4>
                          <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 13, textTransform: "uppercase" }}>{integrante.cargo}</p>
                        </>
                      )}
                    </div>
                    <div style={{ padding: 16, overflowX: "auto" }}>
                      {modoEdicion && puedeEditar && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                          <button onClick={() => agregarActividadAIntegrante(integranteKey)} style={{ padding: "4px 12px", background: "#4B5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 14 }}>+</span> Agregar Actividad</button>
                        </div>
                      )}
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
                          {integrante.actividades?.map((act, actIdx) => {
                            const esManual = manualHorasPersona[`${integranteKey}_${actIdx}`];
                            const tieneDatosExcel = actividadesConHoras.find(a => a.actividad === act.actividad)?.cantidad_base;
                            const estaBloqueado = !esManual && act.cantidad_planificada && tieneDatosExcel;
                            
                            return (
                              <tr key={actIdx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: 10, fontSize: 13 }}>
                                  {modoEdicion && puedeEditar ? (
                                    <select value={act.actividad || ""} onChange={(e) => actualizarNombreActividad(integranteKey, actIdx, e.target.value.toUpperCase())} style={{ width: "100%", padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12 }}>
                                      <option value="">SELECCIONE...</option>
                                      {Array.isArray(form.detalles_actividades) && form.detalles_actividades.map((detalle, idx) => (
                                        <option key={idx} value={detalle}>{detalle}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span style={{ textTransform: "uppercase" }}>{act.actividad || "-"}</span>
                                  )}
                                </td>
                                <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                                  {modoEdicion && puedeEditar ? (
                                    <input type="text" value={act.horas_persona || ""} placeholder="HH:MM" readOnly={estaBloqueado} onChange={(e) => { actualizarActividad(integranteKey, actIdx, 'horas_persona', e.target.value); setManualHorasPersona(prev => ({ ...prev, [`${integranteKey}_${actIdx}`]: true })); }} style={{ width: 70, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12, textAlign: "center", backgroundColor: estaBloqueado ? "#e9ecef" : "white", cursor: estaBloqueado ? "not-allowed" : "text" }} />
                                  ) : (
                                    (act.horas_persona || "") + "hrs"
                                  )}
                                </td>
                                <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                                  {modoEdicion && puedeEditar ? (
                                    <input type="number" value={act.cantidad_planificada || ""} onChange={(e) => actualizarActividad(integranteKey, actIdx, 'cantidad_planificada', e.target.value)} style={{ width: 70, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12, textAlign: "center" }} />
                                  ) : (
                                    act.cantidad_planificada || ""
                                  )}
                                </td>
                                <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                                  {modoEdicion && puedeEditar ? (
                                    <input type="number" value={act.cantidad_elaborada || ""} onChange={(e) => actualizarActividad(integranteKey, actIdx, 'cantidad_elaborada', e.target.value)} style={{ width: 70, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12, textAlign: "center" }} />
                                  ) : (
                                    act.cantidad_elaborada || ""
                                  )}
                                </td>
                                <td style={{ padding: 10, textAlign: "center", fontSize: 13 }}>
                                  {modoEdicion && puedeEditar ? (
                                    <input type="text" value={act.observaciones_integrante || ''} onChange={(e) => actualizarActividad(integranteKey, actIdx, 'observaciones_integrante', e.target.value.toUpperCase())} style={{ width: 150, padding: "4px 6px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: 12, textTransform: "uppercase" }} />
                                  ) : (
                                    act.observaciones_integrante || '-'
                                  )}
                                </td>
                                {modoEdicion && puedeEditar && (
                                  <td style={{ padding: 10, textAlign: "center" }}>
                                    <button onClick={() => eliminarActividad(integranteKey, actIdx)} style={{ background: "#ef4444", border: "none", color: "white", cursor: "pointer", width: 24, height: 24, borderRadius: "50%", fontSize: 12 }} title="Eliminar actividad">✕</button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          {(!integrante.actividades || integrante.actividades.length === 0) && (
                            <tr>
                              <td colSpan={modoEdicion && puedeEditar ? 6 : 5} style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>No hay actividades asignadas</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* INTEGRANTES (lista simple) */}
      <div className="subtitle2" style={{ marginTop: 30 }}>
        <h3>INTEGRANTES</h3>
      </div>
      <ArrayDisplay
        titulo="Lista de Integrantes"
        datos="integrantes"
        modoEdicion={modoEdicion}
        puedeEditar={puedeEditar}
        items={modoEdicion ? (form.integrantes || []) : (registro.integrantes || [])}
        onItemsChange={handleArrayChange}
        camposEditables={["nombre", "cargo"]}
        backgroundColor="#1790d1"
        renderItem={(n) => (
          <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{n.nombre}</span>
            <span style={{ color: "#6b7280" }}>—</span>
            <span style={{ color: "#4b5563", textTransform: "uppercase" }}>{n.cargo}</span>
          </div>
        )}
      />

      {/* OBSERVACIONES */}
      <div className="subtitle2" style={{ marginTop: 30 }}>
        <h3>OBSERVACIONES</h3>
      </div>
      <div className="card" style={cardStyle}>
        < textarea
          value={form.observaciones || ""}
          onChange={(e) => handleChange("observaciones", e.target.value.toUpperCase())} // ✅ .toUpperCase()
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            width: "100%",
            fontSize: 14,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            textTransform: "uppercase"
          }}/>
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
        {estadoAprobado ? (
          <button className="btn" style={{ padding: "12px 24px", fontWeight: 600, fontSize: 15 }} onClick={() => navigate(getPanelRoute())}>Ver</button>
        ) : (
          <>
            {puedeEditar && !modoEdicion && (registro?.estado === "pendiente_SUPERVISOR" || registro?.estado === "rechazado") && (
              <button className="btn2" style={{ padding: "12px 24px", fontWeight: 600, fontSize: 15 }} onClick={() => setModoEdicion(true)}>✏️ Editar Registro</button>
            )}
            
            {puedeEditar && !modoEdicion && registro?.estado !== "pendiente_SUPERVISOR" && registro?.estado !== "rechazado" && (
              <button className="btn2" style={{ padding: "12px 24px", fontWeight: 600, fontSize: 15, background: "#9ca3af", cursor: "not-allowed", opacity: 0.6 }} disabled title="Solo se pueden editar registros en estado Pendiente Supervisor o Rechazado">✏️ Editar Registro</button>
            )}

            {modoEdicion && puedeEditar && (
              <>
                <button className="btn-guardar2" style={{ padding: "12px 24px", cursor: guardando ? "not-allowed" : "pointer", opacity: guardando ? 0.7 : 1 }} onClick={guardarCambios} disabled={guardando}>{guardando ? "⏳ Guardando..." : "💾 Guardar Cambios"}</button>
                <button className="btn" style={{ padding: "12px 24px", background: "#ef4444" }} onClick={() => { setModoEdicion(false); setForm(JSON.parse(JSON.stringify(registro))); }}>❌ Cancelar</button>
              </>
            )}

            {isSupervisor && !modoEdicion && (
              <>
                <button className="btn" style={{ padding: "12px 24px", background: "#10b981", display: "flex", alignItems: "center", gap: 5, cursor: estadoPendienteAnalista || guardando ? "not-allowed" : "pointer", opacity: estadoPendienteAnalista || guardando ? 0.6 : 1 }} onClick={() => actualizarEstadoRegistro("pendiente_ANALISTA_PRODUCCION")} disabled={estadoPendienteAnalista || guardando}>✅ Verificar</button>
                <button className="btn" style={{ padding: "12px 24px", background: "#ef4444", display: "flex", alignItems: "center", gap: 5, cursor: estadoPendienteAnalista || guardando ? "not-allowed" : "pointer", opacity: estadoPendienteAnalista || guardando ? 0.6 : 1 }} onClick={() => actualizarEstadoRegistro("rechazado")} disabled={estadoPendienteAnalista || guardando}>❌ Rechazar</button>
              </>
            )}

            {puedeEliminar && !modoEdicion && registro.estado === "pendiente_SUPERVISOR" && (
              <button className="btn" style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 5 }} onClick={eliminarRegistro}>🗑️ Eliminar Registro</button>
            )}
            {puedeEliminar && !modoEdicion && registro.estado !== "pendiente_SUPERVISOR" && (
              <button className="btn" style={{ padding: "12px 24px", opacity: 0.6, display: "flex", alignItems: "center", gap: 5 }} disabled title="Solo se pueden eliminar registros en estado Pendiente">🗑️ Eliminar Registro</button>
            )}
            <button className="btn3" style={{ padding: "12px 24px", fontWeight: 600, fontSize: 15 }} onClick={() => navigate(getPanelRoute())}>← Volver al Panel</button>
          </>
        )}
      </div>
    </div>
  );
}