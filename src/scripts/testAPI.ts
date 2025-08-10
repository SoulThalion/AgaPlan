import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  response?: any;
}

class APITester {
  private token: string = '';
  private testResults: TestResult[] = [];

  async runTests() {
    console.log('🧪 Iniciando pruebas de la API...\n');

    try {
      // 1. Probar endpoints públicos
      await this.testPublicEndpoints();
      
      // 2. Probar autenticación
      await this.testAuthentication();
      
      // 3. Probar gestión de lugares (superAdmin)
      await this.testLugaresManagement();
      
      // 4. Probar gestión de turnos (admin)
      await this.testTurnosManagement();
      
        // 5. Probar funcionalidades de voluntarios
  await this.testVoluntarioFunctions();
  
  // 6. Probar configuración de participación mensual
  await this.testParticipacionMensual();
      
        // 7. Probar generación automática de turnos
  await this.testAutomaticTurnosGeneration();

      this.printResults();
    } catch (error) {
      console.error('❌ Error durante las pruebas:', error);
    }
  }

  private async testPublicEndpoints() {
    console.log('📡 Probando endpoints públicos...');
    
    // GET /lugares
    await this.testEndpoint('GET /lugares', async () => {
      const response = await axios.get(`${BASE_URL}/lugares`);
      return response.data;
    });

    // GET /turnos
    await this.testEndpoint('GET /turnos', async () => {
      const response = await axios.get(`${BASE_URL}/turnos`);
      return response.data;
    });
  }

