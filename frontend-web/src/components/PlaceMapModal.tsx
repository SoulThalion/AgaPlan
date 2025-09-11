import React from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LEAFLET_CONFIG, TILE_CONFIG } from '../config/leaflet';
import type { Lugar } from '../types';
import 'leaflet/dist/leaflet.css';

// Configurar iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PlaceMapModalProps {
  lugar: Lugar;
  isOpen: boolean;
  onClose: () => void;
}

const PlaceMapModal: React.FC<PlaceMapModalProps> = ({ lugar, isOpen, onClose }) => {
  // Asegurar que las coordenadas sean números válidos
  const latitud = typeof lugar.latitud === 'number' ? lugar.latitud : parseFloat(lugar.latitud as any);
  const longitud = typeof lugar.longitud === 'number' ? lugar.longitud : parseFloat(lugar.longitud as any);

  if (!isOpen || !latitud || !longitud || isNaN(latitud) || isNaN(longitud)) {
    return null;
  }

  const position: [number, number] = [latitud, longitud];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-neutral-dark rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium font-poppins text-neutral-text dark:text-white">
            Ubicación de {lugar.nombre}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-neutral-text dark:text-white mb-2">
            <strong>Dirección:</strong> {lugar.direccion}
          </p>
          <p className="text-sm text-neutral-text dark:text-white">
            <strong>Coordenadas:</strong> {latitud.toFixed(6)}, {longitud.toFixed(6)}
          </p>
        </div>

        <div className="h-96 w-full rounded-lg overflow-hidden border border-neutral-light dark:border-neutral">
          <MapContainer
            center={position}
            zoom={LEAFLET_CONFIG.DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url={TILE_CONFIG.url}
              attribution={TILE_CONFIG.attribution}
              maxZoom={TILE_CONFIG.maxZoom}
            />
            
            <Marker position={position}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {lugar.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {lugar.direccion}
                  </p>
                  {lugar.descripcion && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {lugar.descripcion}
                    </p>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                    📍 {latitud.toFixed(6)}, {longitud.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default PlaceMapModal;
