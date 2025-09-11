import { z } from 'zod';

// Validaciones compartidas entre frontend-web y mobile

export const userSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  rol: z.string().min(1, 'El rol es requerido'),
  activo: z.boolean().optional().default(true),
});

export const turnoSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().min(1, 'La hora de fin es requerida'),
  lugarId: z.number().positive('El lugar es requerido'),
  equipoId: z.number().positive('El equipo es requerido'),
  usuarios: z.array(z.number()).min(1, 'Debe seleccionar al menos un usuario'),
  estado: z.enum(['pendiente', 'confirmado', 'cancelado']).optional().default('pendiente'),
});

export const lugarSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  latitud: z.number().min(-90).max(90, 'Latitud inválida'),
  longitud: z.number().min(-180).max(180, 'Longitud inválida'),
  activo: z.boolean().optional().default(true),
});

export const equipoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  activo: z.boolean().optional().default(true),
});

export const cargoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  activo: z.boolean().optional().default(true),
});

export const disponibilidadSchema = z.object({
  diaSemana: z.number().min(0).max(6, 'Día de la semana inválido'),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().min(1, 'La hora de fin es requerida'),
  activo: z.boolean().optional().default(true),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Tipos inferidos de los schemas
export type UserInput = z.infer<typeof userSchema>;
export type TurnoInput = z.infer<typeof turnoSchema>;
export type LugarInput = z.infer<typeof lugarSchema>;
export type EquipoInput = z.infer<typeof equipoSchema>;
export type CargoInput = z.infer<typeof cargoSchema>;
export type DisponibilidadInput = z.infer<typeof disponibilidadSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
