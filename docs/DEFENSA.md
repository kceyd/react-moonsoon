# Guía para la defensa (EP3) — qué explicar y dónde está el código

Cada integrante debe poder explicar y modificar en vivo su parte. Esta guía resume cada indicador de la rúbrica.

## Backend
**IE3.1.1 / IE3.1.2 — Backend con BD, lógica de negocio y modelos**
- Entidades JPA: `Usuario.java`, `Producto.java`; repositorios `UsuarioRepository`, `ProductoRepository` (Spring Data JPA → MySQL).
- Lógica de negocio en `UsuarioService`: correo único, registro siempre como CLIENTE, no se puede eliminar/desactivar/quitar rol a uno mismo, usuario inactivo no entra.
- Configuración de BD por variables de entorno en `application.properties` (`DB_URL`, `DB_USER`, `DB_PASS`).

**IE3.2.1 / IE3.2.3 — API REST con Spring Boot y Swagger**
- Controladores: `AuthController`, `UsuarioController`, `ProductoController` (GET/POST/PUT/PATCH/DELETE).
- Códigos HTTP: 201 al crear, 400 por validación (`@Valid` + `GlobalExceptionHandler`), 401/403 por seguridad, 404 si no existe.
- Swagger (springdoc): `http://HOST:8082/swagger-ui/index.html` y `http://HOST:8081/swagger-ui/index.html`. Botón **Authorize** → pegar el token del login para probar rutas de admin.

**IE3.3.1 / IE3.3.4 — Autenticación con roles y JWT**
1. `POST /api/auth/login` valida la clave con `BCryptPasswordEncoder.matches` y `JwtUtil.generar` firma un token con correo, id y rol.
2. En cada petición, `JwtFilter` lee `Authorization: Bearer <token>`, valida la firma y carga el rol (`ROLE_ADMIN` / `ROLE_CLIENTE`) en el contexto de seguridad.
3. `SecurityConfig` define las reglas: `/api/usuarios/**` solo ADMIN; en productos el GET es público y el resto ADMIN. Sin token → 401; rol insuficiente → 403.
4. ms-productos no tiene usuarios: solo valida el token con el mismo `JWT_SECRET`.
5. Sesión sin estado (STATELESS) y CSRF desactivado porque se usa token en header, no cookies.

## Frontend
**IE3.2.2 / IE3.2.4 — Integración front–back**
- `src/services/http.js`: un solo punto que usa `fetch`, agrega el token, lee el mensaje de error del backend y maneja fallas de red.
- `authService`, `usuariosService`, `productosService`: una función por endpoint; los componentes nunca llaman `fetch` directo.
- URLs en `.env` (`VITE_API_USUARIOS_URL`, `VITE_API_PRODUCTOS_URL`). CORS en el backend (`CORS_ORIGINS`) permite solo el dominio del front.
- Las pantallas muestran "Cargando…" y los errores de la API; no hay datos quemados.

**IE3.3.2 / IE3.3.5 — Gestión de sesiones**
- `AuthContext` guarda token (`moonsoon_token`) y usuario (`moonsoon_usuario`) en `localStorage` y los lee al iniciar → la sesión sobrevive a recargas.
- Si el backend responde 401 (token vencido), `http.js` emite `moonsoon:unauthorized` y el contexto cierra la sesión.
- Honestidad sobre seguridad: `localStorage` es vulnerable a XSS; una alternativa más segura es cookie `HttpOnly`. Se eligió localStorage por simplicidad y porque React escapa el contenido por defecto.

**IE3.3.3 / IE3.3.6 — Restricciones de acceso en el frontend**
- `ProtectedRoute`: sin sesión → `/login`; con rol requerido distinto → `/`. Se usa en `/admin` (rol ADMIN) y `/carrito`.
- Ocultar opciones del menú según `esAdmin` mejora la experiencia, pero la seguridad real está en el backend (un CLIENTE que llame la API directa recibe 403).

## Preguntas típicas
- *¿Qué pasa si un CLIENTE conoce la URL `/api/usuarios`?* → 403 desde `SecurityConfig`.
- *¿Dónde se guarda la clave?* → Solo el hash BCrypt en la columna `password`; nunca se devuelve en las respuestas.
- *¿Por qué dos servicios?* → Separación de responsabilidades: identidad vs catálogo; comparten solo el secreto JWT.
- *¿Cómo ver la cobertura?* → Backend: `mvn verify` y abrir `target/site/jacoco/index.html`. Frontend: `npm run test:coverage` y abrir `coverage/index.html`.
