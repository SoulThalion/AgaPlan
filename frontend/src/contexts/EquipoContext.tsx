import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Equipo, EquipoStats } from '../types';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

interface EquipoContextType {
  equipos: Equipo[];
  equiposStats: EquipoStats[];
  currentEquipo: Equipo | null;
  isLoading: boolean;
  error: string | null;
  setCurrentEquipo: (equipo: Equipo | null) => void;
  refreshEquipos: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const EquipoContext = createContext<EquipoContextType | undefined>(undefined);

export const useEquipo = () => {
  const context = useContext(EquipoContext);
  if (context === undefined) {
    throw new Error('useEquipo must be used within an EquipoProvider');
  }
  return context;
};

interface EquipoProviderProps {
  children: ReactNode;
}

export const EquipoProvider: React.FC<EquipoProviderProps> = ({ children }) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equiposStats, setEquiposStats] = useState<EquipoStats[]>([]);
  const [currentEquipo, setCurrentEquipo] = useState<Equipo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Función para obtener equipos
  const fetchEquipos = async () => {
    if (!token || user?.rol !== 'superAdmin') return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getEquipos();
      if (response.success) {
        setEquipos(response.data || []);
      } else {
        throw new Error(response.message || 'Error al obtener equipos');
      }
    } catch (err) {
      console.error('Error fetching equipos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener estadísticas de equipos
  const fetchStats = async () => {
    if (!token || user?.rol !== 'superAdmin') return;

    try {
      const response = await apiService.getEquipoStats();
      if (response.success) {
        setEquiposStats(response.data || []);
      } else {
        throw new Error(response.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      console.error('Error fetching equipo stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  // Función para refrescar equipos
  const refreshEquipos = async () => {
    await fetchEquipos();
  };

  // Función para refrescar estadísticas
  const refreshStats = async () => {
    await fetchStats();
  };

  // Cargar equipos al montar el componente
  useEffect(() => {
    if (user?.rol === 'superAdmin') {
      fetchEquipos();
      fetchStats();
    }
  }, [user, token]);

  // Establecer equipo actual basado en el usuario
  useEffect(() => {
    if (user && equipos.length > 0) {
      const userEquipo = equipos.find(equipo => equipo.id === user.equipoId);
      if (userEquipo && !currentEquipo) {
        setCurrentEquipo(userEquipo);
      }
    }
  }, [user, equipos, currentEquipo]);

  const value: EquipoContextType = {
    equipos,
    equiposStats,
    currentEquipo,
    isLoading,
    error,
    setCurrentEquipo,
    refreshEquipos,
    refreshStats,
  };

  return (
    <EquipoContext.Provider value={value}>
      {children}
    </EquipoContext.Provider>
  );
};
