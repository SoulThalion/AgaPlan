import { Usuario, Cargo } from '../models/associations';
import sequelize from '../config/database';
import { Op } from 'sequelize';

async function testUserManagementAPI() {
  try {
    console.log('🔍 Probando API de UserManagement con cargoId...');
    
    // Buscar un cargo existente
    const cargo = await Cargo.findOne({
      where: { nombre: 'Voluntario' }
    });
    
    if (!cargo) {
      console.log('❌ No se encontró el cargo "Voluntario"');
      return;
    }
    
    console.log(`✅ Cargo encontrado: ${cargo.nombre} (ID: ${cargo.id}, Prioridad: ${cargo.prioridad})`);
    
    // Crear un usuario de prueba con cargoId usando el modelo directamente
    const usuarioTest = await Usuario.create({
      nombre: 'Usuario Test API CargoId',
      sexo: 'F',
      cargo: cargo.nombre,
      cargoId: cargo.id,
      rol: 'voluntario',
      participacionMensual: 3,
      tieneCoche: false
    });
    
    console.log(`✅ Usuario creado directamente en BD:`);
    console.log(`   - ID: ${usuarioTest.id}`);
    console.log(`   - Nombre: ${usuarioTest.nombre}`);
    console.log(`   - Cargo: ${usuarioTest.cargo}`);
    console.log(`   - CargoId: ${usuarioTest.cargoId}`);
    
    // Buscar el usuario con información del cargo usando include
    const usuarioConCargo = await Usuario.findByPk(usuarioTest.id, {
      include: [
        {
          model: Cargo,
          as: 'cargoInfo',
          attributes: ['id', 'nombre', 'prioridad', 'activo']
        }
      ]
    });
    
    if (usuarioConCargo && usuarioConCargo.cargoInfo) {
      console.log(`✅ Usuario con información de cargo:`);
      console.log(`   - Nombre: ${usuarioConCargo.nombre}`);
      console.log(`   - Cargo: ${usuarioConCargo.cargo}`);
      console.log(`   - CargoId: ${usuarioConCargo.cargoId}`);
      console.log(`   - Cargo Info: ${usuarioConCargo.cargoInfo.nombre} (Prioridad: ${usuarioConCargo.cargoInfo.prioridad}, Activo: ${usuarioConCargo.cargoInfo.activo})`);
    } else {
      console.log('❌ No se pudo obtener la información del cargo');
    }
    
    // Probar actualización del usuario
    const cargoNuevo = await Cargo.findOne({
      where: { nombre: 'Auxiliar' }
    });
    
    if (cargoNuevo) {
      await usuarioTest.update({
        cargo: cargoNuevo.nombre,
        cargoId: cargoNuevo.id
      });
      
      console.log(`✅ Usuario actualizado:`);
      console.log(`   - Nuevo cargo: ${cargoNuevo.nombre}`);
      console.log(`   - Nuevo cargoId: ${cargoNuevo.id}`);
      
      // Verificar que se actualizó correctamente
      const usuarioActualizado = await Usuario.findByPk(usuarioTest.id, {
        include: [
          {
            model: Cargo,
            as: 'cargoInfo',
            attributes: ['id', 'nombre', 'prioridad']
          }
        ]
      });
      
      if (usuarioActualizado && usuarioActualizado.cargoInfo) {
        console.log(`✅ Verificación de actualización:`);
        console.log(`   - Cargo actual: ${usuarioActualizado.cargo}`);
        console.log(`   - CargoId actual: ${usuarioActualizado.cargoId}`);
        console.log(`   - Cargo Info actual: ${usuarioActualizado.cargoInfo.nombre} (Prioridad: ${usuarioActualizado.cargoInfo.prioridad})`);
      }
    }
    
    console.log(`\n📊 Prueba completada exitosamente`);
    
    // Limpiar: eliminar el usuario de prueba
    await usuarioTest.destroy();
    console.log('\n🧹 Usuario de prueba eliminado');
    
    console.log('\n🎉 Prueba de API completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testUserManagementAPI();
