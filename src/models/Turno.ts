import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TurnoAttributes {
  id: number;
  fecha: Date;
  hora: string; // Formato HH:MM-HH:MM (rango de horas)
  estado: 'libre' | 'ocupado';
  lugarId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TurnoCreationAttributes extends Optional<TurnoAttributes, 'id'> {}

class Turno extends Model<TurnoAttributes, TurnoCreationAttributes> implements TurnoAttributes {
  public id!: number;
  public fecha!: Date;
  public hora!: string;
  public estado!: 'libre' | 'ocupado';
  public lugarId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Propiedades de asociación (se definen en index.ts)
  public readonly usuarios?: any[];
  public readonly lugar?: any;
  public readonly exhibidores?: any[];

  // Métodos helper para trabajar con rangos de horas
  public get horaInicio(): string {
    return this.hora.split('-')[0];
  }

  public get horaFin(): string {
    return this.hora.split('-')[1];
  }

  public get duracionMinutos(): number {
    const [horaInicio, horaFin] = this.hora.split('-');
    const inicio = new Date(`2000-01-01T${horaInicio}:00`);
    const fin = new Date(`2000-01-01T${horaFin}:00`);
    return Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60));
  }

  public static crearRangoHora(horaInicio: string, horaFin: string): string {
    return `${horaInicio}-${horaFin}`;
  }

  public static validarRangoHora(hora: string): boolean {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(hora)) return false;
    
    const [horaInicio, horaFin] = hora.split('-');
    return horaInicio < horaFin;
  }
}

Turno.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING(11), // Aumentado para soportar rangos HH:MM-HH:MM
      allowNull: false,
      validate: {
        esRangoHoraValido(value: string) {
          if (!value || typeof value !== 'string') {
            throw new Error('La hora debe ser una cadena de texto');
          }
          
          // Verificar formato HH:MM-HH:MM
          const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!regex.test(value)) {
            throw new Error('Formato de hora inválido. Debe ser HH:MM-HH:MM (ej: 09:00-10:00)');
          }
          
          // Verificar que la hora de fin sea mayor que la de inicio
          const [horaInicio, horaFin] = value.split('-');
          if (horaInicio >= horaFin) {
            throw new Error('La hora de fin debe ser mayor que la hora de inicio');
          }
        }
      },
    },
    estado: {
      type: DataTypes.ENUM('libre', 'ocupado'),
      allowNull: false,
      defaultValue: 'libre',
    },
    lugarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lugares',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'turnos',
    timestamps: true,
    indexes: [
      {
        fields: ['fecha'],
      },
      {
        fields: ['estado'],
      },
      {
        fields: ['lugarId'],
      },
      {
        unique: true,
        fields: ['fecha', 'hora', 'lugarId'], // Un turno único por fecha, rango de hora y lugar
      },
    ],
  }
);

export default Turno;
