import sequelize from '../config/database';
import Test from './Test';

// Importar todos los modelos
import Usuario from './Usuario';
import Lugar from './Lugar';
import Disponibilidad from './Disponibilidad';
import Turno from './Turno';
import Cargo from './Cargo';
import UsuarioNotificacionConfig from './UsuarioNotificacionConfig';
import NotificacionEnviada from './NotificacionEnviada';
import Exhibidor from './Exhibidor';
import TurnoUsuario from './TurnoUsuario';
import TurnoExhibidor from './TurnoExhibidor';
import Equipo from './Equipo';

// Importar y configurar las asociaciones
import './associations';

// Exportar todos los modelos
export {
  Test,
  Usuario,
  Lugar,
  Disponibilidad,
  Turno,
  Cargo,
  UsuarioNotificacionConfig,
  NotificacionEnviada,
  Exhibidor,
  TurnoUsuario,
  TurnoExhibidor,
  Equipo,
  sequelize // Add this line to export the sequelize instance
};

// Función para sincronizar todos los modelos con la base de datos
export const syncDatabase = async () => {
  try {
    // Solo verificar la conexión, no sincronizar automáticamente
    // Las migraciones se encargan de la estructura de la base de datos
    await sequelize.authenticate();
    console.log('Base de datos conectada correctamente');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

// Función para probar la conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};
