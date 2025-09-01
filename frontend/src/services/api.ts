import axios, { type AxiosInstance } from 'axios';
import type { 
  Usuario, 
  Lugar, 
  Turno, 
  Disponibilidad, 
  Cargo,
  Exhibidor,
  AuthResponse, 
  RegisterRequest, 
  ApiResponse,
  TurnoCreationRequest,
  TurnoRecurrenteRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token a todas las peticiones
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de autenticación
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticación
  async login(credentials: { email: string; contraseña: string }): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Usuarios
  async getUsuarios(): Promise<ApiResponse<Usuario[]>> {
    const response = await this.api.get<ApiResponse<Usuario[]>>('/usuarios');
    return response.data;
  }

  async getUsuarioById(id: number): Promise<ApiResponse<Usuario>> {
    const response = await this.api.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
    return response.data;
  }

  async createUsuario(data: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    const response = await this.api.post<ApiResponse<Usuario>>('/usuarios', data);
    return response.data;
  }

  async updateUsuario(id: number, data: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    const response = await this.api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, data);
    return response.data;
  }

  async deleteUsuario(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/usuarios/${id}`);
    return response.data;
  }

  async configurarParticipacionMensual(userId: number, participacionMensual: number | null): Promise<ApiResponse<Usuario>> {
    const response = await this.api.patch<ApiResponse<Usuario>>(`/usuarios/${userId}/participacion-mensual`, {
      participacionMensual
    });
    return response.data;
  }

  // Obtener la participación mensual actual de un usuario
  async getParticipacionMensualActual(userId: number, mes?: number, año?: number): Promise<any> {
    const params = new URLSearchParams();
    if (mes !== undefined) params.append('mes', mes.toString());
    if (año !== undefined) params.append('año', año.toString());
    
    const url = `/usuarios/${userId}/participacion-mensual-actual${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.api.get(url);
    return response.data;
  }

  // Lugares
  async getLugares(): Promise<ApiResponse<Lugar[]>> {
    const response = await this.api.get<ApiResponse<Lugar[]>>('/lugares');
    return response.data;
  }

  async getLugarById(id: number): Promise<ApiResponse<Lugar>> {
    const response = await this.api.get<ApiResponse<Lugar>>(`/lugares/${id}`);
    return response.data;
  }

  async createLugar(data: Partial<Lugar>): Promise<ApiResponse<Lugar>> {
    const response = await this.api.post<ApiResponse<Lugar>>('/lugares', data);
    return response.data;
  }

  async updateLugar(id: number, data: Partial<Lugar>): Promise<ApiResponse<Lugar>> {
    const response = await this.api.put<ApiResponse<Lugar>>(`/lugares/${id}`, data);
    return response.data;
  }

  async deleteLugar(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/lugares/${id}`);
    return response.data;
  }

  // Turnos
  async getTurnos(): Promise<ApiResponse<Turno[]>> {
    const response = await this.api.get<ApiResponse<Turno[]>>('/turnos');
    return response.data;
  }

  async getTurnosByUsuario(usuarioId: number): Promise<ApiResponse<Turno[]>> {
    const response = await this.api.get<ApiResponse<Turno[]>>(`/turnos/usuario/${usuarioId}`);
    return response.data;
  }

  async createTurno(data: TurnoCreationRequest): Promise<ApiResponse<Turno>> {
    const response = await this.api.post<ApiResponse<Turno>>('/turnos', data);
    return response.data;
  }

  async createTurnosRecurrentes(data: TurnoRecurrenteRequest): Promise<ApiResponse<Turno[]>> {
    const response = await this.api.post<ApiResponse<Turno[]>>('/turnos/recurrentes', data);
    return response.data;
  }

  async updateTurno(id: number, data: TurnoCreationRequest): Promise<ApiResponse<Turno>> {
    const response = await this.api.put<ApiResponse<Turno>>(`/turnos/${id}`, data);
    return response.data;
  }

  async deleteTurno(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/turnos/${id}`);
    return response.data;
  }

  async ocuparTurno(turnoId: number): Promise<ApiResponse<Turno>> {
    const response = await this.api.post<ApiResponse<Turno>>(`/turnos/${turnoId}/ocupar`);
    return response.data;
  }

  async liberarTurno(turnoId: number, usuarioId?: number): Promise<ApiResponse<Turno>> {
    const body = usuarioId ? { usuarioId } : {};
    const response = await this.api.post<ApiResponse<Turno>>(`/turnos/${turnoId}/liberar`, body);
    return response.data;
  }

  async asignarUsuarioATurno(turnoId: number, usuarioId: number): Promise<ApiResponse<Turno>> {
    const response = await this.api.post<ApiResponse<Turno>>(`/turnos/${turnoId}/asignar-usuario`, {
      usuarioId
    });
    return response.data;
  }

  async limpiarTodosLosUsuariosDeTurnos(mes?: number, año?: number): Promise<ApiResponse<{ turnosLimpiados: number }>> {
    const params = new URLSearchParams();
    if (mes !== undefined) params.append('mes', mes.toString());
    if (año !== undefined) params.append('año', año.toString());
    
    const url = `/turnos/limpiar-usuarios${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.api.delete<ApiResponse<{ turnosLimpiados: number }>>(url);
    return response.data;
  }

  // Disponibilidades
  async getDisponibilidades(): Promise<ApiResponse<Disponibilidad[]>> {
    const response = await this.api.get<ApiResponse<Disponibilidad[]>>('/disponibilidades');
    return response.data;
  }

  async getDisponibilidadesByUsuario(usuarioId: number): Promise<ApiResponse<Disponibilidad[]>> {
    const response = await this.api.get<ApiResponse<Disponibilidad[]>>(`/disponibilidades/usuario/${usuarioId}`);
    return response.data;
  }

  async getDisponibilidadUsuarioParaFecha(usuarioId: number, fecha: string): Promise<ApiResponse<Disponibilidad | null>> {
    const diaSemana = new Date(fecha).getDay();
    const response = await this.api.get<ApiResponse<Disponibilidad | null>>(`/disponibilidades/usuario/${usuarioId}/dia/${diaSemana}`);
    return response.data;
  }

  async createDisponibilidad(data: Partial<Disponibilidad>): Promise<ApiResponse<Disponibilidad>> {
    const response = await this.api.post<ApiResponse<Disponibilidad>>('/disponibilidades', data);
    return response.data;
  }

  async updateDisponibilidad(id: number, data: Partial<Disponibilidad>): Promise<ApiResponse<Disponibilidad>> {
    const response = await this.api.put<ApiResponse<Disponibilidad>>(`/disponibilidades/${id}`, data);
    return response.data;
  }

  async deleteDisponibilidad(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/disponibilidades/${id}`);
    return response.data;
  }

  // Cargos
  async getCargos(): Promise<ApiResponse<Cargo[]>> {
    const response = await this.api.get<ApiResponse<Cargo[]>>('/cargos');
    return response.data;
  }

  async getCargoById(id: number): Promise<ApiResponse<Cargo>> {
    const response = await this.api.get<ApiResponse<Cargo>>(`/cargos/${id}`);
    return response.data;
  }

  async createCargo(data: Partial<Cargo>): Promise<ApiResponse<Cargo>> {
    const response = await this.api.post<ApiResponse<Cargo>>('/cargos', data);
    return response.data;
  }

  async updateCargo(id: number, data: Partial<Cargo>): Promise<ApiResponse<Cargo>> {
    const response = await this.api.put<ApiResponse<Cargo>>(`/cargos/${id}`, data);
    return response.data;
  }

  async deleteCargo(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/cargos/${id}`);
    return response.data;
  }

  // Exhibidores
  async getExhibidores(): Promise<ApiResponse<Exhibidor[]>> {
    const response = await this.api.get<ApiResponse<Exhibidor[]>>('/exhibidores');
    return response.data;
  }

  async getExhibidorById(id: number): Promise<ApiResponse<Exhibidor>> {
    const response = await this.api.get<ApiResponse<Exhibidor>>(`/exhibidores/${id}`);
    return response.data;
  }

  async createExhibidor(data: Partial<Exhibidor>): Promise<ApiResponse<Exhibidor>> {
    const response = await this.api.post<ApiResponse<Exhibidor>>('/exhibidores', data);
    return response.data;
  }

  async updateExhibidor(id: number, data: Partial<Exhibidor>): Promise<ApiResponse<Exhibidor>> {
    const response = await this.api.put<ApiResponse<Exhibidor>>(`/exhibidores/${id}`, data);
    return response.data;
  }

  async deleteExhibidor(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/exhibidores/${id}`);
    return response.data;
  }

  // Configuración de disponibilidad de usuarios
  async createUserDisponibilidadConfig(data: {
    usuarioId: number;
    mes: string;
    tipo_disponibilidad: string;
    configuracion: any;
  }): Promise<any> {
    const response = await this.api.post('/user-disponibilidad-config', data);
    return response.data;
  }

  async getUserDisponibilidadConfig(usuarioId: number, mes?: string): Promise<any> {
    const params = mes ? { mes } : {};
    const response = await this.api.get(`/user-disponibilidad-config/usuario/${usuarioId}`, { params });
    return response.data;
  }

  async updateUserDisponibilidadConfig(id: number, data: {
    configuracion?: any;
    activo?: boolean;
  }): Promise<any> {
    const response = await this.api.put(`/user-disponibilidad-config/${id}`, data);
    return response.data;
  }

  async deleteUserDisponibilidadConfig(id: number): Promise<any> {
    const response = await this.api.delete(`/user-disponibilidad-config/${id}`);
    return response.data;
  }

  async getUserDisponibilidadConfigByMes(mes: string): Promise<any> {
    const response = await this.api.get(`/user-disponibilidad-config/usuario-autenticado/${mes}`);
    return response.data;
  }

  // Funciones para el sistema de notificaciones
  async testEmailNotifications(): Promise<any> {
    const response = await this.api.post('/notifications/run-manual');
    return response.data;
  }

  async getNotificationConfig(usuarioId: number): Promise<any> {
    const response = await this.api.get(`/notifications/config/${usuarioId}`);
    return response.data;
  }

  async updateNotificationConfig(usuarioId: number, config: {
    notificarUnaSemanaAntes?: boolean;
    notificarUnDiaAntes?: boolean;
    notificarUnaHoraAntes?: boolean;
    activo?: boolean;
  }): Promise<any> {
    const response = await this.api.put(`/notifications/config/${usuarioId}`, config);
    return response.data;
  }

  async getCronJobsStatus(): Promise<any> {
    const response = await this.api.get('/notifications/cron-status');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
