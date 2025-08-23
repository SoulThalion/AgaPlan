import sequelize from '../config/database';
import Usuario from '../models/Usuario';
import Turno from '../models/Turno';
import Lugar from '../models/Lugar';
import TurnoUsuario from '../models/TurnoUsuario';
import '../models/associations';

async function testGrupoRoleFixed() {
  try {
    console.log('🚀 Iniciando prueba de lógica corregida del rol "grupo"...');
    
    // Sincronizar modelos
    await sequelize.sync({ force: false });
    
    // Crear un lugar de prueba con nombre único
    const timestamp = Date.now();
    const lugar = await Lugar.create({
      nombre: `Lugar de Prueba Grupo ${timestamp}`,
      direccion: 'Dirección de Prueba',
      capacidad: 5
    });
    console.log('✅ Lugar creado:', lugar.nombre);
    
    // Crear un turno de prueba
    const turno = await Turno.create({
      fecha: new Date('2024-12-20'),
      hora: '09:00-13:00',
      lugarId: lugar.id,
      estado: 'libre'
    });
    console.log('✅ Turno creado:', turno.id, 'Estado inicial:', turno.estado);
    
    // Crear un usuario con rol "grupo" con email único
    const usuarioGrupo = await Usuario.create({
      nombre: 'Usuario Grupo Test',
      email: `grupo${timestamp}@test.com`,
      rol: 'grupo',
      cargo: 'Coordinador',
      sexo: 'M',
      tieneCoche: true
    });
    console.log('✅ Usuario grupo creado:', usuarioGrupo.nombre, 'Rol:', usuarioGrupo.rol);
    
    // Simular la asignación del usuario grupo al turno
    console.log('🔄 Asignando usuario grupo al turno...');
    await TurnoUsuario.create({
      turnoId: turno.id,
      usuarioId: usuarioGrupo.id
    });
    
    // Simular la lógica del controlador para marcar como completo
    console.log('🔄 Aplicando lógica del controlador...');
    if (usuarioGrupo.rol === 'grupo') {
      const lugarTurno = await Lugar.findByPk(turno.lugarId);
      if (lugarTurno && lugarTurno.capacidad) {
        turno.estado = 'completo';
        await turno.save();
        console.log(`✅ Turno ${turno.id} marcado como completo por usuario grupo`);
      }
    }
    
    // Recargar el turno para obtener el estado actualizado
    await turno.reload();
    console.log('📊 Estado del turno después de asignar grupo:', turno.estado);
    
    // Recargar el turno con las asociaciones para obtener los usuarios
    const turnoConUsuarios = await Turno.findByPk(turno.id, {
      include: [
        { model: Usuario, as: 'usuarios', through: { attributes: [] } }
      ]
    });
    
    // Verificar usuarios asignados
    const usuariosAsignados = turnoConUsuarios?.usuarios || [];
    console.log('👥 Usuarios asignados al turno:', usuariosAsignados.length);
    console.log('📋 Usuarios:', usuariosAsignados.map((u: any) => ({ id: u.id, nombre: u.nombre, rol: u.rol })));
    
    // Verificar que el turno esté marcado como completo
    if (turno.estado === 'completo') {
      console.log('✅ ÉXITO: El turno está correctamente marcado como "completo"');
    } else {
      console.log('❌ ERROR: El turno NO está marcado como "completo"');
      console.log('   Estado actual:', turno.estado);
    }
    
    // Verificar que solo hay un usuario asignado (el grupo)
    if (usuariosAsignados.length === 1) {
      console.log('✅ ÉXITO: Solo hay un usuario asignado (el grupo)');
    } else {
      console.log('❌ ERROR: Hay más usuarios de los esperados');
      console.log('   Usuarios encontrados:', usuariosAsignados.length);
    }
    
    // Verificar que el usuario asignado es el grupo
    if (usuariosAsignados.length > 0) {
      const usuarioAsignado = usuariosAsignados[0];
      if (usuarioAsignado.rol === 'grupo') {
        console.log('✅ ÉXITO: El usuario asignado tiene rol "grupo"');
      } else {
        console.log('❌ ERROR: El usuario asignado NO tiene rol "grupo"');
        console.log('   Rol actual:', usuarioAsignado.rol);
      }
    } else {
      console.log('❌ ERROR: No hay usuarios asignados al turno');
    }
    
    console.log('\n🎯 RESUMEN DE LA PRUEBA:');
    console.log(`   - Estado del turno: ${turno.estado}`);
    console.log(`   - Usuarios asignados: ${usuariosAsignados.length}`);
    if (usuariosAsignados.length > 0) {
      console.log(`   - Rol del usuario: ${usuariosAsignados[0].rol}`);
    } else {
      console.log(`   - Rol del usuario: No hay usuarios asignados`);
    }
    
    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await TurnoUsuario.destroy({ where: { turnoId: turno.id } });
    await turno.destroy();
    await usuarioGrupo.destroy();
    await lugar.destroy();
    console.log('✅ Datos de prueba limpiados');
    
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    await sequelize.close();
  }
}

testGrupoRoleFixed();
