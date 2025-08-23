# Nuevo Rol "Grupo" - Documentación Completa

## 📋 Descripción del Rol

El rol "**grupo**" es un nuevo nivel de permisos intermedio entre "voluntario" y "admin" que permite a los usuarios gestionar turnos y lugares con capacidades limitadas.

## 🏗️ Jerarquía de Roles

```
voluntario (1) < grupo (2) < admin (3) < superAdmin (4)
```

## 🔐 Permisos del Rol "Grupo"

- **Acceso de voluntario**: Ver turnos, lugares y gestionar perfil propio
- **Gestión de turnos**: Crear, editar y eliminar turnos
- **Gestión de lugares**: Ver todos los lugares (solo lectura)
- **Nivel intermedio**: Permisos superiores a voluntario pero inferiores a admin

## 🚀 Funcionalidad Especial para Rol "Grupo"

### Asignación Automática de Turnos

**Cuando un usuario con rol "grupo" se asigna a un turno:**

1. **Ocupación automática de plazas**: El turno se marca automáticamente como "completo"
2. **Representación visual especial**: Se muestra un único rectángulo que representa al grupo ocupando todas las plazas
3. **Sin usuarios ficticios**: No se crean usuarios temporales, solo se marca el turno como completo

### Lógica de Implementación

```typescript
// LÓGICA ESPECIAL PARA ROL "GRUPO"
if (usuario.rol === 'grupo') {
  // Obtener el lugar del turno para verificar capacidad
  const lugar = await Lugar.findByPk(turno.lugarId);
  
  if (lugar && lugar.capacidad) {
    // Si es rol "grupo", marcar el turno como completo
    // No se crean usuarios ficticios, solo se marca como ocupado por el grupo
    turno.estado = 'completo';
    await turno.save();
    
    console.log(`✅ Turno ${turno.id} marcado como completo por usuario grupo`);
  }
}
```

### Visualización en Frontend

**Cuando se asigna un usuario con rol "grupo" a un turno:**

1. **🎯 Banner informativo**: Explica que el turno fue completado por un grupo
2. **✅ Requisitos automáticamente cumplidos**: Todos los requisitos se muestran como cumplidos
3. **📦 Rectángulo único del grupo**: Reemplaza completamente la vista de plazas individuales
4. **👤 Usuario grupo destacado**: Información completa del usuario grupo dentro del rectángulo
5. **🚫 Sin puestos vacíos**: No se muestran plazas individuales cuando hay grupo asignado

#### **Cambio de Vista Condicional**

**Antes (sin grupo)**: Múltiples plazas individuales con usuarios y puestos vacíos
**Después (con grupo)**: Un único rectángulo púrpura que representa la ocupación completa

#### **Lógica de Requisitos**

```typescript
// Si hay un usuario con rol "grupo", todos los requisitos están cumplidos
const tieneUsuarioGrupo = usuarios.some(u => u.rol === 'grupo');

if (tieneUsuarioGrupo) {
  return {
    completo: true,        // ✅ Turno completo
    tieneCoche: true,      // ✅ Requisito de coche cumplido
    tieneMasculino: true   // ✅ Requisito de masculino cumplido
  };
}
```

#### **Estructura del Rectángulo del Grupo**

- **Header principal**: Icono grande + título "🎯 Grupo Asignado"
- **Información consolidada**: Capacidad, estado y requisitos en tarjetas
- **Usuario destacado**: Información completa del usuario grupo con badges
- **Botón de acción**: Remover grupo del turno (solo para admins)
- **Diseño responsivo**: Ocupa todo el ancho disponible (`col-span-full`)

### Casos de Uso

- **Eventos masivos**: Cuando se necesita llenar rápidamente un turno
- **Emergencias**: Asignación rápida sin necesidad de buscar voluntarios individuales
- **Coordinación de grupos**: Representantes de organizaciones que se responsabilizan de completar turnos
- **Representación visual clara**: Un solo elemento visual en lugar de múltiples usuarios ficticios

## 📁 Archivos Modificados

### Backend

#### Modelos
- `src/models/Usuario.ts` - Agregado 'grupo' al ENUM de roles
- `src/models/associations.ts` - Asociaciones actualizadas

#### Controladores
- `src/controllers/authController.ts` - Soporte para rol 'grupo' en registro/login
- `src/controllers/turnoController.ts` - **NUEVO**: Lógica especial para asignación de turnos con rol "grupo"

#### Middleware
- `src/middleware/roleMiddleware.ts` - Agregado `requireGrupo` y jerarquía actualizada

#### Tipos
- `src/types/auth.ts` - Interfaces actualizadas con rol 'grupo'

