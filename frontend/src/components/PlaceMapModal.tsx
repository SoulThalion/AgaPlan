import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LOADER_CONFIG } from '../config/googleMaps';
import type { Lugar } from '../types';

// Declaración global para Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

interface PlaceMapModalProps {
  lugar: Lugar;
  isOpen: boolean;
  onClose: () => void;
}

const PlaceMapModal: React.FC<PlaceMapModalProps> = ({ lugar, isOpen, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const loaderRef = useRef<Loader | null>(null);

  // Asegurar que las coordenadas sean números válidos
  const latitud = typeof lugar.latitud === 'number' ? lugar.latitud : parseFloat(lugar.latitud as any);
  const longitud = typeof lugar.longitud === 'number' ? lugar.longitud : parseFloat(lugar.longitud as any);

  // Inicializar Google Maps
  useEffect(() => {
    if (!loaderRef.current) {
      loaderRef.current = new Loader(LOADER_CONFIG);
    }
  }, []);

  // Inicializar mapa cuando se abra el modal
  useEffect(() => {
    if (isOpen && mapRef.current && loaderRef.current && !mapInstanceRef.current) {
      if (latitud && longitud && !isNaN(latitud) && !isNaN(longitud)) {
        console.log('Inicializando Google Maps...', { latitud, longitud });
        
        loaderRef.current.load().then(() => {
          console.log('Google Maps cargado exitosamente');
          
          if (mapRef.current && window.google && window.google.maps) {
            const position = { lat: latitud, lng: longitud };
            
            try {
              const map = new google.maps.Map(mapRef.current, {
                center: position,
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
              console.log('Mapa creado exitosamente');

              // Agregar marcador
              const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: lugar.nombre,
                animation: google.maps.Animation.DROP
              });

              markerRef.current = marker;
              console.log('Marcador agregado exitosamente');

              // Agregar InfoWindow
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="text-align: center; padding: 8px;">
                    <h4 style="font-weight: 600; margin: 0 0 4px 0; font-size: 14px;">${lugar.nombre}</h4>
                    <p style="margin: 0; font-size: 12px; color: #666;">${lugar.direccion}</p>
                  </div>
                `
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });
            } catch (error) {
              console.error('Error al crear el mapa:', error);
            }
          } else {
            console.error('Google Maps no está disponible:', {
              mapRef: !!mapRef.current,
              google: !!window.google,
              maps: !!(window.google && window.google.maps)
            });
          }
        }).catch((error) => {
          console.error('Error al cargar Google Maps:', error);
        });
      }
    }
  }, [isOpen, latitud, longitud, lugar.nombre, lugar.direccion]);

  // Limpiar mapa cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    }
  }, [isOpen]);

  if (!isOpen || !latitud || !longitud || isNaN(latitud) || isNaN(longitud)) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-dark rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
          <div 
            ref={mapRef} 
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PlaceMapModal;
