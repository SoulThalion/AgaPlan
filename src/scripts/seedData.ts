import { syncDatabase } from '../models';
import Lugar from '../models/Lugar';
import Turno from '../models/Turno';
import Usuario from '../models/Usuario';
import Disponibilidad from '../models/Disponibilidad';

const seedData = async () => {
  try {
    console.log('Sincronizando base de datos...');
    await syncDatabase();

    console.log('Creando lugares de ejemplo...');
    
    // Crear lugares
    const lugares = await Lugar.bulkCreate([
      {
        nombre: 'Centro Comunitario Norte',
        direccion: 'Calle Principal 123, Zona Norte'
      },
      {
        nombre: 'Centro Comunitario Sur',
        direccion: 'Avenida Central 456, Zona Sur'
      },
      {
        nombre: 'Centro Comunitario Este',
        direccion: 'Boulevard Este 789, Zona Este'
      },
      {
        nombre: 'Centro Comunitario Oeste',
        direccion: 'Calle Oeste 321, Zona Oeste'
      }
    ]);

    console.log(`Se crearon ${lugares.length} lugares`);

    // Crear disponibilidades de ejemplo para usuarios existentes
    console.log('Creando disponibilidades de ejemplo...');
    
    const usuarios = await Usuario.findAll();
    
    for (const usuario of usuarios) {
      if (usuario.rol === 'voluntario') {
        // Crear disponibilidad de lunes a viernes, 9:00 a 17:00
        await Disponibilidad.create({
          dia_semana: 1, // Lunes
          hora_inicio: '09:00',
          hora_fin: '17:00',
          usuarioId: usuario.id
        });

        await Disponibilidad.create({
          dia_semana: 2, // Martes
          hora_inicio: '09:00',
          hora_fin: '17:00',
          usuarioId: usuario.id
        });

        await Disponibilidad.create({
          dia_semana: 3, // Miércoles
          hora_inicio: '09:00',
          hora_fin: '17:00',
          usuarioId: usuario.id
        });

        await Disponibilidad.create({
          dia_semana: 4, // Jueves
          hora_inicio: '09:00',
          hora_fin: '17:00',
          usuarioId: usuario.id
        });

        await Disponibilidad.create({
          dia_semana: 5, // Viernes
          hora_inicio: '09:00',
          hora_fin: '17:00',
          usuarioId: usuario.id
        });
      }
    }

    console.log('Se crearon disponibilidades de ejemplo');

    // Crear turnos de ejemplo para la próxima semana
    console.log('Creando turnos de ejemplo...');
    
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 1); // Mañana
    
    const turnosGenerados = [];
    
    for (let i = 0; i < 5; i++) { // 5 días laborables
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);
      
      // Solo lunes a viernes
      if (fecha.getDay() >= 1 && fecha.getDay() <= 5) {
        for (const lugar of lugares) {
          // Turnos cada 2 horas de 9:00 a 17:00
          for (let hora = 9; hora < 17; hora += 2) {
            const horaString = `${hora.toString().padStart(2, '0')}:00`;
            
            const turno = await Turno.create({
              fecha: fecha,
              hora: horaString,
              lugarId: lugar.id,
              estado: 'libre'
            });
            
            turnosGenerados.push(turno);
          }
        }
      }
    }

    console.log(`Se crearon ${turnosGenerados.length} turnos de ejemplo`);

    console.log('¡Datos de ejemplo creados exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error creando datos de ejemplo:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedData();
}

export default seedData;
