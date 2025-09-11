# 🗂️ Estructura del Monorepo AgaPlan

## 📁 Organización de Carpetas

```
/agaplan-monorepo
├── 📁 backend/                    # 🖥️ API REST (Node.js + Express + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 controllers/        # Controladores de la API
│   │   ├── 📁 models/             # Modelos de Sequelize
│   │   ├── 📁 routes/             # Rutas de Express
│   │   ├── 📁 middleware/         # Middleware personalizado
│   │   ├── 📁 services/           # Servicios de negocio
│   │   └── 📁 types/              # Tipos TypeScript
│   ├── 📁 migrations/             # Migraciones de base de datos
│   ├── 📁 dist/                   # Código compilado
│   ├── 📄 package.json            # Dependencias del backend
│   └── 📄 tsconfig.json           # Configuración TypeScript
│
├── 📁 frontend-web/               # 🌐 Aplicación Web (Vite + React + Tailwind)
│   ├── 📁 src/
│   │   ├── 📁 components/         # Componentes React
│   │   ├── 📁 contexts/           # Contextos de React
│   │   ├── 📁 hooks/              # Hooks personalizados
│   │   ├── 📁 services/           # Servicios de API
│   │   ├── 📁 types/              # Tipos TypeScript
│   │   └── 📁 utils/              # Utilidades
│   ├── 📁 public/                 # Archivos estáticos
│   ├── 📁 dist/                   # Build de producción
│   ├── 📄 package.json            # Dependencias del frontend
│   └── 📄 vite.config.ts          # Configuración Vite
│
├── 📁 mobile/                     # 📱 Aplicación Móvil (Expo + React Native + NativeWind)
│   ├── 📁 src/                    # Código fuente (a crear)
│   ├── 📁 assets/                 # Imágenes y recursos
│   ├── 📄 App.tsx                 # Componente principal
│   ├── 📄 package.json            # Dependencias del mobile
│   ├── 📄 babel.config.js         # Configuración Babel + NativeWind
│   └── 📄 tailwind.config.js      # Configuración Tailwind
│
├── 📁 shared/                     # 🔄 Lógica Compartida
│   ├── 📁 src/
│   │   ├── 📁 types/              # Tipos compartidos
│   │   ├── 📁 validations/        # Validaciones con Zod
│   │   └── 📁 utils/              # Utilidades comunes
│   ├── 📁 dist/                   # Código compilado
│   ├── 📄 package.json            # Dependencias compartidas
│   └── 📄 tsconfig.json           # Configuración TypeScript
│
├── 📄 package.json                # 🎯 Configuración del Monorepo
├── 📄 README_MONOREPO.md          # Documentación del monorepo
└── 📄 ESTRUCTURA_MONOREPO.md      # Este archivo
```

## 🔄 Flujo de Datos

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📱 Mobile     │    │   🌐 Web        │    │   🖥️ Backend    │
│   (React Native)│    │   (React)       │    │   (Node.js)     │
│                 │    │                 │    │                 │
│  ┌─────────────┐│    │  ┌─────────────┐│    │  ┌─────────────┐│
│  │   UI Layer  ││    │  │   UI Layer  ││    │  │   API Layer ││
│  │ (NativeWind)││    │  │ (Tailwind)  ││    │  │ (Express)   ││
│  └─────────────┘│    │  └─────────────┘│    │  └─────────────┘│
│         │       │    │         │       │    │         │       │
│  ┌─────────────┐│    │  ┌─────────────┐│    │  ┌─────────────┐│
│  │  Business   ││    │  │  Business   ││    │  │  Business   ││
│  │   Logic     ││    │  │   Logic     ││    │  │   Logic     ││
│  └─────────────┘│    │  └─────────────┘│    │  └─────────────┘│
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   🔄 Shared     │
                    │   (TypeScript)  │
                    │                 │
                    │  ┌─────────────┐│
                    │  │   Types     ││
                    │  │ Validations ││
                    │  │   Utils     ││
                    │  └─────────────┘│
                    └─────────────────┘
```

## 🚀 Comandos de Desarrollo

### Instalación
```bash
# Instalar todo
npm run install:all

# O por separado
npm install                    # Raíz
cd backend && npm install      # Backend
cd frontend-web && npm install # Web
cd mobile && npm install       # Mobile
cd shared && npm install       # Shared
```

### Desarrollo
```bash
# Terminal 1: Backend
npm run dev:backend    # http://localhost:3001

# Terminal 2: Frontend Web
npm run dev:web        # http://localhost:5173

# Terminal 3: Mobile
npm run dev:mobile     # Expo DevTools
```

## 🎯 Ventajas de esta Estructura

### ✅ **Mantenimiento Simplificado**
- Todo en un solo repositorio
- Cambios coordinados entre web y mobile
- Dependencias centralizadas

### ✅ **Reutilización de Código**
- Lógica compartida en `/shared`
- Tipos TypeScript consistentes
- Validaciones unificadas

### ✅ **Desarrollo Eficiente**
- Cursor ayuda con la conversión de componentes
- Tailwind → NativeWind automático
- Hot reload en todas las plataformas

### ✅ **Escalabilidad**
- Fácil agregar nuevas plataformas
- Separación clara de responsabilidades
- CI/CD simplificado

## 🔧 Configuración por Plataforma

### Backend (`/backend`)
- **Puerto**: 3001
- **Base de datos**: MySQL
- **ORM**: Sequelize
- **Autenticación**: JWT

### Frontend Web (`/frontend-web`)
- **Puerto**: 5173
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router

### Mobile (`/mobile`)
- **Framework**: Expo
- **Styling**: NativeWind
- **Navigation**: React Navigation
- **Platform**: iOS + Android

### Shared (`/shared`)
- **Lenguaje**: TypeScript
- **Validaciones**: Zod
- **Build**: TSC
- **Uso**: Importado por web y mobile

## 📝 Próximos Pasos

1. **Configurar shared** con tipos del backend
2. **Probar conversión** de un componente con Cursor
3. **Configurar navegación** en mobile
4. **Integrar APIs** del backend
5. **Implementar autenticación** compartida
