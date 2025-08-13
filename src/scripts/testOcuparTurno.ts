import sequelize from '../config/database';
import '../models/associations'; // Importar asociaciones
import Turno from '../models/Turno';
import Usuario from '../models/Usuario';
import TurnoUsuario from '../models/TurnoUsuario';
import Disponibilidad from '../models/Disponibilidad';
import Lugar from '../models/Lugar';

async function testOcuparTurno() {
  try {
    console.log('🔍 Probando funcionalidad de ocupar/liberar turnos...');
    
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
        { model: Lugar, as: 'lugar' },
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
      lugar: turnoLibre.lugar?.nombre,
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
      email: usuario.email
    });
    
    // 6. Crear disponibilidad para el usuario (necesario para ocupar turno)
    const diaSemana = new Date(turnoLibre.fecha).getDay();
    let disponibilidad = await Disponibilidad.findOne({
      where: { usuarioId: usuario.id, dia_semana: diaSemana }
    });
    
    if (!disponibilidad) {
      console.log('\n4. Creando disponibilidad para el usuario...');
      disponibilidad = await Disponibilidad.create({
        usuarioId: usuario.id,
        dia_semana: diaSemana,
        hora_inicio: '08:00',
        hora_fin: '18:00',
        activo: true
      });
      console.log('✅ Disponibilidad creada');
    } else {
      console.log('\n4. Disponibilidad existente encontrada');
    }
    
    // 7. Intentar ocupar el turno
    console.log('\n5. Intentando ocupar turno...');
    await TurnoUsuario.create({
      turnoId: turnoLibre.id,
      usuarioId: usuario.id
    });
    
    // Actualizar estado del turno
    turnoLibre.estado = 'ocupado';
    await turnoLibre.save();
    
    console.log('✅ Turno ocupado exitosamente');
    
    // 8. Verificar que el turno esté ocupado
    console.log('\n6. Verificando estado del turno...');
    const turnoOcupado = await Turno.findByPk(turnoLibre.id, {
      include: [
        { model: Lugar, as: 'lugar' },
        { model: Usuario, as: 'usuarios' }
      ]
    });
    
    console.log('✅ Estado del turno:', turnoOcupado?.estado);
    console.log('✅ Usuarios asignados:', turnoOcupado?.usuarios?.length || 0);
    
    // 9. Intentar liberar el turno
    console.log('\n7. Intentando liberar turno...');
    await TurnoUsuario.destroy({
      where: {
        turnoId: turnoLibre.id,
        usuarioId: usuario.id
      }
    });
    
    // Actualizar estado del turno
    turnoLibre.estado = 'libre';
    await turnoLibre.save();
    
    console.log('✅ Turno liberado exitosamente');
    
    // 10. Verificar que el turno esté libre
    console.log('\n8. Verificando estado final del turno...');
    const turnoFinal = await Turno.findByPk(turnoLibre.id, {
      include: [
        { model: Lugar, as: 'lugar' },
        { model: Usuario, as: 'usuarios' }
      ]
    });
    
    console.log('✅ Estado final del turno:', turnoFinal?.estado);
    console.log('✅ Usuarios asignados:', turnoFinal?.usuarios?.length || 0);
    
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
testOcuparTurno();
