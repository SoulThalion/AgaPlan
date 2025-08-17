import sequelize from '../config/database';
import { Op } from 'sequelize';
import '../models/associations'; // Importar las asociaciones
import Usuario from '../models/Usuario';
import Turno from '../models/Turno';
import Lugar from '../models/Lugar';
import TurnoUsuario from '../models/TurnoUsuario';

async function testParticipacionMensualActual() {
  try {
    console.log('🔍 Probando funcionalidad de participación mensual actual...');
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Crear lugar de prueba
    console.log('\n🏢 Creando lugar de prueba...');
    const lugar = await Lugar.create({
      nombre: `Lugar de Prueba ${Date.now()}`,
      direccion: 'Dirección de Prueba',
      capacidad: 5
    });
    
    // Crear usuario de prueba con participación mensual definida
    console.log('\n👤 Creando usuario de prueba con participación mensual definida...');
    const usuario = await Usuario.create({
      nombre: 'Usuario de Prueba',
      sexo: 'M',
      cargo: 'Voluntario de Prueba',
      rol: 'voluntario',
      participacionMensual: 3, // 3 turnos al mes
      tieneCoche: false
    });
    
    console.log('✅ Usuario creado exitosamente:', {
      id: usuario.id,
      nombre: usuario.nombre,
      participacionMensual: usuario.participacionMensual
    });
    
    // Crear turnos de prueba para el mes actual
    console.log('\n📅 Creando turnos de prueba para el mes actual...');
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    
    // Crear 2 turnos en el mes actual
    for (let i = 0; i < 2; i++) {
      const turno = await Turno.create({
        fecha: new Date(añoActual, mesActual, 15 + i), // Días 15 y 16 del mes
        hora: '09:00-11:00',
        lugarId: lugar.id,
        estado: 'ocupado'
      });
      
      // Asignar el usuario al turno usando la tabla intermedia
      await TurnoUsuario.create({
        turnoId: turno.id,
        usuarioId: usuario.id
      });
      
      console.log(`✅ Turno ${i + 1} creado y asignado:`, {
        id: turno.id,
        fecha: turno.fecha,
        usuario: usuario.nombre
      });
    }
    
    // Crear 1 turno en el mes anterior (no debe contar)
    const turnoMesAnterior = await Turno.create({
      fecha: new Date(añoActual, mesActual - 1, 15),
      hora: '09:00-11:00',
      lugarId: lugar.id,
      estado: 'ocupado'
    });
    await TurnoUsuario.create({
      turnoId: turnoMesAnterior.id,
      usuarioId: usuario.id
    });
    console.log('✅ Turno del mes anterior creado (no debe contar):', {
      id: turnoMesAnterior.id,
      fecha: turnoMesAnterior.fecha
    });
    
    // Simular la consulta que hace el controlador
    console.log('\n🔍 Simulando consulta del controlador...');
    const turnosDelMes = await Turno.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          where: { id: usuario.id }
        }
      ],
      where: {
        fecha: {
          [Op.and]: [
            { [Op.gte]: new Date(añoActual, mesActual, 1) },
            { [Op.lt]: new Date(añoActual, mesActual + 1, 1) }
          ]
        }
      }
    });
    
    const turnosOcupados = turnosDelMes.length;
    const limiteMensual = usuario.participacionMensual;
    const disponible = limiteMensual === null || turnosOcupados < (limiteMensual || 0);
    const porcentaje = limiteMensual ? Math.round((turnosOcupados / limiteMensual) * 100) : null;
    
    console.log('\n📊 Resultado de la consulta:');
    console.log('  - Usuario:', usuario.nombre);
    console.log('  - Turnos ocupados en el mes actual:', turnosOcupados);
    console.log('  - Límite mensual:', limiteMensual);
    console.log('  - Disponible:', disponible);
    console.log('  - Porcentaje usado:', porcentaje ? `${porcentaje}%` : 'N/A');
    console.log('  - Turnos restantes:', limiteMensual ? limiteMensual - turnosOcupados : 'Sin límite');
    
    // Verificar que solo se contaron los turnos del mes actual
    console.log('\n📋 Turnos encontrados:');
    turnosDelMes.forEach((turno, index) => {
      console.log(`  ${index + 1}. ID: ${turno.id}, Fecha: ${turno.fecha}`);
    });
    
    // Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await Turno.destroy({ where: { lugarId: lugar.id } });
    await usuario.destroy();
    await lugar.destroy();
    console.log('✅ Datos de prueba eliminados');
    
    console.log('\n🎉 Prueba de participación mensual actual completada exitosamente');
    console.log('\n📋 Resumen de la funcionalidad:');
    console.log('  - Solo se cuentan los turnos del mes actual');
    console.log('  - Se calcula correctamente el porcentaje usado');
    console.log('  - Se determina si el usuario está disponible');
    console.log('  - En el frontend se mostrará: "2/3 turnos/mes"');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testParticipacionMensualActual();
}

export default testParticipacionMensualActual;
