import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';
import UserManagement from './UserManagement';
import PlaceManagement from './PlaceManagement';
import AvailabilityManagement from './AvailabilityManagement';
import ShiftManagement from './ShiftManagement';
import CargoManagement from './CargoManagement';
import DashboardOverview from '../components/DashboardOverview';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const isAdmin = user?.rol === 'admin' || user?.rol === 'superAdmin';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'usuarios':
        return isAdmin ? <UserManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      case 'lugares':
        return isAdmin ? <PlaceManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      case 'disponibilidades':
        return <AvailabilityManagement />;
      case 'turnos':
        return isAdmin ? <ShiftManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      case 'cargos':
        return isAdmin ? <CargoManagement /> : <div className="text-center py-12"><p className="text-red-500">Acceso denegado</p></div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral dark:bg-neutral-dark">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container-responsive py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
