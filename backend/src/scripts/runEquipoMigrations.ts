import { runMigrations } from '../migrations/runner';

async function runEquipoMigrations() {
  try {
    console.log('🚀 Iniciando migraciones para sistema de equipos...');
    console.log('');
    console.log('📋 Migraciones que se ejecutarán:');
    console.log('  031 - Crear tabla equipos');
    console.log('  032 - Agregar equipoId a usuarios');
    console.log('  033 - Agregar equipoId a lugares');
    console.log('  034 - Agregar equipoId a turnos');
    console.log('  035 - Agregar equipoId a cargos');
    console.log('  036 - Agregar equipoId a exhibidores');
    console.log('  037 - Crear equipo por defecto y asignar datos existentes');
    console.log('');
    
    await runMigrations();
    
    console.log('');
    console.log('🎉 ¡Migraciones de equipos completadas exitosamente!');
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('  1. Verificar que todos los datos existentes estén asignados al "Equipo Principal"');
    console.log('  2. Crear el controlador de equipos');
    console.log('  3. Crear las rutas de equipos');
    console.log('  4. Actualizar la autenticación para incluir equipoId');
    console.log('  5. Modificar los controladores existentes para filtrar por equipo');
    
  } catch (error) {
    console.error('❌ Error ejecutando migraciones de equipos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runEquipoMigrations();
}

export default runEquipoMigrations;
