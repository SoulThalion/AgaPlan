import sequelize from '../config/database';
import Usuario from '../models/Usuario';
import Turno from '../models/Turno';
import Lugar from '../models/Lugar';
import TurnoUsuario from '../models/TurnoUsuario';
import { verificarRequisitosTurno } from '../controllers/turnoController';
import '../models/associations'; // Importar asociaciones

async function testGrupoRoleShiftAssignment() {
  try {
    console.log('🚀 Iniciando prueba de asignación de turnos para rol "grupo"...');
    
    // Sincronizar modelos
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');

    // Crear un lugar de prueba
    const lugar = await Lugar.create({
      nombre: `Lugar de Prueba Grupo ${Date.now()}`,
      direccion: 'Dirección de Prueba',
      capacidad: 5,
      descripcion: 'Lugar para probar funcionalidad del rol grupo',
      equipoId: 1
    });
    console.log('✅ Lugar creado:', lugar.nombre);

    // Crear un turno de prueba
    const turno = await Turno.create({
      fecha: new Date('2024-12-25'),
      hora: '09:00-10:00',
      estado: 'libre',
      lugarId: lugar.id,
      equipoId: 1
    });
    console.log('✅ Turno creado:', turno.id);

    // Crear un usuario con rol "grupo"
    const usuarioGrupo = await Usuario.create({
      nombre: `Usuario Grupo de Prueba ${Date.now()}`,
      email: `grupo.prueba.${Date.now()}@test.com`,
      contraseña: 'test123',
      sexo: 'M',
      cargo: 'Grupo',
      rol: 'grupo',
      tieneCoche: false,
      participacionMensual: 0,
      equipoId: 1
    });
    console.log('✅ Usuario grupo creado:', usuarioGrupo.nombre);

    // Verificar estado inicial del turno
    console.log('\n📊 Estado inicial del turno:');
    console.log('- Estado:', turno.estado);
    console.log('- Capacidad del lugar:', lugar.capacidad);
    console.log('- Usuarios asignados: 0');

    // Simular la asignación del usuario grupo al turno
    console.log('\n🔄 Asignando usuario grupo al turno...');
    
    // Crear la relación turno-usuario
    await TurnoUsuario.create({
      turnoId: turno.id,
      usuarioId: usuarioGrupo.id
    });

    // LÓGICA ESPECIAL PARA ROL "GRUPO"
    console.log('🔍 Aplicando lógica especial para rol "grupo"...');
    
    // Obtener el lugar del turno para verificar capacidad
    const lugarActualizado = await Lugar.findByPk(turno.lugarId);
    
    if (lugarActualizado && lugarActualizado.capacidad) {
      // Si es rol "grupo", ocupar todas las plazas restantes con usuarios ficticios
      // que cumplan los requisitos (masculino y coche)
      const usuariosActuales = await Turno.findByPk(turno.id, {
        include: [{ model: Usuario, as: 'usuarios', through: { attributes: [] } }]
      });
      
      const plazasOcupadas = (usuariosActuales?.usuarios?.length || 0) + 1; // +1 por el usuario grupo
      const plazasRestantes = lugarActualizado.capacidad - plazasOcupadas;
      
      console.log(`- Plazas ocupadas por usuario grupo: ${plazasOcupadas}`);
      console.log(`- Plazas restantes a ocupar: ${plazasRestantes}`);
      
      if (plazasRestantes > 0) {
        // Crear usuarios ficticios para ocupar las plazas restantes
        // Estos usuarios cumplirán automáticamente los requisitos
        for (let i = 0; i < plazasRestantes; i++) {
          // Crear un usuario ficticio que cumpla los requisitos
          const usuarioFicticio = await Usuario.create({
            nombre: `Usuario Grupo ${i + 1}`,
            email: `grupo${turno.id}_${i + 1}@temporal.com`,
            contraseña: 'temporal123', // Contraseña temporal
            sexo: 'M' as const, // Masculino para cumplir requisito
            cargo: 'Grupo',
            rol: 'voluntario' as const, // Rol temporal
            tieneCoche: true, // Con coche para cumplir requisito
            participacionMensual: 0,
            equipoId: 1
          });
          
          // Asignar el usuario ficticio al turno
          await TurnoUsuario.create({
            turnoId: turno.id,
            usuarioId: usuarioFicticio.id
          });
          
          console.log(`  ✅ Usuario ficticio ${i + 1} creado y asignado`);
        }
      }
    }

    // Actualizar el estado del turno
    turno.estado = 'ocupado';
    await turno.save();
    console.log('✅ Estado del turno actualizado a "ocupado"');

    // Obtener el turno con información completa
    const turnoCompleto = await Turno.findByPk(turno.id, {
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion', 'capacidad']
        },
        {
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'email', 'cargo', 'sexo', 'tieneCoche', 'rol']
        }
      ]
    });

    // Verificar requisitos finales
    console.log('\n📊 Estado final del turno:');
    console.log('- Estado:', turnoCompleto?.estado);
    console.log('- Capacidad del lugar:', turnoCompleto?.lugar?.capacidad);
    console.log('- Usuarios asignados:', turnoCompleto?.usuarios?.length);
    
    if (turnoCompleto?.usuarios && turnoCompleto?.lugar) {
      const requisitos = verificarRequisitosTurno(turnoCompleto.usuarios, turnoCompleto.lugar);
      
      console.log('\n🔍 Verificación de requisitos:');
      console.log('- Tiene usuario masculino:', requisitos.tieneMasculino ? '✅' : '❌');
      console.log('- Tiene usuario con coche:', requisitos.tieneCoche ? '✅' : '❌');
      console.log('- Plazas ocupadas:', requisitos.plazasOcupadas);
      console.log('- Turno completo:', requisitos.completo ? '✅' : '❌');
      console.log('- Todos los requisitos cumplidos:', requisitos.requisitosCumplidos ? '✅' : '❌');
      
      // Mostrar usuarios asignados
      console.log('\n👥 Usuarios asignados al turno:');
      turnoCompleto.usuarios.forEach((usuario, index) => {
        console.log(`  ${index + 1}. ${usuario.nombre} (${usuario.rol}) - Sexo: ${usuario.sexo}, Coche: ${usuario.tieneCoche ? 'Sí' : 'No'}`);
      });
    }

    console.log('\n✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar la prueba
testGrupoRoleShiftAssignment();
