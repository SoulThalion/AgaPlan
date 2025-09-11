// Tipos compartidos entre frontend-web y mobile

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Turno {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugarId: number;
  equipoId: number;
  usuarios: User[];
  estado: 'pendiente' | 'confirmado' | 'cancelado';
  createdAt: string;
  updatedAt: string;
}

export interface Lugar {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cargo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Disponibilidad {
  id: number;
  usuarioId: number;
  diaSemana: number; // 0 = Domingo, 1 = Lunes, etc.
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
