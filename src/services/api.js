import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    timeout: 30000,
    headers: {
        "Content-Type":"application/json",
    },
});

// Interceptor para manejar errores
api.interceptors.response.use(
    response => response,
    error => {
        if(error.response){
            console.error("Error API:", error.response.status, error.response.data)
        } else if(error.request){
            console.error( "No hubo respuesta del servidor");
        } else{
            console.error("Error:", error.message);
        }
        return Promise.reject(error);
    }
);

// ============================================
// SERVICIOS PARA ONEDRIVE (AGREGAR ESTO)
// ============================================

// Leer cualquier archivo Excel
export const readExcelFile = async (fileName, sheetName, hasHeaders = true) => {
  try {
    const response = await api.post('/onedrive/read', {
      fileName,
      sheetName,
      hasHeaders,
    });
    return response.data;
  } catch (error) {
    console.error('Error leyendo archivo:', error);
    throw error;
  }
};

// Buscar en cualquier archivo
export const searchInExcel = async (fileName, sheetName, searchField, searchValue) => {
  try {
    const response = await api.post('/onedrive/search', {
      fileName,
      sheetName,
      searchField,
      searchValue,
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando:', error);
    throw error;
  }
};

// Buscar lote específico
export const buscarLote = async (loteId) => {
  try {
    const response = await api.post('/onedrive/buscar-lote', { loteId });
    return response.data;
  } catch (error) {
    console.error('Error buscando lote:', error);
    throw error;
  }
};

// Buscar insumo específico
export const buscarInsumo = async (insumoId) => {
  try {
    const response = await api.post('/onedrive/buscar-insumo', { insumoId });
    return response.data;
  } catch (error) {
    console.error('Error buscando insumo:', error);
    throw error;
  }
};

// Buscar producto específico
export const buscarProducto = async (productoId) => {
  try {
    const response = await api.post('/onedrive/buscar-producto', { productoId });
    return response.data;
  } catch (error) {
    console.error('Error buscando producto:', error);
    throw error;
  }
};

// Guardar registro aprobado
export const guardarRegistroAprobado = async (sheetName, registroData) => {
  try {
    const response = await api.post('/onedrive/append-registro', {
      sheetName,
      registroData,
    });
    return response.data;
  } catch (error) {
    console.error('Error guardando registro:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS PARA ESTADÍSTICAS SEMANALES
// ============================================

// Obtener resumen semanal (planificado vs elaborado)
export const getResumenSemanal = async (anio, semana) => {
  try {
    const response = await api.get(`/estadisticas/resumen-semanal/${anio}/${semana}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo resumen semanal:', error);
    throw error;
  }
};

// Guardar resumen semanal en histórico
export const guardarResumenSemanal = async (anio, semana) => {
  try {
    const response = await api.post('/estadisticas/guardar-resumen-semanal', { anio, semana });
    return response.data;
  } catch (error) {
    console.error('Error guardando resumen semanal:', error);
    throw error;
  }
};

// Obtener solo planificación
export const getPlanificacionSemanal = async (anio, semana) => {
  try {
    const response = await api.get(`/estadisticas/planificacion-semanal/${anio}/${semana}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo planificación:', error);
    throw error;
  }
};

// Obtener solo elaborado real
export const getElaboradoSemanal = async (anio, semana) => {
  try {
    const response = await api.get(`/estadisticas/elaborado-semanal/${anio}/${semana}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo elaborado real:', error);
    throw error;
  }
};

// Obtener histórico de una semana específica (desde la tabla histórica)
export const getHistoricoSemanal = async (anio, semana) => {
  try {
    const response = await api.get(`/estadisticas/historico/${anio}/${semana}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo histórico semanal:', error);
    throw error;
  }
};

// Obtener listado de semanas que tienen datos guardados en el histórico
export const getSemanasGuardadas = async (anio) => {
  try {
    const response = await api.get(`/estadisticas/semanas-guardadas/${anio}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo semanas guardadas:', error);
    throw error;
  }
};

// Obtener tendencia anual (cumplimiento semana por semana)
export const getTendenciaAnual = async (anio, codigos = '') => {
  try {
    const params = codigos ? `?codigos=${encodeURIComponent(codigos)}` : '';
    const response = await api.get(`/estadisticas/tendencia-anual/${anio}${params}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tendencia anual:', error);
    throw error;
  }
};
