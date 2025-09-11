import Swal from 'sweetalert2';

// Función para detectar si el sistema está en modo oscuro
const isDarkMode = () => {
  // Verificar si el usuario tiene preferencia de color-scheme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }
  
  // Verificar si el documento tiene la clase dark
  if (document.documentElement.classList.contains('dark')) {
    return true;
  }
  
  // Verificar si hay un tema guardado en localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    return true;
  }
  
  return false;
};

// Configuración global para SweetAlert2
export const configureSweetAlert = () => {
  // Configurar el tema por defecto
  const darkMode = isDarkMode();
  
  // Configuración base para modo oscuro
  const darkConfig = {
    background: '#1f2937',
    color: '#f9fafb',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    popup: {
      background: '#1f2937',
      color: '#f9fafb'
    }
  };
  
  // Configuración base para modo claro
  const lightConfig = {
    background: '#ffffff',
    color: '#111827',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    popup: {
      background: '#ffffff',
      color: '#111827'
    }
  };
  
  // Aplicar configuración según el tema
  const config = darkMode ? darkConfig : lightConfig;
  
  // Configurar SweetAlert2 globalmente
  Swal.mixin({
    background: config.background,
    color: config.color,
    confirmButtonColor: config.confirmButtonColor,
    cancelButtonColor: config.cancelButtonColor,
    customClass: {
      popup: darkMode ? 'swal-dark' : 'swal-light',
      confirmButton: darkMode ? 'swal-confirm-dark' : 'swal-confirm-light',
      cancelButton: darkMode ? 'swal-cancel-dark' : 'swal-cancel-light',
      input: darkMode ? 'swal-input-dark' : 'swal-input-light'
    },
    // Configuraciones adicionales para mejor integración
    showClass: {
      popup: 'scale-100 transition-all duration-300'
    },
    hideClass: {
      popup: 'scale-95 transition-all duration-300'
    },
    // Mejorar la apariencia de los botones
    buttonsStyling: true,
    // Configurar el tema del popup
    theme: darkMode ? 'dark' : 'light'
  });
};

// Función para actualizar el tema de SweetAlert2 en tiempo real
export const updateSweetAlertTheme = () => {
  configureSweetAlert();
};

// Función helper para crear alerts con el tema correcto
export const createAlert = (options: any) => {
  const darkMode = isDarkMode();
  
  const defaultOptions = {
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#111827',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: darkMode ? 'swal-dark' : 'swal-light',
      confirmButton: darkMode ? 'swal-confirm-dark' : 'swal-confirm-light',
      cancelButton: darkMode ? 'swal-cancel-dark' : 'swal-cancel-light',
      input: darkMode ? 'swal-input-dark' : 'swal-input-light'
    },
    // Configuraciones adicionales para mejor integración
    showClass: {
      popup: 'scale-100 transition-all duration-300'
    },
    hideClass: {
      popup: 'scale-95 transition-all duration-300'
    },
    buttonsStyling: true,
    theme: darkMode ? 'dark' : 'light'
  };
  
  return Swal.fire({
    ...defaultOptions,
    ...options
  });
};

// Función helper para confirmaciones
export const createConfirm = (options: any) => {
  return createAlert({
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    ...options
  });
};

// Función helper para inputs
export const createInput = (options: any) => {
  return createAlert({
    input: 'text',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    ...options
  });
};

// Función helper para selección
export const createSelect = (options: any) => {
  return createAlert({
    input: 'select',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    ...options
  });
};

// Función helper para loading
export const showLoading = (title = 'Cargando...') => {
  const darkMode = isDarkMode();
  
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    background: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#111827',
    customClass: {
      popup: darkMode ? 'swal-dark' : 'swal-light'
    },
    showClass: {
      popup: 'scale-100 transition-all duration-300'
    },
    hideClass: {
      popup: 'scale-95 transition-all duration-300'
    },
    theme: darkMode ? 'dark' : 'light'
  });
};

// Función helper para cerrar loading
export const closeLoading = () => {
  Swal.close();
};

// Función helper para mostrar errores
export const showError = (title: string, message?: string) => {
  return createAlert({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'Entendido'
  });
};

// Función helper para mostrar éxito
export const showSuccess = (title: string, message?: string) => {
  return createAlert({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'Perfecto'
  });
};

// Función helper para mostrar advertencias
export const showWarning = (title: string, message?: string) => {
  return createAlert({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'Entendido'
  });
};

// Función helper para mostrar información
export const showInfo = (title: string, message?: string) => {
  return createAlert({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'Entendido'
  });
};

// Función helper para confirmaciones de eliminación
export const confirmDelete = (title: string, message?: string) => {
  return createConfirm({
    icon: 'warning',
    title,
    text: message || 'Esta acción no se puede deshacer',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280'
  });
};

// Función helper para confirmaciones de acción
export const confirmAction = (title: string, message?: string, confirmText = 'Confirmar') => {
  return createConfirm({
    icon: 'question',
    title,
    text: message,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar'
  });
};

// Configurar SweetAlert2 al importar el módulo
configureSweetAlert();

// Escuchar cambios en el tema del sistema
if (typeof window !== 'undefined') {
  // Escuchar cambios en prefers-color-scheme
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSweetAlertTheme);
  
  // Escuchar cambios en el tema de la aplicación
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target as HTMLElement;
        if (target.classList.contains('dark') || !target.classList.contains('dark')) {
          updateSweetAlertTheme();
        }
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
}

export default Swal;
