export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'superadmin' | 'voluntario';
  participacionMensual?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lugar {
  id: number;
  nombre: string;
  direccion: string;
  descripcion?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Turno {
  id: number;
  lugarId: number;
  usuarioId?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'disponible' | 'asignado' | 'completado' | 'cancelado';
  createdAt: string;
  updatedAt: string;
  lugar?: Lugar;
  usuario?: Usuario;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'voluntario' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Usuario; // Changed from usuario to user to match backend
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
