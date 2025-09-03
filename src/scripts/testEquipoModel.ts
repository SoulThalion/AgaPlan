import sequelize from '../config/database';
import { Equipo, Usuario } from '../models';

async function testEquipoModel() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    console.log('🔍 Probando modelo Equipo...');
    const equipos = await Equipo.findAll();
    console.log('✅ Modelo Equipo funcionando correctamente');
    console.log('📋 Equipos encontrados:', equipos.length);
    
    console.log('🔍 Probando modelo Usuario con equipoId...');
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'equipoId'],
      limit: 3
    });
    console.log('✅ Modelo Usuario funcionando correctamente');
    console.log('👥 Usuarios encontrados:', usuarios.length);
    
    console.log('🎉 Todos los modelos funcionando correctamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    console.error('Stack:', (error as Error).stack);
    process.exit(1);
  }
}

testEquipoModel();
