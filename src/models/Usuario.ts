import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

export interface UsuarioAttributes {
  id?: number;
  nombre: string;
  email: string;
  contraseña: string;
  sexo: 'M' | 'F' | 'O';
  cargo: string;
  rol: 'voluntario' | 'admin' | 'superAdmin';
  participacionMensual?: number; // Número de veces al mes que quiere participar (opcional)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UsuarioCreationAttributes extends Omit<UsuarioAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public contraseña!: string;
  public sexo!: 'M' | 'F' | 'O';
  public cargo!: string;
  public rol!: 'voluntario' | 'admin' | 'superAdmin';
  public participacionMensual?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para comparar contraseñas
  public async comparePassword(candidatePassword: string): Promise<boolean> {
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
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    contraseña: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true,
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
        len: [2, 100],
        notEmpty: true,
      },
    },
    rol: {
      type: DataTypes.ENUM('voluntario', 'admin', 'superAdmin'),
      allowNull: false,
      defaultValue: 'voluntario',
      validate: {
        isIn: [['voluntario', 'admin', 'superAdmin']],
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
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
      // Hash de contraseña antes de crear
      beforeCreate: async (usuario: Usuario) => {
        if (usuario.contraseña) {
          const saltRounds = 12;
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, saltRounds);
        }
      },
      // Hash de contraseña antes de actualizar (solo si cambió)
      beforeUpdate: async (usuario: Usuario) => {
        if (usuario.changed('contraseña')) {
          const saltRounds = 12;
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, saltRounds);
        }
      },
    },
  }
);

export default Usuario;
