import sequelize from '../config/database';
import '../models/associations'; // Importar asociaciones
import Turno from '../models/Turno';
import Usuario from '../models/Usuario';
import TurnoUsuario from '../models/TurnoUsuario';

async function testAsignarUsuario() {
  try {
    console.log('🔍 Probando funcionalidad de asignar usuarios a turnos...');
    
    // 1. Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // 2. Sincronizar modelos
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');
    
    // 3. Obtener todos los turnos
    console.log('\n1. Obteniendo turnos...');
    const turnos = await Turno.findAll({
      include: [
        { model: Usuario, as: 'usuarios' }
      ]
    });
    console.log('✅ Turnos obtenidos:', turnos.length);
    
    if (turnos.length === 0) {
      console.log('❌ No hay turnos para probar');
      return;
    }
    
    // 4. Buscar un turno libre
    const turnoLibre = turnos.find(t => t.estado === 'libre');
    if (!turnoLibre) {
      console.log('❌ No hay turnos libres para probar');
      return;
    }
    
    console.log('\n2. Turno libre encontrado:', {
      id: turnoLibre.id,
      fecha: turnoLibre.fecha,
      hora: turnoLibre.hora,
      estado: turnoLibre.estado
    });
    
    // 5. Buscar un usuario para asignar
    const usuario = await Usuario.findOne();
    if (!usuario) {
      console.log('❌ No hay usuarios para probar');
      return;
    }
    
    console.log('\n3. Usuario encontrado:', {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    });
    
    // 6. Intentar asignar el usuario al turno
    console.log('\n4. Intentando asignar usuario al turno...');
    await TurnoUsuario.create({
      turnoId: turnoLibre.id,
      usuarioId: usuario.id
    });
    
    // Actualizar estado del turno si es necesario
    if (turnoLibre.estado === 'libre') {
      turnoLibre.estado = 'ocupado';
      await turnoLibre.save();
    }
    
    console.log('✅ Usuario asignado al turno exitosamente');
    
    // 7. Verificar que el usuario esté asignado
    console.log('\n5. Verificando asignación...');
    const turnoAsignado = await Turno.findByPk(turnoLibre.id, {
      include: [
        { model: Usuario, as: 'usuarios' }
      ]
    });
    
    console.log('✅ Estado del turno:', turnoAsignado?.estado);
    console.log('✅ Usuarios asignados:', turnoAsignado?.usuarios?.length || 0);
    console.log('✅ Usuarios:', turnoAsignado?.usuarios?.map(u => u.nombre).join(', '));
    
    // 8. Intentar asignar el mismo usuario nuevamente (debería fallar)
    console.log('\n6. Intentando asignar el mismo usuario nuevamente...');
    try {
      await TurnoUsuario.create({
        turnoId: turnoLibre.id,
        usuarioId: usuario.id
      });
      console.log('❌ Error: Se permitió asignar el mismo usuario dos veces');
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('✅ Correcto: No se puede asignar el mismo usuario dos veces');
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }
    
    // 9. Verificar que no se haya duplicado
    const turnoVerificado = await Turno.findByPk(turnoLibre.id, {
      include: [
        { model: Usuario, as: 'usuarios' }
      ]
    });
    
    console.log('✅ Usuarios asignados después de intento duplicado:', turnoVerificado?.usuarios?.length || 0);
    
    console.log('\n🎉 ¡Prueba completada exitosamente!');
    
  } catch (error: any) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Detalles del error:', error.message);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar la prueba
testAsignarUsuario();
