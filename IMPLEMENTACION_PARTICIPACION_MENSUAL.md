# Implementación de Participación Mensual para Voluntarios

## 📋 Resumen de la Funcionalidad

Se ha implementado la funcionalidad solicitada: **"al voluntario también se le debe poder poner opcionalmente cuantas veces al mes quiere participar aparte de su disponibilidad semanal"**.

## 🏗️ Cambios Implementados

### 1. Modelo de Usuario (`src/models/Usuario.ts`)

- **Nuevo campo**: `participacionMensual?: number`
- **Tipo**: Entero opcional (0 o mayor)
- **Validación**: Debe ser un número entero mayor o igual a 0
- **Uso**: Solo aplica a usuarios con rol "voluntario"

```typescript
export interface UsuarioAttributes {
  // ... campos existentes ...
  participacionMensual?: number; // Número de veces al mes que quiere participar (opcional)
}

// En la inicialización del modelo:
participacionMensual: {
  type: DataTypes.INTEGER,
  allowNull: true,
  validate: {
    min: 0,
    isInt: true,
  },
}
```

### 2. Controlador de Usuario (`src/controllers/usuarioController.ts`)

- **Nuevo endpoint**: `configurarParticipacionMensual`
- **Funcionalidad**: Permite configurar/actualizar la participación mensual
- **Permisos**: 
  - Voluntarios pueden configurar su propia participación mensual
  - Admins y superAdmins pueden configurar cualquier voluntario
- **Validaciones**: Solo números enteros mayores o iguales a 0

### 3. Rutas de Usuario (`src/routes/usuarioRoutes.ts`)

- **Nueva ruta**: `PATCH /api/usuarios/:id/participacion-mensual`
- **Método**: PATCH (actualización parcial)
- **Autenticación**: Requerida
- **Body**: `{ "participacionMensual": number }`

### 4. Migración de Base de Datos (`src/migrations/005-add-participacion-mensual.ts`)

- **Archivo**: Nueva migración para agregar el campo a la tabla `usuarios`
- **Campo**: `participacionMensual` como INTEGER NULL
- **Rollback**: Permite revertir el cambio si es necesario

### 5. Scripts de Prueba

- **`src/scripts/testAPI.ts`**: Incluye pruebas para la nueva funcionalidad
- **`src/scripts/ejemploParticipacionMensual.ts`**: Script de ejemplo completo
- **Comando**: `npm run test:participacion` para ejecutar el ejemplo

## 🔧 Cómo Usar la Funcionalidad

### Para Voluntarios

```typescript
// Configurar participación mensual
const response = await axios.patch(
  '/api/usuarios/123/participacion-mensual',
  { participacionMensual: 6 }, // Quiere participar 6 veces al mes
  { headers: { Authorization: 'Bearer <token>' } }
);
```

### Para Admins

```typescript
// Ver todos los usuarios con su participación mensual
const usuarios = await axios.get('/api/usuarios', {
  headers: { Authorization: 'Bearer <admin_token>' }
});

// Los voluntarios mostrarán su participacionMensual
usuarios.data.data.forEach(usuario => {
  if (usuario.rol === 'voluntario') {
    console.log(`${usuario.nombre}: ${usuario.participacionMensual} veces al mes`);
  }
});
```

## 📊 Casos de Uso

### 1. Configuración Inicial
- Un voluntario se registra y puede configurar cuántas veces al mes quiere participar
- La configuración es opcional (puede ser `null` o `undefined`)

### 2. Actualización de Preferencias
- Los voluntarios pueden cambiar su participación mensual en cualquier momento
- Los admins pueden ajustar la participación de los voluntarios según las necesidades

### 3. Planificación de Turnos
- Los admins pueden ver la participación mensual de todos los voluntarios
- Esta información ayuda a planificar turnos considerando las preferencias de participación

### 4. Reportes y Estadísticas
- Se puede generar reportes de participación mensual por voluntario
- Análisis de patrones de participación

## 🚀 Comandos Disponibles

```bash
# Compilar el proyecto
npm run build

# Ejecutar migraciones (cuando se implemente el runner)
npm run migrate

# Probar la funcionalidad
npm run test:participacion

# Ejecutar todas las pruebas
npm run test
```

## 🔒 Consideraciones de Seguridad

- **Autenticación**: Todas las operaciones requieren token JWT válido
- **Autorización**: 
  - Voluntarios solo pueden modificar su propio perfil
  - Admins pueden modificar cualquier voluntario
  - Solo usuarios con rol "voluntario" pueden tener participación mensual
- **Validación**: Los valores deben ser números enteros no negativos

## 📈 Próximos Pasos Sugeridos

1. **Implementar lógica de generación de turnos** que considere la participación mensual
2. **Agregar reportes** de participación mensual por voluntario
3. **Implementar notificaciones** cuando un voluntario se acerca a su límite mensual
4. **Crear dashboard** para admins que muestre estadísticas de participación
5. **Agregar historial** de cambios en la participación mensual

## ✅ Estado de la Implementación

- [x] Modelo de datos actualizado
- [x] Controlador implementado
- [x] Rutas configuradas
- [x] Migración creada
- [x] Scripts de prueba implementados
- [x] Documentación actualizada
- [x] Compilación exitosa

**La funcionalidad está completamente implementada y lista para usar.**
