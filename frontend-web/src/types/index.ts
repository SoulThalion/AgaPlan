export interface Equipo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  usuarios?: Usuario[];
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  contraseña?: string; // Opcional en el frontend para no enviar la contraseña
  sexo: 'M' | 'F' | 'O';
  cargo: string; // Mantener para compatibilidad
  cargoId?: number; // ID de referencia a la tabla cargos
  cargoInfo?: Cargo; // Información completa del cargo incluyendo prioridad
  rol: 'voluntario' | 'admin' | 'superAdmin' | 'grupo';
  participacionMensual?: number | null; // null = sin límite de participación
  tieneCoche?: boolean; // Si el usuario tiene coche disponible
  siempreCon?: number; // ID del usuario que siempre debe acompañar a este usuario
  nuncaCon?: number; // ID del usuario que nunca debe acompañar a este usuario
  siempreConUsuario?: Usuario; // Usuario que siempre debe acompañar
  nuncaConUsuario?: Usuario; // Usuario que nunca debe acompañar
  equipoId: number; // ID del equipo al que pertenece el usuario
  equipo?: Equipo; // Información del equipo
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Lugar {
  id: number;
  nombre: string;
  direccion: string;
  descripcion?: string;
  capacidad?: number;
  exhibidores?: number;
  activo?: boolean;
  latitud?: number;
  longitud?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Disponibilidad {
  id: number;
  usuarioId: number;
  lugarId: number;
  diaSemana: number; // 0 = Domingo, 1 = Lunes, etc.
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exhibidor {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Turno {
  id: number;
  lugarId: number;
  fecha: string;
  hora: string; // Formato HH:MM-HH:MM (rango de horas)
  estado: 'libre' | 'ocupado' | 'completo';
  createdAt: string;
  updatedAt: string;
  lugar?: Lugar;
  usuarios?: Usuario[];
  exhibidores?: Exhibidor[];
}

export interface Cargo {
  id: number;
  nombre: string;
  descripcion?: string;
  prioridad: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  contraseña: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  contraseña: string;
  sexo: 'M' | 'F' | 'O';
  cargo: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Usuario; // Changed from usuario to user to match backend
}

export interface TurnoCreationRequest {
  fecha: string;
  hora: string; // Formato HH:MM-HH:MM (rango de horas)
  lugarId: number;
  exhibidorIds: number[];
  usuarioIds?: number[]; // Cambiado de usuarioId a usuarioIds (array)
  estado?: 'libre' | 'ocupado' | 'completo';
}

export interface TurnoRecurrenteRequest {
  fechaInicio: string;
  hora: string; // Formato HH:MM-HH:MM (rango de horas)
  lugarId: number;
  exhibidorIds: number[];
  usuarioIds?: number[]; // Cambiado de usuarioId a usuarioIds (array)
  estado?: 'libre' | 'ocupado' | 'completo';
  esRecurrente: boolean;
  semanas: number; // Número de semanas para repetir
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

// Tipos para gestión de equipos
export interface EquipoCreationRequest {
  nombre: string;
  descripcion?: string;
}

export interface EquipoUpdateRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface EquipoStats {
  id: number;
  nombre: string;
  activo: boolean;
  totalUsuarios: number;
  admins: number;
  voluntarios: number;
  grupos: number;
}

export interface AssignUserToEquipoRequest {
  usuarioId: number;
  equipoId: number;
}
