
import type { Turno, Lugar, Usuario } from '../../types';

interface DashboardStatsProps {
  turnos: Turno[];
  lugares: Lugar[];
  viewAllTurnos: boolean;
  getTurnosDelMes: () => Turno[];
  getTurnosToShow: () => Turno[];
  turnoTieneUsuario: (turno: Turno, userId?: number | undefined) => boolean;
  currentUser?: Usuario | null;
}

export default function DashboardStats({
  turnos,
  lugares,
  viewAllTurnos,
  getTurnosDelMes,
  getTurnosToShow,
  turnoTieneUsuario,
  currentUser
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Turnos</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{turnos.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lugares Activos</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {lugares.filter(l => l.activo !== false).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {viewAllTurnos ? 'Mis Turnos del Mes' : 'Mis Turnos Esta Semana'}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {viewAllTurnos 
                ? getTurnosDelMes().filter(turno => turnoTieneUsuario(turno, currentUser?.id)).length
                : getTurnosToShow().filter(turno => turnoTieneUsuario(turno, currentUser?.id)).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
