import sequelize from '../config/database';
import Usuario from '../models/Usuario';

async function testParticipacionMensual() {
  try {
    console.log('🔍 Probando funcionalidad de participación mensual...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Verificar que la tabla usuarios existe y tiene el campo participacionMensual
    const tableDescription = await sequelize.getQueryInterface().describeTable('usuarios');
    console.log('📋 Campos de la tabla usuarios:');
    Object.keys(tableDescription).forEach(field => {
      console.log(`  - ${field}: ${tableDescription[field].type}`);
    });
    
    // Verificar si existe el campo participacionMensual
    if (tableDescription.participacionMensual) {
      console.log('✅ Campo participacionMensual encontrado en la tabla');
    } else {
      console.log('❌ Campo participacionMensual NO encontrado en la tabla');
      return;
    }
    
    // Intentar crear un usuario de prueba con participación mensual
    console.log('\n👤 Creando usuario de prueba...');
    const usuarioTest = await Usuario.create({
      nombre: 'Usuario Test Participación',
      sexo: 'M',
      cargo: 'Voluntario Test',
      rol: 'voluntario',
      participacionMensual: 5,
      tieneCoche: true,
      equipoId: 1
    });
    
    console.log('✅ Usuario creado exitosamente:', {
      id: usuarioTest.id,
      nombre: usuarioTest.nombre,
      participacionMensual: usuarioTest.participacionMensual
    });
    
    // Verificar que se puede leer el campo
    const usuarioLeido = await Usuario.findByPk(usuarioTest.id);
    console.log('✅ Usuario leído exitosamente:', {
      id: usuarioLeido?.id,
      nombre: usuarioLeido?.nombre,
      participacionMensual: usuarioLeido?.participacionMensual
    });
    
    // Actualizar participación mensual
    console.log('\n🔄 Actualizando participación mensual...');
    await usuarioTest.update({ participacionMensual: 8 });
    
    console.log('✅ Participación mensual actualizada:', {
      participacionMensual: usuarioTest.participacionMensual
    });
    
    // Limpiar usuario de prueba
    await usuarioTest.destroy();
    console.log('✅ Usuario de prueba eliminado');
    
    console.log('\n🎉 Todas las pruebas de participación mensual pasaron exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testParticipacionMensual();
}

export default testParticipacionMensual;
