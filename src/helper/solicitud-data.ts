/**
 * Helper para gestionar datos de solicitudes creadas
 * Guarda correlativo e incidente para usar en aprobaciones
 */

import * as fs from 'fs';
import * as path from 'path';

interface SolicitudCreada {
  correlativo: string;
  incidente: string;
  area: string;
  memo: string;
  monto: number;
  moneda: string;
  fechaCreacion: string;
  usuario: string;
}

const dataPath = path.resolve(__dirname, '../../test-data/solicitudes-creadas.json');

/**
 * Extrae correlativo e incidente del texto del modal
 */
export function extraerDatosSolicitud(textoModal: string): { correlativo: string; incidente: string } | null {
  // Patrones para extraer correlativo e incidente
  const correlativoMatch = textoModal.match(/correlativo[:\s]+([0-9A-Z\-]+)/i);
  const incidenteMatch = textoModal.match(/incidente[:\s]+(\d+)/i);
  
  if (correlativoMatch && incidenteMatch) {
    return {
      correlativo: correlativoMatch[1].trim(),
      incidente: incidenteMatch[1].trim()
    };
  }
  
  return null;
}

/**
 * Guarda una solicitud creada en el archivo JSON
 */
export function guardarSolicitudCreada(solicitud: SolicitudCreada): void {
  let solicitudes: SolicitudCreada[] = [];
  
  // Leer solicitudes existentes
  if (fs.existsSync(dataPath)) {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    solicitudes = JSON.parse(rawData);
  }
  
  // Agregar nueva solicitud
  solicitudes.push(solicitud);
  
  // Guardar en archivo
  fs.writeFileSync(dataPath, JSON.stringify(solicitudes, null, 2), 'utf-8');
  
  console.log(`📄 Solicitud guardada: ${solicitud.correlativo} (Incidente: ${solicitud.incidente})`);
}

/**
 * Obtiene la última solicitud creada para un área específica
 */
