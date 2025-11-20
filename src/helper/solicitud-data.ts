/**
 * Helper para gestionar datos de solicitudes creadas
 * Guarda correlativo e incidente para usar en aprobaciones
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAprobadorVIDA } from './data-loader';

interface SolicitudCreada {
  correlativo: string;
  incidente: string;
  area: string;
  memo: string;
  monto: number;
  moneda: string;
  fechaCreacion: string;
  usuario: string;
  accion?: 'rechazar' | 'observar' | 'aprobar'; // Acción para la cual se registró esta solicitud
  aprobadorNivel?: 1 | 2 | 3; // Nivel de aprobador para el cual se registró esta solicitud
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
 * Obtiene una solicitud por memo, acción y aprobador nivel
 * IMPORTANTE: Ahora usa los campos `accion` y `aprobadorNivel` guardados en el JSON
 * 
 * @param memo - Memo de la solicitud
 * @param accion - Acción a realizar: 'rechazar', 'observar', 'aprobar'
 * @param aprobadorNivel - Nivel de aprobador: 1, 2, o 3
 * @param area - Área de la solicitud (opcional)
 */
export function obtenerSolicitudPorMemoYAccion(
  memo: string, 
  accion: 'rechazar' | 'observar' | 'aprobar',
  aprobadorNivel: 1 | 2 | 3 = 1,
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
  
  // Normalizar el memo para búsqueda
  const memoNormalizado = memo.toLowerCase().replace(/,/g, '').trim();
  
  // NUEVO: Buscar por los campos accion y aprobadorNivel directamente
  let solicitudesFiltradas = solicitudes.filter(s => {
    const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
    const memoCoincide = memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
    const accionCoincide = s.accion === accion;
    const nivelCoincide = s.aprobadorNivel === aprobadorNivel;
    
    return memoCoincide && accionCoincide && nivelCoincide;
  });
  
  if (solicitudesFiltradas.length > 0) {
    // Retornar la última que coincida (más reciente)
    const solicitud = solicitudesFiltradas[solicitudesFiltradas.length - 1];
    console.log(`   📋 Solicitud encontrada por campos: ${solicitud.correlativo} (Acción: ${accion}, Aprobador Nivel: ${aprobadorNivel}, Memo: ${memo})`);
    return solicitud;
  }
  
  // Fallback: Si no tiene los campos, buscar por memo y acción (sin nivel)
  console.log(`⚠️  No se encontró con campos exactos, buscando por memo y acción...`);
  solicitudesFiltradas = solicitudes.filter(s => {
    const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
    const memoCoincide = memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
    const accionCoincide = s.accion === accion;
    
    return memoCoincide && accionCoincide;
  });
  
  if (solicitudesFiltradas.length > 0) {
    const solicitud = solicitudesFiltradas[solicitudesFiltradas.length - 1];
    console.log(`   📋 Solicitud encontrada por memo y acción: ${solicitud.correlativo} (Acción: ${accion}, Memo: ${memo})`);
    return solicitud;
  }
  
  // Último fallback: buscar solo por memo
  solicitudesFiltradas = solicitudes.filter(s => {
    const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
    return memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
  });
  
  if (solicitudesFiltradas.length > 0) {
    const solicitud = solicitudesFiltradas[solicitudesFiltradas.length - 1];
    console.log(`   ⚠️  Solicitud encontrada solo por memo (sin filtro de acción/nivel): ${solicitud.correlativo}`);
    return solicitud;
  }
  
  return null;
}

/**
 * Obtiene una solicitud por memo, monto y aprobador nivel (útil para Aprobadores 2 y 3)
 * Busca la solicitud que coincida con el memo, monto y aprobador nivel especificado
 */
