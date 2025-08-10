# Documentación de la API - AgaPlan

## Autenticación

Todas las rutas protegidas requieren un token JWT en el header `Authorization: Bearer <token>`.

## Roles de Usuario

- **voluntario**: Puede ver turnos y apuntarse/liberarse de ellos
- **admin**: Puede gestionar turnos y ver lugares
- **superAdmin**: Acceso completo a todas las funcionalidades

## Endpoints

### Lugares (`/lugares`)

#### GET `/lugares`
Obtiene todos los lugares.
- **Acceso**: Público
- **Respuesta**: Lista de lugares

#### GET `/lugares/:id`
Obtiene un lugar específico por ID.
- **Acceso**: Público
- **Parámetros**: `id` - ID del lugar
- **Respuesta**: Información del lugar

#### POST `/lugares`
Crea un nuevo lugar.
- **Acceso**: Solo superAdmin
- **Body**:
  ```json
  {
    "nombre": "Nombre del lugar",
    "direccion": "Dirección completa"
  }
  ```

#### PUT `/lugares/:id`
Actualiza un lugar existente.
- **Acceso**: Solo superAdmin
- **Parámetros**: `id` - ID del lugar
- **Body**: Campos a actualizar (nombre y/o direccion)

#### DELETE `/lugares/:id`
Elimina un lugar.
- **Acceso**: Solo superAdmin
- **Parámetros**: `id` - ID del lugar
- **Nota**: Solo se puede eliminar si no tiene turnos asociados

### Turnos (`/turnos`)

#### GET `/turnos`
Obtiene todos los turnos con filtros opcionales.
- **Acceso**: Público
- **Query params**:
  - `fecha`: Fecha específica (YYYY-MM-DD)
  - `lugarId`: ID del lugar
  - `estado`: 'libre' o 'ocupado'
  - `usuarioId`: ID del usuario asignado

#### GET `/turnos/:id`
Obtiene un turno específico por ID.
- **Acceso**: Público
- **Parámetros**: `id` - ID del turno

#### POST `/turnos`
Crea un nuevo turno.
- **Acceso**: Admin y superAdmin
- **Body**:
  ```json
  {
    "fecha": "2024-01-15",
    "hora": "09:00",
    "lugarId": 1
  }
  ```

#### PUT `/turnos/:id`
Actualiza un turno existente.
- **Acceso**: Admin y superAdmin
- **Parámetros**: `id` - ID del turno
- **Nota**: Solo se pueden modificar turnos libres

#### DELETE `/turnos/:id`
Elimina un turno.
- **Acceso**: Admin y superAdmin
- **Parámetros**: `id` - ID del turno
- **Nota**: Solo se pueden eliminar turnos libres

#### POST `/turnos/:id/ocupar`
Un voluntario se apunta a un turno libre.
- **Acceso**: Usuarios autenticados
- **Parámetros**: `id` - ID del turno
- **Validaciones**:
  - El turno debe estar libre
  - El usuario no debe tener otro turno en la misma fecha
  - El usuario debe tener disponibilidad para ese día y hora

#### POST `/turnos/:id/liberar`
Un voluntario se borra de un turno.
- **Acceso**: Usuarios autenticados
- **Parámetros**: `id` - ID del turno
- **Nota**: Solo se pueden liberar turnos propios

#### POST `/turnos/generar-automaticos`
Genera turnos automáticamente de forma semanal o mensual.
- **Acceso**: Solo superAdmin
- **Body**:
  ```json
  {
    "tipo": "semanal",
    "fechaInicio": "2024-01-15",
    "lugarId": 1,
    "horaInicio": "09:00",
    "horaFin": "17:00",
    "intervalo": 60
  }
  ```

## Lógica de Validación

### Asignación de Turnos
1. **Verificación de disponibilidad**: Solo se pueden asignar turnos que coincidan con la disponibilidad del usuario
2. **Conflictos de fecha**: Un usuario no puede tener múltiples turnos en la misma fecha
3. **Horarios válidos**: La hora del turno debe estar dentro del rango de disponibilidad del usuario

### Generación Automática de Turnos
- **Semanal**: Genera turnos para 7 días consecutivos
- **Mensual**: Genera turnos para 30 días consecutivos
- **Días laborables**: Solo se generan turnos de lunes a viernes
- **Intervalos**: Configurables entre 15 y 120 minutos
- **Prevención de duplicados**: No se crean turnos que ya existan

## Códigos de Respuesta

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error en la solicitud (validaciones)
- **401**: No autenticado
- **403**: Acceso denegado (permisos insuficientes)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## Ejemplos de Uso

### Crear un lugar (superAdmin)
```bash
curl -X POST /lugares \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Centro Comunitario",
    "direccion": "Calle Principal 123"
  }'
```

### Generar turnos semanales (superAdmin)
```bash
curl -X POST /turnos/generar-automaticos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "semanal",
    "fechaInicio": "2024-01-15",
    "lugarId": 1,
    "horaInicio": "09:00",
    "horaFin": "17:00",
    "intervalo": 60
  }'
```

### Ocupar un turno (voluntario)
```bash
curl -X POST /turnos/1/ocupar \
  -H "Authorization: Bearer <token>"
```

### Liberar un turno (voluntario)
```bash
curl -X POST /turnos/1/liberar \
  -H "Authorization: Bearer <token>"
```

## Notas Importantes

1. **Seguridad**: Todas las operaciones de escritura están protegidas por autenticación y autorización
2. **Validaciones**: Se realizan validaciones exhaustivas en todos los endpoints
3. **Integridad**: No se pueden eliminar lugares con turnos asociados
4. **Disponibilidad**: Los turnos solo se pueden asignar si coinciden con la disponibilidad del usuario
5. **Conflictos**: Se previenen conflictos de horarios y asignaciones múltiples
