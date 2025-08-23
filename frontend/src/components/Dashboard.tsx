import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import UserManagement from './UserManagement';
import PlaceManagement from './PlaceManagement';

import ShiftManagement from './ShiftManagement';
import DashboardOverview from './DashboardOverview';
import CargoManagement from './CargoManagement';
import ExhibidorManagement from './ExhibidorManagement';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin' || user?.rol === 'superAdmin' || user?.rol === 'grupo';

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
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
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
