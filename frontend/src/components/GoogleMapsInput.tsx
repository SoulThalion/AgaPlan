import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// Extender la interfaz de Google Maps para incluir nuestra propiedad personalizada
interface ExtendedGoogleMap extends google.maps.Map {
  pinModeListener?: google.maps.MapsEventListener;
}

interface GoogleMapsInputProps {
  value: string;
  onChange: (data: { direccion: string; latitud: number; longitud: number }) => void;
  placeholder?: string;
  required?: boolean;
}

const GoogleMapsInput: React.FC<GoogleMapsInputProps> = ({ value, onChange, placeholder = "Buscar dirección...", required = false }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isPinMode, setIsPinMode] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 28.2916, lng: -16.6291 }); // Tenerife por defecto
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ExtendedGoogleMap | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const loaderRef = useRef<Loader | null>(null);

  // Inicializar Google Maps
  useEffect(() => {
    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey: 'AIzaSyCoeRl6qcV3aKmGOdAUXWIpgbyB-s1Zlps',
        version: 'weekly',
        libraries: [] // Unificamos con PlaceMapModal
      });
    }
  }, []);

  // Establecer marcador inicial si ya hay coordenadas
  useEffect(() => {
    if (value && !markerPosition) {
      searchAddress(value);
    }
  }, [value, markerPosition]);

  // Actualizar el campo de búsqueda cuando cambie el valor externo
  useEffect(() => {
    if (value) {
      setSearchQuery(value);
    }
  }, [value]);

  // Inicializar mapa cuando se muestre
  useEffect(() => {
    if (showMap && mapRef.current && loaderRef.current && !mapInstanceRef.current) {
      loaderRef.current.load().then(() => {
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: mapCenter,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          mapInstanceRef.current = map;

          // Si hay marcador inicial, mostrarlo
          if (markerPosition) {
            const marker = new google.maps.Marker({
              position: markerPosition,
              map: map,
              title: 'Ubicación seleccionada'
            });
            markerRef.current = marker;
          }
        }
      });
    }
  }, [showMap, mapCenter, markerPosition]);

  // Agregar/remover listener de click según el modo pin
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Limpiar listener anterior si existe
      if (mapInstanceRef.current.pinModeListener) {
        google.maps.event.clearListeners(mapInstanceRef.current, 'click');
      }

      // Agregar nuevo listener
      const listener = mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (isPinMode && e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          
          console.log('Click en mapa (modo pin):', { lat, lng });
          
          // Reverse geocoding para obtener la dirección
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              console.log('Dirección encontrada:', results[0].formatted_address);
              onChange({
                direccion: results[0].formatted_address || 'Dirección no disponible',
                latitud: lat,
                longitud: lng
              });
              setMarkerPosition({ lat, lng });
              setIsPinMode(false);
              setShowConfirmation(true);
              
              // Ocultar confirmación después de 3 segundos
              setTimeout(() => setShowConfirmation(false), 3000);
            } else {
              console.log('Fallback a coordenadas:', { lat, lng });
              // Fallback si falla el geocoding
              onChange({
                direccion: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                latitud: lat,
                longitud: lng
              });
              setMarkerPosition({ lat, lng });
              setIsPinMode(false);
              setShowConfirmation(true);
              
              // Ocultar confirmación después de 3 segundos
              setTimeout(() => setShowConfirmation(false), 3000);
            }
          });
        }
      });

      // Guardar referencia al listener para poder limpiarlo después
      mapInstanceRef.current.pinModeListener = listener;
    }
  }, [isPinMode, onChange]);

  // Actualizar cursor del mapa según el modo pin
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Cambiar el cursor del mapa según el modo pin
      const mapElement = mapInstanceRef.current.getDiv();
      if (mapElement) {
        mapElement.style.cursor = isPinMode ? 'crosshair' : 'grab';
      }
    }
  }, [isPinMode]);

  // Actualizar marcador cuando cambie la posición
  useEffect(() => {
    if (mapInstanceRef.current && markerPosition) {
      if (markerRef.current) {
        markerRef.current.setPosition(markerPosition);
      } else {
        const marker = new google.maps.Marker({
          position: markerPosition,
          map: mapInstanceRef.current,
          title: 'Ubicación seleccionada'
        });
        markerRef.current = marker;
      }
      
      // Centrar mapa en la nueva posición
      mapInstanceRef.current.setCenter(markerPosition);
    }
  }, [markerPosition]);

  const searchAddress = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Construir URL con más parámetros para mejor precisión
      const params = new URLSearchParams({
        address: query,
        key: 'AIzaSyCoeRl6qcV3aKmGOdAUXWIpgbyB-s1Zlps',
        language: 'es',
        region: 'es',
        components: 'country:ES'
      });
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;
        const newCenter = { lat, lng };
        
        setMapCenter(newCenter);
        setMarkerPosition(newCenter);
        
        // Si el mapa está abierto, centrarlo
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(newCenter);
        }
      }
    } catch (error) {
      console.error('Error al buscar dirección:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setNoResults(false);
    setSearchResults([]);
    
    try {
      // Construir URL con más parámetros para mejor precisión
      const params = new URLSearchParams({
        address: searchQuery,
        key: 'AIzaSyCoeRl6qcV3aKmGOdAUXWIpgbyB-s1Zlps',
        language: 'es',
        region: 'es',
        components: 'country:ES'
      });
      
      console.log('Buscando con parámetros:', params.toString());
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta de Google Maps:', data);
      
      if (data.status === 'ZERO_RESULTS') {
        console.log('No se encontraron resultados para:', searchQuery);
        setNoResults(true);
        setSearchResults([]);
      } else if (data.status === 'OK' && data.results) {
        console.log('Resultados encontrados:', data.results.length);
        setSearchResults(data.results);
        setNoResults(false);
      } else {
        console.error('Estado inesperado:', data.status);
        setNoResults(true);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      setSearchResults([]);
      setNoResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultSelect = (result: any) => {
    const { formatted_address, geometry } = result;
    const { lat, lng } = geometry.location;
    const newCenter = { lat, lng };
    
    onChange({
      direccion: formatted_address || 'Dirección no disponible',
      latitud: lat,
      longitud: lng
    });
    
    setMarkerPosition(newCenter);
    setMapCenter(newCenter);
    setSearchResults([]);
    setSearchQuery('');
    setNoResults(false);
    
    // Si el mapa no está abierto, abrirlo
    if (!showMap) {
      setShowMap(true);
    }
  };

  const handlePinModeToggle = () => {
    setIsPinMode(!isPinMode);
    if (isPinMode) {
      // Al desactivar el modo pin, mostrar mensaje de confirmación
      console.log('Modo pin desactivado');
    } else {
      // Al activar el modo pin, mostrar instrucciones
      console.log('Modo pin activado - Haz click en el mapa');
    }
  };

  return (
    <div className="space-y-3">
      {/* Botones de control */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          title="Mostrar/ocultar mapa"
        >
          {showMap ? '🗺️ Ocultar Mapa' : '🗺️ Mostrar Mapa'}
        </button>
        
        <button
          type="button"
          onClick={handlePinModeToggle}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            isPinMode 
              ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-300 animate-pulse' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          title={isPinMode ? 'Modo pin activo - Click para desactivar' : 'Activar modo pin - Click en el mapa para establecer coordenadas'}
        >
          📌 {isPinMode ? 'Modo Pin Activo' : 'Activar Pin'}
        </button>
        
        {isPinMode && (
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Haz click en el mapa
          </span>
        )}
      </div>

      {/* Campo de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setNoResults(false);
          }}
          placeholder={placeholder}
          required={required}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <strong>Consejo:</strong> Usamos Google Maps que es muy preciso para direcciones específicas. Para ubicaciones exactas, usa el modo pin.
          </div>
          <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto dark:border-gray-600">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleResultSelect(result)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <div className="text-sm font-medium dark:text-white">
                  {result.formatted_address}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Tipo: {result.types ? result.types[0] : 'N/A'} • Precisión: {result.geometry.location_type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {noResults && searchQuery.trim() && (
        <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-200 dark:border-orange-800 flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <span>
            <strong>No se encontraron resultados</strong> para "{searchQuery}". 
            <br />
            <span className="text-xs">Prueba con términos más generales o usa el modo pin para seleccionar la ubicación directamente en el mapa.</span>
          </span>
        </div>
      )}

      {/* Mensaje de confirmación */}
      {showConfirmation && (
        <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span><strong>¡Ubicación seleccionada!</strong> Las coordenadas y dirección han sido actualizadas.</span>
        </div>
      )}

      {/* Mapa de Google Maps */}
      {showMap && (
        <div className="border border-gray-300 rounded-md overflow-hidden dark:border-gray-600">
          <div className="bg-gray-100 px-3 py-2 text-sm text-gray-600 border-b border-gray-200 flex items-center justify-between dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
            <span>
              {isPinMode 
                ? 'Modo pin activo - Haz click en el mapa para establecer coordenadas'
                : 'Navega por el mapa - Activa el modo pin para establecer coordenadas'
              }
            </span>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="text-gray-500 hover:text-gray-700 text-lg dark:text-gray-400 dark:hover:text-gray-200"
              title="Cerrar mapa"
            >
              ✕
            </button>
          </div>
          <div 
            className="h-48 sm:h-64 w-full relative"
          >
            {/* Contenedor del mapa de Google */}
            <div 
              ref={mapRef} 
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Valor actual */}
      {value && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Dirección actual:</strong> {value}
        </div>
      )}
    </div>
  );
};

export default GoogleMapsInput;
