# AgaPlan Mobile

Aplicación móvil de AgaPlan desarrollada con React Native y Expo.

## Estructura del Proyecto

```
mobile/
├── App.tsx              # Componente principal de la aplicación
├── index.ts             # Punto de entrada de la aplicación
├── app.json             # Configuración de Expo
├── metro.config.js      # Configuración de Metro para NativeWind
├── global.css           # Estilos globales con Tailwind CSS
├── tailwind.config.js   # Configuración de Tailwind CSS
├── package.json         # Dependencias del proyecto
└── assets/              # Recursos de la aplicación (iconos, splash screen)
```

## Tecnologías Utilizadas

- **React Native**: Framework para desarrollo móvil multiplataforma
- **Expo**: Plataforma para desarrollo y despliegue de aplicaciones React Native
- **NativeWind**: Tailwind CSS para React Native
- **TypeScript**: Tipado estático para JavaScript

## Instalación y Ejecución

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI instalado globalmente: `npm install -g @expo/cli`

### Pasos para ejecutar la aplicación

1. **Instalar dependencias**:
   ```bash
   cd mobile
   npm install
   ```

2. **Ejecutar la aplicación**:
   ```bash
   npm start
   ```

3. **Ejecutar en dispositivos específicos**:
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

### Usando Expo Go

1. Instala la app **Expo Go** en tu dispositivo móvil desde:
   - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)

2. Escanea el código QR que aparece en la terminal o navegador

## Desarrollo

La aplicación está configurada para usar:
- **NativeWind** para estilos con clases de Tailwind CSS
- **TypeScript** para tipado estático
- **Expo** para desarrollo y despliegue simplificado

### Estructura de Estilos

Los estilos se definen usando clases de Tailwind CSS directamente en los componentes:

```tsx
<View className="flex-1 bg-white items-center justify-center">
  <Text className="text-2xl font-bold text-blue-600">
    Hola mundo
  </Text>
</View>
```

## Próximos Pasos

- [ ] Integración con el backend de AgaPlan
- [ ] Implementación de autenticación
- [ ] Navegación entre pantallas
- [ ] Componentes reutilizables
- [ ] Gestión de estado
