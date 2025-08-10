import Usuario from './Usuario';
import Lugar from './Lugar';
import Disponibilidad from './Disponibilidad';
import Turno from './Turno';
import Exhibidor from './Exhibidor';

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

// Relación: Exhibidor tiene muchos Turnos
Exhibidor.hasMany(Turno, {
  foreignKey: 'exhibidorId',
  as: 'turnos',
  onDelete: 'RESTRICT', // No se puede eliminar un exhibidor si tiene turnos
});

Turno.belongsTo(Exhibidor, {
  foreignKey: 'exhibidorId',
  as: 'exhibidor',
});

export { Usuario, Lugar, Disponibilidad, Turno, Exhibidor };