#### Migraciones
- `src/migrations/024-add-grupo-role.ts` - Nueva migración para agregar rol
- `src/migrations/001-create-usuarios.ts` - ENUM actualizado
- `src/migrations/runner.ts` - Migración agregada al runner

### Frontend

#### Componentes
- `frontend/src/components/UserManagement.tsx` - Formulario adaptado para rol "grupo"
- `frontend/src/components/Register.tsx` - Registro adaptado para rol "grupo"
- `frontend/src/components/Dashboard.tsx` - Permisos actualizados
- `frontend/src/components/DashboardOverview.tsx` - Variable no utilizada comentada

#### Tipos
- `frontend/src/types/index.ts` - Tipo de rol actualizado

### Documentación
- `README.md` - Descripción del rol y permisos
- `NUEVO_ROL_GRUPO.md` - **ESTE ARCHIVO** - Documentación completa

## 🛠️ Implementación

### 1. Base de Datos
```sql
-- Ejecutar migración para agregar rol 'grupo'
ALTER TABLE usuarios 
MODIFY COLUMN rol ENUM('voluntario', 'admin', 'superAdmin', 'grupo') 
NOT NULL DEFAULT 'voluntario';
```

### 2. Backend
- ✅ Modelos actualizados
- ✅ Controladores con lógica especial
- ✅ Middleware de autorización
- ✅ Tipos TypeScript actualizados

### 3. Frontend
- ✅ Formularios adaptados
- ✅ Validaciones condicionales
- ✅ Campos requeridos dinámicos
- ✅ **IMPORTANTE**: Se usa el campo `cargo === 'Grupo'` en lugar de `rol === 'grupo'` para compatibilidad con datos del backend

## 🧪 Scripts de Prueba

### Scripts Existentes
- `src/scripts/runGrupoRoleMigration.ts` - Ejecuta la migración del rol
- `src/scripts/testGrupoRole.ts` - Prueba básica del rol
- `src/scripts/testGrupoRoleComplete.ts` - Prueba completa del rol

### Script Nuevo
- `src/scripts/testGrupoRoleShiftAssignment.ts` - **NUEVO**: Prueba la funcionalidad especial de asignación de turnos

## 🔧 Detalles Técnicos

### Campo Utilizado para Detección
- **Backend**: Se crea el usuario con `rol: 'grupo'`
- **Frontend**: Se detecta usando `cargo: 'Grupo'` (mayúscula)
- **Razón**: El campo `rol` puede no estar disponible en la respuesta del backend, pero `cargo` siempre está presente

### Lógica de Detección
```typescript
const tieneUsuarioGrupo = () => {
  const usuarios = selectedTurno.usuarios || [];
  return usuarios.some(u => u && (u.rol === 'grupo' || u.cargo === 'Grupo'));
};
```

## 🔒 Consideraciones de Seguridad

### Usuarios Ficticios
- Los usuarios temporales creados por el rol "grupo" tienen contraseñas temporales
- Se recomienda implementar un sistema de limpieza para estos usuarios
- Los usuarios ficticios no pueden acceder al sistema (solo existen en la base de datos)

### Validaciones
- Solo usuarios con rol "grupo" pueden activar esta funcionalidad
- Se verifica que el usuario exista antes de aplicar la lógica especial
- Los requisitos se cumplen automáticamente sin comprometer la integridad

## 🚀 Próximos Pasos Opcionales

### 1. Sistema de Limpieza
- Implementar un job que elimine usuarios ficticios antiguos
- Marcar usuarios ficticios como temporales en la base de datos

### 2. Notificaciones
- Alertar a administradores cuando se usen usuarios ficticios
- Sistema de auditoría para seguimiento de uso

### 3. Configuración
- Permitir configurar qué requisitos se cumplen automáticamente
- Opción para desactivar la funcionalidad por lugar o turno

### 4. Integración con Frontend
- Mostrar indicadores visuales cuando se usen usuarios ficticios
- Permitir a administradores gestionar usuarios ficticios

## 📊 Estado de Implementación

- ✅ **Backend**: 100% implementado
- ✅ **Frontend**: 100% implementado
- ✅ **Base de Datos**: 100% implementado
- ✅ **Pruebas**: 100% implementado
- ✅ **Documentación**: 100% implementado
- ✅ **Funcionalidad Especial**: 100% implementado

## 🎯 Resumen

El rol "grupo" está completamente implementado y funcional, incluyendo la funcionalidad especial solicitada: **cuando se asigna un usuario con rol "grupo" a un turno, todas las plazas quedan ocupadas y todos los requisitos se cumplen automáticamente**.

La implementación es robusta, segura y mantiene la integridad del sistema mientras proporciona la funcionalidad especial requerida.
