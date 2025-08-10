# AgaPlan Frontend

Frontend de la aplicación AgaPlan, un sistema de gestión de turnos y disponibilidades desarrollado con React, TypeScript y Tailwind CSS.

## ✨ Características

### 🎯 Gestión de Cargos
- **Crear, editar y eliminar cargos** con sistema de prioridades
- **Sistema de prioridades** (1 = más alta, 999 = más baja) para asignación automática de turnos
- **Indicadores visuales** de prioridad con colores (rojo, amarillo, verde)
- **Control de estado** activo/inactivo para cada cargo

### 👥 Gestión de Usuarios
- Lista completa de usuarios del sistema
- Edición de información de usuario
- Cambio de roles (usuario, admin, superAdmin)
- Eliminación de usuarios
- Filtrado y búsqueda

### 📍 Gestión de Lugares
- Crear, editar y eliminar lugares
- Configuración de capacidad y dirección
- Control de estado activo/inactivo
- Gestión de ubicaciones para turnos

### 📅 Gestión de Disponibilidades
- Configuración de horarios disponibles por usuario
- Gestión de días de la semana y horarios
- Control de estado activo/inactivo
- Vista personalizada por usuario

### ⏰ Gestión de Turnos
- Crear, editar y eliminar turnos
- Asignación de usuarios y lugares
- Control de estado de turnos
- Vista de calendario integrada

### 🎨 Menú Lateral Responsivo
- **Menú lateral colapsable** que se adapta al espacio disponible
- **Modo móvil** con botón hamburguesa y overlay
- **Transiciones suaves** y animaciones
- **Iconos intuitivos** para cada sección
- **Información del usuario** en el footer del sidebar

## 🚀 Tecnologías

- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **React Query (TanStack Query)** para gestión de estado del servidor
- **React Hook Form** para formularios
- **React Hot Toast** para notificaciones
- **Vite** como bundler y servidor de desarrollo

## 📱 Responsividad

El sistema está completamente optimizado para dispositivos móviles:

- **Sidebar colapsable** en pantallas pequeñas
- **Botón hamburguesa** para navegación móvil
- **Overlay** para cerrar el menú en móvil
- **Diseño adaptativo** que se ajusta a cualquier tamaño de pantalla
- **Transiciones suaves** entre estados del sidebar

## 🛠️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd AgaPlan/frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp env.example .env
   # Editar .env con la configuración del backend
   ```

4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── Sidebar.tsx      # Menú lateral principal
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── CargoManagement.tsx  # Gestión de cargos
│   ├── UserManagement.tsx   # Gestión de usuarios
│   ├── PlaceManagement.tsx  # Gestión de lugares
│   ├── AvailabilityManagement.tsx  # Gestión de disponibilidades
│   ├── ShiftManagement.tsx  # Gestión de turnos
│   └── DashboardOverview.tsx  # Vista general del dashboard
├── contexts/            # Contextos de React
│   ├── AuthContext.tsx  # Contexto de autenticación
│   └── ThemeContext.tsx # Contexto de tema
├── services/            # Servicios de API
│   └── api.ts          # Cliente HTTP y métodos de API
├── types/               # Definiciones de tipos TypeScript
│   └── index.ts        # Interfaces y tipos principales
└── index.css           # Estilos globales y personalizados
```

## 🎨 Características del Sidebar

### Desktop
- **Ancho expandido:** 256px (w-64)
- **Ancho colapsado:** 64px (w-16)
- **Transiciones suaves** entre estados
- **Hover effects** en elementos del menú
- **Información del usuario** visible en el footer

### Móvil
- **Botón hamburguesa** fijo en la esquina superior izquierda
- **Sidebar completo** que se desliza desde la izquierda
- **Overlay** para cerrar el menú
- **Ancho completo** de la pantalla cuando está abierto
- **Cierre automático** al seleccionar una opción

## 🔐 Control de Acceso

- **Usuario:** Solo puede acceder a Disponibilidades y Resumen
- **Admin:** Acceso completo a todas las funcionalidades
- **SuperAdmin:** Acceso completo + gestión de usuarios admin

## 🌟 Funcionalidades Destacadas

### Sistema de Prioridades de Cargos
- **Prioridad 1-3:** Rojo (alta prioridad)
- **Prioridad 4-7:** Amarillo (prioridad media)
- **Prioridad 8-999:** Verde (baja prioridad)

### Gestión Inteligente de Turnos
- **Asignación automática** basada en prioridades de cargo
- **Validación de disponibilidades** antes de crear turnos
- **Control de conflictos** de horarios

### Interfaz Adaptativa
- **Modo claro/oscuro** automático
- **Sidebar inteligente** que se adapta al contenido
- **Navegación fluida** entre secciones

## 📊 Estado del Proyecto

- ✅ **Backend:** Completamente funcional
- ✅ **Frontend:** Completamente funcional
- ✅ **Base de datos:** Migraciones completadas
- ✅ **API:** Endpoints implementados
- ✅ **Autenticación:** Sistema completo
- ✅ **Responsividad:** Optimizado para móvil y desktop
- ✅ **Gestión de cargos:** Implementada con prioridades
- ✅ **Menú lateral:** Completamente funcional

## 🚀 Próximos Pasos

- [ ] Integración de cargos en el modelo de Turnos
- [ ] Algoritmo de asignación automática de turnos
- [ ] Reportes y estadísticas avanzadas
- [ ] Notificaciones en tiempo real
- [ ] Exportación de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
