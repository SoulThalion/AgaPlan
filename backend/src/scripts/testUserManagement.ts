import { Usuario, Cargo } from '../models/associations';
import sequelize from '../config/database';

async function testUserManagement() {
  try {
    console.log('🔍 Probando funcionalidad de UserManagement...');
    
    // Buscar un cargo existente
    const cargo = await Cargo.findOne({
      where: { nombre: 'Coordinador' }
    });
    
    if (!cargo) {
      console.log('❌ No se encontró el cargo "Coordinador"');
      return;
    }
    
    console.log(`✅ Cargo encontrado: ${cargo.nombre} (ID: ${cargo.id})`);
    
    // Crear un usuario de prueba con cargoId
    const usuarioTest = await Usuario.create({
      nombre: 'Usuario Test CargoId',
      sexo: 'M',
      cargo: cargo.nombre,
      cargoId: cargo.id,
      rol: 'voluntario',
      participacionMensual: 5,
      tieneCoche: true,
      equipoId: 1
    });
    
    console.log(`✅ Usuario creado: ${usuarioTest.nombre}`);
    console.log(`   - Cargo: ${usuarioTest.cargo}`);
    console.log(`   - CargoId: ${usuarioTest.cargoId}`);
    
    // Buscar el usuario con información del cargo
    const usuarioConCargo = await Usuario.findByPk(usuarioTest.id, {
      include: [
        {
          model: Cargo,
          as: 'cargoInfo',
          attributes: ['id', 'nombre', 'prioridad']
        }
      ]
    });
    
    if (usuarioConCargo && usuarioConCargo.cargoInfo) {
      console.log(`✅ Usuario con información de cargo:`);
      console.log(`   - Nombre: ${usuarioConCargo.nombre}`);
      console.log(`   - Cargo: ${usuarioConCargo.cargo}`);
      console.log(`   - CargoId: ${usuarioConCargo.cargoId}`);
      console.log(`   - Cargo Info: ${usuarioConCargo.cargoInfo.nombre} (Prioridad: ${usuarioConCargo.cargoInfo.prioridad})`);
    } else {
      console.log('❌ No se pudo obtener la información del cargo');
    }
    
    // Actualizar el usuario para cambiar el cargo
    const cargoNuevo = await Cargo.findOne({
      where: { nombre: 'Supervisor' }
    });
    
    if (cargoNuevo) {
      await usuarioTest.update({
        cargo: cargoNuevo.nombre,
        cargoId: cargoNuevo.id
      });
      
      console.log(`✅ Usuario actualizado:`);
      console.log(`   - Nuevo cargo: ${cargoNuevo.nombre}`);
      console.log(`   - Nuevo cargoId: ${cargoNuevo.id}`);
    }
    
    // Limpiar: eliminar el usuario de prueba
    await usuarioTest.destroy();
    console.log('🧹 Usuario de prueba eliminado');
    
    console.log('🎉 Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testUserManagement();
