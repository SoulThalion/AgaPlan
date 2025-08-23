import sequelize from '../config/database';
import Usuario from '../models/Usuario';

async function testGrupoRole() {
  try {
    console.log('🧪 Probando funcionalidad del rol "grupo"...');
    
    // 1. Verificar que el modelo acepta el nuevo rol
    console.log('\n1️⃣ Probando creación de usuario con rol "grupo"...');
    
    const testUser = await Usuario.create({
      nombre: 'Usuario Test Grupo',
      sexo: 'M',
      cargo: 'Coordinador de Grupo',
      rol: 'grupo',
      participacionMensual: 8,
      tieneCoche: true
    });
    
    console.log(`✅ Usuario creado exitosamente con rol: ${testUser.rol}`);
    console.log(`   - ID: ${testUser.id}`);
    console.log(`   - Nombre: ${testUser.nombre}`);
    console.log(`   - Cargo: ${testUser.cargo}`);
    
    // 2. Verificar que se puede actualizar el rol
    console.log('\n2️⃣ Probando actualización de rol...');
    
    await testUser.update({ rol: 'admin' });
    console.log(`✅ Rol actualizado a: ${testUser.rol}`);
    
    await testUser.update({ rol: 'grupo' });
    console.log(`✅ Rol vuelto a: ${testUser.rol}`);
    
    // 3. Verificar que se puede buscar por rol
    console.log('\n3️⃣ Probando búsqueda por rol...');
    
    const usuariosGrupo = await Usuario.findAll({
      where: { rol: 'grupo' },
      attributes: ['id', 'nombre', 'rol', 'cargo']
    });
    
    console.log(`✅ Encontrados ${usuariosGrupo.length} usuarios con rol "grupo":`);
    usuariosGrupo.forEach(user => {
      console.log(`   - ${user.nombre} (${user.cargo})`);
    });
    
    // 4. Verificar validaciones del modelo
    console.log('\n4️⃣ Probando validaciones del modelo...');
    
    try {
      await Usuario.create({
        nombre: 'Usuario Rol Inválido',
        sexo: 'F',
        cargo: 'Test',
        rol: 'rolInvalido' as any, // Esto debería fallar
        participacionMensual: 5
      });
      console.log('❌ Error: Se permitió crear usuario con rol inválido');
    } catch (error: any) {
      console.log('✅ Validación funcionando: Se rechazó rol inválido');
      console.log(`   Error: ${error.message}`);
    }
    
    // 5. Limpiar usuario de prueba
    console.log('\n5️⃣ Limpiando usuario de prueba...');
    await testUser.destroy();
    console.log('✅ Usuario de prueba eliminado');
    
    console.log('\n🎉 Todas las pruebas del rol "grupo" pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar las pruebas
testGrupoRole();
