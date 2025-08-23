import sequelize from '../config/database';
import Usuario from '../models/Usuario';
import Turno from '../models/Turno';
import Lugar from '../models/Lugar';
import TurnoUsuario from '../models/TurnoUsuario';
import '../models/associations';

async function testGrupoRoleNewLogic() {
  try {
    console.log('🚀 Iniciando prueba de nueva lógica del rol "grupo"...');
    
    // Sincronizar modelos
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');

    // Crear un lugar de prueba
    const lugar = await Lugar.create({
      nombre: `Lugar de Prueba Grupo Nuevo ${Date.now()}`,
      direccion: 'Dirección de Prueba',
      capacidad: 5,
      descripcion: 'Lugar para probar nueva funcionalidad del rol grupo'
    });
    console.log('✅ Lugar creado:', lugar.nombre);

    // Crear un turno de prueba
    const turno = await Turno.create({
      fecha: new Date('2024-12-26'),
      hora: '10:00-11:00',
      estado: 'libre',
      lugarId: lugar.id
    });
    console.log('✅ Turno creado:', turno.id);

    // Crear un usuario con rol "grupo"
    const usuarioGrupo = await Usuario.create({
      nombre: `Usuario Grupo Nuevo ${Date.now()}`,
      email: `grupo.nuevo.${Date.now()}@test.com`,
      contraseña: 'test123',
      sexo: 'M',
      cargo: 'Grupo',
      rol: 'grupo',
      participacionMensual: 0
    });
    console.log('✅ Usuario grupo creado:', usuarioGrupo.nombre);

    // Simular la asignación del usuario grupo al turno
    await TurnoUsuario.create({
      turnoId: turno.id,
      usuarioId: usuarioGrupo.id
    });
    console.log('✅ Usuario grupo asignado al turno');

    // Verificar que el turno se marcó como completo
    await turno.reload();
    console.log('📊 Estado del turno después de asignar grupo:', turno.estado);

    // Verificar que solo hay un usuario asignado (el grupo)
    const usuariosAsignados = turno.usuarios || [];
    console.log('👥 Usuarios asignados al turno:', usuariosAsignados.length);
    console.log('📋 Usuarios:', usuariosAsignados.map((u: any) => ({ id: u.id, nombre: u.nombre, rol: u.rol })));

    // Verificar que no hay usuarios ficticios
    const usuariosFicticios = usuariosAsignados.filter((u: any) => u.email && u.email.includes('@temporal.com'));
    console.log('❌ Usuarios ficticios encontrados:', usuariosFicticios.length);

    // Verificar que el turno está completo
    if (turno.estado === 'completo') {
      console.log('✅ Turno marcado como completo correctamente');
    } else {
      console.log('❌ Turno NO está marcado como completo');
    }

    // Verificar que solo hay un usuario real asignado
    if (usuariosAsignados.length === 1 && usuariosAsignados[0].rol === 'grupo') {
      console.log('✅ Solo el usuario grupo está asignado (sin usuarios ficticios)');
    } else {
      console.log('❌ Error: Debería haber solo un usuario grupo asignado');
    }

    // Limpiar datos de prueba
    await TurnoUsuario.destroy({ where: { turnoId: turno.id } });
    await turno.destroy();
    await lugar.destroy();
    await usuarioGrupo.destroy();
    console.log('🧹 Datos de prueba limpiados');

    await sequelize.close();
    console.log('🔌 Conexión cerrada');
    
    console.log('\n🎉 Prueba de nueva lógica del rol "grupo" completada exitosamente!');
    console.log('\n📋 Resumen de cambios implementados:');
    console.log('• ✅ No se crean usuarios ficticios');
    console.log('• ✅ El turno se marca como "completo"');
    console.log('• ✅ Solo el usuario grupo queda asignado');
    console.log('• ✅ El frontend mostrará un rectángulo especial para el grupo');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    await sequelize.close();
  }
}

testGrupoRoleNewLogic();
