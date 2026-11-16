# Especificación de Requisitos de Software (ERS) — moonsoon

**Asignatura:** DSY1104 Desarrollo Full Stack II · **Evaluación:** EP3 + EFT
**Proyecto:** tienda online moonsoon (React + Spring Boot + MySQL)
**Equipo / integrantes:** _(completar)_ · **Versión:** 3.0

> Completa los campos marcados con _(completar)_ con la propuesta personalizada de tu equipo (rubro, público objetivo, catálogo).

## 1. Introducción
### 1.1 Propósito
Definir los requisitos de la versión integrada de moonsoon: un frontend React que consume una API REST propia en Spring Boot, con base de datos MySQL, autenticación con roles y despliegue en la nube.
### 1.2 Alcance
Tienda online con catálogo de productos, registro e inicio de sesión, carrito de compras y un panel de administración (gestión de productos y usuarios). Fuera de alcance: pasarela de pagos real y despacho.
### 1.3 Definiciones
| Término | Significado |
|---|---|
| ADMIN | Usuario con permisos de administración |
| CLIENTE | Usuario comprador (rol por defecto al registrarse) |
| JWT | Token firmado que identifica al usuario y su rol en cada petición |
| BCrypt | Algoritmo de hash para almacenar contraseñas |

## 2. Descripción general
### 2.1 Arquitectura
- **Frontend:** React + Vite + React Router. Capa de servicios separada de los componentes; URL de la API por variable de entorno.
- **ms-usuarios (Spring Boot, :8082):** autenticación, JWT, CRUD de usuarios. BD `moonsoon_usuarios`.
- **ms-productos (Spring Boot, :8081):** CRUD de productos. BD `moonsoon_productos`. Valida el JWT emitido por ms-usuarios (secreto compartido).
- **MySQL:** persistencia. **Swagger/OpenAPI:** documentación en `/swagger-ui/index.html` de cada servicio.

### 2.2 Actores
| Actor | Descripción |
|---|---|
| Visitante | Ve el catálogo, se registra e inicia sesión |
| Cliente | Visitante autenticado con rol CLIENTE; usa el carrito |
| Administrador | Rol ADMIN; gestiona productos y usuarios |

### 2.3 Restricciones
Java 17, Spring Boot 3, MySQL 8, React 18. Contraseñas siempre con hash. Secretos fuera del repositorio.

## 3. Requisitos funcionales
| ID | Requisito | Prioridad |
|---|---|---|
| RF-01 | El visitante puede registrarse; el rol asignado es siempre CLIENTE | Alta |
| RF-02 | El usuario inicia sesión con correo y clave y recibe un JWT | Alta |
| RF-03 | El usuario puede cerrar sesión; la sesión persiste al recargar la página | Alta |
| RF-04 | Las rutas privadas del frontend redirigen al login si no hay sesión | Alta |
| RF-05 | Cualquier persona puede listar productos y ver su detalle | Alta |
| RF-06 | El ADMIN puede crear, editar y eliminar productos | Alta |
| RF-07 | El ADMIN puede listar, crear, editar, cambiar rol, activar/desactivar y eliminar usuarios | Alta |
| RF-08 | Un CLIENTE que intente operaciones de administración recibe 403 | Alta |
| RF-09 | Un usuario desactivado no puede iniciar sesión | Media |
| RF-10 | Un ADMIN no puede eliminarse, desactivarse ni quitarse el rol a sí mismo | Media |
| RF-11 | El carrito permite agregar y quitar productos _(completar según tu implementación)_ | Media |

## 4. Requisitos no funcionales
| ID | Requisito |
|---|---|
| RNF-01 | Seguridad: contraseñas con BCrypt; endpoints protegidos en el backend (no solo ocultando botones) |
| RNF-02 | Validación de entrada (campos obligatorios, precio > 0, stock ≥ 0, correo válido) con códigos HTTP 200/201/400/401/403/404 |
| RNF-03 | CORS restringido al dominio del frontend |
| RNF-04 | Configuración por variables de entorno (BD, JWT_SECRET, CORS_ORIGINS, URLs de API) |
| RNF-05 | Pruebas unitarias con cobertura mínima de 60% en frontend y backend, con informe |
| RNF-06 | Interfaz con estados de carga y error visibles; sin datos quemados |
| RNF-07 | Despliegue con URL pública para frontend y backend |

## 5. Reglas de negocio
- El correo es único por usuario.
- El registro público nunca crea administradores; solo un ADMIN puede asignar el rol ADMIN.
- El token JWT expira a las 24 horas (configurable).
- Al expirar o ser inválido el token, el backend responde 401 y el frontend cierra la sesión.

## 6. Modelo de datos
**usuarios** (`moonsoon_usuarios`): id PK · nombre · email único · password (hash BCrypt) · rol (ADMIN/CLIENTE) · activo
**productos** (`moonsoon_productos`): id PK · nombre · descripcion · precio (> 0) · stock (≥ 0) · categoria · imagen (URL)
Script completo en `docs/moonsoon.sql`.

## 7. Interfaz de la API
| Servicio | Método y ruta | Acceso |
|---|---|---|
| ms-usuarios | POST `/api/auth/login`, POST `/api/auth/registro` | Público |
| ms-usuarios | GET/POST `/api/usuarios`; GET/PUT/DELETE `/api/usuarios/{id}`; PATCH `/api/usuarios/{id}/rol`, `/estado` | ADMIN |
| ms-productos | GET `/api/productos`, GET `/api/productos/{id}` | Público |
| ms-productos | POST `/api/productos`; PUT/DELETE `/api/productos/{id}` | ADMIN |

## 8. Casos de uso principales
**CU-01 Iniciar sesión.** El usuario ingresa correo y clave → el backend valida contra el hash y entrega un JWT → el frontend guarda la sesión y redirige según el rol.
**CU-02 Gestionar productos (ADMIN).** Entra a `/admin` → pestaña Productos → crea/edita/elimina → la API valida y persiste en MySQL → la tabla se recarga desde la API.
**CU-03 Gestionar usuarios (ADMIN).** Pestaña Usuarios → crea, edita, cambia rol/estado o elimina → un CLIENTE que llame esos endpoints recibe 403.

## 9. Criterios de aceptación
- Login con ambos roles funciona en la URL desplegada.
- `/admin` redirige al login sin sesión y a inicio si el rol no es ADMIN.
- Endpoints de administración responden 403 para CLIENTE y 401 sin token.
- Contraseñas hasheadas en la BD; datos persisten tras recargar.
- Pruebas pasan y la cobertura es ≥ 60% en ambos proyectos.
