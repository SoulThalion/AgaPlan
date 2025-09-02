# 🕐 Configuración de Render Cron Jobs para AgaPlan

## 📋 Resumen

Este documento explica cómo configurar un **Cron Job único e inteligente** en Render para que las notificaciones funcionen correctamente en el plan gratuito, donde el servicio se duerme después de 15 minutos de inactividad.

## 🚨 Problema

En el plan gratuito de Render, el servicio se duerme después de 15 minutos de inactividad, por lo que el cron interno no se ejecuta. Necesitamos usar **Render Cron Jobs** externos.

## ✅ Solución

Hemos creado un **endpoint inteligente único** que evalúa automáticamente qué notificaciones deben ejecutarse según la hora actual y las ejecuta si es necesario.

## 🧠 Endpoint Inteligente

### Endpoint Principal
- **URL**: `GET /api/notifications/cron/smart`
- **Frecuencia**: Cada 10 minutos
- **Cron**: `*/10 * * * *`

### ¿Cómo funciona?

El endpoint inteligente evalúa la hora actual y ejecuta automáticamente:

1. **A las 9:00 AM**: Notificaciones de una semana y un día antes
2. **Cada 10 minutos**: Notificaciones de una hora antes (si hay turnos próximos)
3. **A las 2:00 AM**: Mantenimiento diario (verificación SMTP)

### Ventajas
- ✅ **Un solo cron job** en lugar de 4
- ✅ **Eficiente**: Solo ejecuta lo necesario
- ✅ **Inteligente**: Evalúa automáticamente qué hacer
- ✅ **Logging detallado**: Sabe exactamente qué se ejecutó
- ✅ **Menos recursos**: Menos llamadas HTTP a Render

## 🛠️ Configuración en Render

### Paso 1: Crear el Cron Job Inteligente

1. Ve a tu dashboard de Render
2. Haz clic en "New +" → "Cron Job"
3. Configura el cron job con los siguientes datos:

#### Cron Job Inteligente
- **Name**: `agaplan-smart-notifications`
- **Schedule**: `*/10 * * * *`
- **Command**: `curl -X GET https://tu-app.onrender.com/api/notifications/cron/smart`
- **Timezone**: `Europe/Madrid`

### ¿Por qué cada 10 minutos?

- **9:00 AM**: Ejecutará notificaciones de semana y día
- **2:00 AM**: Ejecutará mantenimiento
- **Cada 10 minutos**: Ejecutará notificaciones de una hora antes
- **Otros momentos**: No ejecutará nada (eficiente)

### Paso 2: Configurar Variables de Entorno

Asegúrate de que tu aplicación tenga las siguientes variables de entorno configuradas:

```bash
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Configuración de la aplicación
NODE_ENV=production
RENDER=true
```

### Paso 3: Verificar Funcionamiento

1. **Probar el endpoint inteligente manualmente**:
   ```bash
   curl -X GET https://tu-app.onrender.com/api/notifications/cron/smart
   ```

2. **Verificar logs**: Los logs de Render mostrarán las ejecuciones con el prefijo `[SMART-CRON]`

3. **Monitorear notificaciones**: Revisa que se envíen las notificaciones correctamente

## 📊 Monitoreo

### Logs de Render
El cron job inteligente generará logs con el prefijo `[SMART-CRON]`:
- `🚀 [SMART-CRON] Iniciando evaluación inteligente de notificaciones`
- `⏰ [SMART-CRON] Hora actual: 9:00`
- `📅 [SMART-CRON] Ejecutando notificaciones de una semana y un día antes...`
- `⏰ [SMART-CRON] Ejecutando notificaciones de una hora antes...`
- `📊 [SMART-CRON] Notificaciones hora: X enviadas, Y fallidas`
- `✅ [SMART-CRON] Completado en 150ms - Acciones ejecutadas: notificaciones-hora`

### Respuesta del Endpoint Inteligente
El endpoint devuelve un JSON detallado con:
```json
{
  "success": true,
  "message": "Acciones ejecutadas: notificaciones-hora",
  "data": {
    "notifications": {
      "week": { "sent": 0, "failed": 0, "executed": false },
      "day": { "sent": 0, "failed": 0, "executed": false },
      "hour": { "sent": 3, "failed": 0, "executed": true }
    },
    "maintenance": { "executed": false, "smtpConnection": false },
    "totalSent": 3,
    "totalFailed": 0,
    "executionTime": 150,
    "executedActions": ["notificaciones-hora"],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "nextExecution": "2024-01-15T09:00:00.000Z"
  }
}
```

## 🔧 Troubleshooting

### Problema: Cron job no se ejecuta
- Verifica que la URL de tu aplicación sea correcta
- Asegúrate de que el servicio esté desplegado y funcionando
- Revisa los logs de Render para errores

### Problema: Notificaciones no se envían
- Verifica la configuración SMTP
- Revisa que los usuarios tengan email configurado
- Comprueba que las configuraciones de notificación estén activas

### Problema: Servicio se duerme
- El cron job externo despierta el servicio automáticamente
- El primer cron job puede tardar unos segundos en despertar el servicio

### Problema: No se ejecutan acciones
- Verifica que la hora del servidor sea correcta
- Revisa los logs para ver qué hora detecta el sistema
- Asegúrate de que la zona horaria esté configurada como `Europe/Madrid`

## 📝 Notas Importantes

1. **Zona horaria**: El cron job está configurado para `Europe/Madrid`
2. **Sin autenticación**: El endpoint no requiere autenticación
3. **Logging detallado**: Incluye logging completo de todas las acciones
4. **Manejo de errores**: Devuelve errores HTTP apropiados
5. **Desarrollo vs Producción**: El sistema detecta automáticamente el entorno
6. **Eficiencia**: Solo ejecuta lo necesario según la hora actual

## 🚀 Despliegue

1. Despliega tu aplicación en Render
2. Configura las variables de entorno
3. Crea **UN SOLO** cron job según la configuración anterior
4. Verifica que funcione correctamente

## 🎯 Resumen de la Configuración

**Un solo cron job** que se ejecuta cada 10 minutos y evalúa inteligentemente qué hacer:
- ✅ **9:00 AM**: Notificaciones de semana y día
- ✅ **2:00 AM**: Mantenimiento
- ✅ **Cada 10 minutos**: Notificaciones de una hora antes
- ✅ **Otros momentos**: No hace nada (eficiente)

¡Listo! Las notificaciones ahora funcionarán correctamente en Render con el plan gratuito usando un solo cron job inteligente.
