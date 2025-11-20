/**
 * Data Loader - Carga datos de prueba desde test-data/
 */

import * as fs from 'fs';
import * as path from 'path';

interface Usuario {
  username: string;
  password: string;
  area: string;
  rol: string;
  memos?: string[];
}

interface Aprobador extends Usuario {
  nivel: number;
  rangos: {
    dolares: { min: number; max: number };
    soles: { min: number; max: number };
  };
}

interface Usuarios {
  registradores: {
    [key: string]: Usuario;
  };
  aprobadores: {
    vida: {
      [key: string]: Aprobador;
    };
  };
  bancos: any;
}

export const loadUsuarios = (): Usuarios => {
  const usuariosPath = path.join(process.cwd(), 'test-data', 'usuarios.json');
  const data = fs.readFileSync(usuariosPath, 'utf8');
  return JSON.parse(data);
};

/**
 * Carga datos de solicitudes desde test-data/solicitudes.json
 */
export const loadSolicitudes = (): any => {
  const solicitudesPath = path.join(process.cwd(), 'test-data', 'solicitudes.json');
  const data = fs.readFileSync(solicitudesPath, 'utf8');
  return JSON.parse(data);
};

/**
 * Obtiene datos de VIDA por identificador
 * @param identificador - Identificador del escenario (ej: "pago_sobrevivencia_interbank_dolares")
 */
export const getDatosVIDAPorIdentificador = (identificador: string): any => {
  const solicitudes = loadSolicitudes();
  const datosVIDA = solicitudes.vida[identificador];
  
  if (!datosVIDA) {
    throw new Error(`No se encontraron datos de VIDA para el identificador: ${identificador}`);
  }
  
  return datosVIDA;
};

export const getUsuarioPorNombre = (nombreUsuario: string): Usuario => {
  const usuarios = loadUsuarios();
  
  // Buscar en registradores
  const registrador = usuarios.registradores[nombreUsuario.toLowerCase()];
  if (registrador) {
    return registrador;
  }
  
  // Buscar en aprobadores VIDA
  const aprobador = usuarios.aprobadores?.vida?.[nombreUsuario.toLowerCase()];
  if (aprobador) {
    return aprobador;
  }
  
  throw new Error(`Usuario "${nombreUsuario}" no encontrado en test-data/usuarios.json`);
};

export const getAprobadorVIDA = (nivel: number): Aprobador => {
  const usuarios = loadUsuarios();
  const aprobadorKey = `aprobador${nivel}`;
  const aprobador = usuarios.aprobadores?.vida?.[aprobadorKey];
  
  if (!aprobador) {
    throw new Error(`Aprobador VIDA nivel ${nivel} no encontrado en test-data/usuarios.json`);
  }
  
  return aprobador;
};

export const getBancoPorNombre = (nombreBanco: string): { nombre: string; digitos: number } => {
  const usuarios = loadUsuarios();
  const banco = Object.values(usuarios.bancos).find((b: any) => 
    b.nombre.toLowerCase() === nombreBanco.toLowerCase()
  );
  
  if (!banco) {
    throw new Error(`Banco "${nombreBanco}" no encontrado en test-data/usuarios.json`);
  }
  
  return banco as { nombre: string; digitos: number };
};

/**
 * Determina qué aprobadores necesitan aprobar una solicitud según el monto y moneda
 * Retorna un array con los niveles de aprobadores que deben aprobar (en orden secuencial)
 * 
 * @param monto - Monto de la solicitud
 * @param moneda - Moneda de la solicitud ('Soles' o 'Dolares')
 * @param area - Área de la solicitud ('VIDA' o 'RRHH')
 * @returns Array de niveles de aprobadores que deben aprobar (ej: [1] o [1, 2] o [1, 2, 3])
 */
export const determinarAprobadoresNecesarios = (monto: number, moneda: string, area: string = 'VIDA'): number[] => {
  const usuarios = loadUsuarios();
  const monedaLower = moneda.toLowerCase();
  const monedaKey = monedaLower === 'soles' ? 'soles' : 'dolares';
  
  // Obtener todos los aprobadores del área
  const aprobadores = usuarios.aprobadores?.[area.toLowerCase()];
  if (!aprobadores) {
    throw new Error(`No se encontraron aprobadores para el área: ${area}`);
  }
  
  // Ordenar aprobadores por nivel (1, 2, 3, 4...)
  const nivelesAprobadores = Object.keys(aprobadores)
    .map(key => aprobadores[key].nivel)
    .sort((a, b) => a - b);
  
  const aprobadoresNecesarios: number[] = [];
  
  // Determinar qué aprobadores necesitan aprobar según el monto
  // La lógica es: si el monto está en el rango de un aprobador, TODOS los aprobadores anteriores también deben aprobar
  // Recorrer desde el nivel más alto hacia abajo para encontrar el rango correcto
  for (let i = nivelesAprobadores.length - 1; i >= 0; i--) {
    const nivel = nivelesAprobadores[i];
    const aprobadorKey = `aprobador${nivel}`;
    const aprobador = aprobadores[aprobadorKey];
    
    if (!aprobador || !aprobador.rangos || !aprobador.rangos[monedaKey]) {
      continue;
    }
    
    const rango = aprobador.rangos[monedaKey];
    
    // Si el monto está dentro del rango de este aprobador, agregar este nivel y todos los anteriores
    // Nota: Para el límite inferior, usamos >= para incluir el límite
    if (monto >= rango.min && monto <= rango.max) {
      // Agregar todos los niveles desde 1 hasta el nivel actual
      for (let j = 1; j <= nivel; j++) {
        if (!aprobadoresNecesarios.includes(j)) {
          aprobadoresNecesarios.push(j);
        }
      }
      break; // Ya encontramos el rango máximo, no necesitamos seguir
    }
  }
  
  // Si no se encontró ningún rango, usar solo el aprobador 1 como fallback
  if (aprobadoresNecesarios.length === 0) {
    aprobadoresNecesarios.push(1);
  }
  
  return aprobadoresNecesarios.sort((a, b) => a - b);
};