export function obtenerUltimaSolicitud(area?: string): SolicitudCreada | null {
  if (!fs.existsSync(dataPath)) {
    return null;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const solicitudes: SolicitudCreada[] = JSON.parse(rawData);
  
  if (solicitudes.length === 0) {
    return null;
  }
  
  // Filtrar por área si se proporciona
  const solicitudesFiltradas = area 
    ? solicitudes.filter(s => s.area.toLowerCase() === area.toLowerCase())
    : solicitudes;
  
  // Retornar la última
  return solicitudesFiltradas[solicitudesFiltradas.length - 1] || null;
}

/**
 * Obtiene una solicitud por memo específico (última de ese memo)
 */
export function obtenerSolicitudPorMemo(memo: string, area?: string): SolicitudCreada | null {
  if (!fs.existsSync(dataPath)) {
    return null;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const solicitudes: SolicitudCreada[] = JSON.parse(rawData);
  
  if (solicitudes.length === 0) {
    return null;
  }
  
  // Filtrar por área si se proporciona
  let solicitudesFiltradas = area 
    ? solicitudes.filter(s => s.area.toLowerCase() === area.toLowerCase())
    : solicitudes;
  
  // Filtrar por memo (búsqueda flexible, case-insensitive, ignorando comas)
  const memoNormalizado = memo.toLowerCase().replace(/,/g, '').trim();
  solicitudesFiltradas = solicitudesFiltradas.filter(s => {
    const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
    return memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
  });
  
  if (solicitudesFiltradas.length === 0) {
    return null;
  }
  
  // Retornar la última de ese memo
  return solicitudesFiltradas[solicitudesFiltradas.length - 1] || null;
}

/**
 * Obtiene una solicitud por memo y acción específica
 * IMPORTANTE: La estructura del JSON es:
 * - RECHAZAR: índices 0-2 (0481, 0482, 0483) - SOBREVIVENCIA, RESCATE, MULTAS
 * - OBSERVAR: índices 3-5 (0484, 0485, 0486) - SOBREVIVENCIA, RESCATE, MULTAS
 * - APROBAR: índices 6-8 (0487, 0488, 0489) - SOBREVIVENCIA, RESCATE, MULTAS
 * 
 * @param memo - Memo de la solicitud
 * @param accion - Acción a realizar: 'rechazar', 'observar', 'aprobar'
 * @param indiceMemo - Índice del memo (0=PAGO DE SOBREVIVENCIA, 1=RESCATE, 2=MULTAS)
 * @param area - Área de la solicitud (opcional)
 */
export function obtenerSolicitudPorMemoYAccion(
  memo: string, 
  accion: 'rechazar' | 'observar' | 'aprobar',
  indiceMemo: number = 0,
  area?: string
): SolicitudCreada | null {
  if (!fs.existsSync(dataPath)) {
    return null;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  let solicitudes: SolicitudCreada[] = JSON.parse(rawData);
  
  if (solicitudes.length === 0) {
    return null;
  }
  
  // Filtrar por área si se proporciona
  if (area) {
    solicitudes = solicitudes.filter(s => s.area.toLowerCase() === area.toLowerCase());
  }
  
  if (solicitudes.length === 0) {
    return null;
  }
  
  // Mapear acción a índice base en el array completo (no filtrado por memo)
  // Estructura: RECHAZAR (0-2), OBSERVAR (3-5), APROBAR (6-8)
  let indiceBase = 0;
  if (accion === 'rechazar') {
    indiceBase = 0; // Primeros 3
  } else if (accion === 'observar') {
    indiceBase = 3; // Siguientes 3
  } else if (accion === 'aprobar') {
    indiceBase = 6; // Siguientes 3
  }
  
  // Calcular índice final: indiceBase + indiceMemo
  // indiceMemo: 0=PAGO DE SOBREVIVENCIA, 1=RESCATE, 2=MULTAS
  const indiceFinal = indiceBase + indiceMemo;
  
  if (indiceFinal >= solicitudes.length) {
    // Si no hay suficientes, buscar por memo en todo el array
    console.log(`⚠️  Índice ${indiceFinal} fuera de rango, buscando por memo "${memo}" y acción "${accion}"`);
    const memoNormalizado = memo.toLowerCase().replace(/,/g, '').trim();
    const solicitudesPorMemo = solicitudes.filter(s => {
      const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
      return memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
    });
    
    // Buscar la solicitud que corresponda a la acción dentro del grupo del memo
    // Asumimos que dentro de cada grupo de memo, las acciones están en orden: rechazar, observar, aprobar
    if (solicitudesPorMemo.length > 0) {
      // Encontrar el índice de la primera solicitud de este memo en el array completo
      const primerIndiceMemo = solicitudes.findIndex(s => {
        const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
        return memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
      });
      
      if (primerIndiceMemo !== -1) {
        // Calcular el índice considerando el offset del primer memo
        const indiceConOffset = primerIndiceMemo + indiceBase + indiceMemo;
        if (indiceConOffset < solicitudes.length) {
          return solicitudes[indiceConOffset];
        }
      }
      
      // Fallback: usar la última del memo
      return solicitudesPorMemo[solicitudesPorMemo.length - 1] || null;
    }
    
    return null;
  }
  
  // Verificar que el memo coincida (validación adicional)
  const solicitud = solicitudes[indiceFinal];
  const memoNormalizado = memo.toLowerCase().replace(/,/g, '').trim();
  const memoNormalizadoSolicitud = solicitud.memo.toLowerCase().replace(/,/g, '').trim();
  
  if (memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud)) {
    return solicitud;
  }
  
  // Si no coincide, buscar manualmente en el rango esperado
  console.log(`⚠️  Memo no coincide en índice ${indiceFinal}, buscando manualmente...`);
  for (let i = indiceBase; i < indiceBase + 3 && i < solicitudes.length; i++) {
    const s = solicitudes[i];
    const memoNormalizadoS = s.memo.toLowerCase().replace(/,/g, '').trim();
    if (memoNormalizadoS.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoS)) {
      return s;
    }
  }
  
  return null;
}

/**
 * Obtiene una solicitud por memo y monto (útil para Aprobadores 2 y 3)
 * Busca la solicitud que coincida con el memo y el monto especificado
 */
export function obtenerSolicitudPorMemoYMonto(memo: string, monto: number, moneda: string, area?: string): SolicitudCreada | null {
  if (!fs.existsSync(dataPath)) {
    return null;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  let solicitudes: SolicitudCreada[] = JSON.parse(rawData);
  
  if (solicitudes.length === 0) {
    return null;
  }
  
  // Filtrar por área si se proporciona
  if (area) {
    solicitudes = solicitudes.filter(s => s.area.toLowerCase() === area.toLowerCase());
  }
  
  // Filtrar por memo (búsqueda flexible, case-insensitive, ignorando comas)
  const memoNormalizado = memo.toLowerCase().replace(/,/g, '').trim();
  let solicitudesFiltradas = solicitudes.filter(s => {
    const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
    return memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
  });
  
  if (solicitudesFiltradas.length === 0) {
    return null;
  }
  
  // Filtrar por monto y moneda (coincidencia exacta)
  const solicitudesPorMonto = solicitudesFiltradas.filter(s => 
    s.monto === monto && s.moneda.toLowerCase() === moneda.toLowerCase()
  );
  
  if (solicitudesPorMonto.length > 0) {
    // Retornar la última que coincida con monto y moneda
    return solicitudesPorMonto[solicitudesPorMonto.length - 1] || null;
  }
  
  // Si no hay coincidencia exacta, retornar la última del memo
  return solicitudesFiltradas[solicitudesFiltradas.length - 1] || null;
}

/**
 * Obtiene una solicitud por correlativo
 */
export function obtenerSolicitudPorCorrelativo(correlativo: string): SolicitudCreada | null {
  if (!fs.existsSync(dataPath)) {
    return null;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const solicitudes: SolicitudCreada[] = JSON.parse(rawData);
  
  return solicitudes.find(s => s.correlativo === correlativo) || null;
}

/**
 * Limpia el archivo de solicitudes creadas (útil para tests limpios)
 */
export function limpiarSolicitudesCreadas(): void {
  if (fs.existsSync(dataPath)) {
    fs.unlinkSync(dataPath);
    console.log('🗑️  Solicitudes creadas limpiadas');
  }
}

