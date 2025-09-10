// Configuración de Leaflet
export const LEAFLET_CONFIG = {
  DEFAULT_CENTER: { lat: 27.8478, lng: -15.4467 }, // Vecindario, Gran Canaria por defecto
  DEFAULT_ZOOM: 15,
  LANGUAGE: 'es',
  COUNTRY: 'ES'
};

// URLs de las APIs de geocodificación
export const GEOCODING_URLS = {
  NOMINATIM: 'https://nominatim.openstreetmap.org/search',
  NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse'
};

// Configuración de Nominatim
export const NOMINATIM_CONFIG = {
  format: 'json',
  addressdetails: '1',
  limit: '5',
  countrycodes: 'es',
  'accept-language': 'es'
};

// Configuración de tiles de OpenStreetMap
export const TILE_CONFIG = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
};

// Estilos CSS para Leaflet (se importarán en el componente)
export const LEAFLET_STYLES = {
  container: 'leaflet-container',
  map: 'leaflet-map'
};
