import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const isAdmin = user?.rol === 'admin' || user?.rol === 'superAdmin';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'usuarios', label: 'Usuarios', icon: '👥', adminOnly: true },
    { id: 'lugares', label: 'Lugares', icon: '📍', adminOnly: true },
    { id: 'cargos', label: 'Cargos', icon: '🎯', adminOnly: true },
    { id: 'disponibilidades', label: 'Disponibilidades', icon: '📅' },
    { id: 'turnos', label: 'Turnos', icon: '⏰', adminOnly: true }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white dark:bg-neutral-dark shadow-lg border-b border-neutral-light dark:border-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold font-poppins text-primary">
              AgaPlan
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Tabs de navegación */}
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                if (tab.adminOnly && !isAdmin) return null;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium font-poppins transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-neutral-text dark:text-white hover:bg-neutral-light dark:hover:bg-neutral'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>
            
            {/* Información del usuario */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium font-poppins text-neutral-text dark:text-white">
                  {user?.nombre}
                </p>
                <p className="text-xs text-neutral-text/70 dark:text-white/70 capitalize">
                  {user?.rol}
                </p>
              </div>
              
              <ThemeToggle />
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium font-poppins rounded-lg transition-colors duration-200"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
