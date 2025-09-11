import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import PlaceManagement from './PlaceManagement';
import ShiftManagement from './ShiftManagement';
import DashboardOverview from './DashboardOverview';
import CargoManagement from './CargoManagement';
import ExhibidorManagement from './ExhibidorManagement';
import EquipoManagement from './EquipoManagement';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin' || user?.rol === 'superAdmin' || user?.rol === 'grupo';

  // Determinar la pestaña activa basada en la URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/usuarios') return 'usuarios';
    if (path === '/lugares') return 'lugares';
    if (path === '/cargos') return 'cargos';
    if (path === '/exhibidores') return 'exhibidores';
    if (path === '/turnos') return 'turnos';
    if (path === '/equipos') return 'equipos';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Función para cambiar de pestaña y navegar
  const handleTabChange = (tab: string) => {
    if (tab === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/${tab}`);
    }
  };

  // Redirigir automáticamente si se accede directamente a una URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' && activeTab !== 'overview') {
      // Si estamos en /dashboard pero la pestaña activa no es overview, redirigir
      navigate(`/${activeTab}`);
    }
  }, [location.pathname, activeTab, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'usuarios':
        return isAdmin ? <UserManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      case 'lugares':
        return isAdmin ? <PlaceManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;

      case 'turnos':
        return isAdmin ? <ShiftManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      case 'cargos':
        return isAdmin ? <CargoManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      case 'exhibidores':
        return isAdmin ? <ExhibidorManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      case 'equipos':
        return user?.rol === 'superAdmin' ? <EquipoManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
