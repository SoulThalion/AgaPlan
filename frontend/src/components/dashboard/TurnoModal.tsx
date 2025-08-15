import type { Turno, Usuario } from '../../types';
import { useState } from 'react';

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

  // Estado para controlar si la información del lugar está desplegada
  const [lugarDesplegado, setLugarDesplegado] = useState(false);
  
  // Estado para controlar si los requisitos están desplegados
  const [requisitosDesplegados, setRequisitosDesplegados] = useState(false);

  // Función para calcular el estado de los requisitos del turno
  const calcularRequisitosTurno = () => {
    const usuarios = selectedTurno.usuarios || [];
    const capacidad = selectedTurno.lugar?.capacidad || 0;
    
    return {
      completo: capacidad > 0 ? usuarios.length >= capacidad : usuarios.length > 0,
      tieneCoche: usuarios.some(u => u.tieneCoche),
      tieneMasculino: usuarios.some(u => u.sexo === 'M')
    };
  };

  const requisitos = calcularRequisitosTurno();

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
              <div className="grid grid-cols-3 gap-4 text-sm">
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
          {/* Layout principal con dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna izquierda: Información del turno y requisitos */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Información del lugar */}
              {selectedTurno.lugar && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Información del Lugar
                    </h4>
                    <button
                      onClick={() => setLugarDesplegado(!lugarDesplegado)}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {lugarDesplegado ? 'Ocultar' : 'Mostrar'}
                      <svg 
                        className={`w-4 h-4 ml-1 transition-transform duration-200 ${lugarDesplegado ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {lugarDesplegado && (
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
                  )}
                </div>
              )}

              {/* Requisitos del Turno */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Requisitos del Turno
                  </h4>
                  <button
                    onClick={() => setRequisitosDesplegados(!requisitosDesplegados)}
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  >
                    {requisitosDesplegados ? 'Ocultar' : 'Mostrar'}
                    <svg 
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${requisitosDesplegados ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* Resumen compacto cuando está plegado */}
                {!requisitosDesplegados && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      {[requisitos.completo, requisitos.tieneCoche, requisitos.tieneMasculino].filter(Boolean).length}/3 requisitos cumplidos
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                        ? '✅ Óptimo'
                        : '⚠️ Pendiente'
                      }
                    </span>
                  </div>
                )}
                
                {/* Detalles completos cuando está desplegado */}
                {requisitosDesplegados && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Requisito 1: Turno Completo */}
                      <div className={`p-2 rounded border transition-all duration-300 ${
                        requisitos.completo 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                          : 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-600'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">Ocupación</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            requisitos.completo 
                              ? 'bg-green-500 text-white' 
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {requisitos.completo ? '✓' : '!'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {requisitos.completo 
                            ? 'OK' 
                            : `${Math.max(0, (selectedTurno.lugar?.capacidad || 1) - (selectedTurno.usuarios?.length || 0))} faltan`
                          }
                        </p>
                      </div>

                      {/* Requisito 2: Al menos un coche */}
                      <div className={`p-2 rounded border transition-all duration-300 ${
                        requisitos.tieneCoche 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                          : 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-600'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">Coche</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            requisitos.tieneCoche 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {requisitos.tieneCoche ? '✓' : '✗'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {requisitos.tieneCoche ? 'OK' : 'Falta'}
                        </p>
                      </div>

                      {/* Requisito 3: Al menos un masculino */}
                      <div className={`p-2 rounded border transition-all duration-300 ${
                        requisitos.tieneMasculino 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                          : 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-600'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">Masculino</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            requisitos.tieneMasculino 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {requisitos.tieneMasculino ? '✓' : '✗'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {requisitos.tieneMasculino ? 'OK' : 'Falta'}
                        </p>
                      </div>
                    </div>

                    {/* Resumen del estado - más compacto */}
                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                            ? '✅ Óptimo'
                            : '⚠️ Pendiente'
                          }
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Usuarios asignados y puestos disponibles */}
              <div>
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
              </div>
            </div>

            {/* Columna derecha: Panel lateral con información adicional y acciones */}
            <div className="space-y-6">
              
              {/* Asignar usuarios (solo para admins) */}
              {(_user?.rol === 'admin' || _user?.rol === 'superAdmin') && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Asignar Usuario
                  </h4>
                  {loadingUsuarios ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando usuarios...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {usuariosDisponibles
                        .filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id))
                        .map((usuario) => (
                          <div key={usuario.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-600 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  {usuario.nombre.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{usuario.nombre}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{usuario.cargo}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleAsignarUsuario(selectedTurno, usuario.id);
                                setShowTurnoModal(false);
                              }}
                              disabled={asignarUsuarioMutation.isPending}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs rounded-md transition-colors"
                            >
                              {asignarUsuarioMutation.isPending ? '...' : 'Asignar'}
                            </button>
                          </div>
                        ))}
                      {usuariosDisponibles.filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id)).length === 0 && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p className="text-xs">No hay usuarios disponibles</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
