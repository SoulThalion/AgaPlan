import { runMigrations } from '../migrations/runner';
import { Usuario, Cargo } from '../models/associations';
import sequelize from '../config/database';

async function testCargoPrioridad() {
  try {
    console.log('🔄 Ejecutando migraciones...');
    await runMigrations();
    
    console.log('✅ Migraciones ejecutadas correctamente');
    
    // Crear algunos cargos de prueba con diferentes prioridades
    console.log('📝 Creando cargos de prueba...');
    
    const cargos = await Cargo.bulkCreate([
      {
        nombre: 'Coordinador',
        descripcion: 'Coordinador del evento',
        prioridad: 1,
        activo: true,
        equipoId: 1
      },
      {
        nombre: 'Supervisor',
        descripcion: 'Supervisor del turno',
        prioridad: 2,
        activo: true,
        equipoId: 1
      },
      {
        nombre: 'Voluntario',
        descripcion: 'Voluntario general',
        prioridad: 5,
        activo: true,
        equipoId: 1
      },
      {
        nombre: 'Auxiliar',
        descripcion: 'Auxiliar de apoyo',
        prioridad: 10,
        activo: true,
        equipoId: 1
      }
    ]);
    
    console.log('✅ Cargos creados:', cargos.map(c => ({ id: c.id, nombre: c.nombre, prioridad: c.prioridad })));
    
    // Buscar usuarios existentes y actualizar algunos con cargoId
    console.log('🔍 Buscando usuarios existentes...');
    const usuarios = await Usuario.findAll({
      limit: 5,
      attributes: ['id', 'nombre', 'cargo', 'cargoId']
    });
    
    console.log('📋 Usuarios encontrados:', usuarios.map(u => ({ id: u.id, nombre: u.nombre, cargo: u.cargo, cargoId: u.cargoId })));
    
    // Asignar cargoId a algunos usuarios
    if (usuarios.length > 0) {
      console.log('🔗 Asignando cargos a usuarios...');
      
      for (let i = 0; i < Math.min(usuarios.length, cargos.length); i++) {
        await usuarios[i].update({ cargoId: cargos[i].id });
        console.log(`✅ Usuario ${usuarios[i].nombre} asignado al cargo ${cargos[i].nombre} (Prioridad: ${cargos[i].prioridad})`);
      }
    }
    
    // Probar la consulta con include de cargo
    console.log('🔍 Probando consulta con información de cargo...');
    const usuariosConCargo = await Usuario.findAll({
      include: [
        {
          model: Cargo,
          as: 'cargoInfo',
          attributes: ['id', 'nombre', 'prioridad', 'activo']
        }
      ],
      limit: 3
    });
    
    console.log('📊 Usuarios con información de cargo:');
    usuariosConCargo.forEach(usuario => {
      console.log(`  • ${usuario.nombre} (${usuario.cargo})`);
      if (usuario.cargoInfo) {
        console.log(`    └─ Cargo: ${usuario.cargoInfo.nombre} - Prioridad: ${usuario.cargoInfo.prioridad}`);
      } else {
        console.log(`    └─ Sin cargo asignado`);
      }
    });
    
    console.log('🎉 Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testCargoPrioridad();
