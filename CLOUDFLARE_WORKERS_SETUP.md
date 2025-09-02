# ⚡ Configuración de Cloudflare Workers para AgaPlan

## 📋 Resumen

Este documento explica cómo configurar Cloudflare Workers para ejecutar las notificaciones de AgaPlan de manera eficiente y confiable.

## 🏗️ Arquitectura Simplificada

**Con Cloudflare Workers:**
```
Cloudflare Worker (cada 10 min) 
    ↓ HTTP GET
Tu Backend (/api/notifications/cron/smart)
    ↓ Evalúa automáticamente
Ejecuta notificaciones necesarias
```

**Tu backend NO necesita:**
- ❌ Cron interno
- ❌ node-cron
- ❌ Trabajos programados
- ❌ Lógica de timing

**Tu backend SOLO necesita:**
- ✅ El endpoint `/api/notifications/cron/smart`
- ✅ La lógica de notificaciones
- ✅ El servicio de email

## 🚀 Ventajas de Cloudflare Workers

- ✅ **Ejecución global**: Se ejecuta en múltiples ubicaciones
- ✅ **Sin tiempo de inactividad**: No se "duerme" como Render
- ✅ **Ejecución rápida**: < 10ms de latencia
- ✅ **Gratuito**: 100,000 requests/día gratis
- ✅ **Cron triggers**: Ejecución programada nativa
- ✅ **Arquitectura simple**: Solo un endpoint en tu backend

## ⏰ Configuración de Frecuencia (Optimizada para Render)ru

### Opción 1: Cada 15 minutos (Recomendado para Render)
```javascript
// Cron trigger: "*/15 * * * *"
// Ejecuta: 00, 15, 30, 45 de cada hora
// Llamadas/día: 96 (muy respetuoso con Render)
```

### Opción 2: Cada 20 minutos (Más conservador)
```javascript
// Cron trigger: "*/20 * * * *"
// Ejecuta: 00, 20, 40 de cada hora
// Llamadas/día: 72 (súper respetuoso)
```

### Opción 3: Horarios específicos (Mínimo impacto)
```javascript
// Cron trigger: "0 9,14,19,2 * * *"
// Ejecuta: 9:00, 14:00, 19:00, 2:00
// Llamadas/día: 4 (mínimo absoluto)
```

### Opción 4: Solo cuando es necesario (Inteligente)
```javascript
// Cron trigger: "0 9,2 * * *" + "*/30 * * * *"
// 9:00 y 2:00: Notificaciones diarias + mantenimiento
// Cada 30 min: Solo notificaciones de una hora antes
// Llamadas/día: ~50 (balance perfecto)
```

## 🎯 Margen de Tiempo Optimizado

**Para frecuencias menos frecuentes, ampliamos el margen:**

### Con cada 15 minutos:
- **Margen**: 45-75 minutos antes del turno
- **Ejemplo**: Turno a las 14:30
  - 13:15 (75 min) → ✅ Notificación enviada
  - 13:30 (60 min) → ✅ Notificación enviada
  - 13:45 (45 min) → ✅ Notificación enviada
  - 14:00 (30 min) → ❌ No se envía

### Con cada 20 minutos:
- **Margen**: 40-80 minutos antes del turno
- **Ejemplo**: Turno a las 14:30
  - 13:10 (80 min) → ✅ Notificación enviada
  - 13:30 (60 min) → ✅ Notificación enviada
  - 13:50 (40 min) → ✅ Notificación enviada
  - 14:10 (20 min) → ❌ No se envía

### Con cada 30 minutos:
- **Margen**: 30-90 minutos antes del turno
- **Ejemplo**: Turno a las 14:30
  - 13:00 (90 min) → ✅ Notificación enviada
  - 13:30 (60 min) → ✅ Notificación enviada
  - 14:00 (30 min) → ✅ Notificación enviada
  - 14:30 (0 min) → ❌ No se envía

## 📝 Código del Worker (Versión Simplificada)

**¡Perfecto!** Con Cloudflare Workers solo necesitas llamar al endpoint inteligente que ya creamos:

