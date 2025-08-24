import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const updateFavicon = () => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    
    // Usar media query para detectar el tema del sistema
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    link.href = darkModeMediaQuery.matches ? '/favicon-dark.svg' : '/favicon-light.svg';
    document.getElementsByTagName('head')[0].appendChild(link);

    // Escuchar cambios en el tema del sistema
    darkModeMediaQuery.addEventListener('change', (e) => {
      link.href = e.matches ? '/favicon-dark.svg' : '/favicon-light.svg';
    });
  };

  useEffect(() => {
    updateFavicon();
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-neutral-light dark:bg-neutral-darker transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
    >
      <span
        className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
          isDarkMode ? 'translate-x-10' : 'translate-x-1'
        }`}
      />
      
      {/* Iconos del sol y luna */}
      <div className="absolute left-2 text-yellow-500">
        <svg
          className={`h-5 w-5 transition-opacity duration-300 ${
            isDarkMode ? 'opacity-0' : 'opacity-100'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      <div className="absolute right-2 text-blue-500">
        <svg
          className={`h-5 w-5 transition-opacity duration-300 ${
            isDarkMode ? 'opacity-100' : 'opacity-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle;
