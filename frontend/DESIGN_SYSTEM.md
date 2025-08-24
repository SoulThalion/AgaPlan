# Sistema de Diseño - AgaPlan

## 🎨 Paleta de Colores

Inspirada en tonos tranquilos y profesionales, que transmiten paz y organización.

### 🌞 Modo Claro
| Color | Hex | Uso recomendado |
|-------|-----|-----------------|
| **Azul Sereno** | `#4A90E2` | Color principal (botones, enlaces) |
| **Azul Claro** | `#D4E6FB` | Fondos suaves |
| **Verde Esperanza** | `#6CC070` | Indicadores de turnos disponibles |
| **Gris Cálido** | `#F5F5F5` | Fondo general de la app |
| **Gris Texto** | `#4A4A4A` | Texto principal |

### 🌙 Modo Oscuro
| Color | Hex | Uso recomendado |
|-------|-----|-----------------|
| **Azul Sereno Oscuro** | `#3A80D2` | Color principal en modo oscuro |
| **Azul Claro Oscuro** | `#1E3A5F` | Fondos suaves en modo oscuro |
| **Verde Esperanza Oscuro** | `#5AB060` | Indicadores en modo oscuro |
| **Gris Oscuro** | `#1F2937` | Fondo general en modo oscuro |
| **Gris Texto Claro** | `#E5E7EB` | Texto principal en modo oscuro |

### Variaciones de Colores

#### Azul Sereno (#4A90E2)
- **Hover**: `#3A80D2` (10% más oscuro)
- **Light**: `#D4E6FB` (fondo suave)
- **Uso**: Botones principales, enlaces, elementos de acción
- **Modo Oscuro**: `#3A80D2` (más oscuro para mejor contraste)

#### Verde Esperanza (#6CC070)
- **Uso**: Estados activos, turnos disponibles, confirmaciones
- **Contexto**: Indicadores positivos y de disponibilidad
- **Modo Oscuro**: `#5AB060` (ajustado para modo oscuro)

#### Gris Cálido (#F5F5F5)
- **Uso**: Fondos de secciones, contenedores secundarios
- **Contexto**: Separación visual sin ser intrusivo
- **Modo Oscuro**: `#1F2937` (gris oscuro para fondos)

#### Gris Texto (#4A4A4A)
- **Uso**: Texto principal, títulos, contenido legible
- **Contexto**: Alta legibilidad en fondos claros
- **Modo Oscuro**: `#E5E7EB` (gris claro para texto en fondos oscuros)

## 🔤 Tipografía

### Fuente Primaria: Poppins
- **Uso**: Títulos, encabezados, elementos destacados
- **Características**: Moderna, clara y fácil de leer
- **Pesos recomendados**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Fuente Secundaria: Roboto
- **Uso**: Párrafos, textos largos, contenido secundario
- **Características**: Excelente legibilidad para lectura prolongada
- **Pesos recomendados**: 300 (light), 400 (regular), 500 (medium)

## 📱 Componentes y Estados

### Botones

#### Botón Principal
- **Color**: `#4A90E2`
- **Hover**: `#3A80D2`
- **Texto**: Blanco (`#FFFFFF`)
- **Sombra**: `shadow-lg` con `hover:shadow-xl`

#### Botón Secundario
- **Color**: `#D4E6FB`
- **Texto**: `#4A4A4A`
- **Borde**: `#4A90E2` (opcional)

#### Botón de Estado Activo
- **Color**: `#6CC070`
- **Texto**: Blanco (`#FFFFFF`)

### Campos de Formulario

#### Input Normal
- **Borde**: `#4A90E2`
- **Focus**: Ring `#4A90E2`
- **Texto**: `#4A4A4A`

#### Select
- **Borde**: `#4A90E2`
- **Focus**: Ring `#4A90E2`
- **Texto**: `#4A4A4A`

## 🎯 Principios de Diseño

1. **Consistencia**: Usar siempre la misma paleta de colores en toda la aplicación
2. **Jerarquía Visual**: El Azul Sereno para elementos principales, Verde Esperanza para estados positivos
3. **Legibilidad**: Alto contraste entre texto y fondo
4. **Tranquilidad**: Colores suaves que no fatigan la vista
5. **Profesionalismo**: Apariencia limpia y organizada

## 🌙 Modo Oscuro

### Principios del Modo Oscuro
1. **Contraste Invertido**: Los colores se adaptan para mantener la legibilidad en fondos oscuros
2. **Reducción de Brillo**: Los colores son más suaves para no fatigar la vista en entornos con poca luz
3. **Consistencia Visual**: Mantiene la misma identidad de marca pero adaptada al contexto oscuro
4. **Accesibilidad**: Cumple con estándares WCAG para contraste en modo oscuro

### Adaptaciones de Colores
- **Azul Sereno**: Se oscurece de `#4A90E2` a `#3A80D2` para mejor contraste
- **Verde Esperanza**: Se ajusta de `#6CC070` a `#5AB060` para modo oscuro
- **Fondos**: Cambian de grises claros a grises oscuros
- **Texto**: Se invierte de gris oscuro a gris claro

