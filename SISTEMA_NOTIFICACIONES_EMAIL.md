# Sistema de Notificaciones por Email - AgaPlan

## Descripción

El sistema de notificaciones por email de AgaPlan envía recordatorios automáticos a los usuarios sobre sus turnos asignados. Las notificaciones se envían:

- **Una semana antes** del turno
- **Un día antes** del turno  
- **Una hora antes** del turno

## Características

- ✅ Notificaciones automáticas programadas
- ✅ Configuración personalizable por usuario
- ✅ Templates de email profesionales
- ✅ Información completa del turno (fecha, hora, lugar, exhibidores, compañeros)
- ✅ Soporte para múltiples proveedores SMTP
- ✅ Sistema de tareas programadas (cron jobs)
- ✅ API REST para gestión de configuraciones

## Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Configuración de email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

### 2. Configuración para Gmail

Para usar Gmail como proveedor SMTP:

1. Habilita la verificación en 2 pasos en tu cuenta de Google
2. Genera una "Contraseña de aplicación" específica para AgaPlan
3. Usa esa contraseña en `SMTP_PASS`

### 3. Otros Proveedores SMTP

El sistema es compatible con cualquier proveedor SMTP:

- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Servidores corporativos**: Configura según tu proveedor

## Instalación

### 1. Instalar Dependencias

```bash
npm install nodemailer @types/nodemailer node-cron @types/node-cron
```

### 2. Ejecutar Migraciones

```bash
npm run migrate
```

### 3. Iniciar el Servidor

```bash
npm run dev
```

## API Endpoints

### Configuración de Notificaciones

#### Obtener configuración de un usuario
```http
GET /api/notifications/config/:usuarioId
Authorization: Bearer <token>
```

#### Actualizar configuración de un usuario
```http
PUT /api/notifications/config/:usuarioId
Authorization: Bearer <token>
Content-Type: application/json

{
  "notificarUnaSemanaAntes": true,
  "notificarUnDiaAntes": true,
  "notificarUnaHoraAntes": false,
  "activo": true
}
```

#### Crear configuración para un usuario (Admin)
```http
POST /api/notifications/config
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "usuarioId": 1,
  "notificarUnaSemanaAntes": true,
  "notificarUnDiaAntes": true,
  "notificarUnaHoraAntes": true,
  "activo": true
}
```

#### Obtener todas las configuraciones (Admin)
```http
GET /api/notifications/configs
Authorization: Bearer <admin-token>
```

### Gestión del Sistema

#### Ejecutar notificaciones manualmente (Admin)
```http
POST /api/notifications/run-manual
Authorization: Bearer <admin-token>
```

#### Obtener estado de trabajos programados (Admin)
```http
GET /api/notifications/cron-status
Authorization: Bearer <admin-token>
```

## Funcionamiento

### Tareas Programadas

El sistema ejecuta automáticamente:

- **Diario a las 9:00 AM**: Notificaciones de una semana y un día antes
- **Cada hora**: Notificaciones de una hora antes
- **Diario a las 2:00 AM**: Mantenimiento del sistema

### Lógica de Notificaciones

1. **Identificación de turnos**: El sistema busca turnos que necesitan notificación
2. **Verificación de usuarios**: Solo notifica a usuarios con email configurado
3. **Configuración personal**: Respeta las preferencias de cada usuario
4. **Envío de emails**: Genera y envía emails personalizados

### Contenido del Email

Cada notificación incluye:

- 📅 **Fecha y día de la semana** del turno
- 🕐 **Horario** (hora de inicio y fin)
- 📍 **Lugar** y dirección
- 🎪 **Exhibidores** asignados
- 👥 **Compañeros** del turno
- 🎨 **Diseño profesional** con colores y emojis

## Configuración por Usuario

Cada usuario puede configurar:

- `notificarUnaSemanaAntes`: Recibir notificación 7 días antes
- `notificarUnDiaAntes`: Recibir notificación 1 día antes  
- `notificarUnaHoraAntes`: Recibir notificación 1 hora antes
- `activo`: Habilitar/deshabilitar todas las notificaciones

## Monitoreo y Logs

El sistema registra:

- ✅ Emails enviados exitosamente
- ⚠️ Usuarios sin email configurado
- ❌ Errores de envío
- 🔧 Estado de trabajos programados

## Troubleshooting

### Problemas Comunes

#### 1. Emails no se envían
- Verificar configuración SMTP en `.env`
- Comprobar credenciales del proveedor
- Revisar logs del servidor

#### 2. Usuarios no reciben notificaciones
- Verificar que el usuario tenga email configurado
- Comprobar configuración de notificaciones del usuario
- Revisar que el turno esté en estado "ocupado"

#### 3. Trabajos programados no funcionan
- Verificar zona horaria (configurada para España)
- Comprobar logs del sistema
- Ejecutar notificaciones manualmente para testing

### Comandos de Diagnóstico

```bash
# Verificar conexión SMTP
curl -X POST http://localhost:3000/api/notifications/run-manual \
  -H "Authorization: Bearer <admin-token>"

# Ver estado de trabajos programados
curl -X GET http://localhost:3000/api/notifications/cron-status \
  -H "Authorization: Bearer <admin-token>"
```

## Seguridad

- 🔐 Todas las rutas requieren autenticación
- 👑 Configuración global solo para administradores
- 🔒 Credenciales SMTP en variables de entorno
- 🛡️ Validación de datos en todas las operaciones

## Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

- 📧 Nuevos tipos de notificaciones
- 🎨 Templates de email personalizados
- 📱 Integración con otros canales (SMS, push notifications)
- 📊 Analytics y métricas de entrega

## Soporte

Para problemas o preguntas:

1. Revisar logs del servidor
2. Verificar configuración SMTP
3. Comprobar estado de trabajos programados
4. Contactar al administrador del sistema
