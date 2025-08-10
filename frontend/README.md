# AgaPlan Frontend

Frontend de la aplicación AgaPlan para la gestión de turnos y disponibilidad de voluntarios.

## Características

- **Gestión de Usuarios**: Lista, edición, cambio de rol y eliminación de usuarios
- **Gestión de Lugares**: Crear, editar y eliminar lugares de trabajo
- **Gestión de Disponibilidad**: Configurar horarios disponibles para cada usuario
- **Gestión de Turnos**: Crear, editar, eliminar y asignar turnos
- **Dashboard**: Vista general con estadísticas y calendario de turnos
- **Sistema de Autenticación**: Login y registro de usuarios
- **Control de Acceso**: Diferentes niveles de permisos (voluntario, admin, superadmin)
- **Tema Oscuro/Claro**: Soporte para modo oscuro y claro
- **Responsive Design**: Interfaz adaptada para móviles y escritorio

## Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **React Query** para gestión de estado del servidor
- **Axios** para peticiones HTTP
- **React Big Calendar** para el calendario
- **SweetAlert2** para notificaciones
- **Date-fns** para manejo de fechas

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd AgaPlan/frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` y configurar:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

5. **Construir para producción**:
   ```bash
   npm run build
   ```

## Estructura del Proyecto

```
src/
├── components/           # Componentes de la interfaz
│   ├── Dashboard.tsx           # Dashboard principal con navegación
│   ├── DashboardOverview.tsx   # Vista general del dashboard
│   ├── UserManagement.tsx      # Gestión de usuarios
│   ├── PlaceManagement.tsx     # Gestión de lugares
│   ├── AvailabilityManagement.tsx # Gestión de disponibilidades
│   ├── ShiftManagement.tsx     # Gestión de turnos
│   ├── Navigation.tsx          # Navegación principal
│   ├── Login.tsx               # Formulario de login
│   ├── Register.tsx            # Formulario de registro
│   ├── ProtectedRoute.tsx      # Ruta protegida
│   └── ThemeToggle.tsx         # Toggle de tema
├── contexts/            # Contextos de React
│   ├── AuthContext.tsx         # Contexto de autenticación
│   └── ThemeContext.tsx        # Contexto del tema
├── services/            # Servicios de API
│   └── api.ts                 # Cliente de API
├── types/               # Tipos de TypeScript
│   └── index.ts               # Definiciones de tipos
├── App.tsx              # Componente principal
└── main.tsx             # Punto de entrada
```

## Funcionalidades por Rol

### Voluntario
- Ver dashboard personal
- Gestionar disponibilidad personal
- Ver turnos asignados

### Admin
- Todas las funcionalidades de voluntario
- Gestión completa de usuarios
- Gestión completa de lugares
- Gestión completa de turnos
- Ver estadísticas generales

### Superadmin
- Todas las funcionalidades de admin
- Acceso completo al sistema

## API Endpoints

El frontend se comunica con el backend a través de los siguientes endpoints:

- **Autenticación**: `/api/auth/login`, `/api/auth/register`
- **Usuarios**: `/api/usuarios/*`
- **Lugares**: `/api/lugares/*`
- **Turnos**: `/api/turnos/*`
- **Disponibilidades**: `/api/disponibilidades/*`

## Estilos y Temas

El proyecto utiliza Tailwind CSS con un sistema de colores personalizado:

- **Primary**: Azul sereno (#4A90E2)
- **Success**: Verde esperanza (#6CC070)
- **Neutral**: Grises cálidos para el fondo

### Modo Oscuro
- Soporte completo para tema oscuro
- Colores adaptados para mejor legibilidad
- Toggle automático del tema

## Componentes Principales

### Dashboard
- Vista general con estadísticas
- Calendario de turnos
- Navegación entre módulos

### UserManagement
- Lista de usuarios con filtros
- Formulario de creación/edición
- Cambio de roles
- Eliminación de usuarios

### PlaceManagement
- Lista de lugares
- Formulario de creación/edición
- Activación/desactivación

### AvailabilityManagement
- Gestión de horarios disponibles
- Configuración por día de la semana
- Horarios de inicio y fin

### ShiftManagement
- Creación y edición de turnos
- Asignación de usuarios
- Gestión de estados
- Filtros y búsqueda

## Estado de la Aplicación

- **React Query**: Para gestión de estado del servidor
- **Context API**: Para autenticación y tema
- **Local Storage**: Para persistencia del token y tema

## Manejo de Errores

- Interceptores de Axios para errores de autenticación
- Notificaciones con SweetAlert2
- Estados de carga y error en componentes
- Redirección automática en caso de token expirado

## Responsive Design

- Diseño adaptativo para móviles
- Breakpoints de Tailwind CSS
- Navegación optimizada para diferentes dispositivos

## Scripts Disponibles

- `npm run dev`: Servidor de desarrollo
- `npm run build`: Construcción para producción
- `npm run preview`: Vista previa de la construcción
- `npm run lint`: Linting del código

## Dependencias Principales

- **React**: Framework principal
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de CSS
- **React Query**: Gestión de estado
- **React Router**: Enrutamiento
- **Axios**: Cliente HTTP
- **React Big Calendar**: Componente de calendario

## Contribución

1. Fork del repositorio
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.