  private async testAuthentication() {
    console.log('🔐 Probando autenticación...');
    
    // Login como superAdmin
    await this.testEndpoint('Login superAdmin', async () => {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'carlos.lopez@example.com',
        contraseña: 'password123'
      });
      
      this.token = response.data.token;
      return response.data;
    });
  }

  private async testLugaresManagement() {
    console.log('🏢 Probando gestión de lugares...');
    
    if (!this.token) {
      this.addResult('Gestión de lugares', false, 'No hay token de autenticación');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    // Crear lugar
    let lugarId: number | undefined;
    await this.testEndpoint('Crear lugar', async () => {
      const response = await axios.post(`${BASE_URL}/lugares`, {
        nombre: 'Centro de Pruebas',
        direccion: 'Calle de Pruebas 123'
      }, { headers });
      
      lugarId = response.data.data.id;
      return response.data;
    });

    if (lugarId !== undefined) {
      // Actualizar lugar
      await this.testEndpoint('Actualizar lugar', async () => {
        const response = await axios.put(`${BASE_URL}/lugares/${lugarId}`, {
          nombre: 'Centro de Pruebas Actualizado'
        }, { headers });
        
        return response.data;
      });

      // Eliminar lugar
      await this.testEndpoint('Eliminar lugar', async () => {
        const response = await axios.delete(`${BASE_URL}/lugares/${lugarId}`, { headers });
        return response.data;
      });
    }
  }

  private async testTurnosManagement() {
    console.log('📅 Probando gestión de turnos...');
    
    if (!this.token) {
      this.addResult('Gestión de turnos', false, 'No hay token de autenticación');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    // Obtener lugares para crear turnos
    const lugaresResponse = await axios.get(`${BASE_URL}/lugares`);
    const lugar = lugaresResponse.data.data[0];

    if (lugar) {
      // Crear turno
      let turnoId: number | undefined;
      await this.testEndpoint('Crear turno', async () => {
        const response = await axios.post(`${BASE_URL}/turnos`, {
          fecha: '2024-12-20',
          hora: '10:00',
          lugarId: lugar.id
        }, { headers });
        
        turnoId = response.data.data.id;
        return response.data;
      });

      if (turnoId !== undefined) {
        // Actualizar turno
        await this.testEndpoint('Actualizar turno', async () => {
          const response = await axios.put(`${BASE_URL}/turnos/${turnoId}`, {
            hora: '11:00'
          }, { headers });
          
          return response.data;
        });

        // Eliminar turno
        await this.testEndpoint('Eliminar turno', async () => {
          const response = await axios.delete(`${BASE_URL}/turnos/${turnoId}`, { headers });
          return response.data;
        });
      }
    }
  }

  private async testVoluntarioFunctions() {
    console.log('👤 Probando funcionalidades de voluntarios...');
    
    // Login como voluntario
    let voluntarioToken: string | undefined;
    await this.testEndpoint('Login voluntario', async () => {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'juan.perez@example.com',
        contraseña: 'password123'
      });
      
      voluntarioToken = response.data.token;
      return response.data;
    });

    if (voluntarioToken !== undefined) {
      const headers = { Authorization: `Bearer ${voluntarioToken}` };

      // Obtener turnos libres
      await this.testEndpoint('Obtener turnos libres', async () => {
        const response = await axios.get(`${BASE_URL}/turnos?estado=libre`);
        return response.data;
      });

      // Ocupar un turno
      const turnosResponse = await axios.get(`${BASE_URL}/turnos?estado=libre`);
      const turnoLibre = turnosResponse.data.data[0];

      if (turnoLibre) {
        await this.testEndpoint('Ocupar turno', async () => {
          const response = await axios.post(`${BASE_URL}/turnos/${turnoLibre.id}/ocupar`, {}, { headers });
          return response.data;
        });

        // Liberar el turno
        await this.testEndpoint('Liberar turno', async () => {
          const response = await axios.post(`${BASE_URL}/turnos/${turnoLibre.id}/liberar`, {}, { headers });
          return response.data;
        });
      }
    }
  }

  private async testParticipacionMensual() {
    console.log('📅 Probando configuración de participación mensual...');
    
    if (!this.token) {
      this.addResult('Participación mensual', false, 'No hay token de autenticación');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    // Obtener usuarios voluntarios
    const usuariosResponse = await axios.get(`${BASE_URL}/usuarios`, { headers });
    const voluntario = usuariosResponse.data.data.find((u: any) => u.rol === 'voluntario');

    if (voluntario) {
      // Configurar participación mensual
      await this.testEndpoint('Configurar participación mensual', async () => {
        const response = await axios.patch(`${BASE_URL}/usuarios/${voluntario.id}/participacion-mensual`, {
          participacionMensual: 8
        }, { headers });
        
        return response.data;
      });

      // Verificar que se configuró correctamente
      await this.testEndpoint('Verificar participación mensual', async () => {
        const response = await axios.get(`${BASE_URL}/usuarios/${voluntario.id}`, { headers });
        return response.data;
      });
    } else {
      this.addResult('Participación mensual', false, 'No se encontraron voluntarios para probar');
    }
  }

  private async testAutomaticTurnosGeneration() {
    console.log('⚙️ Probando generación automática de turnos...');
    
    if (!this.token) {
      this.addResult('Generación automática', false, 'No hay token de autenticación');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    // Obtener lugares
    const lugaresResponse = await axios.get(`${BASE_URL}/lugares`);
    const lugar = lugaresResponse.data.data[0];

    if (lugar) {
      await this.testEndpoint('Generar turnos semanales', async () => {
        const response = await axios.post(`${BASE_URL}/turnos/generar-automaticos`, {
          tipo: 'semanal',
          fechaInicio: '2024-12-23',
          lugarId: lugar.id,
          horaInicio: '09:00',
          horaFin: '17:00',
          intervalo: 60
        }, { headers });
        
        return response.data;
      });
    }
  }

  private async testEndpoint(name: string, testFn: () => Promise<any>) {
    try {
      const result = await testFn();
      this.addResult(name, true, undefined, result);
    } catch (error: any) {
      this.addResult(name, false, error.message);
    }
  }

  private addResult(name: string, success: boolean, error?: string, response?: any) {
    this.testResults.push({ name, success, error, response });
  }

  private printResults() {
    console.log('\n📊 Resultados de las pruebas:');
    console.log('=====================================');
    
    let passed = 0;
    let failed = 0;

    this.testResults.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.name}`);
        passed++;
      } else {
        console.log(`❌ ${result.name}: ${result.error}`);
        failed++;
      }
    });

    console.log('\n=====================================');
    console.log(`✅ Pruebas exitosas: ${passed}`);
    console.log(`❌ Pruebas fallidas: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    } else {
      console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores.');
    }
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  const tester = new APITester();
  tester.runTests();
}

export default APITester;
