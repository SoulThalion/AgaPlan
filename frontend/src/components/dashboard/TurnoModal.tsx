import type { Turno, Usuario } from '../../types';

interface TurnoModalProps {
  showTurnoModal: boolean;
  selectedTurno: Turno | null;
  setShowTurnoModal: (show: boolean) => void;
  _user: Usuario | null;
  loadingUsuarios: boolean;
  usuariosDisponibles: Usuario[];
  ocuparTurnoMutation: any;
  liberarTurnoMutation: any;
  asignarUsuarioMutation: any;
  handleClickPuestoVacio: (turno: Turno) => Promise<void>;
  handleLiberarTurno: (turno: Turno, usuarioId?: number) => Promise<void>;
  handleAsignarUsuario: (turno: Turno, usuarioId: number) => Promise<void>;
  formatHora: (hora: string) => string;
}

export default function TurnoModal({
  showTurnoModal,
  selectedTurno,
  setShowTurnoModal,
  _user,
  loadingUsuarios,
  usuariosDisponibles,
  ocuparTurnoMutation,
  liberarTurnoMutation,
  asignarUsuarioMutation,
  handleClickPuestoVacio,
  handleLiberarTurno,
  handleAsignarUsuario,
  formatHora
}: TurnoModalProps) {
  if (!showTurnoModal || !selectedTurno) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowTurnoModal(false)}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Detalles del Turno #{selectedTurno.id}
              </h3>
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 <strong>Sistema de Estados:</strong> Libre (0 usuarios) → Parcialmente Ocupado (1+ usuarios) → Ocupado (capacidad máxima alcanzada)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Fecha:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTurno.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Horario:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatHora(selectedTurno.hora)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Lugar:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTurno.lugar?.nombre || 'Sin lugar'}
                  </p>
                </div>
                                     <div>
                       <p className="text-gray-600 dark:text-gray-400">Ocupación:</p>
                       <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                         {selectedTurno.lugar?.capacidad ? `${selectedTurno.usuarios?.length || 0}/${selectedTurno.lugar.capacidad}` : (selectedTurno.usuarios?.length || 0)}
                       </span>
                     </div>
              </div>
            </div>
            <button
              onClick={() => setShowTurnoModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Información del lugar */}
          {selectedTurno.lugar && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Información del Lugar
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Dirección:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTurno.lugar.direccion}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Capacidad:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTurno.lugar.capacidad || 'No especificada'}
                  </p>
                </div>
                {selectedTurno.lugar.descripcion && (
                  <div className="col-span-2">
                    <p className="text-gray-600 dark:text-gray-400">Descripción:</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedTurno.lugar.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usuarios asignados y puestos disponibles */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Ocupación del Turno ({selectedTurno.usuarios?.length || 0}/{selectedTurno.lugar?.capacidad || '∞'})
            </h4>
            
            {/* Grid de usuarios y puestos vacíos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Usuarios ya asignados */}
              {selectedTurno.usuarios && selectedTurno.usuarios.map((usuario) => (
                <div key={usuario.id} className="relative group">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-blue-900 dark:text-blue-100 text-sm truncate">{usuario.nombre}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 truncate">{usuario.cargo}</p>
                    
                    {/* Botón de remover (solo para admins o para removerte a ti mismo) */}
                    {(_user?.rol === 'admin' || _user?.rol === 'superAdmin' || usuario.id === _user?.id) && (
                      <button
                        onClick={() => handleLiberarTurno(selectedTurno, usuario.id)}
                        disabled={liberarTurnoMutation.isPending}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                        title={usuario.id === _user?.id ? "Removerte a ti mismo" : "Remover usuario"}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Puestos vacíos */}
              {selectedTurno.lugar?.capacidad && Array.from({ length: Math.max(0, selectedTurno.lugar.capacidad - (selectedTurno.usuarios?.length || 0)) }, (_, index) => (
                <div key={`vacante-${index}`} className="group">
                  <button
                    onClick={() => handleClickPuestoVacio(selectedTurno)}
                    disabled={ocuparTurnoMutation.isPending}
                    className="w-full p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-green-400 dark:hover:border-green-500 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg"
                    title="Haz clic para ocupar este puesto"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:from-green-200 group-hover:to-green-300 dark:group-hover:from-green-800 dark:group-hover:to-green-700 transition-all duration-300">
                      <svg className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300 transition-all duration-300">
                      Puesto Libre
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition-all duration-300 mt-1">
                      Haz clic para ocupar
                    </p>
                  </button>
                </div>
              ))}
              
              {/* Indicador cuando no hay puestos disponibles */}
              {selectedTurno.lugar?.capacidad && (selectedTurno.usuarios?.length || 0) >= selectedTurno.lugar.capacidad && (
                <div className="col-span-full">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Turno Completo
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      No hay puestos disponibles
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mensaje cuando no hay capacidad definida */}
            {!selectedTurno.lugar?.capacidad && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>Este lugar no tiene capacidad definida</p>
              </div>
            )}
            
            {/* Mensaje cuando no hay usuarios asignados */}
            {selectedTurno.lugar?.capacidad && (!selectedTurno.usuarios || selectedTurno.usuarios.length === 0) && (
              <div className="col-span-full">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Turno Vacío
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Haz clic en un puesto libre para ocuparlo
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Asignar usuarios (solo para admins) */}
          {(_user?.rol === 'admin' || _user?.rol === 'superAdmin') && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Asignar Usuario
              </h4>
              {loadingUsuarios ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {usuariosDisponibles
                    .filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id))
                    .map((usuario) => (
                      <div key={usuario.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {usuario.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{usuario.nombre}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{usuario.cargo}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleAsignarUsuario(selectedTurno, usuario.id);
                            setShowTurnoModal(false);
                          }}
                          disabled={asignarUsuarioMutation.isPending}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs rounded-md"
                        >
                          {asignarUsuarioMutation.isPending ? 'Asignando...' : 'Asignar'}
                        </button>
                      </div>
                    ))}
                  {usuariosDisponibles.filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id)).length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <p>No hay usuarios disponibles para asignar</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Puestos disponibles */}
          {selectedTurno.lugar?.capacidad && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Puestos Disponibles
              </h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Capacidad total del lugar: <span className="font-medium">{selectedTurno.lugar.capacidad}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Usuarios asignados: <span className="font-medium">{selectedTurno.usuarios?.length || 0}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Puestos libres: <span className="font-medium">{Math.max(0, selectedTurno.lugar.capacidad - (selectedTurno.usuarios?.length || 0))}</span>
                    </p>
                  </div>
                                         <div className="text-right">
                         <div className="inline-flex items-center px-3 py-2 rounded-lg text-lg font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                           {selectedTurno.lugar?.capacidad ? `${selectedTurno.usuarios?.length || 0}/${selectedTurno.lugar.capacidad}` : (selectedTurno.usuarios?.length || 0)}
                         </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, ((selectedTurno.usuarios?.length || 0) / selectedTurno.lugar.capacidad) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(((selectedTurno.usuarios?.length || 0) / selectedTurno.lugar.capacidad) * 100)}% ocupado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowTurnoModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
            
            {/* Botones de acción según la ocupación real del turno */}
            {selectedTurno.lugar?.capacidad && (selectedTurno.usuarios?.length || 0) >= selectedTurno.lugar.capacidad ? (
              <button
                onClick={() => {
                  handleLiberarTurno(selectedTurno);
                  setShowTurnoModal(false);
                }}
                disabled={liberarTurnoMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {liberarTurnoMutation.isPending ? 'Liberando...' : 'Liberar Turno'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
