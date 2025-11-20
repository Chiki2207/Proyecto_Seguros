# TodoAk Backend

Backend para el sistema TodoAk - Gestión de asistencias y seguros del hogar.

## Configuración

1. Instalar dependencias:
```bash
cd server
npm install
```

2. Crear archivo `.env` (copiar de `.env.example`):
```
MONGODB_URI=mongodb://localhost:27017/proyecto
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui_cambiar_en_produccion
PORT=3000
```

3. Asegúrate de que MongoDB esté corriendo en `localhost:27017`

4. Iniciar servidor:
```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

## Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `POST /api/users` - Crear usuario (ADMIN)
- `GET /api/users/:id` - Obtener usuario

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `GET /api/clients/:id` - Obtener cliente

### Listas de Precios
- `GET /api/clients/:clientId/prices` - Listar precios de un cliente
- `POST /api/clients/:clientId/prices` - Crear ítem de precio

### Reportes
- `GET /api/reports` - Listar reportes (filtros: ?clientId=...&estado=...&technicianId=...)
- `GET /api/reports/:id` - Obtener reporte completo con lookups
- `POST /api/reports` - Crear reporte
- `PATCH /api/reports/:id` - Actualizar reporte

### Multimedia
- `POST /api/reports/:id/media` - Registrar archivo multimedia

### Historial
- `POST /api/reports/:id/history` - Agregar entrada al historial

## Autenticación

Todas las rutas (excepto `/api/auth/login`) requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

El token se obtiene al hacer login y debe guardarse en el frontend.

