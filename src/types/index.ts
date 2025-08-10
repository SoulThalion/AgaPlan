// Tipos para Lugares
export interface LugarRequest {
  nombre: string;
  direccion: string;
}

export interface LugarUpdateRequest {
  nombre?: string;
  direccion?: string;
}

// Tipos para Turnos
export interface TurnoRequest {
  fecha: string; // Formato YYYY-MM-DD
  hora: string; // Formato HH:MM
  lugarId: number;
}

export interface TurnoUpdateRequest {
  fecha?: string;
  hora?: string;
  lugarId?: number;
}

export interface TurnoGeneracionRequest {
  tipo: 'semanal' | 'mensual';
  fechaInicio: string; // Formato YYYY-MM-DD
  lugarId: number;
  horaInicio: string; // Formato HH:MM
  horaFin: string; // Formato HH:MM
  intervalo: number; // En minutos
}

// Tipos para respuestas
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Tipos para filtros de consulta
export interface TurnoFilters {
  fecha?: string;
  lugarId?: number;
  estado?: 'libre' | 'ocupado';
  usuarioId?: number;
}
