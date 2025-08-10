import sequelize from '../config/database';
import Test from './Test';

// Importar todos los modelos
import Usuario from './Usuario';
import Lugar from './Lugar';
import Disponibilidad from './Disponibilidad';
import Turno from './Turno';

// Importar y configurar las asociaciones
import './associations';

// Exportar todos los modelos
export { 
  Test,
  Usuario, 
  Lugar, 
  Disponibilidad, 
  Turno 
};

// Función para sincronizar todos los modelos con la base de datos
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
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
