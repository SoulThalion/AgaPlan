# 🗂️ AgaPlan - Monorepo

Estructura organizada del proyecto AgaPlan con separación clara entre backend, frontend web, mobile y lógica compartida.

## 📁 Estructura del Proyecto

```
/agaplan-monorepo
├── /backend          # API REST con Node.js + Express + TypeScript
├── /frontend-web     # Aplicación web con Vite + React + Tailwind
├── /mobile           # Aplicación móvil con Expo + React Native + NativeWind
├── /shared           # Lógica común (types, utils, validations)
└── package.json      # Configuración del monorepo
```

## 🚀 Comandos Disponibles

### Instalación
```bash
# Instalar todas las dependencias
npm run install:all

# O instalar por separado
npm install                    # Dependencias raíz
cd backend && npm install      # Backend
cd frontend-web && npm install # Frontend web
cd mobile && npm install       # Mobile
cd shared && npm install       # Shared
```

### Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev:backend    # Backend (puerto 3001)
npm run dev:web        # Frontend web (puerto 5173)
npm run dev:mobile     # Mobile (Expo)
```

### Build
```bash
# Construir todas las aplicaciones
npm run build:backend
npm run build:web
npm run build:mobile
```

## 🛠️ Tecnologías

### Backend (`/backend`)
- **Node.js** + **Express**
- **TypeScript**
- **Sequelize** (ORM)
- **MySQL** (Base de datos)
- **JWT** (Autenticación)
- **Nodemailer** (Emails)

### Frontend Web (`/frontend-web`)
- **Vite** + **React** + **TypeScript**
- **Tailwind CSS**
- **React Router**
- **Axios** (HTTP client)
- **React Hook Form**
- **Google Maps API**

### Mobile (`/mobile`)
- **Expo** + **React Native**
- **TypeScript**
- **NativeWind** (Tailwind para RN)
- **React Navigation**

### Shared (`/shared`)
- **TypeScript**
- **Zod** (Validaciones)
- **Tipos compartidos**
- **Utilidades comunes**

## 🔄 Flujo de Desarrollo

### 1. Desarrollo de Componentes
1. **Desarrolla en web** (`/frontend-web`) con Tailwind
2. **Convierte a mobile** usando Cursor:
   - Abre el componente web
   - Pide: "Convierte este componente de React + Tailwind para React Native con NativeWind"
   - Cursor genera la versión RN (`<View>`, `<Text>`, etc.)

### 2. Lógica Compartida
- **Tipos**: Define interfaces en `/shared/src/types`
- **Validaciones**: Usa Zod en `/shared/src/validations`
- **Utilidades**: Funciones comunes en `/shared/src/utils`
- **Importa** en web y mobile: `import { User, validateUser } from '@agaplan/shared'`

### 3. API Backend
- **Endpoints** en `/backend` consumidos por web y mobile
- **Autenticación** JWT compartida
- **Base de datos** MySQL centralizada

## 📱 Configuración Mobile

### NativeWind Setup
```bash
cd mobile
npm install nativewind tailwindcss react-native-reanimated
npx tailwindcss init
```

### Babel Config
```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ["nativewind/babel"],
  };
};
```

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

## 🎯 Ventajas de esta Estructura

✅ **Todo en un repo** → Más fácil de mantener
✅ **Reutilización de código** → Sin duplicar lógica
✅ **Cursor te ayuda** → Traducción automática de UI
✅ **Cambios compartidos** → Web y mobile se benefician automáticamente
✅ **Desarrollo incremental** → Pantalla por pantalla

## 🚦 Próximos Pasos

1. **Probar una pantalla** (ej. login) para ver qué se puede automatizar
2. **Configurar shared** con tipos y validaciones del backend
3. **Portar componentes** uno por uno usando Cursor
4. **Configurar navegación** en mobile
5. **Integrar APIs** del backend

## 📝 Notas

- **Frontend original** está en `/frontend-web`
- **Backend** mantiene toda la lógica de negocio
- **Mobile** usa NativeWind para mantener consistencia visual
- **Shared** evita duplicación de código entre web y mobile
