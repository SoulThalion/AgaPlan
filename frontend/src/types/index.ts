export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  contraseña?: string; // Opcional en el frontend para no enviar la contraseña
  sexo: 'M' | 'F' | 'O';
  cargo: string;
  rol: 'voluntario' | 'admin' | 'superAdmin';
  participacionMensual?: number;
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
  usuarioId?: number;
  fecha: string;
  hora: string; // Formato HH:MM
  estado: 'libre' | 'ocupado';
  createdAt: string;
  updatedAt: string;
  lugar?: Lugar;
  usuario?: Usuario;
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
  hora: string;
  lugarId: number;
  exhibidorIds: number[];
  usuarioId?: number;
  estado?: 'libre' | 'ocupado';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
