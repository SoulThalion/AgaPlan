import Usuario from './Usuario';
import Lugar from './Lugar';
import Disponibilidad from './Disponibilidad';
import Turno from './Turno';
import Exhibidor from './Exhibidor';
import TurnoExhibidor from './TurnoExhibidor';

// Relación: Usuario tiene muchas Disponibilidades
Usuario.hasMany(Disponibilidad, {
  foreignKey: 'usuarioId',
  as: 'disponibilidades',
  onDelete: 'CASCADE',
});

Disponibilidad.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario',
});

// Relación: Usuario tiene muchos Turnos (opcional)
Usuario.hasMany(Turno, {
  foreignKey: 'usuarioId',
  as: 'turnos',
  onDelete: 'SET NULL', // Si se elimina el usuario, el turno queda libre
});

Turno.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario',
});

// Relación: Lugar tiene muchos Turnos
Lugar.hasMany(Turno, {
  foreignKey: 'lugarId',
  as: 'turnos',
  onDelete: 'CASCADE', // Si se elimina el lugar, se eliminan sus turnos
});

Turno.belongsTo(Lugar, {
  foreignKey: 'lugarId',
  as: 'lugar',
});

// Relación: Turno tiene muchos Exhibidores a través de TurnoExhibidor
Turno.belongsToMany(Exhibidor, {
  through: TurnoExhibidor,
  foreignKey: 'turnoId',
  otherKey: 'exhibidorId',
  as: 'exhibidores',
  onDelete: 'CASCADE',
});

// Relación: Exhibidor tiene muchos Turnos a través de TurnoExhibidor
Exhibidor.belongsToMany(Turno, {
  through: TurnoExhibidor,
  foreignKey: 'exhibidorId',
  otherKey: 'turnoId',
  as: 'turnos',
  onDelete: 'RESTRICT', // No se puede eliminar un exhibidor si tiene turnos
});

// Relación: TurnoExhibidor pertenece a Turno
TurnoExhibidor.belongsTo(Turno, {
  foreignKey: 'turnoId',
  as: 'turno',
});

// Relación: TurnoExhibidor pertenece a Exhibidor
TurnoExhibidor.belongsTo(Exhibidor, {
  foreignKey: 'exhibidorId',
  as: 'exhibidor',
});

export { Usuario, Lugar, Disponibilidad, Turno, Exhibidor, TurnoExhibidor };
