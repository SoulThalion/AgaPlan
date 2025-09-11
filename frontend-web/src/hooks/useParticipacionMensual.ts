import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface ParticipacionMensualActual {
  usuarioId: number;
  nombre: string;
  mes: number;
  año: number;
  turnosOcupados: number;
  limiteMensual: number | null;
  disponible: boolean;
  porcentaje: number | null;
}

export const useParticipacionMensualActual = (userId: number, mes?: number, año?: number) => {
  return useQuery({
    queryKey: ['participacionMensualActual', userId, mes, año],
    queryFn: () => apiService.getParticipacionMensualActual(userId, mes, año),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useParticipacionMensualActualMultiple = (userIds: number[], mes?: number, año?: number) => {
  return useQuery({
    queryKey: ['participacionMensualActualMultiple', userIds, mes, año],
    queryFn: async () => {
      const promises = userIds.map(id => apiService.getParticipacionMensualActual(id, mes, año));
      const results = await Promise.all(promises);
      return results;
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
