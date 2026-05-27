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
    "MODULO 9":"MODULO 9",
    "MODULO 10":"MODULO 10",
    "MODULO 11":"MODULO 11",
    "MODULO 12":"MODULO 12",
    "MODULO 13":"MODULO 13",
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
  const [cantidadesActividades, setCantidadesActividades] = useState({});
  const [actividadesIntegrantes, setActividadesIntegrantes] = useState({});
  const [nuevoDetalleActividad, setNuevoDetalleActividad] = useState("");
  const [actividadesConHoras, setActividadesConHoras] = useState([]);
  const [cantidadBaseProducto, setCantidadBaseProducto] = useState("0");
  const [_cargandoBase, setCargandoBase] = useState(false);
  const [manualCantidadPlanificada, setManualCantidadPlanificada] = useState(false);
  const [manualHorasPersona, setManualHorasPersona] = useState({});
  
  // NUEVOS ESTADOS PARA EQE
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState({});
  const [mostrarCheckboxes, setMostrarCheckboxes] = useState(false);
  const [listaActividadesEQE, setListaActividadesEQE] = useState([]);
  const [actividadesGlobalesEQE, setActividadesGlobalesEQE] = useState([]);
  const [_productosEQECargados, setProductosEQECargados] = useState(new Set());

  // ESTADOS PARA RESPONSIVE EN GALAXY TAB A
  const [isGalaxyTabA, setIsGalaxyTabA] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  // Detectar Galaxy Tab A y orientación
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detectar Galaxy Tab A 8.0" 2019 (1200x1920 o 1920x1200)
      const isTabADimensions = (width >= 800 && width <= 1200 && height >= 1200 && height <= 1920) ||
                              (width >= 1200 && width <= 1920 && height >= 800 && height <= 1200);
      
      setIsGalaxyTabA(isTabADimensions);
      setIsPortrait(height > width);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Función para obtener estilos responsivos
  const getResponsiveStyle = (baseStyle, tabletStyle, portraitStyle = null) => {
    if (!isGalaxyTabA) return baseStyle;
    if (!isPortrait && portraitStyle) return portraitStyle;
    return tabletStyle;
  };

  // Función para obtener clases responsivas
  const _getResponsiveClass = (baseClass, tabletClass) => {
    if (!isGalaxyTabA) return baseClass;
    return `${baseClass} ${tabletClass}`;
  };

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
        
        // Resetear actividades globales EQE si el nuevo producto no es EQE
        const esEQE = valorFinal.toUpperCase().startsWith("EQE");
        if (!esEQE) {
          setActividadesGlobalesEQE([]);
          setProductosEQECargados(new Set());
          setListaActividadesEQE([]);
        }
      }

      if (name === "cantidad_planificada") {
        setManualCantidadPlanificada(true);
      }

      if (name === "hora_inicio" || name === "hora_fin") {
        const inicio = name === "hora_inicio" ? valorFinal : prev.hora_inicio;
        const fin = name === "hora_fin" ? valorFinal : prev.hora_fin;
        
        const horasTrabajadas = calcularHorasTrabajadas(inicio, fin);
        newForm.hora_planificada = horasTrabajadas;
        
        if (!manualCantidadPlanificada && cantidadBaseProducto && horasTrabajadas !== "0" && horasTrabajadas !== "0.00") {
          const base = parseFloat(cantidadBaseProducto);
          const horas = parseFloat(horasTrabajadas);
          
          if (!isNaN(base) && !isNaN(horas) && horas > 0) {
            const cantidadCalculada = Math.floor(base * horas);
            newForm.cantidad_planificada = cantidadCalculada.toString();
          } else {
            newForm.cantidad_planificada = cantidadBaseProducto;
          }
        } else if (!manualCantidadPlanificada) {
          newForm.cantidad_planificada = cantidadBaseProducto;
        }
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
  
  const esEQE = codigo_producto.toUpperCase().startsWith("EQE");
  setMostrarCheckboxes(esEQE);
  
  if (esEQE) {
    // ✅ PARA EQE: Limpiar y cargar actividades maestras
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
    // ✅ PARA PRODUCTOS NORMALES (NO EQE): Cargar actividades desde el backend
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
  }
  
}, [form.codigo_producto]);


  // Función para toggle de actividad seleccionada (para EQE)
  const toggleActividad = (actividad) => {
    setActividadesSeleccionadas(prev => ({
      ...prev,
      [actividad]: !prev[actividad]
    }));
  };
  
  // Función para obtener las actividades seleccionadas como texto
  const getActividadesSeleccionadasTexto = () => {
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
    const isCodigoNoAplica = /^(CF|RCTEL|BCD|TAB|FPQ)/i.test(codigoLimpio);

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
            actualizarInsumo(index, "lote_insumo", "Error interno del servidor");
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
        campo === "entrega" ||
        campo === "recepcion"
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      let actividadesTexto = form.detalles_actividades;
      
      if (mostrarCheckboxes) {
        actividadesTexto = getActividadesSeleccionadasTexto();
      }
      
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

      await api.post("/registros", datosCompletos);

      setMsg("Registro guardado correctamente");

      //await generarPDF();

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
      setIntegrantes([]);
      setForm((p) => ({ ...p, supervisor: "", responsable: "" }));
      return;
    }

    const cargarPersonal = async () => {
      setLoadingPersonal(true);
      try {
        const { data } = await api.get("/modulos/personal", {
          params: { modulo: hoja },
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
        setIntegrantes([]);
        setForm((p) => ({ ...p, supervisor: "", responsable: "" }));
      } finally {
        setLoadingPersonal(false);
      }
    };

    cargarPersonal();
  }, [form.modulo]);

  {/*const generarPDF = async() =>{
    const elemento = document.getElementById("formulario");

    const canvas = await html2canvas(elemento);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p","mm","a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("registro.pdf");
  }*/}

  return (
    <div 
      id="formulario" 
      className="registro-container"
      style={isGalaxyTabA ? { 
        padding: isPortrait ? "12px" : "16px",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100%"
      } : {}}
    >
      {msg && (
        <div className={`toast ${msg.toLowerCase().includes("error") ? "error" : "success"}`}>
          {msg}
        </div>
      )}
      <header style={isGalaxyTabA ? { flexDirection: isPortrait ? "column" : "row", gap: "12px" } : {}}>
        <div className="logo-left">
          <img src={logo_safemed} alt="logo" className="logo" />
        </div>
        <h1 style={isGalaxyTabA ? { fontSize: isPortrait ? "1.2rem" : "1rem", margin: isPortrait ? "0" : "0 15px" } : {}}>REGISTRO DE CONFECCIÓN O AUTOMÁTICAS - EMPAQUE Y CONTROL DE ACTIVIDADES</h1>
        <div className="logo-right">
          <img src={logo3} alt="logo2" className="logo" />
        </div>
      </header>

      <button 
        className="btn" 
        type="button" 
        onClick={() => nav("/")}
        style={isGalaxyTabA ? { padding: "12px 20px", fontSize: "14px", minHeight: "44px" } : {}}
      >
        ⬅ Volver
      </button>

      <form onSubmit={onSubmit}>
        {/* CABECERA */}
        <div className="card">
          <div style={getResponsiveStyle(
            { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" },
            { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
            { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }
          )}>
            <div className="form-group">
              <label htmlFor="fecha">FECHA:</label>
              <input type="date" id="fecha" name="fecha" value={form.fecha} onChange={onChange} style={getResponsiveStyle({fontSize:"14px"}, {fontSize:"16px", padding:"12px"})} />
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
                style={getResponsiveStyle(
                  { flex: 1, fontSize: "12px", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da" },
                  { flex: 1, fontSize: "14px", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da" }
                )}
                autoComplete="off"
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
                  fontSize: "12px",
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
              <label htmlFor="turno" style={{fontSize:"12px"}}>TURNO:</label>
              <select id="turno" name="turno" value={form.turno} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}>
                <option value="">SELECCIONA EL TURNO...</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="area">ÁREA:</label>
              <select id="area" name="area" value={form.area} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}>
                <option value="">SELECCIONA EL ÁREA...</option>
                <option value="CONFECCIÓN">CONFECCIÓN</option>
                <option value="AUTOMÁTICAS">AUTOMÁTICAS</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modulo">MÓDULO:</label>
              <select id="modulo" name="modulo" value={form.modulo} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}>
                <option value="">SELECCIONE...</option>
                <option value="MODULO 1">MÓDULO 1</option>
                <option value="MODULO 2">MÓDULO 2</option>
                <option value="MODULO 3">MÓDULO 3</option>
                <option value="MODULO 4">MÓDULO 4</option>
                <option value="MODULO 5">MÓDULO 5</option>
                <option value="MODULO 6">MÓDULO 6</option>
                <option value="MODULO 7">MÓDULO 7</option>
                <option value="MODULO 8">MÓDULO 8</option>
                <option value="MODULO 9">MÓDULO 9</option>
                <option value="MODULO 10">MÓDULO 10</option>
                <option value="MODULO 11">MÓDULO 11</option>
                <option value="MODULO 12">MÓDULO 12</option>
                <option value="MODULO 13">MÓDULO 13</option>
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
            <div style={getResponsiveStyle(
              { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" },
              { display: "grid", gridTemplateColumns: "1fr", gap: "12px" },
              { display: "grid", gridTemplateColumns: "1fr", gap: "12px" }
            )}>
              <div className="form-group">
                <label htmlFor="responsable">RESPONSABLE:</label>
                <input
                  placeholder="SELECCIONA PRIMERO EL MÓDULO..."
                  type="text"
                  id="responsable"
                  name="responsable"
                  value={form.responsable || ""}
                  disabled={!form.modulo}
                  style={getResponsiveStyle(
                    { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", width: "100%", backgroundColor: !form.modulo ? "#f3f4f6" : "#e9ecef", cursor: "not-allowed", fontSize: "12px" },
                    { padding: "12px", borderRadius: "6px", border: "1px solid #d1d5db", width: "100%", backgroundColor: !form.modulo ? "#f3f4f6" : "#e9ecef", cursor: "not-allowed", fontSize: "14px" }
                  )}
                />
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
                  style={getResponsiveStyle(
                    { padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db", width: "100%", backgroundColor: !form.modulo ? "#f3f4f6" : "#e9ecef", cursor: "not-allowed", fontSize:"12px" },
                    { padding: "12px", borderRadius: "6px", border: "1px solid #d1d5db", width: "100%", backgroundColor: !form.modulo ? "#f3f4f6" : "#e9ecef", cursor: "not-allowed", fontSize:"14px" }
                  )}
                />
              </div>
            </div>
          </div>
        
          <div className="cabecera2">
            <div style={getResponsiveStyle(
              { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" },
              { display: "grid", gridTemplateColumns: "1fr", gap: "12px" },
              { display: "grid", gridTemplateColumns: "1fr", gap: "12px" }
            )}>
              <div className="form-group">
                <label htmlFor="personal_asignado">PERSONAL ASIGNADO: </label>
                <select id="personal_asignado" name="personal_asignado" value={form.personal_asignado} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}>
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
                  <input type="number" id="personal_otro" name="personal_otro" min="1" max="20" placeholder="INGRESA LA CANTIDAD DEL PERSONAL. EJ: 15" value={form.personal_otro} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}/>
                </div>
              )}
              <div className="form-group">
                <label>PERSONAL PRESENTE: </label>
                <input placeholder="INGRESA LA CANTIDAD DEL PERSONAL PRESENTE..." type="number" id="personal_presente" name="personal_presente" min="0" max="20" value={form.personal_presente} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}/>
              </div>
            </div>
          </div>

          <div className="cabecera3">
            <div style={getResponsiveStyle(
              { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "20px" },
              { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
              { display: "grid", gridTemplateColumns: "1fr", gap: "12px" }
            )}>
              <div className="form-group">
                <label htmlFor="codigo_producto">REFERENCIA:</label>
                <input
                  id="codigo_producto"
                  name="codigo_producto"
                  value={form.codigo_producto}
                  onChange={onChange}
                  style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="descripcion">DESCRIPCIÓN:</label>
                <textarea id="descripcion" name="descripcion" rows={4} value={form.descripcion} onChange={onChange} className="input-disabled" style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}/>
              </div>
              <div className="form-group">
                <label htmlFor="hora_planificada">TIEMPO: </label>
                <input htmlFor="number" id="hora_planificada" name="hora_planificada" value={form.hora_planificada} onChange={onChange} className="input-disabled" placeholder="Se calculará automaticamente" readOnly style={getResponsiveStyle({fontSize: "16px"}, {fontSize: "18px", padding:"12px"})}/>
              </div>
              <div className="form-group">
                <label htmlFor="cantidad_planificada">CANTIDAD PLANIFICADA:</label>
                <input type="number" id="cantidad_planificada" name="cantidad_planificada" value={form.cantidad_planificada} onChange={onChange} className="input-disabled" style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})} />
              </div>
              <div className="form-group">
                <label htmlFor="lotePrincipal">LOTE MAESTRO:</label>
                <input type="text" id="lotePrincipal" name="lotePrincipal" value={form.lotePrincipal} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})} />
              </div>
              <div className="form-group">
                <label htmlFor="loteSecundario" >N°:</label>
                <input placeholder="INGRESA EL DÍA LOTE (OPCIONAL)" type="text" id="loteSecundario" name="loteSecundario" value={form.loteSecundario} onChange={onChange} style={getResponsiveStyle({fontSize:"12px"}, {fontSize:"14px", padding:"12px"})}/>
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
              <div style={{ marginBottom: "15px", color: "#000", fontWeight: "bold", fontSize: "12px"}}>
                {insumos.length} INSUMO(S) CARGADO(S)
              </div>
            )}
            
            {insumos.map((item, index) => (
              <div key={item.id || index} style={getResponsiveStyle(
                { display: "grid", width: "950px", gridTemplateColumns: "1.8fr 4fr 1.5fr 1.1fr 3.4fr 2.6fr 2.5fr auto", gap: "20px", marginBottom: "25px", alignItems: "center", padding: "20px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6", boxSizing: "border-box" },
                { display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "20px", padding: "15px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6", width: "100%" },
                { display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "20px", padding: "15px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6", width: "100%" }
              )}>
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
                         style={getResponsiveStyle(
                           { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize:"10px" },
                           { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize:"14px" }
                         )}/>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> DESCRIPCIÓN: </label>
                  <input type="text" value={item.descripcion_insumo || ""} readOnly style={getResponsiveStyle(
                    { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#e9ecef", color: "#495057", fontSize:"10px" },
                    { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#e9ecef", color: "#495057", fontSize:"14px" }
                  )}/>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}>CANTIDAD: </label>
                  <input type="number" step="any" value={item.cantidad_insumo || ""} onChange={(e) => actualizarInsumo(index, "cantidad_insumo", e.target.value)} min="0" max="100000"
                    style={getResponsiveStyle(
                      { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"9.5px" },
                      { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"14px" }
                    )} placeholder="EJ: 10"/>
                </div>

                <div>
                  <label style={{display: "block", marginBottom: "5px", fontSize: "10px", fontWeight:"500"}}>UNIDAD MEDIDA:</label>
                  <input type="text" value={item.descrip_cant_insumo || ""} onChange={(e)=> actualizarInsumo(index,"descrip_cant_insumo", e.target.value)}
                  style={getResponsiveStyle(
                    { width: "100%", padding: "8px", border:"1px solid #ced4da", borderRadius: "4px", fontSize:"10px" },
                    { width: "100%", padding: "12px", border:"1px solid #ced4da", borderRadius: "4px", fontSize:"14px" }
                  )} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> LOTE: </label>
                  <input type="text" value={item.lote_insumo || ""} onChange={(e) => actualizarInsumo(index, "lote_insumo", e.target.value)} style={getResponsiveStyle(
                    { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"10px" },
                    { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"14px" }
                  )} placeholder="N° DE LOTE"/>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> ENTREGA: </label>
                  <input className="input-uppercase" type="text" value={item.entrega || ""} onChange={(e) => actualizarInsumo(index, "entrega", e.target.value)} style={getResponsiveStyle(
                    { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"10px" },
                    { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"14px" }
                  )} placeholder="INGRESA EL NOMBRE DE LA PERSONA QUE ENTREGA"/>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", fontWeight: "500" }}> RECEPCIÓN: </label>
                  <select value={item.recepcion || ""} onChange={(e) => actualizarInsumo(index, "recepcion", e.target.value)} style={getResponsiveStyle(
                    { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"10px" },
                    { width: "100%", padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", fontSize:"14px" }
                  )}>
                    <option value="">SELECCIONA LA PERSONA QUE RECIBE...</option>
                    {integrantes.map((integrante, idx) => (
                      <option key={idx} value={integrante.nombre}>
                        {integrante.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "10px", color: "transparent" }}> ACCIÓN: </label>
                  <button type="button" onClick={() => eliminarInsumo(index)} style={getResponsiveStyle(
                    { padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "10px" },
                    { padding: "12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", minHeight: "44px" }
                  )}>
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
                style={getResponsiveStyle(
                  { padding: "12px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" },
                  { padding: "14px 24px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "18px", fontWeight: "bold", minHeight: "48px" }
                )}
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
              <div key={item.id || index} style={getResponsiveStyle(
                { display: "grid", width: "950px", gridTemplateColumns: "2.4fr 4.5fr 1.4fr 1.2fr 2fr 2.8fr 2.8fr auto", gap: "10px", marginBottom: "15px", alignItems: "center", padding: "15px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6" },
                { display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "15px", padding: "15px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6", width: "100%" },
                { display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "15px", padding: "15px", backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#ffffff", borderRadius: "8px", border: "1px solid #dee2e6", width: "100%" }
              )}>
                <div>
                  <label style={{fontSize:"11px", fontWeight:"500"}}>CÓDIGO DEL INSUMO:</label>
                  <select
                    value={item.codigo_insumo || ""}
                    onChange={(e) => actualizarReposicionNoConforme(index, "codigo_insumo", e.target.value)}
                    style={getResponsiveStyle(
                      { width: "100%", padding: "6px", fontSize: "11px", borderRadius: "4px" },
                      { width: "100%", padding: "12px", fontSize: "14px", borderRadius: "4px" }
                    )}
                  >
                    <option value="">SELECCIONE...</option>
                    {_listaNoConforme.map((insumo, idx) => (
                      <option key={idx} value={insumo.codigo}>
                        {insumo.codigo}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{fontSize:"11px", fontWeight:"500"}}>DESCRIPCIÓN:</label>
                  <input 
                    type="text" 
                    value={item.descripcion_insumo || ""} 
                    readOnly
                    style={getResponsiveStyle(
                      { width: "100%", padding: "6px", fontSize: "11px", backgroundColor: "#e9ecef" },
                      { width: "100%", padding: "12px", fontSize: "14px", backgroundColor: "#e9ecef" }
                    )}
                  />
                </div>
                
                <div>
                  <label style={{fontSize:"11px", fontWeight:"500"}}>CANTIDAD:</label>
                  <input 
                    type="number" 
                    value={item.cantidad} 
                    onChange={(e) => actualizarReposicionNoConforme(index, "cantidad", e.target.value)}
                    placeholder="EJ: 10"
                    style={getResponsiveStyle(
                      { width: "100%", padding: "6px", fontSize: "11px", borderRadius: "4px" },
                      { width: "100%", padding: "12px", fontSize: "14px", borderRadius: "4px" }
                    )}
                  />
                </div>
                
                <div>
                  <label style={{fontSize: "11px", fontWeight:"500"}}>UNIDAD MEDIDA:</label>
                  <input
                    type="text"
                    value={item.descrip_cant_insumo}
                    onChange={(e)=> actualizarReposicionNoConforme(index, "descrip_cant_insumo", e.target.value)}
                    placeholder="EJ: UDS"
                    style={getResponsiveStyle(
                      { width: "100%", padding: "6px", fontSize:"11px", borderRadius:"4px" },
                      { width: "100%", padding: "12px", fontSize:"14px", borderRadius:"4px" }
                    )}
                  />
                </div>
                
                <div>
                  <label style={{fontSize:"11px", fontWeight:"500"}}>LOTE:</label>
                  <input 
                    type="text" 
                    value={item.lote} 
                    onChange={(e) => actualizarReposicionNoConforme(index, "lote", e.target.value)}
                    placeholder="N° LOTE"
                    style={getResponsiveStyle(
                      { width: "100%", padding: "6px", fontSize: "11px", borderRadius: "4px" },
                      { width: "100%", padding: "12px", fontSize: "14px", borderRadius: "4px" }
                    )}
                  />
                </div>
                
                <div>
                  <label style={{fontSize:"11px", fontWeight:"500"}}>ENTREGA:</label>
                  <input 
                    type="text" 
                    value={item.entrega} 
                    onChange={(e) => actualizarReposicionNoConforme(index, "entrega", e.target.value)}
                    placeholder="QUIÉN ENTREGA"
                    style={getResponsiveStyle(
                      { width: "100%", padding: "6px", fontSize: "11px", borderRadius: "4px" },
                      { width: "100%", padding: "12px", fontSize: "14px", borderRadius: "4px" }
                    )}
                  />
                </div>
                
                <div>
                  <label style={{fontSize:"11px", fontWeight:"500"}}>RECEPCIÓN:</label>
                  <select 
                    value={item.recepcion} 
                    onChange={(e) => actualizarReposicionNoConforme(index, "recepcion", e.target.value)}
                    style={getResponsiveStyle(
                      { width: "100%", padding: "6px", fontSize: "11px", borderRadius: "4px" },
                      { width: "100%", padding: "12px", fontSize: "14px", borderRadius: "4px" }
                    )}
                  >
                    <option value="">SELECCIONA LA PERSONA QUE RECIBE...</option>
                    {integrantes.map((integrante, idx) => (
                      <option key={idx} value={integrante.nombre}>
                        {integrante.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <button 
                    type="button" 
                    onClick={() => eliminarNoConforme(index)}
                    style={getResponsiveStyle(
                      { padding: "6px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" },
                      { padding: "12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", minHeight: "44px" }
                    )}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={agregarNoConforme}
              style={getResponsiveStyle(
                { padding: "8px 15px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", marginTop: "10px" },
                { padding: "12px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", marginTop: "10px", minHeight: "44px" }
              )}
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
    flex-wrap: nowrap;        /* 👈 NUEVO: evita que se envuelvan a varias líneas */
    overflow-x: auto;         /* 👈 NUEVO: scroll horizontal si es necesario */
  }
  .etiqueta-field {
    flex: 0 0 auto;           /* 👈 CAMBIADO: 1 → 0 0 auto (tamaño automático) */
    min-width: 180px;         /* 👈 NUEVO: ancho mínimo */
  }
  .etiqueta-field label {
    display: block;
    font-size: 10px;          /* 👈 CAMBIADO: 11px → 10px */
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 4px;       /* 👈 CAMBIADO: 5px → 4px */
  }
  .etiqueta-field input,
  .etiqueta-field select {
    width: 100%;
    padding: 6px 10px;        /* 👈 CAMBIADO: 10px 12px → 6px 10px */
    border-radius: 6px;       /* 👈 CAMBIADO: 8px → 6px */
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
    padding: 6px;             /* 👈 CAMBIADO: 8px → 6px */
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;       /* 👈 CAMBIADO: 8px → 6px */
    cursor: pointer;
    width: 34px;              /* 👈 CAMBIADO: 38px → 34px */
    height: 34px;             /* 👈 CAMBIADO: 38px → 34px */
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
    padding: 8px 16px;        /* 👈 CAMBIADO: 12px 20px → 8px 16px */
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;       /* 👈 CAMBIADO: 8px → 6px */
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
              <div key={index} className="etiqueta-grid" style={isGalaxyTabA ? { width: "100%" } : {}}>
                <div className="etiqueta-field" style={{ flex: 1.2 }}>
                  <label>ETIQUETA</label>
                  <select 
                    value={item.descripcion_etiqueta} 
                    onChange={(e) => actualizarEtiqueta(index, "descripcion_etiqueta", e.target.value)}
                    style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}
                  >
                    <option value="">SELECCIONE...</option>
                    <option value="ETIQUETA ADHESIVA PARA CAJA MASTER">ETIQUETA ADHESIVA PARA CAJA MASTER</option>
                    <option value="ETIQUETA IMPRESA EN FUNDA">ETIQUETA IMPRESA EN FUNDA</option>
                    <option value="ETIQUETA DE PAPEL INDIVIDUAL">ETIQUETA DE PAPEL INDIVIDUAL</option>
                    <option value="ETIQUETA CON NOMBRE DE CLIENTE">ETIQUETA CON NOMBRE DE CLIENTE</option>
                  </select>
                </div>

                <div className="etiqueta-field" style={{ flex: 0.5 }}>
                  <label>CANTIDAD</label>
                  <input 
                    placeholder="INGRESA LA CANTIDAD DE LA ETIQUETA.."
                    type="number" 
                    min="0" 
                    max="9999" 
                    step="any"
                    value={item.cantidad_etiqueta ?? ""} 
                    onChange={(e) => actualizarEtiqueta(index, "cantidad_etiqueta", e.target.value)}
                    style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}
                  />
                </div>

                <div className="etiqueta-field" style={{ flex: 1.2 }}>
                  <label>ENTREGA</label>
                  <select
                    value={item.entrega_etiqueta}
                    onChange={(e)=> actualizarEntregaEtiqueta(index,"entrega_etiqueta", e.target.value)}
                    style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}
                  >
                    <option value="">SELECCIONE...</option>
                    <option value="BRYAN ALEXANDER CAJAMARCA BONILLA">BRYAN ALEXANDER CAJAMARCA BONILLA</option>
                    <option value="NATALY SILVANA TIPAN GUALOTUÑA">NATALY SILVANA TIPAN GUALOTUÑA</option>
                    <option value="ANA LUCIA GUAMAN PILATUÑA">ANA LUCIA GUAMAN PILATUÑA</option>
                  </select>
                </div>

                <div className="etiqueta-field" style={{ flex: 1 }}>
                  <label>RECEPCIÓN</label>
                  <input 
                    value={item.recepcion_etiqueta ?? ""} 
                    onChange={(e) => actualizarEtiqueta(index, "recepcion_etiqueta", e.target.value)} 
                    placeholder="INGRESA EL NOMBRE QUE RECIBE..."
                    style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}
                  />
                </div>

                <button 
                  type="button" 
                  className="btn-delete"
                  onClick={() => eliminarEtiqueta(index)} 
                  title="Eliminar etiqueta"
                  style={isGalaxyTabA ? { width: "100%", marginTop: "10px", minHeight: "44px" } : {}}
                >
                  🗑️
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={agregarEtiqueta} style={isGalaxyTabA ? { fontSize: "14px", padding: "14px 20px", minHeight: "48px" } : {}}>
              <span style={{ fontSize: "18px" }}>➕</span> AGREGAR ETIQUETA
            </button>
          </div> 
        </div>
        
        {/* SECCIÓN DE DOS COLUMNAS: CANTIDADES IZQUIERDA | CONFECCIÓN DERECHA */}
        <div style={getResponsiveStyle(
          { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" },
          { display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "20px" },
          { display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "20px" }
        )}>
        
          {/* COLUMNA DERECHA - CONFECCIÓN Y AUTOMÁTICAS */}
          <div>
            <div className="subtitle" style={{ marginBottom: "10px" }}>
              <h3>CONFECCIÓN Y AUTOMÁTICAS</h3>
            </div>
            <div className="card" style={{ padding: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={getResponsiveStyle(
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" }
                )}>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="hora_inicio" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>H. INICIO:</label>
                    <input 
                      type="time" 
                      id="hora_inicio" 
                      name="hora_inicio" 
                      value={form.hora_inicio} 
                      onChange={onChange} 
                      style={getResponsiveStyle(
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da" },
                        { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px" }
                      )}
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
                      style={getResponsiveStyle(
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da" },
                        { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px" }
                      )}
                    />
                  </div>
                </div>

                <div style={getResponsiveStyle(
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" }
                )}>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="destino" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>PARA:</label>
                    <select 
                      id="destino" 
                      name="destino" 
                      value={form.destino} 
                      onChange={onChange} 
                      style={getResponsiveStyle(
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" },
                        { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                      )}
                    >
                      <option value="">SELECCIONE EL DESTINATARIO...</option>
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="STOCK">STOCK</option>
                    </select>
                  </div>

                  {form.destino === "CLIENTE" && (
                    <div className="form-group" style={{ marginBottom: "0" }}>
                      <label htmlFor="n_cliente" style={{ fontWeight: "bold", marginBottom: "5px", display: "block", fontSize:"11px"}}>N. CLIENTE:</label>
                      <input 
                        type="text" 
                        id="n_cliente" 
                        name="n_cliente" 
                        value={form.n_cliente} 
                        onChange={onChange} 
                        style={getResponsiveStyle(
                          { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" },
                          { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                        )}
                        placeholder="INGRESA EL NOMBRE DEL CLIENTE..."
                      />
                    </div>
                  )}
                  {form.destino !== "CLIENTE" && <div></div>}
                </div>

                <div style={getResponsiveStyle(
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" }
                )}>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="esteril" style={{ fontWeight: "bold", marginBottom: "5px", display: "block"}}>ESTÉRIL:</label>
                    <select 
                      id="esteril" 
                      name="esteril" 
                      value={form.esteril} 
                      onChange={onChange} 
                      style={getResponsiveStyle(
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"11px" },
                        { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                      )}
                    >
                      <option value="">SELECCIONE...</option>
                      <option value="SÍ">SÍ</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                </div>

                <div style={getResponsiveStyle(
                  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: "10px" }
                )}>
                  <div className="form-group" style={{ marginBottom: "0" }}>
                    <label htmlFor="leyenda" style={{ fontWeight: "bold", marginBottom: "5px", display: "block" }}>LEYENDA:</label>
                    <select 
                      id="leyenda" 
                      name="leyenda" 
                      value={form.leyenda} 
                      onChange={onChange} 
                      style={getResponsiveStyle(
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" },
                        { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                      )}
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
                        style={getResponsiveStyle(
                          { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" },
                          { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                        )}
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
                      style={getResponsiveStyle(
                        { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" },
                        { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                      )}
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
                  <label htmlFor="cantidad_elaborado" style={{ fontWeight: "bold", marginBottom: "5px", display: "block", fontSize:"12px" }}>ELABORADO:</label>
                  <input 
                    type="number" 
                    id="cantidad_elaborado" 
                    name="cantidad_elaborado" 
                    value={form.cantidad_elaborado} 
                    onChange={onChange} 
                    style={getResponsiveStyle(
                      { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "12px" },
                      { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize: "14px" }
                    )}
                    placeholder="INGRESA LA CANTIDAD ELABORADA DEL PRODUCTO..."
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label htmlFor="cantidad_proceso" style={{ fontWeight: "bold", marginBottom: "5px", display: "block", fontSize:"12px" }}>PROCESO:</label>
                  <input 
                    type="number" 
                    id="cantidad_proceso" 
                    name="cantidad_proceso" 
                    value={form.cantidad_proceso} 
                    onChange={onChange} 
                    style={getResponsiveStyle(
                      { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" },
                      { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                    )}
                    placeholder="SE CALCULA AUTOMÁTICAMENTE..."
                    readOnly
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label htmlFor="cantidad_merma" style={{ fontWeight: "bold", marginBottom: "5px", display: "block", fontSize:"12px" }}>MERMA:</label>
                  <input 
                    type="text" 
                    id="cantidad_merma" 
                    name="cantidad_merma" 
                    value={form.cantidad_merma} 
                    onChange={onChange} 
                    style={getResponsiveStyle(
                      { width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"12px" },
                      { width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ced4da", fontSize:"14px" }
                    )}
                    placeholder="INGRESA LA CANTIDAD DE LA MERMA..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fecha_final_producto" >FECHA FINAL DE PRODUCTO TERMINADO:</label>
                  <input type="date" id="fecha_final_producto" name="fecha_final_producto" value={form.fecha_final_producto} onChange={onChange} style={getResponsiveStyle({fontSize:"14px"}, {fontSize:"16px", padding:"12px"})}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maquinaria */}
        <div className="card2">
          <h3> MAQUINARIA </h3>
        </div>
        <div className="card">
          <div className="form-group">
            <label> DESCRIPCIÓN DE LA MAQUINARIA: </label>
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
    flex-wrap: nowrap;  /* 👈 CAMBIADO: wrap → nowrap (no permite salto de línea) */
    overflow-x: auto;   /* 👈 NUEVO: permite scroll horizontal si es necesario */
  }
  .maquinaria-field {
    flex: 0 0 auto;     /* 👈 CAMBIADO: 1 → 0 0 auto (no se expande, tamaño automático) */
    min-width: 180px;   /* 👈 CAMBIADO: 220px → 180px */
  }
  .maquinaria-field label{
    display: block;
    font-size: 10px;    /* 👈 CAMBIADO: 11px → 10px */
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 4px;
  }
  .maquinaria-field input,
  .maquinaria-field select {
    width: 100%;        /* 👈 CAMBIADO: 30% → 100% */
    padding: 6px 10px;  /* 👈 CAMBIADO: 10px 12px → 6px 10px */
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
    display: flex;                    /* 👈 CAMBIADO: grid → flex */
    flex-direction: column;             /* 👈 NUEVO: horizontal */
    gap: 10px;
    align-items: flex-end;
    flex-wrap: nowrap;               /* 👈 NUEVO: sin salto de línea */
  }
  .numeros-maquina .maquinaria-field {
    min-width: 150px;                /* 👈 NUEVO: ancho específico */
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
              <div key={index} className="maquinaria-grid" style={isGalaxyTabA ? { width: "100%" } : {}}>
                <div className="maquinaria-field" style={{ flex: 1.2 }}>
                  <label>NOMBRE DE LA MAQUINARÍA:</label>
                  <select value={item.maquinaria}
                          onChange={(e)=> actualizarMaquinaria(index, "maquinaria", e.target.value)}
                          style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}
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
                    <option value="MÁQUINA DE BOLSOS O FUNDA">MÁQUINA DE BOLSOS O FUNDA</option>
                    <option value="VIDEO JET">VIDEO JET</option>
                    <option value="GORROS TIPO ARCODEÓN">GORROS TIPO ARCODEÓN</option>
                    <option value="ESTAMPADO">ESTAMPADO</option>
                    <option value="M. CINTAS">M. CINTAS</option>
                    <option value="LAVADORAS">LAVADORAS</option>
                    <option value="SECADORAS">SECADORAS</option>
                    <option value="BALANZA">BALANZA</option>
                    <option value="M. HOTMETL">M. HOTMETL</option>
                    <option value="M. AUTOMÁTICAS">M. AUTOMÁTICAS</option>
                    <option value="INJETH">INJETH</option>
                    <option value="DE PEDESTAL">DE PEDESTAL</option>
                    <option value="M. CNC">M. CNC</option>
                    <option value="M. PUÑOS">M. PUÑOS</option>
                    <option value="M. TALADRO">M. TALADRO</option>
                    <option value="M. VERTICALES MANUALES">M. VERTICALES MANUALES</option>
                  </select>
                </div>
                <div className="maquinaria-field" style={{ maxWidth: isGalaxyTabA ? "100%" : "180px" }}>
                  <label>CANTIDAD DE MAQUINARIA:</label>
                  <input type="text" min="1" value={item.cantidad_maquinaria} onChange={(e)=> actualizarMaquinaria(index, "cantidad_maquinaria", e.target.value)} style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}/>
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
                          style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}
                        />
                      </div>
                    ))}  
                  </div>
                )}
                <button type="button"
                  className="btn-delete"
                  onClick={()=> eliminarMaquinaria(index)}
                  title="Eliminar Maquinaria"
                  style={isGalaxyTabA ? { width: "100%", marginTop: "10px", minHeight: "44px" } : {}}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={agregarMaquinaria} style={isGalaxyTabA ? { fontSize: "14px", padding: "14px 20px", minHeight: "48px" } : {}}>
              <span style={{fontSize: "18px"}}>➕</span> AGREGAR MAQUINARIA
            </button>
          </div>
        </div>

        {/* DETALLES DE ACTIVIDADES - MODIFICADO */}
<div className="subtitle">
  <h3>DETALLES DE ACTIVIDADES</h3>
</div>

<div className="card">
  {/* Input para agregar actividad manualmente - SIEMPRE visible para EQE (independientemente de si hay actividades o no) */}
  {mostrarCheckboxes && (
    <div style={getResponsiveStyle(
      { marginBottom: "15px", padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9", display: "flex", gap: "10px", alignItems: "flex-end" },
      { marginBottom: "15px", padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9", display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" },
      { marginBottom: "15px", padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "8px", border: "1px solid #90caf9", display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" }
    )}>
      <div style={{ flex: 1 }}>
        <label style={{ display: "block", fontSize: isGalaxyTabA ? "14px" : "12px", fontWeight: "600", marginBottom: "5px", color: "#1565c0" }}>
          AGREGAR ACTIVIDAD MANUALMENTE:
        </label>
        <input
          type="text"
          id="nuevaActividadManual"
          placeholder="Escribe una nueva actividad y presiona Agregar..."
          style={getResponsiveStyle(
            { width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #90caf9", fontSize: "12px", fontWeight: "500", backgroundColor: "white" },
            { width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #90caf9", fontSize: "14px", fontWeight: "500", backgroundColor: "white" }
          )}
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
        style={getResponsiveStyle(
          { padding: "10px 20px", backgroundColor: "#1565c0", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" },
          { padding: "12px 20px", backgroundColor: "#1565c0", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }
        )}
      >
        <span style={{ fontSize: "16px" }}>➕</span> Agregar Actividad
      </button>
    </div>
  )}

  {/* Lista de actividades con checkboxes - solo visible si hay actividades */}
  {mostrarCheckboxes && listaActividadesEQE.length > 0 && (
    <>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "15px", fontSize: isGalaxyTabA ? "16px" : "14px" }}>
          SELECCIONE LAS ACTIVIDADES QUE SE VAN A REALIZAR:
        </label>

        <div style={getResponsiveStyle(
          { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "12px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", maxHeight: "400px", overflowY: "auto" },
          { display: "grid", gridTemplateColumns: "1fr", gap: "12px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", maxHeight: "400px", overflowY: "auto" },
          { display: "grid", gridTemplateColumns: "1fr", gap: "12px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #dee2e6", maxHeight: "400px", overflowY: "auto" }
        )}>
          {listaActividadesEQE.map((actividad, index) => (
            <label key={index} style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              padding: isGalaxyTabA ? "12px" : "8px",
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
                  style={{ width: isGalaxyTabA ? "22px" : "18px", height: isGalaxyTabA ? "22px" : "18px", cursor: "pointer" }}
                />
                <span style={{ fontSize: isGalaxyTabA ? "16px" : "14px", fontWeight: actividadesSeleccionadas[actividad] ? "500" : "normal" }}>
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
        
        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#e9ecef", borderRadius: "4px", fontSize: isGalaxyTabA ? "14px" : "12px" }}>
          <strong>Actividades seleccionadas:</strong> {Object.values(actividadesSeleccionadas).filter(v => v).length} de {listaActividadesEQE.length}
        </div>
      </div>

      {/* MOSTRAR RESUMEN DE ACTIVIDADES SELECCIONADAS PARA EQE */}
      {Object.keys(actividadesSeleccionadas).filter(act => actividadesSeleccionadas[act]).length > 0 && (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "15px", fontSize: isGalaxyTabA ? "16px" : "14px", color: "#2563eb" }}>
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
                  <div style={getResponsiveStyle(
                    { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "15px", alignItems: "center" },
                    { display: "grid", gridTemplateColumns: "1fr", gap: "12px", alignItems: "center" },
                    { display: "grid", gridTemplateColumns: "1fr", gap: "12px", alignItems: "center" }
                  )}>
                    <div style={{ fontWeight: "bold", fontSize: isGalaxyTabA ? "16px" : "14px", color: "#1f2937" }}>
                      {actividad.trim()}
                      
                      {integrantesConActividad.length > 0 && (
                        <span style={{ 
                          marginLeft: "10px", 
                          fontSize: isGalaxyTabA ? "12px" : "11px", 
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
                      <label style={{ fontSize: isGalaxyTabA ? "12px" : "11px", color: "#495057", display: "block", marginBottom: "5px" }}>
                        PLANIFICADA:
                      </label>
                      <input
                        type="number"
                        value={totalPlanificado}
                        readOnly
                        style={getResponsiveStyle(
                          { width: "100%", padding: "8px", border: "1px solid #28a745", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize: "12px", fontWeight: "bold", color: "#0f5132" },
                          { width: "100%", padding: "10px", border: "1px solid #28a745", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize: "14px", fontWeight: "bold", color: "#0f5132" }
                        )}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: isGalaxyTabA ? "12px" : "11px", color: "#495057", display: "block", marginBottom: "5px" }}>
                        ELABORADA:
                      </label>
                      <input
                        type="number"
                        value={totalElaborado}
                        readOnly
                        style={getResponsiveStyle(
                          { width: "100%", padding: "8px", border: `1px solid ${totalElaborado < totalPlanificado ? '#dc3545' : '#28a745'}`, borderRadius: "4px", backgroundColor: totalElaborado < totalPlanificado ? '#fff5f5' : '#e9ecef', fontSize: "12px", fontWeight: "bold", color: totalElaborado < totalPlanificado ? '#dc3545' : '#28a745' },
                          { width: "100%", padding: "10px", border: `1px solid ${totalElaborado < totalPlanificado ? '#dc3545' : '#28a745'}`, borderRadius: "4px", backgroundColor: totalElaborado < totalPlanificado ? '#fff5f5' : '#e9ecef', fontSize: "14px", fontWeight: "bold", color: totalElaborado < totalPlanificado ? '#dc3545' : '#28a745' }
                        )}
                      />
                    </div>
                  </div>
                  
                  {integrantesConActividad.length === 0 && (
                    <div style={{
                      marginTop: "12px",
                      padding: "10px",
                      backgroundColor: "#fff3cd",
                      borderRadius: "6px",
                      fontSize: isGalaxyTabA ? "12px" : "11px",
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
      fontSize: isGalaxyTabA ? "14px" : "12px",
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
          style={getResponsiveStyle(
            { position: "absolute", top: "10px", right: "10px", padding: "6px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" },
            { position: "absolute", top: "10px", right: "10px", padding: "10px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", minHeight: "44px" }
          )}
        >
          ❌ Eliminar
        </button>
        <div style={getResponsiveStyle(
          { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "20px", alignItems: "center", paddingRight: "80px" },
          { display: "grid", gridTemplateColumns: "1fr", gap: "15px", alignItems: "center", paddingRight: "0" },
          { display: "grid", gridTemplateColumns: "1fr", gap: "15px", alignItems: "center", paddingRight: "0" }
        )}>
          <div style={{ fontWeight: "bold", fontSize: isGalaxyTabA ? "18px" : "16px" }}>
            {actividad.trim()}
            {integrantesConActividad.length > 0 && (
              <span style={{ 
                marginLeft: "10px", 
                fontSize: isGalaxyTabA ? "14px" : "12px", 
                color: "#28a745",
                backgroundColor: "#d4edda",
                padding: "2px 8px",
                borderRadius: "12px"
              }}>
                {integrantesConActividad.length} INTEGRANTE(S)
              </span>
            )}
          </div>
          
          <div>
            <label style={{ fontSize: isGalaxyTabA ? "14px" : "12px", color: "#495057", display: "block", marginBottom: "5px" }}>
              PLANIFICADA TOTAL:
            </label>
            <input
              type="number"
              value={totalPlanificado}
              readOnly
              style={getResponsiveStyle(
                { width: "100%", padding: "10px", border: "1px solid #28a745", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize: "12px", fontWeight: "bold", color: "#0f5132" },
                { width: "100%", padding: "12px", border: "1px solid #28a745", borderRadius: "4px", backgroundColor: "#e9ecef", fontSize: "14px", fontWeight: "bold", color: "#0f5132" }
              )}
            />
          </div>

          <div>
            <label style={{ fontSize: isGalaxyTabA ? "14px" : "12px", color: "#495057", display: "block", marginBottom: "5px" }}>
              ELABORADA TOTAL:
            </label>
            <input
              type="number"
              value={totalElaborado}
              readOnly
              style={getResponsiveStyle(
                { width: "100%", padding: "10px", border: `1px solid ${totalElaborado < totalPlanificado ? '#dc3545' : '#28a745'}`, borderRadius: "4px", backgroundColor: totalElaborado < totalPlanificado ? '#fff5f5' : '#e9ecef', fontSize: "12px", fontWeight: "bold", color: totalElaborado < totalPlanificado ? '#dc3545' : '#28a745' },
                { width: "100%", padding: "12px", border: `1px solid ${totalElaborado < totalPlanificado ? '#dc3545' : '#28a745'}`, borderRadius: "4px", backgroundColor: totalElaborado < totalPlanificado ? '#fff5f5' : '#e9ecef', fontSize: "14px", fontWeight: "bold", color: totalElaborado < totalPlanificado ? '#dc3545' : '#28a745' }
              )}
            />
          </div>
        </div>

        {integrantesConActividad.length > 0 && (
          <div style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#e9ecef",
            border: "1px solid #ced4da",
            borderRadius: "4px",
            fontSize: isGalaxyTabA ? "14px" : "12px"
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
    <div style={getResponsiveStyle(
      { marginTop: "20px", padding: "15px", backgroundColor: "#f8fafc", border: "1px dashed #0284c7", borderRadius: "8px", display: "flex", gap: "10px", alignItems: "flex-end" },
      { marginTop: "20px", padding: "15px", backgroundColor: "#f8fafc", border: "1px dashed #0284c7", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" },
      { marginTop: "20px", padding: "15px", backgroundColor: "#f8fafc", border: "1px dashed #0284c7", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch" }
    )}>
      <div style={{ flex: 1 }}>
        <label style={{ display: "block", fontSize: isGalaxyTabA ? "14px" : "12px", fontWeight: "600", marginBottom: "5px", color: "#1f2937" }}>
          NUEVA ACTIVIDAD:
        </label>
        <input
          type="text"
          value={nuevoDetalleActividad}
          onChange={(e) => setNuevoDetalleActividad(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && agregarDetalleActividad()}
          placeholder="Escribe una nueva actividad y presiona Enter o haz clic en Agregar..."
          style={getResponsiveStyle(
            { width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "12px", fontWeight: "500" },
            { width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: "500" }
          )}
        />
      </div>
      <button
        type="button"
        onClick={agregarDetalleActividad}
        style={getResponsiveStyle(
          { padding: "10px 20px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" },
          { padding: "12px 20px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }
        )}
      >
        <span style={{ fontSize: "16px" }}>➕</span> Agregar Actividad
      </button>
    </div>
  )}
</div>


        
        {/* INTEGRANTES */}
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
                <div style={getResponsiveStyle(
                  { display: "grid", gridTemplateColumns: "auto 2fr 1fr auto", gap: 10, marginBottom: 20, alignItems: "center", backgroundColor: "#e9ecef", padding: "10px", borderRadius: "6px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 20, backgroundColor: "#e9ecef", padding: "10px", borderRadius: "6px" },
                  { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 20, backgroundColor: "#e9ecef", padding: "10px", borderRadius: "6px" }
                )}>
                  <span style={{ fontSize: isGalaxyTabA ? "20px" : "16px", textAlign: "center" }}>👤</span>
          
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
                    style={getResponsiveStyle(
                      { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", fontWeight: "bold", fontSize: "16px" },
                      { padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", fontWeight: "bold", fontSize: "18px" }
                    )}
                  />
            
                  <select
                    value={integrante.cargo}
                    onChange={(e) => actualizarCargoIntegrante(integranteIndex, e.target.value)}
                    style={getResponsiveStyle(
                      { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", cursor: "pointer" },
                      { padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", cursor: "pointer", fontSize: "14px" }
                    )}
                  >
                    <option value="LÍDER">LÍDER</option>
                    <option value="COSTURERA/O">COSTURERA/O</option>
                    <option value="REMATADORA/O">REMATADORA/O</option>
                    <option value="APRENDÍZ DE COSTURA">APRENDÍZ DE COSTURA</option>
                    <option value="OTRO">OTRO</option>
                  </select>

                  <button 
                    type="button" 
                    onClick={() => eliminarIntegrante(integranteIndex)} 
                    title="Eliminar integrante"
                    style={getResponsiveStyle(
                      { padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
                      { padding: "12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", minHeight: "44px", fontSize: "14px" }
                    )}
                  >
                    ❌ ELIMINAR
                  </button>
                </div>

                {integrante.cargo === "OTRO" && (
                  <div style={{
                    padding:"10px",
                    marginLeft: isGalaxyTabA ? "0" : "30px",
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
                      style={getResponsiveStyle(
                        { width: "100%", padding: "8px", border: "1px solid #007bff", borderRadius: "4px", fontSize: "14px" },
                        { width: "100%", padding: "12px", border: "1px solid #007bff", borderRadius: "4px", fontSize: "16px" }
                      )}  
                      autoFocus
                    />
                  </div>
                )}

                <div style={{ marginLeft: isGalaxyTabA ? "0" : "20px" }}>
                  <h4 style={{ 
                    marginBottom: "15px", 
                    fontSize: isGalaxyTabA ? "18px" : "16px", 
                    color: "#495057",
                    borderBottom: "2px solid #28a745",
                    paddingBottom: "5px",
                    display: "inline-block"
                  }}>
                    Actividades asignadas:
                  </h4>
          
                  {(actividadesIntegrantes[`integrante_${integranteIndex}`]?.actividades || []).map((actividad, actividadIndex) => (
                    <div key={actividadIndex} style={getResponsiveStyle(
                      { display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.8fr 0.8fr 1.6fr auto", gap: "10px", marginBottom: "10px", alignItems: "center", backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "4px", border: "1px solid #dee2e6" },
                      { display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "10px", backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "4px", border: "1px solid #dee2e6" },
                      { display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "10px", backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "4px", border: "1px solid #dee2e6" }
                    )}>
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
                                params: { actividad: actividadSeleccionada }
                              });
                              const cantidadBase = response.data.cantidad_por_hora;
                              setActividadesConHoras(prev => {
                                const nuevas = [...prev];
                                const index = nuevas.findIndex(a => a.actividad === actividadSeleccionada);
                                if (index >= 0) {
                                  nuevas[index] = { ...nuevas[index], cantidad_base: cantidadBase };
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
                        style={getResponsiveStyle(
                          { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", fontSize: "11px" },
                          { padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", fontSize: "14px" }
                        )}
                      >
                        <option value="">SELECCIONE ACTIVIDAD...</option>
                        {mostrarCheckboxes 
                          ? listaActividadesEQE.filter(act => actividadesSeleccionadas[act]).map((act, idx) => (
                              <option key={idx} value={act}>
                                {act}
                              </option>
                            ))
                          : form.detalles_actividades.split('\n').filter(act => act.trim() !== '').map((act, idx) => (
                              <option key={idx} value={act.trim()}>
                                {act.trim()}
                              </option>
                            ))
                        }
                      </select>

                      <input
                        type="number"
                        value={actividad.horas_persona || ''}
                        placeholder="HORAS"
                        onChange={(e) => {
                          actualizarActividadIntegrante(integranteIndex, actividadIndex, "horas_persona", e.target.value);
                          setManualHorasPersona(prev => ({
                            ...prev,
                            [`${integranteIndex}_${actividadIndex}`]: true
                          }));
                        }}
                        style={getResponsiveStyle(
                          { padding: "8px", border: "1px solid #007bff", borderRadius: "4px", width: "100%", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e9ecef" },
                          { padding: "12px", border: "1px solid #007bff", borderRadius: "4px", width: "100%", fontSize: "14px", fontWeight: "bold", backgroundColor: "#e9ecef" }
                        )}
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
                          
                          const horasPersona = !esManualHoras && cantidadPlanificada && cantidadBase
                            ? (parseFloat(cantidadPlanificada) / cantidadBase).toFixed(2)
                            : (esManualHoras ? actividad.horas_persona : '');

                          actualizarActividadIntegrante(integranteIndex, actividadIndex, "cantidad_planificada", cantidadPlanificada);
                          
                          if (!esManualHoras && horasPersona) {
                            actualizarActividadIntegrante(integranteIndex, actividadIndex, "horas_persona", horasPersona);
                          }
                        }}
                        placeholder="CANT. PLANIF."
                        style={getResponsiveStyle(
                          { padding: "8px", border: "1px solid #28a745", borderRadius: "4px", width: "100%", fontSize: "11px", fontWeight: "bold" },
                          { padding: "12px", border: "1px solid #28a745", borderRadius: "4px", width: "100%", fontSize: "14px", fontWeight: "bold" }
                        )}
                      />

                      <input
                        type="number"
                        min="0"
                        value={actividad.cantidad_elaborada || ''}
                        onChange={(e) => {
                          actualizarActividadIntegrante(integranteIndex, actividadIndex, "cantidad_elaborada", e.target.value);
                        }}
                        placeholder="CANT. ELABOR."
                        style={getResponsiveStyle(
                          { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", width: "100%", fontSize: "11px" },
                          { padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", width: "100%", fontSize: "14px" }
                        )}
                      />

                      <textarea 
                        type="text"
                        placeholder="Ingrese las observaciones del Integrante"
                        value={actividad.observaciones_integrante || ''}
                        onChange={(e) => {
                          actualizarActividadIntegrante(integranteIndex, actividadIndex, "observaciones_integrante", e.target.value);
                        }}
                        style={getResponsiveStyle(
                          { padding: "8px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", fontWeight: "bold", fontSize: "11px" },
                          { padding: "12px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#ffffff", fontWeight: "bold", fontSize: "14px" }
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => eliminarActividadDeIntegrante(integranteIndex, actividadIndex)}
                        style={getResponsiveStyle(
                          { padding: "8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" },
                          { padding: "12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", minHeight: "44px" }
                        )}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => agregarActividadAIntegrante(integranteIndex)}
                    style={getResponsiveStyle(
                      { marginTop: "15px", padding: "10px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" },
                      { marginTop: "15px", padding: "12px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", minHeight: "48px", width: "100%" }
                    )}
                  >
                    ➕ AGREGAR ACTIVIDAD A {integrante.nombre ? integrante.nombre.split(' ')[0] : 'INTEGRANTE'}
                  </button>
                </div>
              </div>
            ))}
        
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button 
                type="button" 
                className="btn" 
                onClick={agregarIntegrante}
                style={getResponsiveStyle(
                  { padding: "12px 20px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" },
                  { padding: "14px 24px", backgroundColor: "#ff7675", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "18px", fontWeight: "bold", minHeight: "48px" }
                )}
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
            <textarea placeholder="INGRESA LAS OBSERVACIONES QUE TENGAS PARA EL REGISTRO... (OPCIONAL)" className="textObs" id="observaciones" name="observaciones" rows={4} value={form.observaciones} onChange={onChange} style={isGalaxyTabA ? { fontSize: "14px", padding: "12px" } : {}}/>
          </div>
        </div>
        
        <button type="submit" className="btn-guardar" style={isGalaxyTabA ? { padding: "16px", fontSize: "16px", minHeight: "56px" } : {}}>
          GUARDAR REGISTRO DE PRODUCCIÓN
        </button>
      </form>
    </div>
  );
}