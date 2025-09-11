import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import ThemeToggle from './ThemeToggle';
import type { RegisterRequest } from '../types';
import Swal from 'sweetalert2';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    confirmPassword: '',
    sexo: 'M' as 'M' | 'F' | 'O',
    cargo: '',
    rol: 'voluntario' as 'voluntario' | 'admin' | 'superAdmin' | 'grupo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Si está cargando la autenticación, mostrar nada
  if (authLoading) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.contraseña !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Las contraseñas no coinciden',
        confirmButtonText: 'Entendido'
      });
      setLoading(false);
      return;
    }

    try {
      // Si es rol "grupo", solo se requiere el nombre
      if (formData.rol === 'grupo') {
        if (!formData.nombre.trim()) {
          setError('El nombre es obligatorio para usuarios con rol "grupo"');
          Swal.fire({
            icon: 'warning',
            title: 'Campo requerido',
            text: 'El nombre es obligatorio para usuarios con rol "grupo".',
            confirmButtonText: 'Entendido'
          });
          setLoading(false);
          return;
        }
        
        // Para usuarios con rol "grupo", asignar valores por defecto
        const registerData: RegisterRequest = {
          nombre: formData.nombre.trim(),
          email: '', // Campo vacío para usuarios de grupo
          contraseña: '', // Campo vacío para usuarios de grupo
          sexo: 'M',
          cargo: 'Grupo'
        };
        
        const response = await apiService.register(registerData);
        
        if (response.success && response.token && response.user) {
          // Auto-login después del registro exitoso
          await login(response.token, response.user);
          
          // Mostrar mensaje de éxito
          await Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: `Usuario de grupo registrado exitosamente`,
            timer: 2000,
            showConfirmButton: false
          });
          
          navigate('/dashboard');
        } else {
          setError(response.message || 'Error en el registro');
          Swal.fire({
            icon: 'error',
            title: 'Error de registro',
            text: response.message || 'Error en el registro',
            confirmButtonText: 'Entendido'
          });
        }
        return;
      }
      
      // Para otros roles, validaciones normales
      // Preparar datos para el registro
      const registerData: RegisterRequest = {
        nombre: formData.nombre,
        email: formData.email,
        contraseña: formData.contraseña,
        sexo: formData.sexo,
        cargo: formData.cargo
      };

      const response = await apiService.register(registerData);
      
      if (response.success && response.token && response.user) {
        // Auto-login después del registro exitoso
        await login(response.token, response.user);
        
        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: `Usuario registrado como ${response.user.rol}`,
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate('/dashboard');
      } else {
        setError(response.message || 'Error en el registro');
        Swal.fire({
          icon: 'error',
          title: 'Error de registro',
          text: response.message || 'Error en el registro',
          confirmButtonText: 'Entendido'
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error de conexión. Intenta nuevamente.';
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: errorMessage,
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral dark:bg-neutral-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-success rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold font-poppins text-neutral-text dark:text-white">
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm font-roboto text-gray-600 dark:text-gray-300">
            Únete a AgaPlan y comienza a ayudar
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-2">
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="input-field"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label htmlFor="rol" className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-2">
                Rol
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="input-field"
              >
                <option value="voluntario">Voluntario</option>
                <option value="grupo">Grupo</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Super Administrador</option>
              </select>
            </div>

            {/* Campos adicionales - Solo visibles si NO es rol grupo */}
            {formData.rol !== 'grupo' && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-2">
                    Correo electrónico
                  </label>
                                     <input
                     id="email"
                     name="email"
                     type="email"
                     autoComplete="email"
                     required
                     value={formData.email}
                     onChange={handleChange}
                     className="input-field"
                     placeholder="tu@email.com"
                   />
                </div>
                
                <div>
                  <label htmlFor="contraseña" className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-2">
                    Contraseña
                  </label>
                  <input
                    id="contraseña"
                    name="contraseña"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.contraseña}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg font-roboto text-sm animate-slide-up">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-success w-full flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-roboto text-gray-600 dark:text-gray-300">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to="/login" 
                className="font-medium text-primary hover:text-primary-dark transition-colors duration-200 font-poppins"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

