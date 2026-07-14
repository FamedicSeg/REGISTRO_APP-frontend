import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api";
import "../styles/registro.css";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import logo_safemed from "../assets/logo_safemed.jpg";
import logo3 from "../assets/logo3.png";
//import html2canvas from "html2canvas";
//import jsPDF from "jspdf";
import { toUpperCase, shouldUpperCase } from "../utils/textUtils";

const MODULO_TO_HOJA ={
    "MODULO 1":"MODULO 1",
    "MODULO 2":"MODULO 2",
    "MODULO 3":"MODULO 3",
    "MODULO 4":"MODULO 4",
    "MODULO 6":"MODULO 6",
    "MODULO 7":"MODULO 7",
    "MODULO 8":"MODULO 8",
    "MODULO 10":"MODULO 10",
    "VARIOS 1":"VARIOS 1",
    "VARIOS 2":"VARIOS 2",
    "ESTAMPADO":"ESTAMPADO",
    "BOTAS SIMPLES":"BOTAS SIMPLES",
    "SPA":"SPA",
    "MASCARILLAS":"MASCARILLAS",
    "GPA":"GPA",
    "SELLADO":"SELLADO",
    "CORTE": "CORTE",
    "METBLOWN":"METBLOWN"
  }

export default function Registro() {
  const nav = useNavigate();

  const INITIAL_FORM = {
    fecha: "",
    responsable: "",
    supervisor:"",
    op: "",
    turno: "",
    modulo: "",
    codigo_producto: "",
    descripcion: "",
    area:"",
    confeccion:"",
    automatica:"",
    personal_asignado:"",
    personal_presente:"",
    personal_otro:"",
    cliente: "",
    lotePrincipal: "",
    loteSecundario: "",

    // Materia prima e insumos
    insumos:"",
    codigo_insumo:"",
    descripcion_insumo:"",
    cantidad_insumo:"",
    descrip_cant_insumo:"",
    lote_insumo:"",
    entrega:"",
    recepcion:"",

    // Recepción No Conforme
    reposicion_no_conforme:"",
    codigo_insumo_no_conforme:"",
    descripcion_insumo_no_conforme:"",
    cantidad_insumo_no_conforme:"",
    descrip_cant_insumo_no_conforme:"",
    entrega_insumo_no_conforme:"",
    recepcion_insumo_no_conforme:"",

    // Etiquetas
    descripcion_etiqueta: "",
    cantidad_etiqueta: "",
    lote_etiqueta: "", 
    entrega_etiqueta:"",
    recepcion_etiqueta:"",

    // Cantidad Producto
    cantidad_elaborado:"",
    cantidad_proceso:"",
    cantidad_merma:"",

    // Confección
    hora_inicio: "",
    hora_fin: "",
    destino: "",
    n_cliente: "",
    esteril: "",
    talla: "",
    leyenda: "",
    leyenda_si:"",
    leyenda_otra:"",
    tipo: "",
    descripcion_lyda: "",
    cantidad_planificada: "",
    referencia: "",
    descripcion_referencia: "",
    fecha_final_producto: "",

    // Textareas
    detalles_actividades: "",
    cantidad_elaborada_detalles:"",
    
    // Maquinarias
    maquinaria:"",
    cantidad_maquinaria:"",
    numero_maquinaria:"",

    // Integrantes
    nombre:"",
    cargo:"",
    cargoOtro:"",

    //OBSERVACIONES
    observaciones:"",
    aprobaciones: false,
    uno: false,
    dos: false,
    tres: false,
    
    // Nuevo campo para actividades por integrante
    actividades_por_integrante: "{}",
    actividades_detalle: "[]",
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [msg, setMsg] = useState("");
  const [_loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ops, setOps] = useState([]);
  const [integrantes, setIntegrantes] = useState([{ nombre: "", cargo: "" },]);
  const [etiquetas, setEtiqueta] = useState([{ descripcion_etiqueta:"", cantidad_etiqueta:"", observacion_etiqueta: "", entrega_etiqueta:"", recepcion_etiqueta:""},]);
  const [insumos, setInsumos] = useState([{ id: Date.now(), codigo_insumo:"", descripcion_insumo:"", cantidad_insumo:"", descrip_cant_insumo:"", lote_insumo:"", entrega:"", recepcion:""},]);
  const [reposicionNoConforme, setReposicionNoConforme] = useState([]);
  const [maquinarias, setMaquinarias] = useState([{maquinaria:"", cantidad_maquinaria:"", numero_maquinaria:[]}]);
  const [loadingNoConforme, setLoadingNoConforme] = useState(false);
  const [_listaNoConforme, setListaNoConforme] = useState([]);
  const [_listaInsumos, setListaInsumos] = useState([]);
  const [loadingInsumos, setLoadingInsumos] = useState(false);
  const [_cargandoDescripciones, setCargandoDescripciones] = useState(false);
  const [_listaSupervisores, setListaSupervisores] = useState([]);
  const [_listaLideres, setListaLideres] = useState([]);
  const [_listaIntegrantes, setListaIntegrantes] = useState([]);
  const [_loadingPersonal, setLoadingPersonal] = useState(false);
  const [lideresFilterados, setLideresFilterados] = useState([]);
  const [cantidadesActividades, setCantidadesActividades] = useState({});
  const [actividadesIntegrantes, setActividadesIntegrantes] = useState({});
  const [nuevoDetalleActividad, setNuevoDetalleActividad] = useState("");
  const [actividadesConHoras, setActividadesConHoras] = useState([]);
  const [_cantidadBaseProducto, setCantidadBaseProducto] = useState("0");
  const [_cargandoBase, setCargandoBase] = useState(false);
  const [_manualCantidadPlanificada, setManualCantidadPlanificada] = useState(false);
  const [manualHorasPersona, setManualHorasPersona] = useState({});
  
  // NUEVOS ESTADOS PARA EQE
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState({});
  const [mostrarCheckboxes, setMostrarCheckboxes] = useState(false);
  const [listaActividadesEQE, setListaActividadesEQE] = useState([]);
  const [actividadesGlobalesEQE, setActividadesGlobalesEQE] = useState([]);
  const [_productosEQECargados, setProductosEQECargados] = useState(new Set());

  // ========== TEMPORIZADOR OCULTO PARA JEFE_PRODUCCION ==========
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(null);
  const [mostrarTiempoOculto, setMostrarTiempoOculto] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [tiempoFinal, setTiempoFinal] = useState(null);
  // ================================================================

  // Función para calcular cantidad_proceso automáticamente
  const calcularProceso = useCallback((planificada, elaborada) => {
    const plan = Number(planificada) || 0;
    const elab = Number(elaborada) || 0;
    
    if (plan >= elab) {
      return (plan - elab).toString();
    }
    return "0";
  }, []);

  const calcularHorasTrabajadas = (inicio, fin) =>{
    if(!inicio || !fin) return "0";

    const [horaInicio, minInicio] = inicio.split(':').map(Number);
    const [horaFin, minFin] = fin.split(':').map(Number);

    const minutosInicio = horaInicio * 60 + minInicio;
    const minutosFin = horaFin * 60 + minFin;

    let diferenciaMinutos = minutosFin - minutosInicio;

    if(diferenciaMinutos < 0){
      diferenciaMinutos += 24*60;
    }

    const horasDecimal = diferenciaMinutos / 60;
    
    const horasEspeciales = [14, 15, 16, 17, 18, 19, 20];
    if (horasEspeciales.includes(horaFin) && minFin === 30) {
      return Math.floor(horasDecimal).toString();
    }
    
    return horasDecimal.toFixed(2);
  }

  // ========== FUNCIONES DEL TEMPORIZADOR ==========
  const verificarRolJefeProduccion = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.rol || user.role || user.userRol;
      const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      const sessionRole = sessionUser.rol || sessionUser.role;
      const esJefe = userRole === 'JEFE_PRODUCCION' || userRole === 'JEFE DE PRODUCCIÓN' ||
                     sessionRole === 'JEFE_PRODUCCION' || sessionRole === 'JEFE DE PRODUCCIÓN';
      return esJefe;
    } catch (error) {
      console.error("Error verificando rol:", error);
      return false;
    }
  }, []);

  const iniciarTemporizador = useCallback(() => {
    if (tiempoInicio) return;
    
    const inicio = new Date();
    setTiempoInicio(inicio);
    
    const id = setInterval(() => {
      const ahora = new Date();
      const diffMs = ahora - inicio;
      const diffMin = Math.floor(diffMs / 60000);
      const diffSeg = Math.floor((diffMs % 60000) / 1000);
      const horas = Math.floor(diffMin / 60);
      const minutos = diffMin % 60;
      
      let tiempoTexto = "";
      if (horas > 0) {
        tiempoTexto = `${horas}h ${minutos}m ${diffSeg}s`;
      } else if (minutos > 0) {
        tiempoTexto = `${minutos}m ${diffSeg}s`;
      } else {
        tiempoTexto = `${diffSeg}s`;
      }
      
      setTiempoTranscurrido(tiempoTexto);
      
      if (verificarRolJefeProduccion() && diffMin > 0 && diffMin % 30 === 0 && diffSeg < 5) {
        console.log(`⏱️ [JEFE_PRODUCCION] Tiempo de creación: ${tiempoTexto}`);
      }
    }, 1000);
    
    setIntervalId(id);
  }, [tiempoInicio, verificarRolJefeProduccion]);

  const detenerTemporizador = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    if (tiempoInicio && !tiempoFinal) {
      const fin = new Date();
      setTiempoFinal(fin);
      const diffMs = fin - tiempoInicio;
      const diffMin = Math.floor(diffMs / 60000);
      const diffSeg = Math.floor((diffMs % 60000) / 1000);
      const tiempoTotal = `${diffMin} minutos y ${diffSeg} segundos`;
      
      window.tiempoRegistroActual = {
        inicio: tiempoInicio,
        fin: fin,
        totalMs: diffMs,
        totalTexto: tiempoTotal
      };
      
      if (verificarRolJefeProduccion()) {
        console.log(`✅ Registro completado en: ${tiempoTotal}`);
      }
    }
  }, [intervalId, tiempoInicio, tiempoFinal, verificarRolJefeProduccion]);

  const reiniciarTemporizador = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTiempoInicio(null);
    setTiempoTranscurrido(null);
    setTiempoFinal(null);
    window.tiempoRegistroActual = null;
  }, [intervalId]);

  // Efecto para verificar rol al cargar el componente
  useEffect(() => {
    const esJefe = verificarRolJefeProduccion();
    setMostrarTiempoOculto(esJefe);
    if (esJefe) {
      console.log('👑 Modo JEFE_PRODUCCION activado - Temporizador oculto disponible');
    }
  }, [verificarRolJefeProduccion]);

  // Efecto para iniciar temporizador cuando el LÍDER empieza a trabajar
  useEffect(() => {
    const liderActivo = form.modulo && form.responsable && form.codigo_producto;
    
    if (liderActivo && !tiempoInicio) {
      iniciarTemporizador();
    }
    
    if (!form.modulo || !form.responsable) {
      if (tiempoInicio || intervalId) {
        reiniciarTemporizador();
      }
    }
  }, [form.modulo, form.responsable, form.codigo_producto, tiempoInicio, intervalId, iniciarTemporizador, reiniciarTemporizador]);

  // Limpiar intervalo al desmontar el componente
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  // ========== FIN FUNCIONES DEL TEMPORIZADOR ==========

  // Fecha actual por defecto
  useEffect(() => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    setForm((p) => ({ ...p, fecha: `${yyyy}-${mm}-${dd}` }));
  }, []);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    
    let valorFinal = value;
    if (type === 'text' || type === 'textarea' || type === 'select-one') {
      if (shouldUpperCase(name)) {
        valorFinal = toUpperCase(value);
      }
    }
    
    setForm((prev) => {
      const newForm = { ...prev, [name]: valorFinal };

      if (name === "codigo_producto") {
        newForm.hora_inicio = "";
        newForm.hora_fin = "";
        newForm.hora_planificada = "0";
        newForm.cantidad_planificada = "0";
        setManualCantidadPlanificada(false);
        setManualHorasPersona({});
        setActividadesSeleccionadas({});
        
        // COMENTADO: condición especial EQE - ahora todos los productos usan el flujo normal
        /*
        const esEQE = valorFinal.toUpperCase().startsWith("EQE");
        if (!esEQE) {
          setActividadesGlobalesEQE([]);
          setProductosEQECargados(new Set());
          setListaActividadesEQE([]);
        }
        */
        setActividadesGlobalesEQE([]);
        setProductosEQECargados(new Set());
        setListaActividadesEQE([]);
      }

      if (name === "cantidad_planificada") {
        setManualCantidadPlanificada(true);
      }

      if (name === "hora_inicio" || name === "hora_fin") {
        const inicio = name === "hora_inicio" ? valorFinal : prev.hora_inicio;
        const fin = name === "hora_fin" ? valorFinal : prev.hora_fin;
  
        const horasTrabajadas = calcularHorasTrabajadas(inicio, fin);
        newForm.hora_planificada = horasTrabajadas;
      }
      
      if (name === "cantidad_planificada" || name === "cantidad_elaborado") {
        const planificada = name === "cantidad_planificada" ? valorFinal : prev.cantidad_planificada;
        const elaborada = name === "cantidad_elaborado" ? valorFinal : prev.cantidad_elaborada;
        
        newForm.cantidad_proceso = calcularProceso(planificada, elaborada);
      }
      
      return newForm;
    });
  };

  useEffect(() => {
    const codigo_producto = form.codigo_producto?.trim() || "";
    
    if (!codigo_producto || codigo_producto.length < 3) {
      setListaInsumos([]);
      setInsumos([]);
      setListaNoConforme([]);
      return;
    }

    const cargarInsumos = async () => {
      setLoadingInsumos(true);
      setLoadingNoConforme(true);
      try {
        const { data } = await api.get("/insumos/producto", {
          params: { codigo: codigo_producto },
        });
        let lista = [];
        if (data && Array.isArray(data.insumos)) {
          lista = data.insumos;
        } else if (Array.isArray(data)) {
          lista = data;
        }
        setListaInsumos(lista);
        
        const nuevosInsumos = lista.map((insumo, index) => ({
          id: Date.now() + index,
          tipo_insumo: insumo.codigo || insumo,
          descripcion_insumo: insumo.descripcion || "",
          cantidad_insumo: insumo.cantidad || "",
          descrip_cant_insumo : insumo.unidad_medida || "", 
          lote_insumo: "",
          entrega: "",
          recepcion: "",
          rechazo: insumo.rechazo || 0,
        }));
        setInsumos(nuevosInsumos);
        const opciones = lista.map((insumo) => ({
          codigo: insumo.codigo || insumo,
          descripcion: insumo.descripcion || "",
        }));
        setListaNoConforme(opciones);
      } catch (err) {
        console.error("Error cargando insumos:", err);
        setListaInsumos([]);
        setInsumos([]);
        setListaNoConforme([]);
      } finally {
        setLoadingInsumos(false);
        setLoadingNoConforme(false);
      }
    };
    const timeoutId = setTimeout(cargarInsumos, 400);
    return () => clearTimeout(timeoutId);
  }, [form.codigo_producto]);

  // useEffect modificado para cargar actividades
