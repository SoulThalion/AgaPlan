// Configuración de Google Maps
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  DEFAULT_CENTER: { lat: 27.8478, lng: -15.4467 }, // Vecindario, Gran Canaria por defecto
  DEFAULT_ZOOM: 15,
  LANGUAGE: 'es',
  REGION: 'es',
  COUNTRY: 'ES'
};

// URLs de las APIs
export const GOOGLE_MAPS_URLS = {
  GEOCODING: 'https://maps.googleapis.com/maps/api/geocode/json'
};

// Configuración del loader
export const LOADER_CONFIG = {
  apiKey: GOOGLE_MAPS_CONFIG.API_KEY,
  version: 'weekly',
  libraries: [] as any[]
};

// Validar que la API key esté configurada
if (!GOOGLE_MAPS_CONFIG.API_KEY) {
  throw new Error(`
🚨 Google Maps API Key no configurada!

Para solucionarlo:

1. Crea un archivo .env.local en la carpeta frontend/:
   VITE_GOOGLE_MAPS_API_KEY=tu_api_key_real_aqui

2. O configura la variable de entorno en tu servidor de producción

NUNCA subas tu API key a GitHub.
  `);
}