```javascript
// worker.js - Versión simplificada
export default {
  async scheduled(event, env, ctx) {
    const startTime = new Date();
    console.log(`🚀 [CLOUDFLARE-WORKER] Llamando endpoint inteligente - ${startTime.toISOString()}`);
    
    try {
      // Llamar al endpoint inteligente que evalúa todo automáticamente
      const response = await fetch(`${env.API_URL}/api/notifications/cron/smart`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ [WORKER] ${result.message}`);
        console.log(`📊 [WORKER] Total enviadas: ${result.data.totalSent}, fallidas: ${result.data.totalFailed}`);
        console.log(`⏱️ [WORKER] Tiempo de ejecución: ${result.data.executionTime}ms`);
      } else {
        console.error(`❌ [WORKER] Error: ${result.message}`);
      }
      
      // Opcional: Enviar resultado a un webhook
      if (env.WEBHOOK_URL && result.success) {
        await fetch(env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'cloudflare-worker',
            ...result
          })
        });
      }

    } catch (error) {
      console.error('❌ [WORKER] Error llamando al endpoint:', error);
      
      // Opcional: Enviar error a webhook
      if (env.WEBHOOK_URL) {
        await fetch(env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'cloudflare-worker',
            success: false,
            message: 'Error en worker',
            error: error.message,
            timestamp: new Date().toISOString()
          })
        });
      }
    }
  }
};
```

## 🎯 **¿Por qué es mejor así?**

✅ **Más simple**: Solo una llamada HTTP  
✅ **Menos código**: El worker es mínimo  
✅ **Más confiable**: La lógica está en tu backend  
✅ **Fácil debugging**: Los logs están en tu aplicación  
✅ **Menos recursos**: El worker consume menos CPU  
✅ **Anti-duplicados**: Sistema integrado para evitar notificaciones repetidas

## 🛡️ Sistema Anti-Duplicados

**El backend incluye un sistema inteligente para evitar notificaciones duplicadas:**

- ✅ **Tabla de registro**: `notificaciones_enviadas` registra cada notificación enviada
- ✅ **Verificación automática**: Antes de enviar, verifica si ya se envió
- ✅ **Único por combinación**: Un usuario solo recibe una notificación por turno y tipo
- ✅ **Registro de errores**: Si falla el envío, se registra para reintentar

**Ejemplo:**
```
Turno 123, Usuario 456, Tipo "una_hora"
- Primera llamada: ✅ Envía notificación, registra en BD
- Segunda llamada: ⏭️ Ya enviada, no envía duplicado
- Tercera llamada: ⏭️ Ya enviada, no envía duplicado
```  

## 🛠️ Configuración en Cloudflare

### Paso 1: Crear el Worker

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona "Workers & Pages"
3. Haz clic en "Create application"
4. Selecciona "Worker"
5. Pega el código anterior

### Paso 2: Configurar Variables de Entorno

En la pestaña "Settings" → "Variables":

```bash
API_URL=https://tu-app.onrender.com
WEBHOOK_URL=https://hooks.slack.com/services/... (opcional)
```

### Paso 3: Configurar Cron Trigger

1. Ve a "Triggers" → "Cron Triggers"
2. Agrega un nuevo trigger:

**Opción recomendada (respetuosa con Render):**
   - **Cron**: `*/15 * * * *` (cada 15 minutos)
   - **Timezone**: `Europe/Madrid`
   - **Llamadas/día**: 96 (muy respetuoso)

**Opción conservadora:**
   - **Cron**: `*/20 * * * *` (cada 20 minutos)
   - **Timezone**: `Europe/Madrid`
   - **Llamadas/día**: 72 (súper respetuoso)

### Paso 4: Desplegar

1. Haz clic en "Save and Deploy"
2. El worker estará activo inmediatamente

## 📊 Monitoreo

### Logs de Cloudflare
- Ve a "Logs" en el dashboard del worker
- Verás logs con prefijo `[CLOUDFLARE-WORKER]`

### Webhook (Opcional)
Puedes configurar un webhook para recibir notificaciones de los resultados:
- Slack
- Discord
- Email
- Tu propio endpoint

## 🔧 Troubleshooting

### Problema: Worker no se ejecuta
- Verifica que el cron trigger esté configurado
- Revisa los logs del worker
- Asegúrate de que la zona horaria sea correcta

### Problema: API no responde
- Verifica que `API_URL` sea correcta
- Asegúrate de que tu aplicación esté desplegada
- Revisa que los endpoints no requieran autenticación

### Problema: Notificaciones duplicadas
- El sistema está diseñado para evitar duplicados
- Cada usuario solo recibe una notificación por turno
- El margen de 50-70 minutos permite múltiples intentos

## 💰 Costos

**Cloudflare Workers (Gratuito):**
- 100,000 requests/día
- 10ms CPU time por request
- Cron triggers incluidos

**Cálculo para tu caso:**
- Cada 10 minutos = 144 requests/día
- Muy por debajo del límite gratuito

## 🎯 Resumen

**Configuración recomendada (respetuosa con Render):**
- ✅ **Frecuencia**: Cada 15 minutos (`*/15 * * * *`)
- ✅ **Margen**: 30-90 minutos antes del turno
- ✅ **Zona horaria**: Europe/Madrid
- ✅ **Llamadas/día**: 96 (muy respetuoso)
- ✅ **Costo**: Gratuito
- ✅ **Confiabilidad**: 99.9% uptime

**Alternativa conservadora:**
- ✅ **Frecuencia**: Cada 20 minutos (`*/20 * * * *`)
- ✅ **Llamadas/día**: 72 (súper respetuoso)

¡Perfecto para Render y tu caso de uso! 🚀
