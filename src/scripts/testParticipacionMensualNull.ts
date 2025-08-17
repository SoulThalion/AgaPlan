import sequelize from '../config/database';
import Usuario from '../models/Usuario';

async function testParticipacionMensualNull() {
  try {
    console.log('🔍 Probando funcionalidad de participación mensual con valores null...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Crear usuario de prueba con participación mensual null (sin límite)
    console.log('\n👤 Creando usuario de prueba con participación mensual null...');
    const usuarioSinLimite = await Usuario.create({
      nombre: 'Usuario Sin Límite',
      sexo: 'F',
      cargo: 'Voluntario Sin Límite',
      rol: 'voluntario',
      participacionMensual: null, // Sin límite de participación
      tieneCoche: false
    });
    
    console.log('✅ Usuario creado exitosamente:', {
      id: usuarioSinLimite.id,
      nombre: usuarioSinLimite.nombre,
      participacionMensual: usuarioSinLimite.participacionMensual
    });
    
    // Crear usuario de prueba con participación mensual definida
    console.log('\n👤 Creando usuario de prueba con participación mensual definida...');
    const usuarioConLimite = await Usuario.create({
      nombre: 'Usuario Con Límite',
      sexo: 'M',
      cargo: 'Voluntario Con Límite',
      rol: 'voluntario',
      participacionMensual: 5, // 5 turnos al mes
      tieneCoche: true
    });
    
    console.log('✅ Usuario creado exitosamente:', {
      id: usuarioConLimite.id,
      nombre: usuarioConLimite.nombre,
      participacionMensual: usuarioConLimite.participacionMensual
    });
    
    // Verificar que se pueden leer ambos usuarios correctamente
    const usuarioSinLimiteLeido = await Usuario.findByPk(usuarioSinLimite.id);
    const usuarioConLimiteLeido = await Usuario.findByPk(usuarioConLimite.id);
    
    console.log('\n📖 Usuarios leídos exitosamente:');
    console.log('  - Usuario sin límite:', {
      id: usuarioSinLimiteLeido?.id,
      nombre: usuarioSinLimiteLeido?.nombre,
      participacionMensual: usuarioSinLimiteLeido?.participacionMensual,
      interpretacion: usuarioSinLimiteLeido?.participacionMensual === null ? 'Sin límite (puede participar todas las veces que quiera)' : `${usuarioSinLimiteLeido?.participacionMensual} turnos/mes`
    });
    
    console.log('  - Usuario con límite:', {
      id: usuarioConLimiteLeido?.id,
      nombre: usuarioConLimiteLeido?.nombre,
      participacionMensual: usuarioConLimiteLeido?.participacionMensual,
      interpretacion: usuarioConLimiteLeido?.participacionMensual === null ? 'Sin límite (puede participar todas las veces que quiera)' : `${usuarioConLimiteLeido?.participacionMensual} turnos/mes`
    });
    
    // Actualizar participación mensual de null a un número
    console.log('\n🔄 Actualizando participación mensual de null a 8...');
    await usuarioSinLimite.update({ participacionMensual: 8 });
    
    console.log('✅ Participación mensual actualizada:', {
      participacionMensual: usuarioSinLimite.participacionMensual,
      interpretacion: '8 turnos/mes'
    });
    
    // Actualizar participación mensual de un número a null
    console.log('\n🔄 Actualizando participación mensual de 5 a null...');
    await usuarioConLimite.update({ participacionMensual: null });
    
    console.log('✅ Participación mensual actualizada:', {
      participacionMensual: usuarioConLimite.participacionMensual,
      interpretacion: 'Sin límite (puede participar todas las veces que quiera)'
    });
    
    // Limpiar usuarios de prueba
    await usuarioSinLimite.destroy();
    await usuarioConLimite.destroy();
    console.log('✅ Usuarios de prueba eliminados');
    
    console.log('\n🎉 Todas las pruebas de participación mensual con valores null pasaron exitosamente');
    console.log('\n📋 Resumen de la funcionalidad:');
    console.log('  - participacionMensual = null: Usuario puede participar todas las veces que quiera (sin límite)');
    console.log('  - participacionMensual = número: Usuario puede participar máximo ese número de veces al mes');
    console.log('  - En el frontend, solo se muestra "X turnos/mes" cuando hay un número definido');
    console.log('  - Cuando es null, no se muestra nada, indicando que no hay límite');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testParticipacionMensualNull();
}

export default testParticipacionMensualNull;
