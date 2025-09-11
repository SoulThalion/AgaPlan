import sequelize from '../config/database';
import { Equipo, Usuario, Lugar, Turno, Cargo, Exhibidor } from '../models';

async function verificarEquipos() {
  try {
    console.log('🔍 Verificando sistema de equipos...');
    
    // Verificar equipos
    const equipos = await Equipo.findAll();
    console.log('📋 Equipos encontrados:', equipos.length);
    equipos.forEach(equipo => {
      console.log(`  - ID: ${equipo.id}, Nombre: ${equipo.nombre}, Activo: ${equipo.activo}`);
    });
    
    // Verificar usuarios con equipoId
    const usuarios = await Usuario.findAll({ 
      attributes: ['id', 'nombre', 'equipoId'],
      limit: 5 
    });
    console.log('👥 Usuarios con equipoId:', usuarios.length);
    usuarios.forEach(usuario => {
      console.log(`  - ID: ${usuario.id}, Nombre: ${usuario.nombre}, EquipoId: ${usuario.equipoId}`);
    });
    
    // Verificar lugares con equipoId
    const lugares = await Lugar.findAll({ 
      attributes: ['id', 'nombre', 'equipoId'],
      limit: 5 
    });
    console.log('📍 Lugares con equipoId:', lugares.length);
    lugares.forEach(lugar => {
      console.log(`  - ID: ${lugar.id}, Nombre: ${lugar.nombre}, EquipoId: ${lugar.equipoId}`);
    });
    
    // Verificar turnos con equipoId
    const turnos = await Turno.findAll({ 
      attributes: ['id', 'fecha', 'hora', 'equipoId'],
      limit: 5 
    });
    console.log('🕐 Turnos con equipoId:', turnos.length);
    turnos.forEach(turno => {
      console.log(`  - ID: ${turno.id}, Fecha: ${turno.fecha}, Hora: ${turno.hora}, EquipoId: ${turno.equipoId}`);
    });
    
    console.log('✅ Verificación completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    process.exit(1);
  }
}

verificarEquipos();
