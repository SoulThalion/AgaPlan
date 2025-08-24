import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ColorDemo() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="p-6 bg-gris-calido dark:bg-dark-gris-fondo min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gris-texto dark:text-dark-gris-texto">
            Demostración de Colores - AgaPlan
          </h1>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-azul-sereno dark:bg-dark-azul-sereno text-white rounded-lg hover:bg-azul-sereno-hover dark:hover:bg-azul-sereno-hover transition-colors"
          >
            {isDarkMode ? '🌞 Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Botones */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gris-texto dark:text-dark-gris-texto">Botones</h2>
            
            <button className="w-full px-4 py-3 bg-azul-sereno dark:bg-dark-azul-sereno text-white rounded-lg hover:bg-azul-sereno-hover dark:hover:bg-azul-sereno-hover transition-colors shadow-lg">
              Botón Principal
            </button>
            
            <button className="w-full px-4 py-3 bg-azul-claro dark:bg-dark-azul-claro text-gris-texto dark:text-dark-gris-texto rounded-lg border border-azul-sereno dark:border-dark-azul-sereno transition-colors">
              Botón Secundario
            </button>
            
            <button className="w-full px-4 py-3 bg-verde-esperanza dark:bg-dark-verde-esperanza text-white rounded-lg transition-colors">
              Botón de Éxito
            </button>
          </div>

          {/* Campos de formulario */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gris-texto dark:text-dark-gris-texto">Formularios</h2>
            
            <input
              type="text"
              placeholder="Campo de texto"
              className="w-full px-4 py-3 border border-azul-sereno dark:border-dark-azul-sereno rounded-lg bg-white dark:bg-dark-gris-fondo text-gris-texto dark:text-dark-gris-texto focus:ring-2 focus:ring-azul-sereno dark:focus:ring-dark-azul-sereno focus:outline-none transition-colors"
            />
            
            <select className="w-full px-4 py-3 border border-azul-sereno dark:border-dark-azul-sereno rounded-lg bg-white dark:bg-dark-gris-fondo text-gris-texto dark:text-dark-gris-texto focus:ring-2 focus:ring-azul-sereno dark:focus:ring-dark-azul-sereno focus:outline-none transition-colors">
              <option>Opción 1</option>
              <option>Opción 2</option>
              <option>Opción 3</option>
            </select>
          </div>

          {/* Indicadores */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gris-texto dark:text-dark-gris-texto">Indicadores</h2>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-verde-esperanza dark:bg-dark-verde-esperanza rounded-full"></div>
              <span className="text-gris-texto dark:text-dark-gris-texto">Disponible</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-azul-sereno dark:bg-dark-azul-sereno rounded-full"></div>
              <span className="text-gris-texto dark:text-dark-gris-texto">En proceso</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gris-texto dark:bg-dark-gris-texto rounded-full"></div>
              <span className="text-gris-texto dark:text-dark-gris-texto">Completado</span>
            </div>
          </div>
        </div>

        {/* Información del tema actual */}
        <div className="mt-8 p-4 bg-white dark:bg-dark-gris-fondo rounded-lg border border-azul-claro dark:border-dark-azul-claro">
          <h3 className="text-lg font-semibold text-gris-texto dark:text-dark-gris-texto mb-2">
            Información del Tema
          </h3>
          <p className="text-gris-texto dark:text-dark-gris-texto">
            <strong>Tema actual:</strong> {isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
          </p>
          <p className="text-gris-texto dark:text-dark-gris-texto">
            <strong>Clase CSS:</strong> {isDarkMode ? '.dark' : 'sin clase'}
          </p>
        </div>
      </div>
    </div>
  );
}
