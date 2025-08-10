# AgaPlan Backend

Backend con Node.js, Express, TypeScript y Sequelize conectado a MySQL.

## 🚀 Características

- **Node.js + Express**: Framework web robusto y escalable
- **TypeScript**: Tipado estático para mayor seguridad y productividad
- **Sequelize ORM**: ORM para MySQL con migraciones automáticas
- **Autenticación JWT**: Sistema de autenticación seguro con tokens
- **Control de Roles**: Sistema de permisos basado en roles (voluntario, admin, superAdmin)
- **Hash de Contraseñas**: Contraseñas hasheadas con bcrypt
- **Validaciones**: Validaciones de datos a nivel de modelo y API
- **Migraciones**: Sistema de migraciones para gestionar cambios en la base de datos
- **Seeding**: Datos de prueba para desarrollo

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- MySQL (versión 5.7 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd AgaPlan
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   # Configuración de la base de datos MySQL
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=AgaPlan
   DB_PORT=3306

   # Configuración del servidor
   PORT=3000
   NODE_ENV=development

   # Configuración de JWT
   JWT_SECRET=tu_clave_secreta_super_segura_cambiala_en_produccion
   ```

4. **Configurar la base de datos**
   - Crear una base de datos MySQL llamada `AgaPlan`
   - Asegurarte de que el usuario tenga permisos de acceso

5. **Ejecutar migraciones y sincronizar modelos**
   ```bash
   npm run dev
   ```

## 🗄️ Modelos de Base de Datos

### Usuario
- `id`: Identificador único (auto-incremento)
- `nombre`: Nombre completo del usuario
- `email`: Email único del usuario
- `contraseña`: Contraseña hasheada con bcrypt
- `sexo`: Género (M, F, O)
- `cargo`: Cargo o función del usuario
- `rol`: Rol del usuario (voluntario, admin, superAdmin)

### Lugar
- `id`: Identificador único
- `nombre`: Nombre del lugar
- `dirección`: Dirección física del lugar

### Disponibilidad
- `id`: Identificador único
- `dia_semana`: Día de la semana (0-6, donde 0 es domingo)
- `hora_inicio`: Hora de inicio (formato HH:MM)
- `hora_fin`: Hora de fin (formato HH:MM)
- `usuarioId`: Referencia al usuario (foreign key)

### Turno
- `id`: Identificador único
- `fecha`: Fecha del turno
- `hora`: Hora del turno (formato HH:MM)
- `estado`: Estado del turno (libre, ocupado)
- `usuarioId`: Referencia al usuario (opcional, solo si está ocupado)
- `lugarId`: Referencia al lugar (foreign key)

## 🔗 Relaciones

- **Usuario** tiene muchas **Disponibilidades**
- **Usuario** tiene muchos **Turnos** (opcional)
- **Lugar** tiene muchos **Turnos**

## 🔐 Sistema de Autenticación y Autorización

### Roles y Permisos
- **voluntario**: 
  - Puede ver turnos y lugares
  - Puede apuntarse/liberarse de turnos (si coinciden con su disponibilidad)
  - Puede gestionar su propio perfil
- **admin**: 
  - Acceso de voluntario
  - Puede gestionar turnos (crear, editar, eliminar)
  - Puede ver todos los lugares
- **superAdmin**: 
  - Acceso completo de admin
  - Puede gestionar lugares (crear, editar, eliminar)
  - Puede generar turnos automáticamente
  - Puede eliminar usuarios

### Registro de Usuario
- **Endpoint**: `POST /api/auth/register`
- **Campos requeridos**: nombre, email, contraseña, sexo, cargo
- **Rol por defecto**: voluntario
- **Primer usuario**: Se asigna automáticamente como superAdmin

### Login de Usuario
- **Endpoint**: `POST /api/auth/login`
- **Campos requeridos**: email, contraseña
- **Respuesta**: Token JWT válido por 7 días

### Perfil de Usuario
- **Endpoint**: `GET /api/auth/profile`
- **Autenticación**: Requiere token JWT válido

## 🛡️ Control de Acceso

### Middlewares de Seguridad
- `authMiddleware`: Valida tokens JWT y añade `req.user`
- `roleMiddleware`: Verifica permisos basados en roles
- `requireOwnershipOrRole`: Permite acceso si es propietario o tiene rol superior

## 📡 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado

### Usuarios
- `POST /api/usuarios` - Crear usuario (público, solo para registro inicial)
- `GET /api/usuarios` - Obtener todos los usuarios (requiere admin)
- `GET /api/usuarios/:id` - Obtener usuario por ID (requiere autenticación)
- `PUT /api/usuarios/:id` - Actualizar usuario (requiere autenticación)
- `DELETE /api/usuarios/:id` - Eliminar usuario (requiere superAdmin)
- `PATCH /api/usuarios/:id/participacion-mensual` - Configurar participación mensual (requiere autenticación)

### Test
- `GET /api/test` - Endpoint de prueba

### Lugares
- `GET /api/lugares` - Obtener todos los lugares (público)
- `GET /api/lugares/:id` - Obtener lugar por ID (público)
- `POST /api/lugares` - Crear lugar (solo superAdmin)
- `PUT /api/lugares/:id` - Actualizar lugar (solo superAdmin)
- `DELETE /api/lugares/:id` - Eliminar lugar (solo superAdmin)

### Turnos
- `GET /api/turnos` - Obtener todos los turnos con filtros (público)
- `GET /api/turnos/:id` - Obtener turno por ID (público)
- `POST /api/turnos` - Crear turno (admin y superAdmin)
- `PUT /api/turnos/:id` - Actualizar turno (admin y superAdmin)
- `DELETE /api/turnos/:id` - Eliminar turno (admin y superAdmin)
- `POST /api/turnos/:id/ocupar` - Ocupar turno (usuarios autenticados)
- `POST /api/turnos/:id/liberar` - Liberar turno (usuarios autenticados)
- `POST /api/turnos/generar-automaticos` - Generar turnos automáticos (solo superAdmin)

## 🏗️ Estructura del Proyecto

```
src/
├── config/
│   └── database.ts          # Configuración de Sequelize
├── controllers/
│   ├── authController.ts     # Controlador de autenticación
│   ├── testController.ts     # Controlador de prueba
│   ├── usuarioController.ts  # Controlador de usuarios
│   ├── lugarController.ts    # Controlador de lugares
│   └── turnoController.ts    # Controlador de turnos
├── middleware/
│   ├── authMiddleware.ts     # Middleware de autenticación JWT
│   └── roleMiddleware.ts     # Middleware de control de roles
├── migrations/
│   ├── 001-create-usuarios.ts
│   ├── 002-create-lugares.ts
│   ├── 003-create-disponibilidades.ts
│   ├── 004-create-turnos.ts
│   └── runner.ts            # Ejecutor de migraciones
├── models/
│   ├── associations.ts       # Definición de relaciones
│   ├── index.ts             # Exportación de modelos
│   ├── Test.ts              # Modelo de prueba
│   ├── Usuario.ts           # Modelo de usuario
│   ├── Lugar.ts             # Modelo de lugar
│   ├── Disponibilidad.ts    # Modelo de disponibilidad
│   └── Turno.ts             # Modelo de turno
├── routes/
│   ├── authRoutes.ts        # Rutas de autenticación
│   ├── index.ts             # Rutas principales
│   ├── testRoutes.ts        # Rutas de prueba
│   ├── usuarioRoutes.ts     # Rutas de usuarios
│   ├── lugarRoutes.ts       # Rutas de lugares
│   └── turnoRoutes.ts       # Rutas de turnos
├── scripts/
│   └── seedData.ts          # Script para poblar la base de datos
├── types/
│   ├── auth.ts              # Tipos de TypeScript para autenticación
│   └── index.ts             # Tipos para lugares y turnos
├── app.ts                   # Configuración de Express
└── server.ts                # Punto de entrada de la aplicación
```

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm run build`: Compila el código TypeScript a JavaScript
- `npm start`: Inicia el servidor en modo producción
- `npm run seed`: Ejecuta el script de seeding para poblar la base de datos

## 🔧 Configuración de Base de Datos

### Variables de Entorno Requeridas
```env
DB_HOST=localhost          # Host de MySQL
DB_USER=root              # Usuario de MySQL
DB_PASSWORD=              # Contraseña de MySQL (vacía si no hay)
DB_NAME=AgaPlan           # Nombre de la base de datos
DB_PORT=3306              # Puerto de MySQL
JWT_SECRET=clave_secreta  # Clave secreta para JWT
```

### Crear Base de Datos
```sql
CREATE DATABASE AgaPlan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🚀 Uso

1. **Iniciar el servidor**
   ```bash
   npm run dev
   ```

2. **El servidor estará disponible en**
   - URL: `http://localhost:3000`
   - API: `http://localhost:3000/api`

3. **Probar la API**
   - Endpoint de prueba: `GET http://localhost:3000/api/test`
   - Documentación de la API: `GET http://localhost:3000/api`

## 🔒 Seguridad

- **Contraseñas**: Hasheadas con bcrypt (12 salt rounds)
- **JWT**: Tokens con expiración de 7 días
- **Validaciones**: Validaciones a nivel de modelo y API
- **CORS**: Configurado para desarrollo y producción
- **Rate Limiting**: Implementado para prevenir abuso

## 🧪 Testing

Para probar la API, puedes usar herramientas como:
- Postman
- Insomnia
- curl
- Thunder Client (extensión de VS Code)

### Ejemplo de Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "contraseña": "123456",
    "sexo": "M",
    "cargo": "Voluntario"
  }'
```

### Ejemplo de Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "contraseña": "123456"
  }'
```

## 🐛 Solución de Problemas

### Error de Conexión a MySQL
- Verificar que MySQL esté ejecutándose
- Verificar credenciales en `.env`
- Verificar que la base de datos `AgaPlan` exista

### Error de JWT
- Verificar que `JWT_SECRET` esté configurado en `.env`
- Verificar que el token esté en el header `Authorization: Bearer <token>`

### Error de Migraciones
- Verificar que la base de datos esté accesible
- Verificar que el usuario tenga permisos de CREATE, ALTER, DROP

## 📝 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas, por favor abre un issue en el repositorio.
