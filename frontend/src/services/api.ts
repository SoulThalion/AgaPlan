import axios, { type AxiosInstance } from 'axios';
import type { 
  Usuario, 
  Lugar, 
  Turno, 
  Disponibilidad, 
  Cargo,
  AuthResponse, 
  RegisterRequest, 
  ApiResponse 
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
          localStorage.removeItem('usuario');
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

  async configurarParticipacionMensual(id: number, participacionMensual: number): Promise<ApiResponse<Usuario>> {
    const response = await this.api.patch<ApiResponse<Usuario>>(`/usuarios/${id}/participacion-mensual`, {
      participacionMensual
    });
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

  async createTurno(data: Partial<Turno>): Promise<ApiResponse<Turno>> {
    const response = await this.api.post<ApiResponse<Turno>>('/turnos', data);
    return response.data;
  }

  async updateTurno(id: number, data: Partial<Turno>): Promise<ApiResponse<Turno>> {
    const response = await this.api.put<ApiResponse<Turno>>(`/turnos/${id}`, data);
    return response.data;
  }

  async deleteTurno(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/turnos/${id}`);
    return response.data;
  }

  async asignarTurno(turnoId: number, usuarioId: number): Promise<ApiResponse<Turno>> {
    const response = await this.api.patch<ApiResponse<Turno>>(`/turnos/${turnoId}/asignar`, {
      usuarioId
    });
    return response.data;
  }

  async liberarTurno(turnoId: number): Promise<ApiResponse<Turno>> {
    const response = await this.api.patch<ApiResponse<Turno>>(`/turnos/${turnoId}/liberar`);
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
}

export const apiService = new ApiService();
export default apiService;
