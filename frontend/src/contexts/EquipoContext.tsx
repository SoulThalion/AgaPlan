import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Equipo, EquipoStats } from '../types';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
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
  currentEquipoId: number | null; // ID del equipo actual para invalidar queries
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
  const [currentEquipoId, setCurrentEquipoId] = useState<number | null>(null);
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

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

  // Función personalizada para cambiar equipo
  const handleSetCurrentEquipo = (equipo: Equipo | null) => {
    console.log('handleSetCurrentEquipo called with:', equipo);
    console.log('Previous currentEquipoId:', currentEquipoId);
    setCurrentEquipo(equipo);
    const newEquipoId = equipo?.id || null;
    setCurrentEquipoId(newEquipoId);
    console.log('New currentEquipoId:', newEquipoId);
    
    if (equipo) {
      localStorage.setItem('currentEquipo', JSON.stringify(equipo));
      console.log('Saved equipo to localStorage:', equipo);
    } else {
      localStorage.removeItem('currentEquipo');
      console.log('Removed equipo from localStorage');
    }
    
    // Forzar invalidación de queries específicas para que se refresquen los datos
    console.log('Invalidating specific queries...');
    queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    queryClient.invalidateQueries({ queryKey: ['turnos'] });
    queryClient.invalidateQueries({ queryKey: ['lugares'] });
    queryClient.invalidateQueries({ queryKey: ['cargos'] });
    queryClient.invalidateQueries({ queryKey: ['exhibidores'] });
  };

  // Establecer equipo actual basado en el usuario
  useEffect(() => {
    console.log('useEffect equipo - user:', user, 'equipos:', equipos.length, 'currentEquipo:', currentEquipo);
    
    if (user && equipos.length > 0 && !currentEquipo) {
      // Primero intentar cargar desde localStorage
      const savedEquipoStr = localStorage.getItem('currentEquipo');
      console.log('savedEquipoStr from localStorage:', savedEquipoStr);
      
      if (savedEquipoStr) {
        try {
          const savedEquipo = JSON.parse(savedEquipoStr);
          const equipoExists = equipos.find(e => e.id === savedEquipo.id);
          console.log('savedEquipo:', savedEquipo, 'equipoExists:', equipoExists);
          
          if (equipoExists) {
            setCurrentEquipo(equipoExists);
            console.log('Set currentEquipo from localStorage:', equipoExists);
            return;
          }
        } catch (error) {
          console.error('Error parsing saved equipo:', error);
        }
      }
      
      // Si no hay equipo guardado, usar el equipo del usuario
      const userEquipo = equipos.find(equipo => equipo.id === user.equipoId);
      console.log('userEquipo:', userEquipo, 'user.equipoId:', user.equipoId);
      
      if (userEquipo) {
        setCurrentEquipo(userEquipo);
        localStorage.setItem('currentEquipo', JSON.stringify(userEquipo));
        console.log('Set currentEquipo from user:', userEquipo);
      }
    }
  }, [user, equipos, currentEquipo]);

  const value: EquipoContextType = {
    equipos,
    equiposStats,
    currentEquipo,
    isLoading,
    error,
    setCurrentEquipo: handleSetCurrentEquipo,
    refreshEquipos,
    refreshStats,
    currentEquipoId,
  };

  return (
    <EquipoContext.Provider value={value}>
      {children}
    </EquipoContext.Provider>
  );
};
