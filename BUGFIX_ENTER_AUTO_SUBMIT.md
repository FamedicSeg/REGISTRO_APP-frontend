# 🐛 Bugfix: Prevenir Submit automático al presionar Enter

## Problema Reportado
Cuando el usuario presionaba **Enter** mientras estaba llenando el registro (en cualquier campo de texto), el formulario se guardaba automáticamente sin intención.

## Causa Raíz
En HTML, cuando presionas **Enter** dentro de un `<form>`, automáticamente se dispara el evento `onSubmit` del formulario. Esto es el comportamiento por defecto del navegador.

En el archivo `src/pages/registro.jsx`:
- Todos los inputs estaban dentro de un `<form onSubmit={onSubmit}>`
- No había prevención del comportamiento por defecto de Enter
- El botón "Guardar" es de `type="submit"`, lo que hace que Enter lo active

## Solución Implementada

### 1. **Nueva función `preventEnterSubmit`** (línea 1348)
```javascript
const preventEnterSubmit = (e) => {
  if (e.key === 'Enter' && !e.target.hasAttribute('data-allow-enter')) {
    e.preventDefault();
  }
};
```

- Previene que Enter dispare el submit del formulario
- **Excepto** en campos marcados con `data-allow-enter="true"`
- Permite que los campos de actividades sigan funcionando normalmente con Enter

### 2. **Atributo `onKeyDown` en el formulario** (línea 1937)
```jsx
<form onSubmit={onSubmit} onKeyDown={preventEnterSubmit}>
```

- Bloquea Enter a nivel global del formulario
- Cualquier input sin `data-allow-enter` no puede disparar submit con Enter

### 3. **Campos especiales permitidos**
Los siguientes campos tienen `data-allow-enter="true"` para permitir que Enter funcione como lo hacía antes:

1. **Campo "NUEVA ACTIVIDAD"** (Productos normales) - línea 3333
   - Permite presionar Enter para agregar actividades rápidamente
   - Mantiene la UX mejorada

2. **Campo "AGREGAR ACTIVIDAD MANUALMENTE"** (Productos EQE) - línea 3012
   - Permite presionar Enter para agregar actividades EQE
   - Mantiene la funcionalidad existente

## Cambios Realizados

| Línea | Campo | Cambio |
|-------|-------|--------|
| 1348-1354 | Función | Agregada `preventEnterSubmit` |
| 1937 | Formulario | Agregado `onKeyDown={preventEnterSubmit}` |
| 1943 | Input FECHA | Agregado `onKeyDown={preventEnterSubmit}` |
| 1962 | Input OP | Agregado `onKeyDown={preventEnterSubmit}` |
| 3012 | Input EQE Actividades | Agregado `data-allow-enter="true"` |
| 3333 | Input NUEVA ACTIVIDAD | Agregado `data-allow-enter="true"` |

## Comportamiento Después del Cambio

✅ **Cambios correctos:**
- ❌ Presionar Enter en campos normales NO guarda el registro
- ✅ Presionar Enter en "NUEVA ACTIVIDAD" SÍ agrega la actividad
- ✅ Presionar Enter en "AGREGAR ACTIVIDAD (EQE)" SÍ agrega la actividad
- ✅ El botón "GUARDAR" sigue funcionando normalmente

## Testing

Para verificar que funciona:

1. Abre el formulario de registro
2. Llena algunos campos normales (fecha, OP, etc.)
3. Presiona **Enter** en cada campo
   - ✅ No debe guardar
   - ✅ No debe mostrar el mensaje "Registro guardado correctamente"
4. Presiona **Enter** en "NUEVA ACTIVIDAD"
   - ✅ Debe agregar la actividad a la lista
5. Presiona el botón "GUARDAR" normalmente
   - ✅ Debe guardar el registro como antes

## Compatibilidad

- ✅ Todos los navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ No afecta funcionamiento existente
- ✅ Build: `npm run build` ejecutado exitosamente
