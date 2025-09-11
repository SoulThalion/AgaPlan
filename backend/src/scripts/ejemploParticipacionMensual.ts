import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

/**
 * Ejemplo de uso de la funcionalidad de participación mensual
 * 
 * Este script demuestra cómo:
 * 1. Un voluntario puede configurar cuántas veces al mes quiere participar
 * 2. Un admin puede ver la configuración de participación mensual de los voluntarios
 * 3. La información se almacena y se puede consultar
 */

async function ejemploParticipacionMensual() {
  console.log('📅 Ejemplo de Participación Mensual\n');

  try {
    // 1. Login como voluntario
    console.log('🔐 1. Login como voluntario...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'maria.garcia@example.com',
      contraseña: 'password123'
    });
    
    const voluntarioToken = loginResponse.data.token;
    console.log('✅ Login exitoso como voluntario\n');

    // 2. Configurar participación mensual del voluntario
    console.log('⚙️ 2. Configurando participación mensual...');
    const configResponse = await axios.patch(
      `${BASE_URL}/usuarios/${loginResponse.data.user.id}/participacion-mensual`,
      {
        participacionMensual: 6 // Quiere participar 6 veces al mes
      },
      {
        headers: { Authorization: `Bearer ${voluntarioToken}` }
      }
    );
    
    console.log('✅ Participación mensual configurada:', configResponse.data.message);
    console.log('📊 Datos del usuario:', {
      nombre: configResponse.data.data.nombre,
      rol: configResponse.data.data.rol,
      participacionMensual: configResponse.data.data.participacionMensual
    });
    console.log();

    // 3. Login como admin para ver la configuración
    console.log('🔐 3. Login como admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'ana.martinez@example.com',
      contraseña: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Login exitoso como admin\n');

    // 4. Ver todos los usuarios (incluyendo participación mensual)
    console.log('👥 4. Consultando usuarios como admin...');
    const usuariosResponse = await axios.get(`${BASE_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('📊 Usuarios y su participación mensual:');
    usuariosResponse.data.data.forEach((usuario: any) => {
      if (usuario.rol === 'voluntario') {
        const participacion = usuario.participacionMensual !== null 
          ? `${usuario.participacionMensual} veces al mes`
          : 'No configurado';
        console.log(`  - ${usuario.nombre} (${usuario.rol}): ${participacion}`);
      } else {
        console.log(`  - ${usuario.nombre} (${usuario.rol}): No aplica`);
      }
    });
    console.log();

    // 5. Ver perfil específico de un voluntario
    console.log('👤 5. Consultando perfil específico del voluntario...');
    const perfilResponse = await axios.get(
      `${BASE_URL}/usuarios/${loginResponse.data.user.id}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    const voluntario = perfilResponse.data.data;
    console.log('📋 Perfil del voluntario:');
    console.log(`  - Nombre: ${voluntario.nombre}`);
    console.log(`  - Email: ${voluntario.email}`);
    console.log(`  - Rol: ${voluntario.rol}`);
    console.log(`  - Participación mensual: ${voluntario.participacionMensual || 'No configurado'}`);
    console.log();

    // 6. Actualizar participación mensual
    console.log('🔄 6. Actualizando participación mensual...');
    const updateResponse = await axios.patch(
      `${BASE_URL}/usuarios/${loginResponse.data.user.id}/participacion-mensual`,
      {
        participacionMensual: 8 // Cambiar a 8 veces al mes
      },
      {
        headers: { Authorization: `Bearer ${voluntarioToken}` }
      }
    );
    
    console.log('✅ Participación mensual actualizada:', updateResponse.data.message);
    console.log(`📊 Nueva configuración: ${updateResponse.data.data.participacionMensual} veces al mes`);
    console.log();

    console.log('🎉 Ejemplo completado exitosamente!');
    console.log('\n💡 Casos de uso:');
    console.log('  - Los voluntarios pueden configurar cuántas veces al mes quieren participar');
    console.log('  - Los admins pueden ver esta información para planificar turnos');
    console.log('  - La configuración es opcional y se puede actualizar en cualquier momento');
    console.log('  - Solo se aplica a usuarios con rol "voluntario"');

  } catch (error: any) {
    console.error('❌ Error durante el ejemplo:', error.response?.data || error.message);
  }
}

// Ejecutar el ejemplo si se llama directamente
if (require.main === module) {
  ejemploParticipacionMensual();
}

export default ejemploParticipacionMensual;
