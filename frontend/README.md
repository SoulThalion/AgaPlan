# AgaPlan Frontend

Frontend de la aplicación AgaPlan construido con React, TypeScript y Tailwind CSS.

## Características

- **Autenticación**: Login y registro de usuarios
- **Dashboard**: Vista principal con calendario de turnos
- **Calendario**: Visualización de turnos usando react-big-calendar
- **Responsive**: Diseño adaptativo para diferentes dispositivos
- **TypeScript**: Tipado estático para mejor desarrollo
- **Tailwind CSS**: Framework de CSS utilitario

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- React Query (TanStack Query)
- React Big Calendar
- Axios

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp env.example .env
```

3. Asegurarse de que el backend esté ejecutándose en `http://localhost:3000`

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Login.tsx       # Formulario de login
│   ├── Register.tsx    # Formulario de registro
│   ├── Dashboard.tsx   # Dashboard principal
│   └── ProtectedRoute.tsx # Ruta protegida
├── contexts/           # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── services/           # Servicios de API
│   └── api.ts         # Cliente de API
├── types/              # Tipos TypeScript
│   └── index.ts       # Definiciones de tipos
├── App.tsx            # Componente principal
└── main.tsx           # Punto de entrada
```

## Funcionalidades

### Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Manejo de tokens JWT
- Rutas protegidas

### Dashboard
- Información del usuario
- Calendario de turnos
- Vista de turnos personales o todos (según rol)
- Leyenda de estados de turnos

### Roles de Usuario
- **Voluntario**: Ve solo sus turnos, puede configurar participación mensual
- **Admin**: Ve todos los turnos, acceso completo
- **SuperAdmin**: Acceso total al sistema

## API Endpoints

El frontend se comunica con el backend a través de los siguientes endpoints:

- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro de usuario
- `GET /api/usuarios` - Obtener usuarios
- `GET /api/turnos` - Obtener turnos
- `GET /api/turnos/usuario/:id` - Obtener turnos de un usuario
- `PATCH /api/usuarios/:id/participacion-mensual` - Configurar participación mensual

## Personalización

### Colores
Los colores se pueden personalizar en `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* ... */ },
      secondary: { /* ... */ }
    }
  }
}
```

### Estilos
Los estilos personalizados están en `src/index.css` usando las directivas de Tailwind.

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Vista previa del build
- `npm run lint` - Linting del código
