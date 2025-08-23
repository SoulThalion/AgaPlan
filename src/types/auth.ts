import { Request } from 'express';

export interface UserPayload {
  id: number;
  email: string;
  nombre: string;
  rol: 'voluntario' | 'admin' | 'superAdmin' | 'grupo';
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  contraseña: string;
  sexo: 'M' | 'F' | 'O';
  cargo: string;
}

export interface LoginRequest {
  email: string;
  contraseña: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<UserPayload, 'id'> & { id: number };
}

export interface JwtPayload {
  id: number;
  email: string;
  rol: 'voluntario' | 'admin' | 'superAdmin' | 'grupo';
  iat: number;
  exp: number;
}
