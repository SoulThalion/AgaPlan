import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import ThemeToggle from './ThemeToggle';
import Swal from 'sweetalert2';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    contraseña: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Si está cargando la autenticación, mostrar nada
  if (authLoading) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData);
      if (response.success && response.token && response.user) {
        await login(response.token, response.user);
        
        // Mostrar mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate('/dashboard');
      } else {
        setError(response.message || 'Error al iniciar sesión');
        // Mostrar error con SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: response.message || 'Error al iniciar sesión',
          confirmButtonText: 'Entendido'
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error de conexión. Intenta nuevamente.';
      setError(errorMessage);
      
      // Mostrar error con SweetAlert
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
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold font-poppins text-neutral-text dark:text-white">
            Bienvenido de vuelta
          </h2>
          <p className="mt-2 text-sm font-roboto text-gray-600 dark:text-gray-300">
            Inicia sesión en tu cuenta
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
              <label htmlFor="password" className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="contraseña"
                type="password"
                autoComplete="current-password"
                required
                value={formData.contraseña}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
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
              className="btn-primary w-full flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-roboto text-gray-600 dark:text-gray-300">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className="font-medium text-primary hover:text-primary-dark transition-colors duration-200 font-poppins"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
