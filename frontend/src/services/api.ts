import axios, { type AxiosInstance } from 'axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  Usuario, 
  Lugar, 
  Turno, 
  Disponibilidad,
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

  async updateUsuario(id: number, data: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    const response = await this.api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, data);
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

  // Turnos
  async getTurnos(): Promise<ApiResponse<Turno[]>> {
    const response = await this.api.get<ApiResponse<Turno[]>>('/turnos');
    return response.data;
  }

  async getTurnosByUsuario(usuarioId: number): Promise<ApiResponse<Turno[]>> {
    const response = await this.api.get<ApiResponse<Turno[]>>(`/turnos/usuario/${usuarioId}`);
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
}

export const apiService = new ApiService();
export default apiService;
