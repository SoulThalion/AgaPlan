# 🔐 Configuración Segura de Google Maps

## ⚠️ IMPORTANTE: Seguridad de la API Key

**NUNCA subas tu API key de Google Maps a GitHub.** Esto puede resultar en:
- Uso no autorizado de tu cuenta
- Facturación inesperada
- Bloqueo de tu API key

## 🚀 Configuración Local

### 1. Crear archivo `.env.local` (NO se sube a GitHub)

En la carpeta `frontend/`, crea un archivo llamado `.env.local`:

```bash
# frontend/.env.local
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_real_aqui
```

### 2. Obtener tu API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a "APIs y servicios" → "Credenciales"
4. Copia tu API key

### 3. Habilitar las APIs necesarias

En Google Cloud Console, habilita estas APIs:
- **Maps JavaScript API**
- **Geocoding API**
- **Places API** (opcional)

## 🔒 Configuración de Producción

### Para Vercel/Netlify:
- Agrega la variable de entorno en el dashboard de tu proveedor
- Nombre: `VITE_GOOGLE_MAPS_API_KEY`
- Valor: Tu API key real

### Para otros servidores:
- Configura la variable de entorno en tu servidor
- Asegúrate de que sea `VITE_GOOGLE_MAPS_API_KEY`

## 📁 Archivos que NO se suben a GitHub

- ✅ `.env.local` (variables locales)
- ❌ `.env` (variables por defecto)
- ✅ `.env.example` (ejemplo para otros desarrolladores)

## 🚨 Restricciones de la API Key

Configura restricciones en Google Cloud Console:
1. **Restricciones de aplicación**: Solo tu dominio
2. **Restricciones de API**: Solo las APIs que uses
3. **Cuotas**: Establece límites de uso

## 🔍 Verificación

Si ves este error en la consola:
```
🚨 Google Maps API Key no configurada!
```

Significa que necesitas crear el archivo `.env.local` con tu API key real.

## 📝 Ejemplo de `.env.local`

```bash
# frontend/.env.local
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDezzAdoFZIgS0Jqqvc4ta0hwN_x-8wPb8
```

## 🛡️ Seguridad Implementada

- ✅ **Sin fallbacks hardcodeados**: La aplicación falla si no hay API key
- ✅ **Validación estricta**: Error claro si falta configuración
- ✅ **Variables de entorno**: Solo se leen desde archivos seguros
- ✅ **Gitignore**: `.env.local` nunca se sube a GitHub

## 🗺️ Configuración del Mapa

- **Centro por defecto**: Vecindario, Gran Canaria (27.8478, -15.4467)
- **Zoom por defecto**: 15
- **Idioma**: Español (es)
- **Región**: España (ES)

**¡Recuerda: NUNCA subas este archivo a GitHub!**
