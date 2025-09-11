import React, { useEffect, useState } from 'react';
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


interface LeafletViewerProps {
  lugares: Lugar[];
  height?: string;
  showPopup?: boolean;
  center?: [number, number];
  zoom?: number;
}

const LeafletViewer: React.FC<LeafletViewerProps> = ({ 
  lugares, 
  height = '400px',
  showPopup = true,
  center,
  zoom = LEAFLET_CONFIG.DEFAULT_ZOOM
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    center || [LEAFLET_CONFIG.DEFAULT_CENTER.lat, LEAFLET_CONFIG.DEFAULT_CENTER.lng]
  );

  // Calcular centro automático basado en los lugares si no se especifica
  useEffect(() => {
    if (!center && lugares.length > 0) {
      const lugaresConCoordenadas = lugares.filter(lugar => 
        lugar.latitud !== undefined && lugar.longitud !== undefined
      );
      
      if (lugaresConCoordenadas.length > 0) {
        const latSum = lugaresConCoordenadas.reduce((sum, lugar) => 
          sum + parseFloat(lugar.latitud!.toString()), 0);
        const lngSum = lugaresConCoordenadas.reduce((sum, lugar) => 
          sum + parseFloat(lugar.longitud!.toString()), 0);
        
        const avgLat = latSum / lugaresConCoordenadas.length;
        const avgLng = lngSum / lugaresConCoordenadas.length;
        
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [lugares, center]);

  // Filtrar solo lugares activos con coordenadas válidas
  const lugaresValidos = lugares.filter(lugar => 
    lugar.activo && 
    lugar.latitud !== undefined && 
    lugar.longitud !== undefined &&
    !isNaN(parseFloat(lugar.latitud.toString())) &&
    !isNaN(parseFloat(lugar.longitud.toString()))
  );

  return (
    <div className="w-full" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-lg"
      >
        <TileLayer
          url={TILE_CONFIG.url}
          attribution={TILE_CONFIG.attribution}
          maxZoom={TILE_CONFIG.maxZoom}
        />
        
        {lugaresValidos.map((lugar) => {
          const lat = parseFloat(lugar.latitud!.toString());
          const lng = parseFloat(lugar.longitud!.toString());
          
          return (
            <Marker key={lugar.id} position={[lat, lng]}>
              {showPopup && (
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
                      📍 {lat.toFixed(6)}, {lng.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletViewer;