export function obtenerSolicitudPorMemoYMonto(
  memo: string, 
  monto: number, 
  moneda: string, 
  aprobadorNivel: 1 | 2 | 3 = 1,
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
  
  // Filtrar por memo (búsqueda flexible, case-insensitive, ignorando comas)
  const memoNormalizado = memo.toLowerCase().replace(/,/g, '').trim();
  let solicitudesFiltradas = solicitudes.filter(s => {
    const memoNormalizadoSolicitud = s.memo.toLowerCase().replace(/,/g, '').trim();
    return memoNormalizadoSolicitud.includes(memoNormalizado) || memoNormalizado.includes(memoNormalizadoSolicitud);
  });
  
  if (solicitudesFiltradas.length === 0) {
    return null;
  }
  
  // Filtrar por monto, moneda y aprobador nivel (coincidencia exacta)
  const solicitudesPorMonto = solicitudesFiltradas.filter(s => 
    s.monto === monto && 
    s.moneda.toLowerCase() === moneda.toLowerCase() &&
    s.aprobadorNivel === aprobadorNivel
  );
  
  if (solicitudesPorMonto.length > 0) {
    // Retornar la última que coincida con monto, moneda y nivel
    const solicitud = solicitudesPorMonto[solicitudesPorMonto.length - 1];
    console.log(`   📋 Solicitud encontrada por monto y nivel: ${solicitud.correlativo} (Monto: ${monto} ${moneda}, Aprobador Nivel: ${aprobadorNivel})`);
    return solicitud;
  }
  
  // Fallback: buscar solo por monto y moneda (sin nivel)
  const solicitudesPorMontoSinNivel = solicitudesFiltradas.filter(s => 
    s.monto === monto && s.moneda.toLowerCase() === moneda.toLowerCase()
  );
  
  if (solicitudesPorMontoSinNivel.length > 0) {
    const solicitud = solicitudesPorMontoSinNivel[solicitudesPorMontoSinNivel.length - 1];
    console.log(`   ⚠️  Solicitud encontrada solo por monto (sin nivel): ${solicitud.correlativo}`);
    return solicitud;
  }
  
  // Si no hay coincidencia exacta, retornar la última del memo
  return solicitudesFiltradas[solicitudesFiltradas.length - 1] || null;
}

/**
 * Obtiene cualquier solicitud por acción y aprobador nivel (sin especificar memo)
 * Útil para aprobador1 que puede aprobar cualquier solicitud de su rango
 * Filtra por rango de monto según el nivel del aprobador
 */
export function obtenerSolicitudPorAccionYNivel(
  accion: 'rechazar' | 'observar' | 'aprobar',
  aprobadorNivel: 1 | 2 | 3 = 1,
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
  
  // Obtener rangos del aprobador para filtrar por monto
  let solicitudesFiltradas: SolicitudCreada[] = [];
  
  try {
    const aprobador = getAprobadorVIDA(aprobadorNivel);
    
    if (aprobador && aprobador.rangos) {
      // Filtrar por acción Y rango de monto (el aprobadorNivel del JSON puede no coincidir)
      solicitudesFiltradas = solicitudes.filter(s => {
        if (s.accion !== accion) {
          return false;
        }
        
        // Verificar que el monto esté dentro del rango del aprobador
        const monedaKey = s.moneda.toLowerCase() === 'soles' ? 'soles' : 'dolares';
        const rango = aprobador.rangos[monedaKey];
        
        if (!rango) {
          return false;
        }
        
        return s.monto >= rango.min && s.monto <= rango.max;
      });
      
      if (solicitudesFiltradas.length > 0) {
        const solicitud = solicitudesFiltradas[solicitudesFiltradas.length - 1];
        console.log(`   📋 Solicitud encontrada por acción, nivel y rango: ${solicitud.correlativo} (Acción: ${accion}, Aprobador Nivel: ${aprobadorNivel}, Memo: ${solicitud.memo}, Monto: ${solicitud.monto} ${solicitud.moneda})`);
        return solicitud;
      }
    }
  } catch (error) {
    console.log(`   ⚠️  No se pudieron obtener rangos del aprobador, buscando sin filtro de monto...`);
  }
  
  // Fallback: buscar solo por acción y aprobador nivel (sin filtro de monto)
  solicitudesFiltradas = solicitudes.filter(s => 
    s.accion === accion && s.aprobadorNivel === aprobadorNivel
  );
  
  if (solicitudesFiltradas.length > 0) {
    const solicitud = solicitudesFiltradas[solicitudesFiltradas.length - 1];
    console.log(`   📋 Solicitud encontrada por acción y nivel (sin filtro de monto): ${solicitud.correlativo} (Acción: ${accion}, Aprobador Nivel: ${aprobadorNivel}, Memo: ${solicitud.memo})`);
    return solicitud;
  }
  
  // Último fallback: buscar solo por acción (sin nivel)
  console.log(`⚠️  No se encontró con nivel exacto, buscando solo por acción...`);
  solicitudesFiltradas = solicitudes.filter(s => s.accion === accion);
  
  if (solicitudesFiltradas.length > 0) {
    const solicitud = solicitudesFiltradas[solicitudesFiltradas.length - 1];
    console.log(`   📋 Solicitud encontrada solo por acción: ${solicitud.correlativo} (Acción: ${accion}, Memo: ${solicitud.memo})`);
    return solicitud;
  }
  
  return null;
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

