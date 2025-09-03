import Usuario from './Usuario';
import Lugar from './Lugar';
import Turno from './Turno';
import Disponibilidad from './Disponibilidad';
import Exhibidor from './Exhibidor';
import TurnoExhibidor from './TurnoExhibidor';
import TurnoUsuario from './TurnoUsuario';
import UserDisponibilidadConfig from './UserDisponibilidadConfig';
import UsuarioNotificacionConfig from './UsuarioNotificacionConfig';
import Cargo from './Cargo';
import Equipo from './Equipo';

// Asociaciones Usuario - Turno (muchos a muchos)
Usuario.belongsToMany(Turno, { 
  through: TurnoUsuario, 
  foreignKey: 'usuarioId',
  as: 'turnos'
});

Turno.belongsToMany(Usuario, { 
  through: TurnoUsuario, 
  foreignKey: 'turnoId',
  as: 'usuarios'
});

// Asociaciones Turno - Lugar
Turno.belongsTo(Lugar, { foreignKey: 'lugarId', as: 'lugar' });
Lugar.hasMany(Turno, { foreignKey: 'lugarId', as: 'turnos' });

// Asociaciones Turno - Exhibidor (muchos a muchos)
Turno.belongsToMany(Exhibidor, { 
  through: TurnoExhibidor, 
  foreignKey: 'turnoId',
  as: 'exhibidores'
});

Exhibidor.belongsToMany(Turno, { 
  through: TurnoExhibidor, 
  foreignKey: 'exhibidorId',
  as: 'turnos'
});

// Asociaciones Usuario - Disponibilidad
Usuario.hasMany(Disponibilidad, { foreignKey: 'usuarioId', as: 'disponibilidades' });
Disponibilidad.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Asociaciones Usuario - UserDisponibilidadConfig
Usuario.hasMany(UserDisponibilidadConfig, { foreignKey: 'usuarioId', as: 'configuracionesDisponibilidad' });
UserDisponibilidadConfig.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Asociaciones Usuario - UsuarioNotificacionConfig
Usuario.hasOne(UsuarioNotificacionConfig, { foreignKey: 'usuarioId', as: 'configuracionNotificaciones' });
UsuarioNotificacionConfig.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Asociaciones Usuario - Cargo
Usuario.belongsTo(Cargo, { foreignKey: 'cargoId', as: 'cargoInfo' });
Cargo.hasMany(Usuario, { foreignKey: 'cargoId', as: 'usuarios' });

// Asociaciones con Equipo
Equipo.hasMany(Usuario, { foreignKey: 'equipoId', as: 'usuarios' });
Usuario.belongsTo(Equipo, { foreignKey: 'equipoId', as: 'equipo' });

Equipo.hasMany(Lugar, { foreignKey: 'equipoId', as: 'lugares' });
Lugar.belongsTo(Equipo, { foreignKey: 'equipoId', as: 'equipo' });

Equipo.hasMany(Turno, { foreignKey: 'equipoId', as: 'turnos' });
Turno.belongsTo(Equipo, { foreignKey: 'equipoId', as: 'equipo' });

Equipo.hasMany(Cargo, { foreignKey: 'equipoId', as: 'cargos' });
Cargo.belongsTo(Equipo, { foreignKey: 'equipoId', as: 'equipo' });

Equipo.hasMany(Exhibidor, { foreignKey: 'equipoId', as: 'exhibidores' });
Exhibidor.belongsTo(Equipo, { foreignKey: 'equipoId', as: 'equipo' });

// Asociaciones Lugar - Disponibilidad (comentadas porque la tabla no tiene lugarId)
// Lugar.hasMany(Disponibilidad, { foreignKey: 'lugarId', as: 'disponibilidades' });
// Disponibilidad.belongsTo(Lugar, { foreignKey: 'lugarId', as: 'lugar' });

export {
  Usuario,
  Lugar,
  Turno,
  Disponibilidad,
  Exhibidor,
  TurnoExhibidor,
  TurnoUsuario,
  UserDisponibilidadConfig,
  UsuarioNotificacionConfig,
  Cargo,
  Equipo
};