useEffect(() => {
  const codigo_producto = form.codigo_producto?.trim() || "";

  if (!codigo_producto || codigo_producto.length < 3) {
    setForm(prev => ({
      ...prev,
      detalles_actividades: "",
    }));
    setMostrarCheckboxes(false);
    setListaActividadesEQE([]);
    setActividadesSeleccionadas({});
    return;
  }

  
  // COMENTADO: condición especial EQE con checkboxes - EQE-075 y EQE-045 ahora cargan sus propias actividades como cualquier otro producto
  /*
  const esEQE = codigo_producto.toUpperCase().startsWith("EQE");
  setMostrarCheckboxes(esEQE);
  
  if (esEQE) {
    setListaActividadesEQE([]);
    setActividadesSeleccionadas({});
    setForm(prev => ({
      ...prev,
      detalles_actividades: "",
    }));
    
    const cargarActividadesMaestras = async () => {
      try {
        const codigoMaestro = "EQE-075";
        const resProcesos = await api.get("/procesos/producto", {
          params: { codigo: codigoMaestro },
        });
        
        let actividadesMaestras = [];
        
        if (resProcesos.data && resProcesos.data.detalles) {
          actividadesMaestras = resProcesos.data.detalles
            .split('\n')
            .filter(act => act.trim() !== '')
            .map(act => act.trim());
        }
        
        setListaActividadesEQE(actividadesMaestras);
        
        const nuevasSelecciones = {};
        actividadesMaestras.forEach(act => {
          nuevasSelecciones[act] = false;
        });
        setActividadesSeleccionadas(nuevasSelecciones);
        
        setActividadesIntegrantes({});
        
      } catch (err) {
        console.error("Error cargando actividades maestras:", err);
        setListaActividadesEQE([]);
        setActividadesSeleccionadas({});
      }
    };
    
    cargarActividadesMaestras();
    
  } else {
  */
    setListaActividadesEQE([]);
    setActividadesSeleccionadas({});
    
    const cargarActividadesNormales = async () => {
      try {
        const resProcesos = await api.get("/procesos/producto", {
          params: { codigo: codigo_producto },
        });
        
        if (resProcesos.data && resProcesos.data.detalles) {
          const actividadesTexto = resProcesos.data.detalles;
          setForm(prev => ({
            ...prev,
            detalles_actividades: actividadesTexto,
          }));
        } else {
          setForm(prev => ({
            ...prev,
            detalles_actividades: "",
          }));
        }
        setActividadesIntegrantes({});
      } catch (err) {
        console.error("Error cargando procesos del producto:", err);
        setForm(prev => ({
          ...prev,
          detalles_actividades: "",
        }));
      }
    };

    cargarActividadesNormales();
  // } // fin else comentado
  
}, [form.codigo_producto]);


  // Función para toggle de actividad seleccionada (para EQE)
  const toggleActividad = (actividad) => {
    setActividadesSeleccionadas(prev => ({
      ...prev,
      [actividad]: !prev[actividad]
    }));
  };

  
  // Función para obtener las actividades seleccionadas como texto
  const _getActividadesSeleccionadasTexto = () => {
    return Object.keys(actividadesSeleccionadas)
      .filter(act => actividadesSeleccionadas[act])
      .join('\n');
  };
  
  const _cargarDescripcionInsumo = async (index, codigo_insumo) => {
    if (!codigo_insumo || codigo_insumo.trim() === "") return;
    
    try {
      const { data } = await api.get("/insumos/detalle", {
        params: { codigo: codigo_insumo.trim() }
      });
      
      let descripcion = "";
      if (typeof data === 'string') {
        descripcion = data;
      } else if (typeof data === 'object') {
        descripcion = data.descripcion || data.descripcion_insumo || "Sin descripción";
      }
      
      setReposicionNoConforme(prev => 
        prev.map((item, i) => 
          i === index ? { ...item, descripcion_insumo: descripcion } : item
        )
      );
      
    } catch (error) {
      console.error("Error cargando descripción:", error);
    }
  };
  
  const cargarDescripcionInsumoNoConforme = async (index, codigo_insumo) => {
    if (!codigo_insumo || codigo_insumo.trim() === "") return;

    try {
      const { data } = await api.get("/productos/detalle", {
        params: { codigo: codigo_insumo.trim() },
      });

      const descripcion = data?.descripcion || "Sin descripción";

      setReposicionNoConforme((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, descripcion_insumo: descripcion } : item
        )
      );
    } catch (error) {
      console.error("Error cargando descripción:", error);

      setReposicionNoConforme((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, descripcion_insumo: "Sin descripción" } : item
        )
      );
    }
  };

  const cargarDescripcionLoteInsumo = async (index, codigo_insumo) => {
    if (!codigo_insumo || codigo_insumo.trim() === "") {
      actualizarInsumo(index, "lote_insumo", "");
      return;
    }
  
    const codigoLimpio = codigo_insumo.trim();
    const isCodigoNoAplica = /^(CF|BCD|FPQ)/i.test(codigoLimpio);

    setCargandoDescripciones(prev => ({...prev, [index]: true}));

    if (isCodigoNoAplica) {
      actualizarInsumo(index, "lote_insumo", "NO APLICA");
      setCargandoDescripciones(prev => ({...prev, [index]: false}));
      return;
    }
  
    try {
      const { data } = await api.get("/insumos/lote", {
        params: { codigo: codigoLimpio },
      });
      
      if (data.error) {
        actualizarInsumo(index, "lote_insumo", `Error: ${data.error}`);
        return;
      }
    
      let lote = "";
    
      if (typeof data === 'string') {
        lote = data;
      } else if (typeof data === 'object') {
        lote = data.lote || "Sin lote disponible";
      }
    
      actualizarInsumo(index, "lote_insumo", lote);

    } catch (err) {
      console.error(`Error cargando lotes para ${codigo_insumo}:`, err);
    
      if (err.response) {
        const { status, data } = err.response;
        switch (status) {
          case 400:
            actualizarInsumo(index, "lote_insumo", "Error: Código inválido");
            break;
          case 404:
            actualizarInsumo(index, "lote_insumo", "Insumo no encontrado en sistema");
            break;
          case 500:
            actualizarInsumo(index, "lote_insumo", "Lote no encontrado en la BD");
            break;
          default:
            actualizarInsumo(index, "lote_insumo", `Error ${status}: ${data?.error || 'Desconocido'}`);
        }
      } else if (err.request) {
        actualizarInsumo(index, "lote_insumo", "Error de conexión");
      } else {
        actualizarInsumo(index, "lote_insumo", "Error desconocido");
      }
    } finally {
      setCargandoDescripciones(prev => ({...prev, [index]: false}));
    }
  };
        
  const agregarIntegrante = () => {
    const nuevoIntegrante = {
      id: Date.now(), 
      nombre: "",
      cargo: "COSTURERA/O" 
    };
    setIntegrantes((prev) => [...prev, nuevoIntegrante]);
  };

  const agregarInsumo = () =>{
    const nuevoInsumo = {
      tipo_insumo:"",
      descripcion_insumo:"",
      cantidad_insumo:"",
      descrip_cant_insumo:"",
      lote_insumo:"",
      entrega:"",
      recepcion:""
    };
    setInsumos((prev) => [...prev, nuevoInsumo]);
  }

  const buscarDescripcionInsumo = async(codigo, index) =>{
    try{
      if(!codigo || !codigo.trim()) return;
      const {data} = await api.get("/productos/detalle",{
        params: {codigo: codigo.trim()}
      });
      setInsumos((prev) => {
        const copia = [...prev];
        copia[index].descripcion_insumo = data?.descripcion || "";
        return copia;
      });
    }catch (error){
      console.error("Error obteniendo descripción del insumo:", error);
      setInsumos((prev)=>{
        const copia = [...prev]
        copia[index].descripcion_insumo="";
        return copia
      });
    }
  };

  const agregarEtiqueta = () =>{
    setEtiqueta((prev) => [...prev, {id: uuidv4(), descripcion:"", cantidad:"", observacion: "", entrega:"", recepcion:""}]);
  };
  
  const agregarMaquinaria = () => {
    setMaquinarias((prev)=>[...prev,{maquinaria:"", cantidad_maquinaria:"", numero_maquinaria:[]}]);
  }

  const agregarDetalleActividad = () => {
    if (nuevoDetalleActividad.trim()) {
      const actividadEnMayusculas = nuevoDetalleActividad.trim().toUpperCase();
      setForm(prev => ({
        ...prev,
        detalles_actividades: prev.detalles_actividades 
          ? prev.detalles_actividades + '\n' + actividadEnMayusculas
          : actividadEnMayusculas
      }));
      setNuevoDetalleActividad('');
    }
  };

  const eliminarDetalleActividad = (index) => {
    setForm(prev => {
      const detalles = prev.detalles_actividades.split('\n').filter(d => d.trim());
      detalles.splice(index, 1);
      return {
        ...prev,
        detalles_actividades: detalles.join('\n')
      };
    });
  };

  const actualizarEtiqueta = (index, campo, valor) => {
    const valorFinal = (campo === 'descripcion_etiqueta' || campo === 'entrega_etiqueta' || campo === 'recepcion_etiqueta') 
      ? valor.toUpperCase() 
      : valor;
      
    setEtiqueta((prev)=>
      prev.map((i,idx)=>
        idx === index ? {...i, [campo]: valorFinal}:i
      )
    ); 
  };

  const actualizarEntregaEtiqueta = (index,campo,valor)=>{
    const valorFinal = shouldUpperCase(campo) ? toUpperCase(valor) : valor;
      
    setEtiqueta((prev)=>
      prev.map((i,idx)=>
        idx === index ? {...i, [campo]: valorFinal}:i
      )
    ); 
  };

  const actualizarMaquinaria = (index, campo, valor)=>{
    const valorFinal = shouldUpperCase(campo) ? toUpperCase(valor) : valor;

    setMaquinarias((prev)=>
      prev.map((item, idx)=> {
        if(idx !== index) return item;
        if (campo === 'cantidad_maquinaria'){
          const cantidad = Math.max(0, Number(valor) || 0);
          return {
            ...item,
            cantidad_maquinaria: valor,
            numero_maquinaria: Array.from(
              {length: cantidad },
              (_,i) => item.numero_maquinaria?.[i] || ""
            )
          };
        }
        return {
        ...item,
        [campo]: valorFinal
      };
      })
    )
  };

  const actualizarNumeroMaquinaria = (indexMaquinaria, indexNumero, valor) =>{
    setMaquinarias((prev)=>
      prev.map((item, idx)=>{
        if(idx !== indexMaquinaria) return item;
        const nuevosNumeros = [...item.numero_maquinaria];
        nuevosNumeros[indexNumero] = valor;

        return {
          ...item,
          numero_maquinaria: nuevosNumeros
        };
      })
    );
  };
 
  const agregarNoConforme = () => {
    setReposicionNoConforme(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        codigo_insumo: "", 
        descripcion_insumo: "", 
        cantidad: "", 
        descrip_cant_insumo:"",
        lote: "", 
        entrega: "", 
        recepcion: "" 
      }
    ]);
  };

  const actualizarInsumo = (index, campo, valor) => {
    setInsumos(prev => {
      let valorFinal = valor;
      if (shouldUpperCase(campo)) {
        valorFinal = toUpperCase(valor);
      }
      
      const nuevosInsumos = prev.map((item, i) => 
        i === index ? { ...item, [campo]: valorFinal } : item
      );
      
      if (campo === "tipo_insumo" || campo === "codigo_insumo") {
        setTimeout(() => {
          cargarDescripcionInsumoNoConforme(index, valorFinal);
          cargarDescripcionLoteInsumo(index, valorFinal);
        }, 300);
      }
      
      return nuevosInsumos;
    });
  };

  const actualizarReposicionNoConforme = (index, campo, valor) => {
    setReposicionNoConforme((prev) => {
      let valorFinal = valor;

      if (
        campo === "codigo_insumo" ||
        campo === "descripcion_insumo" ||
        campo === "lote" ||
        campo === "entrega"
      ) {
        valorFinal = String(valor || "").toUpperCase();
      }

      const nuevoNoConforme = prev.map((item, i) =>
        i === index ? { ...item, [campo]: valorFinal } : item
      );

      if (campo === "codigo_insumo" && String(valorFinal).trim() !== "") {
        setTimeout(() => {
          cargarDescripcionInsumoNoConforme(index, valorFinal);
        }, 300);
      }

      return nuevoNoConforme;
    });
  };

  const eliminarIntegrante = (index) => {
    setIntegrantes((prev) => prev.filter((_, idx) => idx !== index));
    
    setActividadesIntegrantes(prev => {
      const nuevasActividades = {};
      
      Object.keys(prev).forEach(key => {
        const keyNum = parseInt(key.replace('integrante_', ''));
        if (keyNum < index) {
          nuevasActividades[`integrante_${keyNum}`] = prev[key];
        } else if (keyNum > index) {
          nuevasActividades[`integrante_${keyNum - 1}`] = prev[key];
        }
      });
      
      return nuevasActividades;
    });
    
    setManualHorasPersona(prev => {
      const nuevosFlags = {};
      
      Object.keys(prev).forEach(key => {
        const [integranteIdx, actividadIdx] = key.split('_').map(Number);
        if (integranteIdx < index) {
          nuevosFlags[`${integranteIdx}_${actividadIdx}`] = prev[key];
        } else if (integranteIdx > index) {
          nuevosFlags[`${integranteIdx - 1}_${actividadIdx}`] = prev[key];
        }
      });
      
      return nuevosFlags;
    });
  };

  const eliminarEtiqueta = (index) => {
    setEtiqueta((prev) => prev.filter((_,idx) => idx !== index));
  };

  const eliminarMaquinaria = (index) => {
    setMaquinarias((prev) => prev.filter((_,idx)=>idx != index));
  }

  const eliminarInsumo = (index) => {
    setInsumos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const eliminarNoConforme = (index) => {
    setReposicionNoConforme((prev) => prev.filter((_, idx) => idx !== index));
  }
  
  const actualizarCargoIntegrante = (integranteIndex, nuevoCargo) => {
    const nuevosIntegrantes = [...integrantes];
    nuevosIntegrantes[integranteIndex] = {
      ...nuevosIntegrantes[integranteIndex],
      cargo: nuevoCargo.toUpperCase()
    };
    const cargoOtro = nuevoCargo === "OTRO"
      ? integrantes[integranteIndex].cargoOtro || ""
      : "";
    nuevosIntegrantes[integranteIndex] = {
      ...nuevosIntegrantes[integranteIndex],
      cargo: nuevoCargo,
      cargoOtro: cargoOtro
    }

    setIntegrantes(nuevosIntegrantes);
  
    setActividadesIntegrantes(prev => {
      const key = `integrante_${integranteIndex}`;
      if (prev[key]) {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            cargo: nuevoCargo === "OTRO" ? cargoOtro : nuevoCargo
          }
        };
      }
      return prev;
    });
  };

  const actualizarActividadIntegrante = (integranteIndex, actividadIndex, campo, valor) => {
    const valorFinal = campo === 'actividad' ? valor.toUpperCase() : valor;
    
    setActividadesIntegrantes(prev => {
      const key = `integrante_${integranteIndex}`;
      const integranteActual = prev[key] || {
        nombre: integrantes[integranteIndex]?.nombre || "",
        cargo: integrantes[integranteIndex]?.cargo || "",
        actividades: []
      };
      
      const actividadesPrevias = integranteActual.actividades || [];
      const nuevasActividades = [...actividadesPrevias];
      
      if (!nuevasActividades[actividadIndex]) {
        nuevasActividades[actividadIndex] = { 
          actividad: "", 
          cantidad_planificada: "", 
          cantidad_elaborada: "",
          observaciones_integrante: "" 
        };
      }
      
      nuevasActividades[actividadIndex][campo] = valorFinal;
      
      const nuevoEstado = {
        ...prev,
        [key]: {
          nombre: integrantes[integranteIndex]?.nombre || "",
          cargo: integrantes[integranteIndex]?.cargo || "",
          actividades: nuevasActividades
        }
      };
      
      return nuevoEstado;
    });
  };

  const _recalcularTotalesElaborados = useCallback((actividadesState) => {
    const nuevosTotales = { ...cantidadesActividades };
    
    form.detalles_actividades.split('\n')
      .filter(act => act.trim() !== '')
      .forEach((actividad, index) => {
        const totalElaborado = Object.values(actividadesState)
          .filter(integrante => integrante.actividades)
          .reduce((sum, integrante) => {
            const actividadEncontrada = integrante.actividades.find(
              a => a.actividad === actividad.trim()
            );
            return sum + (parseInt(actividadEncontrada?.cantidad_elaborada) || 0);
          }, 0);
        
        if (totalElaborado > 0) {
          nuevosTotales[`elaborada_${index}`] = totalElaborado.toString();
        }
      });
    
    setCantidadesActividades(nuevosTotales);
  }, [form.detalles_actividades, cantidadesActividades]);

  const agregarActividadAIntegrante = (integranteIndex) => {
    setActividadesIntegrantes(prev => {
      const key = `integrante_${integranteIndex}`;
      const integranteActual = prev[key] || {
        nombre: integrantes[integranteIndex]?.nombre || "",
        cargo: integrantes[integranteIndex]?.cargo || "",
        actividades: []
      };
      
      const actividadesPrevias = integranteActual.actividades || [];
      
      const nuevoEstado = {
        ...prev,
        [key]: {
          ...integranteActual,
          actividades: [
            ...actividadesPrevias, 
            { actividad: "", cantidad_planificada: "", cantidad_elaborada: "", observaciones_integrante: "" }
          ]
        }
      };
      
      return nuevoEstado;
    });
  };

  const eliminarActividadDeIntegrante = (integranteIndex, actividadIndex) => {
    setActividadesIntegrantes(prev => {
      const key = `integrante_${integranteIndex}`;
      const integranteActual = prev[key];

      if (!integranteActual) return prev;

      const actividadesPrevias = integranteActual.actividades || [];
      
      const nuevoEstado = {
        ...prev,
        [key]: {
          ...integranteActual,
          actividades: actividadesPrevias.filter((_, idx) => idx !== actividadIndex)
        }
      };
      
      return nuevoEstado;
    });
    
    setManualHorasPersona(prev => ({
      ...prev,
      [`${integranteIndex}_${actividadIndex}`]: false
    }));
  };
 
  useEffect(() => {
    api.get("/op/lista")
      .then(res => {
        const opsArray = res.data.hojas 
          ? Object.values(res.data.hojas).flatMap(hoja => 
              hoja.datos?.flatMap(d => 
                Object.values(d.valores || {}).map(col => col?.valor).filter(v => v !== undefined && v !== null && v !== "")
              ) || []
            )
          : [];
        setOps(opsArray);
      })
      .catch(err => console.error("No se pudo cargar OP", err));
  }, []);

  useEffect(() => {
    const codigo = form.codigo_producto?.trim();

    if (!codigo || codigo.length < 3) {
      setForm((p) => ({ ...p, descripcion: "" }));
      return;
    }

    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/productos/detalle", {
          params: { codigo },
        });

        setForm((p) => ({
          ...p,
          descripcion: data.descripcion || "",
        }));
      } catch (err) {
        console.error("Error obteniendo descripción:", err.response?.data || err.message);
        setForm((p) => ({
          ...p,
          descripcion: "",
        }));
      }
    }, 400);

    return () => clearTimeout(t);
  }, [form.codigo_producto]);

  useEffect(() => {
    const codigo = form.codigo_producto?.trim();

    if (!codigo || codigo.length < 3) {
      setForm((p) => ({ ...p, lotePrincipal: "" }));
      return;
    }

    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/lote/info", {
          params: { codigo },
        });

        if (data && data.loteInfo !== undefined) {
          setForm((p) => ({
            ...p,
            lotePrincipal: String(data.loteInfo).trim(),
          }));
        } else {
          setForm((p) => ({
            ...p,
            lotePrincipal: "",
          }));
        }
      } catch (err) {
        console.error("Error obteniendo lote info:", err);
        setForm((p) => ({
          ...p,
          lotePrincipal: "",
        }));
      }
    }, 400);

    return () => clearTimeout(t);
  }, [form.codigo_producto]);

  const handleActualizar = async () => {
    setRefreshing(true);

    // Guardar snapshot de todo lo que el usuario ya llenó
    const snapForm = { ...form };
    const snapIntegrantes = integrantes.map(i => ({ ...i }));
    const snapMaquinarias = maquinarias.map(m => ({ ...m, numero_maquinaria: [...(m.numero_maquinaria || [])] }));
    const snapEtiquetas = etiquetas.map(e => ({ ...e }));
    let snapInsumos = insumos.map(i => ({ ...i }));
    const snapReposicion = reposicionNoConforme.map(r => ({ ...r }));
    const snapActividadesIntegrantes = JSON.parse(JSON.stringify(actividadesIntegrantes));
    const snapCantidadesActividades = { ...cantidadesActividades };
    const snapActividadesConHoras = [...actividadesConHoras];
    const snapManualHorasPersona = { ...manualHorasPersona };

    try {
      // Recargar lista de OPs
      try {
        const res = await api.get("/op/lista");
        const opsArray = res.data.hojas
          ? Object.values(res.data.hojas).flatMap(hoja =>
              hoja.datos?.flatMap(d =>
                Object.values(d.valores || {}).map(col => col?.valor).filter(v => v !== undefined && v !== null && v !== "")
              ) || []
            )
          : [];
        setOps(opsArray);
      } catch (err) { console.error("Error recargando OPs:", err); }

      // Recargar personal del módulo actual (sin resetear los valores del usuario)
      const hoja = MODULO_TO_HOJA[snapForm.modulo];
      if (hoja) {
        try {
          const { data } = await api.get("/modulos/personal", { params: { modulo: hoja } });
          setListaSupervisores(Array.isArray(data.supervisores) ? data.supervisores : []);
          setListaLideres(Array.isArray(data.lideres) ? data.lideres : []);
          setListaIntegrantes(Array.isArray(data.integrantes) ? data.integrantes : []);
        } catch (err) { console.error("Error recargando personal:", err); }
      }

      // Recargar insumos del producto actual (sin resetear entrega/recepcion del usuario)
      if (snapForm.codigo_producto && snapForm.codigo_producto.trim().length >= 3) {
        try {
          const { data } = await api.get("/insumos/producto", {
            params: { codigo: snapForm.codigo_producto.trim() },
          });
          let lista = [];
          if (data && Array.isArray(data.insumos)) lista = data.insumos;
          else if (Array.isArray(data)) lista = data;
          setListaInsumos(lista);
          setListaNoConforme(lista.map(insumo => ({ codigo: insumo.codigo || insumo, descripcion: insumo.descripcion || "" })));
        } catch (err) { console.error("Error recargando insumos:", err); }

        // Recargar actividades del producto (para que aparezcan las nuevas agregadas en OneDrive)
        try {
          const resProcesos = await api.get("/procesos/producto", {
            params: { codigo: snapForm.codigo_producto.trim() },
          });
          if (resProcesos.data && resProcesos.data.detalles) {
            snapForm.detalles_actividades = resProcesos.data.detalles;
          }
        } catch (err) { console.error("Error recargando actividades:", err); }

        // Recargar lote del producto
        try {
          const { data } = await api.get("/lote/info", {
            params: { codigo: snapForm.codigo_producto.trim() },
          });
          if (data && data.loteInfo !== undefined) {
            snapForm.lotePrincipal = String(data.loteInfo).trim();
          }
        } catch (err) { console.error("Error recargando lote del producto:", err); }

        // Recargar lotes de cada insumo (preservando entrega/recepcion del usuario)
        snapInsumos = await Promise.all(snapInsumos.map(async (insumo) => {
          const codigo = insumo.tipo_insumo?.trim();
          if (!codigo) return insumo;
          const isNoAplica = /^(CF|BCD|FPQ)/i.test(codigo);
          if (isNoAplica) return { ...insumo, lote_insumo: "NO APLICA" };
          try {
            const { data } = await api.get("/insumos/lote", { params: { codigo } });
            const lote = typeof data === "string" ? data : (data.lote || insumo.lote_insumo);
            return { ...insumo, lote_insumo: lote };
          } catch {
            return insumo;
          }
        }));
      }

    } finally {
      // Restaurar todos los datos que el usuario ya había ingresado
      // (detalles_actividades ya viene actualizado desde el fetch de arriba)
      setForm(snapForm);
      setIntegrantes(snapIntegrantes);
      setMaquinarias(snapMaquinarias);
      setEtiqueta(snapEtiquetas);
      setInsumos(snapInsumos);
      setReposicionNoConforme(snapReposicion);
      setActividadesIntegrantes(snapActividadesIntegrantes);
      setCantidadesActividades(snapCantidadesActividades);
      setActividadesConHoras(snapActividadesConHoras);
      setManualHorasPersona(snapManualHorasPersona);
      setRefreshing(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Detener el temporizador al guardar
    detenerTemporizador();
    
    setMsg("");
    setLoading(true);
    try {
      let actividadesTexto = form.detalles_actividades;
      
      // COMENTADO: los EQE ahora usan el mismo flujo normal que los demás productos
      /*
      if (mostrarCheckboxes) {
        actividadesTexto = getActividadesSeleccionadasTexto();
      }
      */
      
      const planificadaPorDetalle = {};
      const elaboradaPorDetalle = {};
      const actividadesConHorasData = {};
      
      if (actividadesTexto) {
        const actividades = actividadesTexto.split('\n').filter(a => a.trim());
        actividades.forEach((act, index) => {
          const actTrim = act.trim();
          const actividadData = actividadesConHoras.find(a => a.actividad === actTrim);
          if (actividadData){
            actividadesConHorasData[actTrim] = {
              cantidad_base: actividadData.cantidad_base,
              horas: actividadData.horas,
              planificada_total: actividadData.planificada_total
            };
          }
          if (cantidadesActividades[`planificada_${index}`]) {
            planificadaPorDetalle[actTrim] = cantidadesActividades[`planificada_${index}`];
          }
          if (cantidadesActividades[`elaborada_${index}`]) {
            elaboradaPorDetalle[actTrim] = cantidadesActividades[`elaborada_${index}`];
          }
        });
      }
      
      const cantidad_planificada_detalles = Object.values(planificadaPorDetalle).reduce((sum, val) => {
        const num = parseInt(val) || 0;
        return sum + num;
      }, 0);
      
      const cantidad_elaborada_detalles = Object.values(elaboradaPorDetalle).reduce((sum, val) => {
        const num = parseInt(val) || 0;
        return sum + num;
      }, 0);
      
      const actividadesParaGuardar = {};

      // Primero incluir todos los integrantes (aunque no tengan actividades asignadas)
      integrantes.forEach((integrante, index) => {
        if (integrante.nombre || integrante.cargo) {
          actividadesParaGuardar[index] = {
            nombre: integrante.nombre || "",
            cargo: integrante.cargo || "",
            actividades: []
          };
        }
      });

      // Luego sobreescribir con los que sí tienen actividades asignadas
      Object.keys(actividadesIntegrantes).forEach(key => {
        const match = key.match(/integrante_(\d+)/);
        if (match) {
          const index = parseInt(match[1]);
          actividadesParaGuardar[index] = actividadesIntegrantes[key];
        }
      });
      
      const actividadesPorIntegranteJSON = JSON.stringify(actividadesParaGuardar, null, 2);
      const reposicionNoConformeJSON = JSON.stringify(reposicionNoConforme || []);
      const loteUnido = (form.lotePrincipal || "") + (form.loteSecundario || "");

      const datosCompletos = {
        ...form,
        loteUnido: loteUnido,
        insumos: insumos || [],
        etiquetas: etiquetas || [],
        integrantes: integrantes || [],
        reposicion_no_conforme: reposicionNoConformeJSON,
        maquinarias: maquinarias || [],
        cantidad_planificada_detalles: cantidad_planificada_detalles,
        cantidad_elaborada_detalles: cantidad_elaborada_detalles,
        actividades_por_integrante: actividadesPorIntegranteJSON,
        planificada_por_detalle: planificadaPorDetalle,
        elaborada_por_detalle: elaboradaPorDetalle,
        actividades_con_horas: actividadesConHoras,
        detalles_actividades: actividadesTexto
      };

      // Si es JEFE_PRODUCCION, añadir tiempo al payload (opcional)
      if (mostrarTiempoOculto && window.tiempoRegistroActual) {
        datosCompletos.tiempo_registro_frontend = window.tiempoRegistroActual.totalTexto;
        datosCompletos.tiempo_registro_ms = window.tiempoRegistroActual.totalMs;
      }

      await api.post("/registros", datosCompletos);

      setMsg("Registro guardado correctamente");

      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
      const dd = String(hoy.getDate()).padStart(2, "0");
      const fechaHoy = `${yyyy}-${mm}-${dd}`;

      setForm({ ...INITIAL_FORM, fecha: fechaHoy, lotePrincipal: "", loteSecundario: "" });
      setIntegrantes([{ nombre: "", cargo: "" }]);
      setActividadesIntegrantes({});
      setCantidadesActividades({});
      setEtiqueta([{ descripcion_etiqueta: "", cantidad_etiqueta: "", observacion_etiqueta: "", entrega_etiqueta: "", recepcion_etiqueta: "" }]);
      setInsumos([{ id: Date.now(), codigo_insumo: "", descripcion_insumo: "", cantidad_insumo: "", descrip_cant_insumo:"", lote_insumo: "", entrega: "", recepcion: "" }]);
      setReposicionNoConforme([]);
      setMaquinarias([{maquinaria:"", cantidad_maquinaria:"", numero_maquinaria:[]}]);
      setListaInsumos([]);
      setActividadesSeleccionadas({});
      setListaActividadesEQE([]);
      setMostrarCheckboxes(false);
      setActividadesGlobalesEQE([]);
      setProductosEQECargados(new Set());
      
      // Reiniciar temporizador después de guardar
      reiniciarTemporizador();
      
    } catch (err) {
      setMsg("❌ Error: " + (err.response?.data?.error || "No se pudo guardar"));
      console.error("Error al guardar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const codigo = form.codigo_producto?.trim();
    
    if (!codigo || codigo.length < 3) {
      setCantidadBaseProducto("0");
      setForm(prev => ({
        ...prev,
        hora_planificada: "0",
        cantidad_planificada: "0",
        cantidad_proceso: "0"
      }));
      return;
    }

    const cargarCantidadBase = async () => {
      setCargandoBase(true);
      try {
        const { data } = await api.get("/cantidades/producto", {
          params: { codigo }
        });
        
        const nuevaBase = data.meta || "0";
        setCantidadBaseProducto(nuevaBase);
        
        setForm(prev => ({
          ...prev,
          cantidad_planificada: nuevaBase,
        }));
        
      } catch (err) {
        console.error("❌ Error al cargar la cantidad base:", err);
        setCantidadBaseProducto("0");
        setForm(prev => ({
          ...prev,
          cantidad_planificada: "0"
        }));
      } finally {
        setCargandoBase(false);
      }
    };

    cargarCantidadBase();
  }, [form.codigo_producto]);

  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(""), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  useEffect(() => {
    const codigo = form.codigo_producto?.trim();
    
    if(!codigo || codigo.length < 3 || form.hora_planificada) {
      return;
    }

    const cargaMeta = async () => {
      try {
        const {data} = await api.get("/cantidades/producto",{
          params: {codigo},
        });  

        setForm((prev) => {
          if (prev.hora_planificada && prev.hora_planificada !== "0") {
            return prev;
          }
          
          const newForm = {
            ...prev,
            cantidad_planificada: data.meta || "",
          };
          newForm.cantidad_proceso = calcularProceso(
            newForm.cantidad_planificada, 
            newForm.cantidad_elaborado
          );
          return newForm;
        });
      } catch (err) {
        console.error("Error cargando meta:", err);
      }
    };
    cargaMeta();
  }, [form.codigo_producto, calcularProceso, form.hora_planificada]);

  useEffect(() => {
    const codigo_producto = form.codigo_producto?.trim();
    const cantidadPlanificada = Number(form.cantidad_planificada) || 0;

    if (!codigo_producto || codigo_producto.length < 3) {
      setListaInsumos([]);
      setInsumos([]);
      return;
    }

    const cargarInsumos = async () => {
      setLoadingInsumos(true);
      try {
        const valoresActuales = {};
        insumos.forEach(insumo => {
          if (insumo.tipo_insumo) {
            valoresActuales[insumo.tipo_insumo] = {
              entrega: insumo.entrega || "",
              recepcion: insumo.recepcion || ""
            };
          }
        });

        const { data } = await api.get("/insumos/producto", {
          params: { codigo: codigo_producto },
        });

        let lista = [];
        if (data && Array.isArray(data.insumos)) {
          lista = data.insumos;
        } else if (Array.isArray(data)) {
          lista = data;
        }

        setListaInsumos(lista);

        const nuevosInsumos = lista.map((insumo, index) => {
          const cantidadBase = Number(insumo.cantidad) || 0;
          const valoresPrevios = valoresActuales[insumo.codigo || insumo] || {};

          return {
            id: Date.now() + index,
            tipo_insumo: insumo.codigo || "",
            descripcion_insumo: insumo.descripcion || "",
            cantidad_insumo: cantidadBase * cantidadPlanificada,
            descrip_cant_insumo: insumo.descrip_cant_insumo || insumo.unidad_medida || "",
            lote_insumo:"",
            entrega: valoresPrevios.entrega || "",
            recepcion: valoresPrevios.recepcion || "",
          };
        });

        setInsumos(nuevosInsumos);
        nuevosInsumos.forEach((insumo, idx) => {
          if (insumo.tipo_insumo) {
            setTimeout(() => {
              cargarDescripcionLoteInsumo(idx, insumo.tipo_insumo);
            }, 500 + idx * 150);
          }
        });
      } catch (error) {
        console.error("Error cargando insumos:", error);
        setListaInsumos([]);
        setInsumos([]);
      } finally {
        setLoadingInsumos(false);
      }
    };

    cargarInsumos();
  }, [form.codigo_producto, form.cantidad_planificada]);

  useEffect(() => {
    const hoja = MODULO_TO_HOJA[form.modulo];
    
    if (!hoja) {
      setListaSupervisores([]);
      setListaIntegrantes([]);
      setListaLideres([]);
      setLideresFilterados([]);
      setIntegrantes([]);
      setForm((p) => ({ ...p, supervisor: "", responsable: "" }));
      return;
    }

    const cargarPersonal = async () => {
      setLoadingPersonal(true);
      try {
        const { data } = await api.get("/modulos/personal", {
          params: { modulo: hoja, turno: form.turno },
        });
        
        setListaSupervisores(Array.isArray(data.supervisores) ? data.supervisores : []);
        setListaLideres(Array.isArray(data.lideres) ? data.lideres : []);

        const lista = Array.isArray(data.integrantes) ? data.integrantes : [];
        setListaIntegrantes(lista);

        const nuevosIntegrantes = lista.map((item, index) => ({
          id: Date.now() + index,
          nombre: item.nombre,
          cargo: item.cargo || "",
        }));

        setIntegrantes(nuevosIntegrantes);
        
        const primerLider = Array.isArray(data.lideres) && data.lideres.length > 0 ? data.lideres[0] : "";
        const primerSupervisor = Array.isArray(data.supervisores) && data.supervisores.length > 0 ? data.supervisores[0] : "";
        
        setForm((p) => ({
          ...p, 
          responsable: primerLider,
          supervisor: primerSupervisor
        }));

        setActividadesIntegrantes({});

      } catch (err) {
        console.error("❌ Error cargando personal:", err);
        setListaSupervisores([]);
        setListaIntegrantes([]);
        setListaLideres([]);
        setLideresFilterados([]);
        setIntegrantes([]);
        setForm((p) => ({ ...p, supervisor: "", responsable: "" }));
      } finally {
        setLoadingPersonal(false);
      }
    };

    cargarPersonal();
  }, [form.modulo, form.turno]);

  // Efecto para filtrar líderes según turno (especialmente para GPA)
  useEffect(() => {
    const listaLideres = Array.isArray(_listaLideres) ? _listaLideres : [];
    
    console.log("DEBUG: form.modulo =", form.modulo, "form.turno =", form.turno, "listaLideres =", listaLideres);
    
    if ((form.modulo === "BOTAS SIMPLES" || form.modulo === "MODULO 2" || form.modulo === "MODULO 3" || form.modulo === "SELLADO") && form.turno && listaLideres.length > 0) {
      // Configuración especial para GPA
      let liderFiltrado = [];
      
      if (form.turno === "1") {
        // Turno 1: Primer líder o búsqueda por keywords
        liderFiltrado = listaLideres.filter(lider => 
          lider.toLowerCase().includes("sinchiguano") || 
          lider.toLowerCase().includes("lorena") ||
          lider.toLowerCase().includes("carla")
        );
        // Si no encuentra por keywords, usar el primer líder
        if (liderFiltrado.length === 0 && listaLideres.length >= 1) {
          liderFiltrado = [listaLideres[0]];
          console.log("DEBUG: Turno 1 - usando primer líder por defecto:", liderFiltrado[0]);
        } else {
          console.log("DEBUG: Turno 1 - encontrado por keywords:", liderFiltrado[0]);
        }
      } else if (form.turno === "2") {
        // Turno 2: Segundo líder o búsqueda por keywords
        liderFiltrado = listaLideres.filter(lider => 
          lider.toLowerCase().includes("alvarez") || 
          lider.toLowerCase().includes("priscila") ||
          lider.toLowerCase().includes("vanessa")
        );
        // Si no encuentra por keywords, usar el segundo líder
        if (liderFiltrado.length === 0 && listaLideres.length >= 2) {
          liderFiltrado = [listaLideres[1]];
          console.log("DEBUG: Turno 2 - usando segundo líder por defecto:", liderFiltrado[0]);
        } else if (liderFiltrado.length === 0 && listaLideres.length === 1) {
          liderFiltrado = [listaLideres[0]];
          console.log("DEBUG: Turno 2 - solo hay 1 líder disponible:", liderFiltrado[0]);
        } else {
          console.log("DEBUG: Turno 2 - encontrado por keywords:", liderFiltrado[0]);
        }
      }
      
      console.log("DEBUG: liderFiltrado final =", liderFiltrado);
      setLideresFilterados(liderFiltrado);
      
      // Seleccionar automáticamente el líder del turno
      if (liderFiltrado.length > 0) {
        setForm(prev => ({ ...prev, responsable: liderFiltrado[0] }));
      }
    } else {
      // Para otros módulos, mostrar todos los líderes
      setLideresFilterados(listaLideres);
      console.log("DEBUG: No es GPA o turno vacío - mostrando todos los líderes");
    }
  }, [form.modulo, form.turno, _listaLideres]);

  // Agrega esta función ANTES del return
const decimalParaHorasMinutos = (decimal) => {
  if (isNaN(decimal) || decimal <= 0) return '';
  const horas = Math.floor(decimal);
  const minutos = Math.round((decimal - horas) * 60);
  if (minutos >= 60) {
    return `${horas + 1}:00`;
  }
  if (minutos === 0) {
    return `${horas}:00`;
  }
  return `${horas}:${minutos.toString().padStart(2, '0')}`;
};

  return (
    <div id="formulario" className="registro-container">
      {msg && (
        <div className={`toast ${msg.toLowerCase().includes("error") ? "error" : "success"}`}>
          {msg}
        </div>
      )}
      
      {/* ========== TEMPORIZADOR OCULTO - SOLO PARA JEFE_PRODUCCION ========== */}
      {mostrarTiempoOculto && tiempoTranscurrido && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#00ff00',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          zIndex: 9999,
          border: '2px solid #00ff00',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(5px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 1)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onClick={() => {
          if (window.tiempoRegistroActual) {
            alert(`⏱️ TIEMPO TOTAL DE CREACIÓN\n\n${window.tiempoRegistroActual.totalTexto}\n\nInicio: ${new Date(window.tiempoRegistroActual.inicio).toLocaleTimeString()}\nFin: ${new Date(window.tiempoRegistroActual.fin).toLocaleTimeString()}`);
          } else {
            alert(`⏱️ TIEMPO TRANSCURRIDO\n\n${tiempoTranscurrido}\n\nEl temporizador se detendrá al guardar el registro.`);
          }
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⏱️</span>
            <div>
              <div style={{ fontSize: '11px', color: '#88ff88', marginBottom: '2px' }}>TIEMPO DEL LÍDER</div>
              <div style={{ fontSize: '16px', letterSpacing: '1px' }}>{tiempoTranscurrido}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Panel de información solo para JEFE_PRODUCCION 
      {mostrarTiempoOculto && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: '#ffaa00',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 9998,
          border: '1px solid #ffaa00'
        }}>
          👑 MODO SUPERVISIÓN ACTIVO
        </div>
      )}*/}
      {/* ========== FIN TEMPORIZADOR OCULTO ========== */}
      
      <header>
        <div className="logo-left">
          <img src={logo_safemed} alt="logo" className="logo" />
        </div>
        <h1>REGISTRO DE CONFECCIÓN O AUTOMÁTICAS - EMPAQUE Y CONTROL DE ACTIVIDADES</h1>
        <div className="logo-right">
          <img src={logo3} alt="logo2" className="logo" />
        </div>
      </header>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "space-between" }}>
        <button className="btn" type="button" onClick={() => nav("/")}>
          ⬅ Volver
        </button>
        <button
        className="btn-actualizar"
          type="button"
          disabled={refreshing}
          onClick={handleActualizar}
          title="Recarga los datos disponibles sin perder lo que ya llenaste"
        >
          {refreshing ? "⏳ Actualizando..." : "🔄 Actualizar"}
        </button>
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", marginBottom: "auto" }}>
        
      </div>

      <form onSubmit={onSubmit}>
        {/* CABECERA */}
        <div className="card">
          <div className="grid4">
            <div className="form-group">
              <label htmlFor="fecha">FECHA:</label>
              <input type="date" id="fecha" name="fecha" value={form.fecha} onChange={onChange}
              style={{ fontSize: "12px" }} />
            </div>
            
            <div className="form-group">
              <label htmlFor="op">OP:</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input 
                list="op-list"
                id="op" 
                name="op"
                value={form.op}
                onChange={onChange}
                placeholder="SELECCIONA O ESCRIBE LA ORDEN DE PRODUCCIÓN..."
                autoComplete="off"
                style={{ fontSize: "12px" }}
                />
                <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, op: "" }))}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                  whiteSpace: "nowrap"
                }}
                title="Limpiar OP"
                >
                  ✖
                </button>
              </div>
              <datalist id="op-list">
                <option value="">SELECCIONA LA ORDEN DE PRODUCCIÓN...</option>
                {ops.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </datalist>
            </div>
            
            <div className="form-group">
              <label htmlFor="turno">TURNO:</label>
              <select id="turno" name="turno" value={form.turno} onChange={onChange}>
                <option value="">SELECCIONA EL TURNO...</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="area">ÁREA:</label>
              <select id="area" name="area" value={form.area} onChange={onChange}>
                <option value="">SELECCIONA EL ÁREA...</option>
                <option value="CONFECCIÓN">CONFECCIÓN</option>
                <option value="AUTOMÁTICAS">AUTOMÁTICAS</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modulo">MÓDULO:</label>
              <select id="modulo" name="modulo" value={form.modulo} onChange={onChange}>
                <option value="">SELECCIONE...</option>
                <option value="MODULO 1">MÓDULO 1</option>
                <option value="MODULO 2">MÓDULO 2</option>
                <option value="MODULO 3">MÓDULO 3</option>
                <option value="MODULO 4">MÓDULO 4</option>
                <option value="MODULO 6">MÓDULO 6</option>
                <option value="MODULO 7">MÓDULO 7</option>
                <option value="MODULO 8">MÓDULO 8</option>
                <option value="MODULO 10">MÓDULO 10</option>
                <option value="VARIOS 1">VARIOS 1</option>
                <option value="VARIOS 2">VARIOS 2</option>
                <option value="ESTAMPADO">ESTAMPADO</option>
                <option value="BOTAS SIMPLES">BOTAS SIMPLES</option>
                <option value="SPA">SPA</option>
                <option value="MASCARILLAS">MASCARILLAS</option>
                <option value="GPA">GPA</option>
                <option value="SELLADO">SELLADO</option>
                <option value="CORTE">CORTE</option>
                <option value="ETIQUETAS">ETIQUETAS</option>
                <option value="METBLOWN">METBLOWN</option>
              </select>
            </div>
          </div>

          <div className="cabecera2">
            <div className="grid2">
              <div className="form-group">
                <label htmlFor="responsable">RESPONSABLE:</label>
                <select
                  id="responsable"
                  name="responsable"
                  value={form.responsable || ""}
                  onChange={onChange}
                  disabled={!form.modulo}
                  style={{
                    backgroundColor: !form.modulo ? "#f3f4f6" : "#ffffff",
                    cursor: !form.modulo ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    padding: "8px",
                    border: "1px solid #ced4da",
                    borderRadius: "4px"
                  }}
                >
                  <option value="">SELECCIONA EL RESPONSABLE...</option>
                  {lideresFilterados.map((lider, idx) => (
                    <option key={idx} value={lider}>
                      {lider}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="supervisor">SUPERVISOR@:</label>
                <input
                  placeholder="SELECCIONA PRIMERO EL MÓDULO..."
                  type="text"
                  id="supervisor" 
                  name="supervisor"
                  value={form.supervisor || ""}
                  disabled={!form.modulo}
                  style={{ backgroundColor: !form.modulo ? "#f3f4f6" : "#e9ecef", cursor: "not-allowed", fontSize: "12px" }}
                />
              </div>
            </div>
          </div>
        
          <div className="cabecera2">
            <div className="grid2">
              <div className="form-group">
                <label htmlFor="personal_asignado">PERSONAL ASIGNADO: </label>
                <select id="personal_asignado" name="personal_asignado" value={form.personal_asignado} onChange={onChange}>
                  <option value="">SELECCIONA EL PERSONAL ASIGNADO...</option>
                  <option value="8">8</option>
                  <option value="10">10</option>
                  <option value="13">13</option>
                  <option value="OTRO">OTRO</option>
                </select>
              </div>
              {form.personal_asignado === "OTRO" && (
                <div className="form-group">
                  <label htmlFor="personal_otro">INGRESE CANTIDAD:</label>
                  <input type="number" id="personal_otro" name="personal_otro" min="1" max="20" placeholder="INGRESA LA CANTIDAD DEL PERSONAL. EJ: 15" value={form.personal_otro} onChange={onChange}  style={{ fontSize: "12px" }} />
                </div>
              )}
              <div className="form-group">
                <label>PERSONAL PRESENTE: </label>
                <input placeholder="INGRESA LA CANTIDAD DEL PERSONAL PRESENTE..." type="number" id="personal_presente" name="personal_presente" min="0" max="20" value={form.personal_presente} onChange={onChange} style={{ fontSize: "12px" }} />
              </div>
            </div>
          </div>

          <div className="cabecera3">
            <div className="grid6">
              <div className="form-group">
                <label htmlFor="codigo_producto">REFERENCIA:</label>
                <input
                  id="codigo_producto"
                  name="codigo_producto"
                  value={form.codigo_producto}
                  onChange={onChange}
                  style={{ fontSize: "12px" }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="descripcion">DESCRIPCIÓN:</label>
                <textarea id="descripcion" name="descripcion" rows={4} value={form.descripcion} onChange={onChange} style={{ fontSize: "12px" }} className="input-disabled" />
              </div>
              <div className="form-group">
                <label htmlFor="hora_planificada">TIEMPO: </label>
                <input htmlFor="number" id="hora_planificada" name="hora_planificada" value={form.hora_planificada} onChange={onChange} className="input-disabled" style={{ fontSize: "12px" }} placeholder="Se calculará automaticamente" readOnly />
              </div>
              <div className="form-group">
                <label htmlFor="cantidad_planificada">CANTIDAD PLANIFICADA:</label>
                <input type="number" id="cantidad_planificada" name="cantidad_planificada" value={form.cantidad_planificada} onChange={onChange} className="input-disabled" style={{ fontSize: "12px" }} />
              </div>
              <div className="form-group">
                <label htmlFor="lotePrincipal">LOTE MAESTRO:</label>
                <input type="text" id="lotePrincipal" name="lotePrincipal" value={form.lotePrincipal} onChange={onChange} style={{ fontSize: "12px" }} />
              </div>
              <div className="form-group">
                <label htmlFor="loteSecundario" >N°:</label>
                <input placeholder="INGRESA EL DÍA LOTE (OPCIONAL)" type="text" id="loteSecundario" name="loteSecundario" value={form.loteSecundario} onChange={onChange} style={{ fontSize: "12px" }} />
              </div>
            </div>
          </div>
        </div>
                
        <div className="subtitle">
          <h3>ENTREGA Y RECEPCIÓN DE MATERIA PRIMA E INSUMOS</h3>
        </div>
        
        {/* INSUMOS */}
        <div className="card">
          <div className="form-group">
            <label> INSUMOS USADOS EN LA PRODUCCIÓN</label>
            
            {loadingInsumos && (
              <div className="alert alert-info" style={{ padding: "8px", marginBottom: "15px" }}>
                BUSCANDO INSUMOS PARA {form.codigo_producto}...
              </div>
            )}
            
            {!loadingInsumos && form.codigo_producto && insumos.length === 0 && (
              <div className="alert alert-warning" style={{ padding: "8px", marginBottom: "15px" }}>
                NO SE ENCONTRARON INSUMOS PARA EL CÓDIGO {form.codigo_producto}
              </div>
            )}
            
            {!loadingInsumos && insumos.length > 0 && (
              <div style={{ marginBottom: "15px", color: "#000", fontWeight: "bold", fontSize: "10px"}}>
                {insumos.length} INSUMO(S) CARGADO(S)
              </div>
            )}
            
            {insumos.map((item, index) => (
              <div key={item.id || index} style={
                { display: "grid", width: "950px", gridTemplateColumns: "2fr 4.2fr 1.9fr 1.2fr 3.2fr 2.3fr 2.3fr auto", gap: "5px", marginBottom: "25px", alignItems: "flex-start", padding: "20px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6", boxSizing: "border-box" }
              }>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> CÓDIGO DEL INSUMO: </label>
                  <input className="input-uppercase"
                         type="text" 
                         value={item.tipo_insumo || ""} 
                         placeholder="CÓDIGO INSUMO" 
                         onChange={(e)=>{const valor = e.target.value;
                          setInsumos((prev)=>{
                            const copia =[...prev];
                            copia[index].tipo_insumo = valor;
                            return copia;
                         });
                         }}
                         onBlur = {()=> {
                          buscarDescripcionInsumo(item.tipo_insumo, index);
                          cargarDescripcionLoteInsumo(index, item.tipo_insumo);
                         }}
                         style={{fontSize: "9.5px" }} 
                         />
                </div>

                <div className="insumo-field">
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> DESCRIPCIÓN: </label>
                  <input type="text" value={item.descripcion_insumo || ""} readOnly style={{ backgroundColor: "#e9ecef", fontSize: "9.5px" }}/>
                </div>

                <div className="insumo-field">
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}>CANTIDAD: </label>
                  <input type="number" step="any" value={item.cantidad_insumo || ""} onChange={(e) => actualizarInsumo(index, "cantidad_insumo", e.target.value)} min="0" max="100000" placeholder="EJ: 10" style={{fontSize: "9.5px" }}/>
                </div>

                <div className="insumo-field">
                  <label style={{display: "block", marginBottom: "5px", fontSize: "10px", fontWeight:"500"}}>UNIDAD MEDIDA:</label>
                  <input type="text" value={item.descrip_cant_insumo || ""} onChange={(e)=> actualizarInsumo(index,"descrip_cant_insumo", e.target.value)} style={{fontSize: "9.5px" }} />
                </div>
                <div className="insumo-field">
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> LOTE: </label>
                  <input type="text" value={item.lote_insumo || ""} onChange={(e) => actualizarInsumo(index, "lote_insumo", e.target.value)} placeholder="N° DE LOTE" style={{fontSize: "9.5px" }} />
                </div>

                <div className="insumo-field">
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> ENTREGA: </label>
                  <select
                    value={item.entrega}
                    onChange={(e) => actualizarInsumo(index, "entrega", e.target.value)}
                    style={{fontSize: "9.5px" }}
                  >
                    <option value="">SELECCIONE...</option>
                    <option value="BRYAN ALEXANDER CAJAMARCA BONILLA">BRYAN ALEXANDER CAJAMARCA BONILLA</option>
                    <option value="JUAN ANIBAL CHASIPANTA ALQUINGA">JUAN ANIBAL CHASIPANTA ALQUINGA</option>
                    <option value="CARLA MICAELA CHUQUIMARCA FERNANDEZ">CARLA MICAELA CHUQUIMARCA FERNANDEZ</option>
                    <option value="JEREMY JOEL COLUMBA COLCHA">JEREMY JOEL COLUMBA COLCHA</option>
                    <option value="GABRIELA SOLANGE COLUMBA IZA">GABRIELA SOLANGE COLUMBA IZA</option>
                    <option value="ANA LUCIA GUAMAN PILATUÑA">ANA LUCIA GUAMAN PILATUÑA</option>
                    <option value="MANUEL ALEJANDRO PERUGACHE QUIMBIURCO">MANUEL ALEJANDRO PERUGACHE QUIMBIURCO</option>
                    <option value="ANA MARIA PINCAY RUIZ">ANA MARIA PINCAY RUIZ</option>
                    <option value="ERIKA MARISELA SUNTAXI PAUCAR">ERIKA MARISELA SUNTAXI PAUCAR</option>
                    <option value="NATALY SILVANA TIPAN GUALOTUÑA">NATALY SILVANA TIPAN GUALOTUÑA</option>
                    <option value="ANTONY FABRICIO BONILLA TASHIGUANO">ANTONY FABRICIO BONILLA TASHIGUANO</option>
                    <option value="MARIBEL ELIZABETH CHILUISA MONTALUISA">MARIBEL ELIZABETH CHILUISA MONTALUISA</option>
                    <option value="CHRISTIAN GIOVANNI SUNTAXI SUNTASIG ">CHRISTIAN GIOVANNI SUNTAXI SUNTASIG</option>
                    <option value="LUIS GUSTAVO SIMBAÑA MAILA">LUIS GUSTAVO SIMBAÑA MAILA</option>
                    <option value="CAROLINA ESTEFANIA VACA GUANATASIG">CAROLINA ESTEFANIA VACA GUANATASIG</option>
                    <option value="KLEVER IVAN FARINANGO SUQUILLO">KLEVER IVAN FARINANGO SUQUILLO</option>
                    <option value="ROCIO ELIZABETH PILATAXI MONTA">ROCIO ELIZABETH PILATAXI MONTA</option>
                  </select>
                </div>

                <div className="insumo-field">
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> RECEPCIÓN: </label>
                  <select value={item.recepcion || ""} onChange={(e) => actualizarInsumo(index, "recepcion", e.target.value)} style={{fontSize: "9.5px" }}>
                    <option value="">SELECCIONA LA PERSONA QUE RECIBE...</option>
                    <option value="Vaca Guanatasig Carolina Estefania">Vaca Guanatasig Carolina Estefania</option>
                    <option value="Cajamarca Bonilla Bryan Alexander">BRYAN ALEXANDER CAJAMARCA BONILLA</option>
                    <option value="Guaman Pilatuña Ana Lucia">ANA LUCIA GUAMAN PILATUÑA</option>
                    <option value="Tipan Gualotuña Nataly Silvana">NATALY SILVANA TIPAN GUALOTUÑA</option>
                    {integrantes.map((integrante, idx) => (
                      <option key={idx} value={integrante.nombre}>
                        {integrante.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="insumo-field-action">
                  <button type="button" onClick={() => eliminarInsumo(index)} className="btn-delete">
                    ❌
                  </button>
                </div>
              </div>
            ))}
            
            <div style={{marginTop:"20px", textAlign:"center"}}>
              <button
                type="button"
                className="btn"
                onClick={agregarInsumo}
              >
                ➕ Agregar Nuevo Insumo
              </button>
            </div>
          </div>
        </div>

        {/* REPOSICIÓN NO CONFORME */}
        <div className="cabecera4">
          <div className="form-group">
            <label htmlFor="reposicion_no_conforme">REPOSICIÓN NO CONFORME:</label>
            
            {loadingNoConforme && (
              <div className="alert alert-info">CARGANDO INSUMOS...</div>
            )}
            
            {reposicionNoConforme.length === 0 && !loadingNoConforme && (
              <div style={{ 
                padding: "20px", 
                textAlign: "center", 
                backgroundColor: "#f8f9fa",
                border: "1px dashed #ccc",
                borderRadius: "8px",
                marginBottom: "15px",
                color: "#666"
              }}>
                No hay insumos no conformes agregados. Agregue únicamente si tiene Insumos No Conformes 
              </div>
            )}
            
            {reposicionNoConforme.map((item, index) => (
              <div key={item.id || index} style={
                { display: "grid", width: "950px", gridTemplateColumns: "2fr 4.2fr 1.9fr 1.2fr 3.2fr 2.3fr 2.3fr auto", gap: "5px", marginBottom: "15px", alignItems: "center", padding: "15px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6" }
              }>
                <div className="no-conforme-field">
                  <label style={{fontSize:"10px", fontWeight:"500"}}>CÓDIGO DEL INSUMO:</label>
                  <select
                    value={item.codigo_insumo || ""}
                    onChange={(e) => actualizarReposicionNoConforme(index, "codigo_insumo", e.target.value)} style={{fontSize: "9.5px" }}
                  >
                    <option value="">SELECCIONE...</option>
                    {_listaNoConforme.map((insumo, idx) => (
                      <option key={idx} value={insumo.codigo}>
                        {insumo.codigo}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="no-conforme-field">
                  <label style={{fontSize:"10px", fontWeight:"500"}}>DESCRIPCIÓN:</label>
                  <input 
                    type="text" 
                    value={item.descripcion_insumo || ""} 
                    readOnly
                    style={{ backgroundColor: "#e9ecef", fontSize: "9.5px" }}
                  />
                </div>
                
                <div className="no-conforme-field">
                  <label style={{fontSize:"10px", fontWeight:"500"}}>CANTIDAD:</label>
                  <input 
                    type="number" 
                    value={item.cantidad} 
                    onChange={(e) => actualizarReposicionNoConforme(index, "cantidad", e.target.value)}
                    style={{fontSize: "9.5px" }}
                    placeholder="EJ: 10"
                  />
                </div>
                
                <div className="no-conforme-field">
                  <label style={{fontSize: "10px", fontWeight:"500"}}>UNIDAD MEDIDA:</label>
                  <input
                    type="text"
                    value={item.descrip_cant_insumo}
                    onChange={(e)=> actualizarReposicionNoConforme(index, "descrip_cant_insumo", e.target.value)}
                    style={{fontSize: "9.5px" }}
                    placeholder="EJ: UDS"
                  />
                </div>
                
                <div className="no-conforme-field">
                  <label style={{fontSize:"10px", fontWeight:"500"}}>LOTE:</label>
                  <input 
                    type="text" 
                    value={item.lote} 
                    onChange={(e) => actualizarReposicionNoConforme(index, "lote", e.target.value)}
                    placeholder="N° LOTE"
                    style={{fontSize: "9.5px" }}
                  />
                </div>
                
                <div className="no-conforme-field">
                  <label style={{fontSize:"10px", fontWeight:"500"}}>ENTREGA:</label>
                  <select
                    value={item.entrega}
                    onChange={(e) => actualizarReposicionNoConforme(index, "entrega", e.target.value)}
                    style={{fontSize: "9.5px" }}
                  >
                    <option value="">SELECCIONE...</option>
                    <option value="BRYAN ALEXANDER CAJAMARCA BONILLA">BRYAN ALEXANDER CAJAMARCA BONILLA</option>
                    <option value="JUAN ANIBAL CHASIPANTA ALQUINGA">JUAN ANIBAL CHASIPANTA ALQUINGA</option>
                    <option value="CARLA MICAELA CHUQUIMARCA FERNANDEZ">CARLA MICAELA CHUQUIMARCA FERNANDEZ</option>
                    <option value="JEREMY JOEL COLUMBA COLCHA">JEREMY JOEL COLUMBA COLCHA</option>
                    <option value="GABRIELA SOLANGE COLUMBA IZA">GABRIELA SOLANGE COLUMBA IZA</option>
                    <option value="ANA LUCIA GUAMAN PILATUÑA">ANA LUCIA GUAMAN PILATUÑA</option>
                    <option value="MANUEL ALEJANDRO PERUGACHE QUIMBIURCO">MANUEL ALEJANDRO PERUGACHE QUIMBIURCO</option>
                    <option value="ANA MARIA PINCAY RUIZ">ANA MARIA PINCAY RUIZ</option>
                    <option value="ERIKA MARISELA SUNTAXI PAUCAR">ERIKA MARISELA SUNTAXI PAUCAR</option>
                    <option value="NATALY SILVANA TIPAN GUALOTUÑA">NATALY SILVANA TIPAN GUALOTUÑA</option>
                    <option value="ANTONY FABRICIO BONILLA TASHIGUANO">ANTONY FABRICIO BONILLA TASHIGUANO</option>
                    <option value="MARIBEL ELIZABETH CHILUISA MONTALUISA">MARIBEL ELIZABETH CHILUISA MONTALUISA</option>
                    <option value="CHRISTIAN GIOVANNI SUNTAXI SUNTASIG">CHRISTIAN GIOVANNI SUNTAXI SUNTASIG</option>
                    <option value="LUIS GUSTAVO SIMBAÑA MAILA">LUIS GUSTAVO SIMBAÑA MAILA</option>
                    <option value="CAROLINA ESTEFANIA VACA GUANATASIG">CAROLINA ESTEFANIA VACA GUANATASIG</option>
                    <option value="KLEVER IVAN FARINANGO SUQUILLO">KLEVER IVAN FARINANGO SUQUILLO</option>
                    <option value="ROCIO ELIZABETH PILATAXI MONTA">ROCIO ELIZABETH PILATAXI MONTA</option>
                  </select>
                </div>
                
                <div className="no-conforme-field">
                  <label style={{fontSize:"10px", fontWeight:"500"}}>RECEPCIÓN:</label>
                  <select 
                    value={item.recepcion} 
                    onChange={(e) => actualizarReposicionNoConforme(index, "recepcion", e.target.value)} style={{fontSize: "9.5px" }}
                  >
                    <option value="">SELECCIONA LA PERSONA QUE RECIBE...</option>
                    {integrantes.map((integrante, idx) => (
                      <option key={idx} value={integrante.nombre.toUpperCase()}>
                        {integrante.nombre.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="no-conforme-field-action">
                  <button 
                    type="button" 
                    onClick={() => eliminarNoConforme(index)}
                    className="btn-delete"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={agregarNoConforme}
              className="btn-add"
            >
              ➕ AGREGAR INSUMO NO CONFORME
            </button>
          </div>
        </div>

        {/* ETIQUETAS */}
        <div className="card2">
          <h3>ENTREGA Y RECEPCIONES DE ETIQUETAS EN MESA</h3>
        </div>
        <div className="card">
          <div className="form-group">
            <label>DESCRIPCIÓN DE ETIQUETA:</label>
            <style>{`
            .etiqueta-grid {
              display: flex;
              align-items: flex-end;
              gap: 15px;
              margin-bottom: 20px;
              padding: 15px;
              background: #f8fafc;
              border-radius: 10px;
              border: 1px solid #e2e8f0;
              flex-wrap: nowrap;        
              overflow-x: auto;         
            }
            .etiqueta-field {
              flex: 0 0 auto;           
              min-width: 180px;         
            }
            .etiqueta-field label {
              display: block;
              font-size: 10px;          
              font-weight: 600;
              color: #4b5563;
              margin-bottom: 4px;       
            }
            .etiqueta-field input,
            .etiqueta-field select {
              width: 100%;
              padding: 6px 10px;        
              border-radius: 6px;       
              border: 1px solid #d1d5db;
              font-size: 11px;
              background: white;
            }
            .etiqueta-field input:focus,
            .etiqueta-field select:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
            }
            .btn-delete {
              padding: 6px;             
              background: #e74c3c;
              color: white;
              border: none;
              border-radius: 6px;       
              cursor: pointer;
              width: 34px;              
              height: 34px;             
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
              flex-shrink: 0;
            }
            .btn-delete:hover {
              background: #c0392b;
            }
            .btn-add {
              padding: 8px 16px;        
              background: #28a745;
              color: white;
              border: none;
              border-radius: 6px;       
              cursor: pointer;
              font-size: 11px;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .btn-add:hover {
              background: #218838;
            }
  
            /* Scroll horizontal para pantallas pequeñas */
            @media (max-width: 1200px) {
            .etiqueta-grid {
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
            .btn-delete {
              margin-top: 0;
              width: 34px;
            }
          }
          `}</style>
            {etiquetas.map((item, index) => (
              <div key={index} className="etiqueta-grid">
                <div className="etiqueta-field" style={{ flex: 1.2 }}>
                  <label>ETIQUETA</label>
                  <select 
                    value={item.descripcion_etiqueta} 
                    onChange={(e) => actualizarEtiqueta(index, "descripcion_etiqueta", e.target.value)}
                  >
                    <option value="">SELECCIONE...</option>
                    <option value="ETIQUETA ADHESIVA PARA CAJA MASTER">ETIQUETA ADHESIVA PARA CAJA MASTER</option>
                    <option value="ETIQUETA IMPRESA EN FUNDA">ETIQUETA IMPRESA EN FUNDA</option>
                    <option value="ETIQUETA DE PAPEL INDIVIDUAL">ETIQUETA DE PAPEL INDIVIDUAL</option>
                    <option value="ETIQUETA CON NOMBRE DE CLIENTE">ETIQUETA CON NOMBRE DE CLIENTE</option>
                  </select>
                </div>

                <div className="etiqueta-field">
                  <label>CANTIDAD</label>
                  <input 
                    placeholder="INGRESA LA CANTIDAD DE LA ETIQUETA.."
                    type="number" 
                    min="0" 
                    max="9999" 
                    step="any"
                    value={item.cantidad_etiqueta ?? ""} 
                    onChange={(e) => actualizarEtiqueta(index, "cantidad_etiqueta", e.target.value)}
                  />
                </div>

                <div className="etiqueta-field">
                  <label>ENTREGA</label>
                  <select
                    value={item.entrega_etiqueta}
                    onChange={(e)=> actualizarEntregaEtiqueta(index,"entrega_etiqueta", e.target.value)}
                  >
                    <option value="">SELECCIONE...</option>
                    <option value="BRYAN ALEXANDER CAJAMARCA BONILLA">BRYAN ALEXANDER CAJAMARCA BONILLA</option>
                    <option value="NATALY SILVANA TIPAN GUALOTUÑA">NATALY SILVANA TIPAN GUALOTUÑA</option>
                    <option value="ANA LUCIA GUAMAN PILATUÑA">ANA LUCIA GUAMAN PILATUÑA</option>
                  </select>
                </div>

                <div className="etiqueta-field">
                  <label>RECEPCIÓN</label>
                  <input 
                    value={item.recepcion_etiqueta ?? ""} 
                    onChange={(e) => actualizarEtiqueta(index, "recepcion_etiqueta", e.target.value)} 
                    placeholder="INGRESA EL NOMBRE QUE RECIBE..."
                  />
                </div>

                <button 
                  type="button" 
                  className="btn-delete"
                  onClick={() => eliminarEtiqueta(index)} 
                  title="Eliminar etiqueta"
                >
                  🗑️
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={agregarEtiqueta}>
              <span style={{ fontSize: "18px" }}>➕</span> AGREGAR ETIQUETA
            </button>
          </div> 
        </div>
        
        {/* SECCIÓN DE DOS COLUMNAS: CANTIDADES IZQUIERDA | CONFECCIÓN DERECHA */}
        {/* SECCIÓN DE DOS COLUMNAS: CANTIDADES IZQUIERDA | CONFECCIÓN DERECHA */}
        <div style={
          { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }
        }>
        
          {/* COLUMNA DERECHA - CONFECCIÓN Y AUTOMÁTICAS */}
          <div>
            <div className="subtitle" style={{ marginBottom: "10px" }}>
              <h3>CONFECCIÓN Y AUTOMÁTICAS</h3>
            </div>
            <div className="card" style={{ padding: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }
                }>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="hora_inicio" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>H. INICIO:</label>
                    <input 
                      type="time" 
                      id="hora_inicio" 
                      name="hora_inicio" 
                      value={form.hora_inicio} 
                      onChange={onChange} 
                      style={{fontSize: "14px" }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="hora_fin" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>H. FIN:</label>
                    <input 
                      type="time" 
                      id="hora_fin" 
                      name="hora_fin" 
                      value={form.hora_fin} 
                      onChange={onChange} 
                      style={{fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div style={
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="destino" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>PARA:</label>
                    <select 
                      id="destino" 
                      name="destino" 
                      value={form.destino} 
                      onChange={onChange}
                      style={
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" }}
                    > 
                      <option value="">SELECCIONE EL DESTINATARIO...</option>
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="STOCK">STOCK</option>
                    </select>
                  </div>

                  {form.destino === "CLIENTE" && (
                    <div className="form-group" style={{ marginBottom: "0" }}>
                      <label htmlFor="n_cliente" style={{ fontWeight: "bold", marginBottom: "5px", display: "block",fontSize:"11px"}}>N. CLIENTE:</label>
                      <input 
                        type="text" 
                        id="n_cliente" 
                        name="n_cliente" 
                        value={form.n_cliente} 
                        onChange={onChange} 
                        style={
                          { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" }}
                        placeholder="INGRESA EL NOMBRE DEL CLIENTE..."
                      />
                    </div>
                  )}
                  {form.destino !== "CLIENTE" && <div></div>}
                </div>

                <div style={
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="esteril" style={{ fontWeight: "bold", marginBottom: "5px", display: "block"}}>ESTÉRIL:</label>
                    <select 
                      id="esteril" 
                      name="esteril" 
                      value={form.esteril} 
                      onChange={onChange} 
                    >
                      <option value="">SELECCIONE...</option>
                      <option value="SÍ">SÍ</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                </div>

                <div style={
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="leyenda" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>LEYENDA:</label>
                    <select 
                      id="leyenda" 
                      name="leyenda" 
                      value={form.leyenda} 
                      onChange={onChange} 
                      style={
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" }}
                    >
                      <option value="">SELECCIONE...</option>
                      <option value="SÍ">SÍ</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  {form.leyenda === "SÍ" && (
                    <div className="form-group" style={{ marginBottom: "0" }}>
                      <label htmlFor="leyenda_si" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>TIPO LEYENDA:</label>
                      <select 
                        name="leyenda_si" 
                        value={form.leyenda_si} 
                        onChange={onChange} 
                        style={
                          { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" }}
                      >
                        <option value="">SELECCIONE EL TIPO DE LEYENDA...</option>
                        <option value="IESS">IESS</option>
                        <option value="MSP">MSP</option>
                        <option value="RP">RP</option>
                        <option value="OTRA">OTRA</option>
                      </select>
                    </div>
                  )}
                  {form.leyenda !== "SÍ" && <div></div>}
                </div>

                {form.leyenda_si === "OTRA" && (
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="leyenda_otra" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>DESCRIPCIÓN LEYENDA:</label>
                    <input 
                      type="text" 
                      name="leyenda_otra" 
                      value={form.leyenda_otra} 
                      onChange={onChange} 
                      style={
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" }}
                      placeholder="INGRESA LA LEYENDA..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA IZQUIERDA - CANTIDAD PRODUCTO */}
          <div>
            <div className="subtitle" style={{ marginBottom: "10px"}}>
              <h3>CANTIDAD PRODUCTO</h3>
            </div>
            <div className="card" style={{ padding: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label htmlFor="cantidad_elaborado" style={{ fontWeight: "bold", marginBottom: "5px", display: "block"}}>ELABORADO:</label>
                  <input 
                    type="number" 
                    id="cantidad_elaborado" 
                    name="cantidad_elaborado" 
                    value={form.cantidad_elaborado} 
                    onChange={onChange} 
                    style={
                      { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "12px" }}
                    placeholder="INGRESA LA CANTIDAD ELABORADA DEL PRODUCTO..."
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label htmlFor="cantidad_proceso" style={{ fontWeight: "bold", marginBottom: "5px", display: "block"}}>PROCESO:</label>
                  <input 
                    type="number" 
                    id="cantidad_proceso" 
                    name="cantidad_proceso" 
                    value={form.cantidad_proceso} 
                    onChange={onChange} 
                    style={
                      { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" }}
                    placeholder="SE CALCULA AUTOMÁTICAMENTE..."
                    readOnly
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label htmlFor="cantidad_merma" style={{ fontWeight: "bold", marginBottom: "5px", display: "block"}}>MERMA:</label>
                  <input 
                    type="text" 
                    id="cantidad_merma" 
                    name="cantidad_merma" 
                    value={form.cantidad_merma} 
                    onChange={onChange}
                    style={
                      { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" }} 
                    placeholder="INGRESA LA CANTIDAD DE LA MERMA..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fecha_final_producto" >FECHA FINAL DE PRODUCTO TERMINADO:</label>
                  <input type="date" id="fecha_final_producto" name="fecha_final_producto" value={form.fecha_final_producto} onChange={onChange} style={{fontSize:"14px"}, {fontSize:"14px", padding:"12px"}} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAQUINARIA */}
        <div className="card2">
          <h3>MAQUINARIA</h3>
        </div>
        <div className="card">
          <div className="form-group">
            <label>DESCRIPCIÓN DE LA MAQUINARIA:</label>
            <style>{`
            .maquinaria-grid{
              display: flex;
              align-items: flex-end;
              gap: 15px;
              margin-bottom: 20px;
              padding: 15px;
              background: #f8fafc;
              border-radius: 10px;
              border: 1px solid #e2e8f0;
              flex-wrap: nowrap;  
              overflow-x: auto;   
            }
            .maquinaria-field {
              flex: 0 0 auto;     
              min-width: 180px;   
            }
            .maquinaria-field label{
              display: block;
              font-size: 10px;    
              font-weight: 600;
              color: #4b5563;
              margin-bottom: 4px;
            }
            .maquinaria-field input,
            .maquinaria-field select {
              width: 100%;        
              padding: 6px 10px;  
              border-radius: 6px;
              border: 1px solid #d1d5db;
              font-size: 11px;
              background: white;
            }
            .maquinaria-field input:focus,
            .maquinaria-field select:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
            }
            .numeros-maquina{
              display: flex;                  
              flex-direction: column;             
              gap: 10px;
              align-items: flex-end;
              flex-wrap: nowrap;               
            }
            .numeros-maquina .maquinaria-field {
              min-width: 150px;                
            }
            .btn-delete {
              padding: 6px;
              background: #e74c3c;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
              flex-shrink: 0;
            }
            .btn-delete:hover {
              background: #c0392b;
            }
            .btn-add {
              padding: 8px 16px;
              background: #28a745;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 11px;
              font-weight: 500;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-top: 10px;
            }
            .btn-add:hover {
              background: #218838;
            }
  
            /* Scroll horizontal para pantallas pequeñas */
            @media (max-width: 1400px) {
              .maquinaria-grid {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
              }
            }
          `}</style>
            {maquinarias.map((item, index)=>(
              <div key={index} className="maquinaria-grid" style={{ width: "100%" }}>
                <div className="maquinaria-field" style={{ flex: 1.2 }}>
                  <label>NOMBRE DE LA MAQUINARÍA:</label>
                  <select value={item.maquinaria}
                          onChange={(e)=> actualizarMaquinaria(index, "maquinaria", e.target.value)}
                          style={{ fontSize: "11px", padding: "12px" }}
                  >
                    <option value="">SELECCIONE...</option>
                    <option value="RECTA">RECTA</option>
                    <option value="OVERLOCK">OVERLOCK</option>
                    <option value="ULTRASONIDO PUNTOS">ULTRASONIDO PUNTOS</option>
                    <option value="ULTRASONIDO DE TIRAS">ULTRASONIDO DE TIRAS</option>
                    <option value="QUIRÚGICA ELÁSTICO">QUIRÚGICA ELÁSTICO</option>
                    <option value="QUIRÚGICA PEDÍATRICA">QUIRÚGICA PEDÍATRICA</option>
                    <option value="MÁQUINA PARA KN">MÁQUINA PARA KN</option>
                    <option value="ELASTICADORA">ELASTICADORA</option>
                    <option value="TERMOSELLADORA">TERMOSELLADORA</option>
                    <option value="EMPACADORA">EMPACADORA</option>
                    <option value="SELLADORA DE PEDESTAL">SELLADORA DE PEDESTAL</option>
                    <option value="SELLADORA DE BANDA">SELLADORA DE BANDA</option>
                    <option value="SELLADORAS">SELLADORAS</option>
                    <option value="M. SELLADORA NEUMÁTICA">M. SELLADORA NEUMÁTICA</option>
                    <option value="MÁQUINA DE BOLSOS O FUNDA">MÁQUINA DE BOLSOS O FUNDA</option>
                    <option value="VIDEO JET">VIDEO JET</option>
                    <option value="GORROS TIPO ARCODEÓN">GORROS TIPO ARCODEÓN</option>
                    <option value="ESTAMPADO">ESTAMPADO</option>
                    <option value="M. CINTAS">M. CINTAS</option>
                    <option value="M. TROQUELADORA DE FUNDA">M. TROQUELADORA DE FUNDA</option>
                    <option value="LAVADORAS">LAVADORAS</option>
                    <option value="SECADORAS">SECADORAS</option>
                    <option value="BALANZA">BALANZA</option>
                    <option value="M. HOTMETL">M. HOTMETL</option>
                    <option value="M. AUTOMÁTICAS">M. AUTOMÁTICAS</option>
                    <option value="INJETH">INJETH</option>
                    <option value="DE PEDESTAL">DE PEDESTAL</option>
                    <option value="M. CNC">M. CNC</option>
                    <option value="M. RIBETEADORA">M. RIBETEADORA</option>
                    <option value="M. BROCHADORA">M. BROCHADORA</option>
                    <option value="M. NEUMÁTICA DE VÁLVULAS">M. NEUMÁTICA DE VÁLVULAS</option>
                    <option value="M. PUÑOS">M. PUÑOS</option>
                    <option value="M. TALADRO">M. TALADRO</option>
                    <option value="M. VERTICALES MANUALES">M. VERTICALES MANUALES</option>
                    <option value="M. ENROLLADORA DE WATTA">M. ENROLLADORA DE WATTA</option>
                    <option value="M. DE CORTE 2">M. DE CORTE 2</option>
                  </select>
                </div>
                <div className="maquinaria-field" style={{ maxWidth: "100%" }}>
                  <label>CANTIDAD DE MAQUINARIA:</label>
                  <input type="text" min="1" value={item.cantidad_maquinaria} onChange={(e)=> actualizarMaquinaria(index, "cantidad_maquinaria", e.target.value)} style={{fontSize: "11px", padding: "12px"}}/>
                </div>
                
                {item.numero_maquinaria?.length > 0 &&(
                  <div className="numeros-maquina">
                    {item.numero_maquinaria.map((numero, idxNumero)=>(
                      <div key={idxNumero} className="maquinaria-field">
                        <label> INGRESA EL NÚMERO DE MÁQUINA: </label>
                        <input 
                          type="number"
                          value={numero}
                          onChange={(e) => actualizarNumeroMaquinaria(index, idxNumero, e.target.value)}
                          placeholder="INGRESA EL NÚMERO DE LA MAQUINARIA"
                          style={{ fontSize: "11px", padding: "12px" }}
                        />
                      </div>
                    ))}  
                  </div>
                )}
                <button type="button"
                  className="btn-delete"
                  onClick={()=> eliminarMaquinaria(index)}
                  title="Eliminar Maquinaria"
                  style={ { width: "5%", marginTop: "10px", minHeight: "44px" }}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={agregarMaquinaria}>
              <span style={{fontSize: "18px"}}>➕</span> AGREGAR MAQUINARIA
            </button>
          </div>
        </div>

        {/* DETALLES DE ACTIVIDADES */}
        <div className="subtitle">
          <h3>DETALLES DE ACTIVIDADES</h3>
        </div>

          
        <div className="card">
          {/* Input para agregar actividad manualmente - SIEMPRE visible para EQE*/}
          {mostrarCheckboxes && (
            <div style={
      { marginBottom: "15px", padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9", display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "5px", color: "#1565c0" }}>
                  AGREGAR ACTIVIDAD MANUALMENTE:
                </label>
                <input
                  type="text"
                  id="nuevaActividadManual"
                  placeholder="Escribe una nueva actividad y presiona Agregar..."
                  style={
            { width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #90caf9", fontSize: "12px", fontWeight: "500", backgroundColor: "white" }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const nuevaActividad = e.target.value.trim().toUpperCase();
                      if (nuevaActividad && !listaActividadesEQE.includes(nuevaActividad)) {
                        setListaActividadesEQE(prev => [...prev, nuevaActividad]);
                        setActividadesSeleccionadas(prev => ({ ...prev, [nuevaActividad]: true }));
                        e.target.value = "";
                      } else if (nuevaActividad && listaActividadesEQE.includes(nuevaActividad)) {
                        alert("⚠️ Esta actividad ya existe en la lista");
                      }
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const inputElement = document.getElementById("nuevaActividadManual");
                  const nuevaActividad = inputElement?.value.trim().toUpperCase();
                  if (nuevaActividad && !listaActividadesEQE.includes(nuevaActividad)) {
                    setListaActividadesEQE(prev => [...prev, nuevaActividad]);
                    setActividadesSeleccionadas(prev => ({ ...prev, [nuevaActividad]: true }));
                    if (inputElement) inputElement.value = "";
                  } else if (nuevaActividad && listaActividadesEQE.includes(nuevaActividad)) {
                    alert("⚠️ Esta actividad ya existe en la lista");
                  } else if (!nuevaActividad) {
                    alert("⚠️ Por favor escribe una actividad");
                  }
                }}
                style={
          { padding: "10px 20px", backgroundColor: "#1565c0", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "16px" }}>➕</span> Agregar Actividad
              </button>
            </div>
          )}
            

          {/* Lista de actividades con checkboxes - solo visible si hay actividades */}
          {mostrarCheckboxes && listaActividadesEQE.length > 0 && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: "15px" }}>
                  SELECCIONE LAS ACTIVIDADES QUE SE VAN A REALIZAR:
                </label>

                <div style={
          { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", maxHeight: "400px", overflowY: "auto" }}>
                  {listaActividadesEQE.map((actividad, index) => (
                    <label key={index} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              padding: "12px",
              cursor: "pointer",
              backgroundColor: actividadesSeleccionadas[actividad] ? "#e3f2fd" : "transparent",
              borderRadius: "4px",
              transition: "background-color 0.2s",
              justifyContent: "space-between"
            }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={actividadesSeleccionadas[actividad] || false}
                          onChange={() => toggleActividad(actividad)}
                          style={{ width: "22px", height: "22px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "16px", fontWeight: actividadesSeleccionadas[actividad] ? "500" : "normal" }}>
                  {actividad}
                </span>
                      </div>
                      {!actividadesGlobalesEQE.includes(actividad) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar la actividad "${actividad}"?`)) {
                              setListaActividadesEQE(prev => prev.filter(a => a !== actividad));
                              setActividadesSeleccionadas(prev => {
                                const newState = { ...prev };
                                delete newState[actividad];
                                return newState;
                              });
                            }
                          }}
                          style={{
                    padding: "4px 8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                    minHeight: "30px"
                  }}
                  title="Eliminar actividad"
                >
                          🗑️
                        </button>
                      )}
                    </label>
                  ))}
                </div>
                
                <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#e9ecef", borderRadius: "4px", fontSize: "14px"  }}>
                  <strong>Actividades seleccionadas:</strong> {Object.values(actividadesSeleccionadas).filter(v => v).length} de {listaActividadesEQE.length}
                </div>
              </div>
              

              {/* RESUMEN DE ACTIVIDADES SELECCIONADAS PARA EQE */}
              {Object.keys(actividadesSeleccionadas).filter(act => actividadesSeleccionadas[act]).length > 0 && (
                <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                  <label style={{ fontWeight: "bold", display: "block", marginBottom: "15px", color: "#2563eb" }}>
                    RESUMEN DE ACTIVIDADES SELECCIONADAS:
                  </label>
                  
                  {Object.keys(actividadesSeleccionadas)
                    .filter(actividad => actividadesSeleccionadas[actividad])
                    .map((actividad, index) => {
                      const integrantesConActividad = Object.values(actividadesIntegrantes).filter(
                        integrante => integrante.actividades?.some(act => act.actividad === actividad.trim())
                      );
                      const totalPlanificado = integrantesConActividad.reduce((sum, integrante) => {
                        const actividadEnIntegrante = integrante.actividades.find(act => act.actividad === actividad.trim());
                        return sum + (parseInt(actividadEnIntegrante?.cantidad_planificada) || 0);
                      }, 0);
                      const totalElaborado = integrantesConActividad.reduce((sum, integrante) => {
                        const actividadEnIntegrante = integrante.actividades.find(act => act.actividad === actividad.trim());
                        return sum + (parseInt(actividadEnIntegrante?.cantidad_elaborada) || 0);
                      }, 0);
                      return (
                        <div key={`resumen-eqe-${index}`} style={{ 
                  marginBottom: "15px", 
                  padding: "15px", 
                  border: "1px solid #dee2e6", 
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                          <div style={
                    { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "15px", alignItems: "center" }}>
                            <div style={{ fontWeight: "bold", fontSize: "16px" , color: "#1f2937" }}>
                              {actividad.trim()}
                              {integrantesConActividad.length > 0 && (
                                <span style={{ 
                          marginLeft: "10px", 
                          fontSize: "12px", 
                          color: "#28a745",
                          backgroundColor: "#d4edda",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          display: "inline-block"
                        }}>
                          {integrantesConActividad.length} INTEGRANTE(S)
                        </span>
                              )}
                            </div>
                            
                              <div>
                                <label style={{ fontSize:"12px", color: "#495057", display: "block", marginBottom: "5px" }}>PLANIFICADA:</label>
                                <input
                        type="number"
                        value={totalPlanificado}
                        readOnly
                        style={
                          { width: "100%", padding: "8px", border: "1px solid #28a745", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize: "12px", fontWeight: "bold", color: "#0f5132" }}
                      />
                              </div>
                              <div>
                                <label style={{ fontSize:"12px", color: "#495057", display: "block", marginBottom: "5px" }}>
                        ELABORADA:
                      </label>
                                <input
                        type="number"
                        value={totalElaborado}
                        readOnly
                        style={
                          { width: "100%", padding: "8px", border: `1px solid ${totalElaborado < totalPlanificado ? '#dc3545' : '#28a745'}`, borderRadius: "4px", backgroundColor: totalElaborado < totalPlanificado ? '#fff5f5' : '#e9ecef', fontSize: "12px", fontWeight: "bold", color: totalElaborado < totalPlanificado ? '#dc3545' : '#28a745' }}
                      />
                              </div>
                            </div>
                          
                          {integrantesConActividad.length === 0 && (
                            <div style={{
                      marginTop: "12px",
                      padding: "10px",
                      backgroundColor: "#fff3cd",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#856404",
                      textAlign: "center"
                    }}>
                              ⚠️ Aún no hay integrantes asignados a esta actividad. Ve a la sección "INTEGRANTES Y ACTIVIDADES" para asignar.
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )} 
            
          
          {/* Mensaje cuando NO hay actividades para EQE */}
          {mostrarCheckboxes && listaActividadesEQE.length === 0 && (
            <div style={{
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeeba",
              borderRadius: "8px",
              color: "#856404",
              fontSize: "14px",
              marginTop: "15px"
            }}>
              ⚠️ No se encontraron actividades para el producto {form.codigo_producto}. 
              Puedes agregar actividades manualmente en el campo de arriba.
            </div>
          )}
            
          
          {/* Mostrar actividades en texto plano para productos normales */}
          {!mostrarCheckboxes && form.detalles_actividades.split('\n').filter(act => act.trim() !== '').map((actividad, index) => {
            const integrantesConActividad = Object.values(actividadesIntegrantes).filter(integrante => integrante.actividades?.some(act => act.actividad === actividad.trim()));
            const totalPlanificado = integrantesConActividad.reduce((sum, integrante) => {
              const actividadEnIntegrante = integrante.actividades.find(act => act.actividad === actividad.trim());
              return sum + (parseInt(actividadEnIntegrante?.cantidad_planificada) || 0);
            }, 0);
            const totalElaborado = integrantesConActividad.reduce((sum, integrante) => {
              const actividadEnIntegrante = integrante.actividades.find(act => act.actividad === actividad.trim());
              return sum + (parseInt(actividadEnIntegrante?.cantidad_elaborada) || 0);
            }, 0);

            return (
              <div key={`actividad-${index}`} style={{ 
                marginBottom: "20px", 
                padding: "15px", 
                border: "1px solid #dee2e6", 
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
                position: "relative"
              }}>
                <button
                  type="button"
                  onClick={() => eliminarDetalleActividad(index)}
                  title="Eliminar actividad"
                  style={
                    { position: "absolute", top: "10px", right: "10px", padding: "6px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                >❌ Eliminar</button>
                  <div style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "20px", alignItems: "center", paddingRight: "80px" }}>
                  <div style={{ fontWeight: "bold", fontSize:  "18px" }}>
                    {actividad.trim()}
                    {integrantesConActividad.length > 0 && (
                      <span style={{ 
                        marginLeft: "10px", 
                        fontSize: "14px", 
                        color: "#28a745",
                        backgroundColor: "#d4edda",
                        padding: "2px 8px",
                        borderRadius: "12px"
                      }}>{integrantesConActividad.length} INTEGRANTE(S)</span>
                    )}
                  </div>
                  <div className="actividad-normal-cantidades">
                    <div>
                      <label style={{ fontSize: "14px", color: "#495057", display: "block", marginBottom: "5px" }}>PLANIFICADA TOTAL:</label>
                      <input
                        type="number"
                        value={totalPlanificado}
                        readOnly
                        style={
                          { width: "100%", padding: "10px", border: "1px solid #28a745", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize: "12px", fontWeight: "bold", color: "#0f5132" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize:  "14px", color: "#495057", display: "block", marginBottom: "5px" }}>ELABORADA TOTAL:</label>
                      <input
                        type="number"
                        value={totalElaborado}
                        readOnly
                        style={
                          { width: "100%", padding: "10px", border: `1px solid ${totalElaborado < totalPlanificado ? '#dc3545' : '#28a745'}`, borderRadius: "4px", backgroundColor: totalElaborado < totalPlanificado ? '#fff5f5' : '#e9ecef', fontSize: "12px", fontWeight: "bold", color: totalElaborado < totalPlanificado ? '#dc3545' : '#28a745' }}
                      />
                    </div>
                  </div>
                </div>
                {integrantesConActividad.length > 0 && (
                  <div style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#e9ecef",
                    border: "1px solid #ced4da",
                    borderRadius: "4px",
                    fontSize:"14px" 
                  }}>
                    <strong>DISTRIBUCIÓN:</strong> {integrantesConActividad.length} integrantes × horas variables
                    {totalPlanificado > 0 && (
                      <> | <strong>AVANCE:</strong> {Math.round((totalElaborado/totalPlanificado)*100)}%</>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* INPUT Y BOTÓN PARA AGREGAR NUEVO DETALLE (solo para productos normales) */}
          {!mostrarCheckboxes && (
            <div style={
      { marginTop: "20px", padding: "15px", backgroundColor: "#f8fafc", border: "1px dashed #0284c7", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "5px", color: "#1f2937" }}>
                  NUEVA ACTIVIDAD:
                </label>
                <input
                  type="text"
                  value={nuevoDetalleActividad}
                  onChange={(e) => setNuevoDetalleActividad(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && agregarDetalleActividad()}
                  placeholder="Escribe una nueva actividad y presiona Enter o haz clic en Agregar..."
                  style={
            { width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px", fontWeight: "500" }}
                />
              </div>
              <button
                type="button"
                onClick={agregarDetalleActividad}
               style={
          { padding: "10px 20px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "16px" }}>➕</span> Agregar Actividad
              </button>
            </div>
          )}
        </div>
        
        {/* INTEGRANTES Y ACTIVIDADES */}
        <div className="card2">
          <h3>INTEGRANTES Y ACTIVIDADES</h3>
        </div>
        
        <div className="cabecera4">
          <div className="form-group">
            <label> NOMBRES Y CARGOS DE INTEGRANTES CON SUS ACTIVIDADES: </label>
            
            {integrantes.map((integrante, integranteIndex) => (
              <div key={integrante.id ?? integranteIndex} style={{ 
                marginBottom: "30px", 
                padding: "20px", 
                border: "1px solid #dee2e6", 
                borderRadius: "8px",
                backgroundColor: integranteIndex % 2 === 0 ? "#f8f9fa" : "#ffffff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={
                  { display: "grid", gridTemplateColumns: "auto 2fr 1fr auto", gap: 10, marginBottom: 20, alignItems: "center", backgroundColor: "#e9ecef", padding: "10px", borderRadius: "6px" }}>
                  <span style={{ fontSize:"20px", textAlign: "center" }}>👤</span>
                  <input 
                    type="text" 
                    value={integrante.nombre} 
                    onChange={(e) => {
                      const valorEnMayusculas = e.target.value.toUpperCase();
                      const nuevosIntegrantes = [...integrantes];
                      nuevosIntegrantes[integranteIndex] = {
                        ...nuevosIntegrantes[integranteIndex],
                        nombre: valorEnMayusculas
                      };
                      setIntegrantes(nuevosIntegrantes);
                      setActividadesIntegrantes(prev => {
                        const key = `integrante_${integranteIndex}`;
                        if (prev[key]) {
                          return {
                            ...prev,
                            [key]: {
                              ...prev[key],
                              nombre: valorEnMayusculas
                            }
                          };
                        }
                        return prev;
                      });
                    }}
                    placeholder="ESCRIBE EL NOMBRE DEL INTEGRANTE..."
                    style={
                      { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", fontWeight: "bold", fontSize: "12px" }}
                  />
                  <select
                    value={integrante.cargo}
                    onChange={(e) => actualizarCargoIntegrante(integranteIndex, e.target.value)}
                    style={
                      { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", cursor: "pointer" }}
                  >
                    <option value="LÍDER">LÍDER</option>
                    <option value="COSTURERA/O">COSTURERA/O</option>
                    <option value="REMATADORA/O">REMATADORA/O</option>
                    <option value="APRENDÍZ DE COSTURA">APRENDÍZ DE COSTURA</option>
                    <option value="OPERARIA/O">OPERARIA/O</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                  <button 
                    type="button" 
                    onClick={() => eliminarIntegrante(integranteIndex)} 
                    title="Eliminar integrante"
                    style={
                      { padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    ❌ ELIMINAR
                  </button>
                </div>

                {integrante.cargo === "OTRO" && (
                  <div style={{
                    padding:"10px",
                    marginLeft:  "0",
                    marginBottom: "15px",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeeba",
                    borderRadius: "4px"
                  }}>
                    <input
                      type="text"
                      value={integrante.cargoOtro || ""}
                      onChange={(e) => {
                        const valorEnMayusculas = e.target.value.toUpperCase();
                        const nuevosIntegrantes = [...integrantes];
                        nuevosIntegrantes[integranteIndex] = {
                          ...nuevosIntegrantes[integranteIndex],
                          cargoOtro: valorEnMayusculas
                        };
                        setIntegrantes(nuevosIntegrantes);
                      }}
                      placeholder="ESCRIBA EL CARGO CORRESPONDIENTE"
                      style={
                        { width: "100%", padding: "8px", border: "1px solid #007bff", borderRadius: "4px", fontSize: "12px" }}
                      autoFocus
                    />
                  </div>
                )}

                <div style={{ marginLeft: "0"  }}>
                  <h4 style={{ 
                    marginBottom: "15px", 
                    fontSize: "18px", 
                    color: "#495057",
                    borderBottom: "2px solid #28a745",
                    paddingBottom: "5px",
                    display: "inline-block"
                  }}>Actividades asignadas:</h4>
          
                  {(actividadesIntegrantes[`integrante_${integranteIndex}`]?.actividades || []).map((actividad, actividadIndex) => (
                    <div key={actividadIndex} style={
                      { display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.8fr 0.8fr 1.6fr auto", gap: "10px", marginBottom: "10px", alignItems: "center", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "4px", border: "1px solid #dee2e6" }}>
                      <select
                        value={actividad.actividad}
                        onChange={async (e) => {
                          const actividadSeleccionada = e.target.value;
                          actualizarActividadIntegrante(integranteIndex, actividadIndex, "actividad", actividadSeleccionada);
                          setManualHorasPersona(prev => ({
                            ...prev,
                            [`${integranteIndex}_${actividadIndex}`]: false
                          }));
                          if (actividadSeleccionada) {
                            try {
                               const response = await api.get("/actividad/cantidadPorHora", {
                                params: { actividad: actividadSeleccionada, codigo: form.codigo_producto }
                              });
                              const cantidadBase = response.data.cantidad_por_hora;
                              setActividadesConHoras(prev => {
                                const nuevas = [...prev];
                                const idx = nuevas.findIndex(a => a.actividad === actividadSeleccionada);
                                if (idx >= 0) {
                                  nuevas[idx] = { ...nuevas[idx], cantidad_base: cantidadBase };
                                } else {
                                  nuevas.push({ actividad: actividadSeleccionada, cantidad_base: cantidadBase });
                                }
                                return nuevas;
                              });
                            } catch (error) {
                              console.error("Error cargando cantidad base:", error);
                            }
                          }
                        }}
                        style={
                          { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", fontSize: "11px" }}
                      >
                        <option value="">SELECCIONE ACTIVIDAD...</option>
                        {mostrarCheckboxes 
                          ? listaActividadesEQE.filter(act => actividadesSeleccionadas[act]).map((act, idx) => (
                              <option key={idx} value={act}>{act}</option>
                            ))
                          : form.detalles_actividades.split('\n').filter(act => act.trim() !== '').map((act, idx) => (
                              <option key={idx} value={act.trim()}>{act.trim()}</option>
                            ))
                        }
                      </select>

                      <input
                        type="text"
                        value={actividad.horas_persona || ''}
                        placeholder="HH:MM"
                        readOnly={!manualHorasPersona[`${integranteIndex}_${actividadIndex}`] && actividad.cantidad_planificada && actividadesConHoras.find(a => a.actividad === actividad.actividad)?.cantidad_base}
                        onChange={(e) => {
                          const esBloqueado = !manualHorasPersona[`${integranteIndex}_${actividadIndex}`] && 
                           actividad.cantidad_planificada && 
                           actividadesConHoras.find(a => a.actividad === actividad.actividad)?.cantidad_base;
                          if (!esBloqueado) {
                            actualizarActividadIntegrante(integranteIndex, actividadIndex, "horas_persona", e.target.value);
                            setManualHorasPersona(prev => ({ ...prev, [`${integranteIndex}_${actividadIndex}`]: true }));
                          }
                        }}
                       style={{
                        padding: "8px", border: "1px solid #007bff", borderRadius: "4px", width: "100%", fontSize: "11px", fontWeight: "bold", backgroundColor: !manualHorasPersona[`${integranteIndex}_${actividadIndex}`] && actividad.cantidad_planificada && actividadesConHoras.find(a => a.actividad === actividad.actividad)?.cantidad_base ? "#e9ecef" : "#ffffff",
                      cursor: !manualHorasPersona[`${integranteIndex}_${actividadIndex}`] && actividad.cantidad_planificada && actividadesConHoras.find(a => a.actividad === actividad.actividad)?.cantidad_base ? "not-allowed" : "text"
                    }} 
                      />

                      <input
                        type="number"
                        min="0"
                        value={actividad.cantidad_planificada || ''}
                        onChange={(e) => {
                          const cantidadPlanificada = e.target.value;
                          const actividadBase = actividadesConHoras.find(a => a.actividad === actividad.actividad);
                          const cantidadBase = parseFloat(actividadBase?.cantidad_base);
                          const esManualHoras = manualHorasPersona[`${integranteIndex}_${actividadIndex}`];
                          let horasPersona = '';
                          if (!esManualHoras && cantidadPlanificada && cantidadBase) {
                            horasPersona = decimalParaHorasMinutos(parseFloat(cantidadPlanificada) / cantidadBase);
                          } else if (esManualHoras) {
                            horasPersona = actividad.horas_persona;
                          }
                          actualizarActividadIntegrante(integranteIndex, actividadIndex, "cantidad_planificada", cantidadPlanificada);
                          if (!esManualHoras && horasPersona) {
                            actualizarActividadIntegrante(integranteIndex, actividadIndex, "horas_persona", horasPersona);
                          }
                        }}
                        placeholder="CANT. PLANIF."
                        style={
                          { padding: "8px", border: "1px solid #28a745", borderRadius: "4px", width: "100%", fontSize: "11px", fontWeight: "bold" }}
                      />

                      <input
                        type="number"
                        min="0"
                        value={actividad.cantidad_elaborada || ''}
                        onChange={(e) => actualizarActividadIntegrante(integranteIndex, actividadIndex, "cantidad_elaborada", e.target.value)}
                        placeholder="CANT. ELABOR."
                        style={
                          { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", width: "100%", fontSize: "11px" }}
                      />

                      <textarea 
                        type="text"
                        placeholder="Ingrese las observaciones del Integrante"
                        value={actividad.observaciones_integrante || ''}
                        onChange={(e) => actualizarActividadIntegrante(integranteIndex, actividadIndex, "observaciones_integrante", e.target.value)}
                        style={
                          { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", fontWeight: "bold", fontSize: "11px" }}
                      />

                      <button
                        type="button"
                        onClick={() => eliminarActividadDeIntegrante(integranteIndex, actividadIndex)}
                        style={
                          { padding: "8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => agregarActividadAIntegrante(integranteIndex)}
                    style={
                      { marginTop: "15px", padding: "10px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                  >
                    ➕ AGREGAR ACTIVIDAD A {integrante.nombre ? integrante.nombre.split(' ')[0] : 'INTEGRANTE'}
                  </button>
                </div>
              </div>
            ))}
        
            <div className="text-center">
              <button 
                type="button" 
                className="btn" 
                onClick={agregarIntegrante}
                style={
                  { padding: "12px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
              >
                ➕ Agregar Nuevo Integrante
              </button>
            </div>
          </div>
        </div>
          
        <div className="card2">
          <h3>OBSERVACIONES</h3>
        </div>
        <div className="cabecera4">
          <div className="form-group">
            <textarea placeholder="INGRESA LAS OBSERVACIONES QUE TENGAS PARA EL REGISTRO... (OPCIONAL)" className="textObs" id="observaciones" name="observaciones" rows={4} value={form.observaciones} onChange={onChange} />
          </div>
        </div>
        
        <button type="submit" className="btn-guardar" style={{ padding: "16px", fontSize: "14px", minHeight: "56px" }}>
          GUARDAR REGISTRO DE PRODUCCIÓN
        </button>
      </form>
    </div>
  );
}