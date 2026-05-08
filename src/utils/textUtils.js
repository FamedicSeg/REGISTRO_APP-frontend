/**
 * Función helper para convertir valor a mayúsculas
 * Se usa en onChange de inputs de texto
 */
export const toUpperCase = (value) => {
  if (typeof value !== 'string') return value;
  return value.toUpperCase();
};

/**
 * Lista de campos que deben convertirse a mayúsculas
 * Agregar nombres de campos según sea necesario
 */
export const UPPERCASE_FIELDS = [
  // Generales
  'responsable', 'supervisor', 'op', 'codigo_producto', 'descripcion',
  'personal_asignado', 'personal_presente', 'personal_otro', 'cliente',
  'lotePrincipal', 'loteSecundario', 'loteUnido',
  
  // Insumos
  'tipo_insumo', 'codigo_insumo', 'descripcion_insumo', 'descrip_cant_insumo',
  'lote_insumo', 'entrega', 'recepcion',
  
  // Reposición no conforme
  'codigo_insumo_no_conforme', 'descripcion_insumo_no_conforme',
  'descrip_cant_insumo_no_conforme', 'entrega_insumo_no_conforme',
  'recepcion_insumo_no_conforme',
  
  // Etiquetas
  'descripcion_etiqueta', 'entrega_etiqueta', 'recepcion_etiqueta',
  
  // Confección
  'destino', 'n_cliente', 'esteril', 'talla', 'leyenda', 'leyenda_si', 'leyenda_otra',
  
  // Integrantes
  'nombre', 'cargo', 'cargoOtro',
  
  // Maquinarias
  'maquinaria',
  
  // Observaciones
  'observaciones'
];

/**
 * Determina si un campo debe convertirse a mayúsculas
 */
export const shouldUpperCase = (fieldName) => {
  return UPPERCASE_FIELDS.includes(fieldName);
};