### Implementación
- **Automático**: Respeta la preferencia del sistema (`prefers-color-scheme: dark`)
- **Manual**: Clase `.dark` para control manual del tema
- **Transiciones**: Cambios suaves entre modos con `transition-colors`

### Accesibilidad y Contraste
- **WCAG AA**: Todos los colores cumplen con el estándar AA (contraste 4.5:1)
- **Modo Claro**: Texto oscuro sobre fondos claros para máxima legibilidad
- **Modo Oscuro**: Texto claro sobre fondos oscuros para reducir la fatiga visual
- **Estados Interactivos**: Hover y focus mantienen contraste adecuado
- **Indicadores**: Los colores de estado son distinguibles para usuarios con daltonismo

## 📋 Implementación en Tailwind CSS

### Colores Personalizados
```css
/* Agregar al archivo CSS principal */
:root {
  /* Modo Claro */
  --color-azul-sereno: #4A90E2;
  --color-azul-claro: #D4E6FB;
  --color-verde-esperanza: #6CC070;
  --color-gris-calido: #F5F5F5;
  --color-gris-texto: #4A4A4A;
}

/* Modo Oscuro */
@media (prefers-color-scheme: dark) {
  :root {
    --color-azul-sereno: #3A80D2;
    --color-azul-claro: #1E3A5F;
    --color-verde-esperanza: #5AB060;
    --color-gris-calido: #1F2937;
    --color-gris-texto: #E5E7EB;
  }
}

/* Clases para modo oscuro manual */
.dark {
  --color-azul-sereno: #3A80D2;
  --color-azul-claro: #1E3A5F;
  --color-verde-esperanza: #5AB060;
  --color-gris-calido: #1F2937;
  --color-gris-texto: #E5E7EB;
}
```

### Clases de Utilidad
```css
/* Modo Claro */
.bg-azul-sereno { background-color: #4A90E2; }
.bg-azul-claro { background-color: #D4E6FB; }
.bg-verde-esperanza { background-color: #6CC070; }
.bg-gris-calido { background-color: #F5F5F5; }
.text-gris-texto { color: #4A4A4A; }

/* Modo Oscuro */
.dark .bg-azul-sereno { background-color: #3A80D2; }
.dark .bg-azul-claro { background-color: #1E3A5F; }
.dark .bg-verde-esperanza { background-color: #5AB060; }
.dark .bg-gris-calido { background-color: #1F2937; }
.dark .text-gris-texto { color: #E5E7EB; }
```

## 🔄 Mantenimiento

- **Revisar**: Mensualmente que todos los componentes usen la paleta correcta
- **Actualizar**: La documentación cuando se agreguen nuevos colores
- **Validar**: Que los contrastes cumplan con estándares de accesibilidad
- **Consistencia**: Verificar que no se usen colores fuera de la paleta

## 🚨 Troubleshooting

### El Modo Oscuro No Funciona
1. **Verificar configuración de Tailwind**: Asegurar que `darkMode: 'class'` esté configurado
2. **Clase CSS**: Verificar que la clase `.dark` se aplique al `<html>` o `<body>`
3. **Contexto de Tema**: Confirmar que `ThemeProvider` envuelva la aplicación
4. **Clases de Tailwind**: Usar `dark:bg-dark-azul-sereno` en lugar de `dark:bg-[#3A80D2]`

### Colores No Se Aplican
1. **Purge de Tailwind**: Verificar que las clases personalizadas no se eliminen en build
2. **Variables CSS**: Confirmar que las variables CSS estén definidas en `index.css`
3. **Especificidad**: Usar `!important` si es necesario para sobrescribir estilos
4. **Cache del navegador**: Limpiar cache y hard refresh

## 📝 Ejemplos de Uso

### Botón con Modo Oscuro
```jsx
<button className="bg-azul-sereno dark:bg-dark-azul-sereno text-white hover:bg-azul-sereno-hover dark:hover:bg-azul-sereno-hover transition-colors">
  Acción Principal
</button>
```

### Cómo Probar el Modo Oscuro

1. **Componente de Demostración**: Usar `ColorDemo.tsx` para ver todos los colores en ambos modos
2. **Toggle Manual**: Usar el botón de cambio de tema en la interfaz
3. **Preferencia del Sistema**: El tema cambia automáticamente según la configuración del sistema operativo
4. **LocalStorage**: La preferencia se guarda y persiste entre sesiones

### Contenedor con Fondo Adaptativo
```jsx
<div className="bg-gris-calido dark:bg-dark-gris-fondo text-gris-texto dark:text-dark-gris-texto">
  Contenido del componente
</div>
```

### Input con Estados
```jsx
<input 
  className="border-azul-sereno dark:border-dark-azul-sereno focus:ring-azul-sereno dark:focus:ring-dark-azul-sereno text-gris-texto dark:text-dark-gris-texto"
  placeholder="Escribe aquí..."
/>
```

### Indicador de Estado
```jsx
<span className="bg-verde-esperanza dark:bg-dark-verde-esperanza text-white px-2 py-1 rounded">
  Disponible
</span>
```

---

**Última actualización**: [Fecha actual]
**Versión**: 1.0
**Responsable**: Equipo de Diseño Frontend
