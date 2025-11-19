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
