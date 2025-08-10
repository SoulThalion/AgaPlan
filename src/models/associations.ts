import Usuario from './Usuario';
import Lugar from './Lugar';
import Disponibilidad from './Disponibilidad';
import Turno from './Turno';

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

export { Usuario, Lugar, Disponibilidad, Turno };
