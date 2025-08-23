import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

export interface UsuarioAttributes {
  id?: number;
  nombre: string;
  email?: string; // Ahora opcional
  contraseña?: string; // Ahora opcional
  sexo: 'M' | 'F' | 'O';
  cargo: string; // Mantener para compatibilidad
  cargoId?: number; // ID de referencia a la tabla cargos
  rol: 'voluntario' | 'admin' | 'superAdmin' | 'grupo';
  participacionMensual?: number | null; // Número de veces al mes que quiere participar (opcional), null = sin límite
  activo?: boolean; // Si el usuario está activo
  tieneCoche?: boolean; // Si el usuario tiene coche disponible
  siempreCon?: number; // ID del usuario que siempre debe acompañar a este usuario
  nuncaCon?: number; // ID del usuario que nunca debe acompañar a este usuario
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UsuarioCreationAttributes extends Omit<UsuarioAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: number;
  public nombre!: string;
  public email?: string; // Ahora opcional
  public contraseña?: string; // Ahora opcional
  public sexo!: 'M' | 'F' | 'O';
  public cargo!: string;
  public cargoId?: number;
  public cargoInfo?: any; // Para la relación con Cargo
  public rol!: 'voluntario' | 'admin' | 'superAdmin' | 'grupo';
  public participacionMensual?: number | null;
  public activo?: boolean;
  public tieneCoche?: boolean;
  public siempreCon?: number;
  public nuncaCon?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para comparar contraseñas (solo si tiene contraseña)
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.contraseña) return false;
    return bcrypt.compare(candidatePassword, this.contraseña);
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true, // Ahora opcional
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: false, // Permitir vacío
      },
    },
    contraseña: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ahora opcional
      validate: {
        len: [0, 255], // Permitir longitud 0
        notEmpty: false, // Permitir vacío
      },
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F', 'O'),
      allowNull: false,
      validate: {
        isIn: [['M', 'F', 'O']],
      },
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [0, 100], // Permitir longitud 0 (string vacío)
        // notEmpty: false removido - no usar esta validación para permitir strings vacíos
      },
    },
    cargoId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rol: {
      type: DataTypes.ENUM('voluntario', 'admin', 'superAdmin', 'grupo'),
      allowNull: false,
      defaultValue: 'voluntario',
      validate: {
        isIn: [['voluntario', 'admin', 'superAdmin', 'grupo']],
      },
    },
    participacionMensual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        isInt: true,
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    tieneCoche: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    siempreCon: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nuncaCon: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ],
    hooks: {
      // Hash de contraseña antes de crear
      beforeCreate: async (usuario: Usuario) => {
        if (usuario.contraseña && usuario.contraseña.length > 0) {
          const saltRounds = 12;
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, saltRounds);
        }
      },
      // Hash de contraseña antes de actualizar (solo si cambió)
      beforeUpdate: async (usuario: Usuario) => {
        if (usuario.changed('contraseña') && usuario.contraseña && usuario.contraseña.length > 0) {
          const saltRounds = 12;
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, saltRounds);
        }
      },
    },
  }
);

// Definir las asociaciones
Usuario.belongsTo(Usuario, { as: 'siempreConUsuario', foreignKey: 'siempreCon' });
Usuario.belongsTo(Usuario, { as: 'nuncaConUsuario', foreignKey: 'nuncaCon' });

export default Usuario;
