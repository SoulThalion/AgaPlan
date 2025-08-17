import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export interface ParticipacionMensualActual {
  usuarioId: number;
  nombre: string;
  turnosOcupados: number;
  limiteMensual: number | null;
  disponible: boolean;
  porcentaje: number | null;
}

export const useParticipacionMensualActual = (userId: number) => {
  return useQuery({
    queryKey: ['participacionMensualActual', userId],
    queryFn: () => apiService.getParticipacionMensualActual(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useParticipacionMensualActualMultiple = (userIds: number[]) => {
  return useQuery({
    queryKey: ['participacionMensualActualMultiple', userIds],
    queryFn: async () => {
      const promises = userIds.map(id => apiService.getParticipacionMensualActual(id));
      const results = await Promise.all(promises);
      return results;
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};
