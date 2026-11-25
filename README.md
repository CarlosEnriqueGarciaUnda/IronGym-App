# IRON GYM — Sistema web de gestión de gimnasio

Proyecto integrador de **Programación Web**. Repositorio compartido de **Uriel Eduardo Guzmán Ramírez** (frontend React) y **Carlos Enrique García Unda** (backend Spring Boot / base de datos).

**Repositorio:** https://github.com/CarlosEnriqueGarciaUnda/IronGym-App  
**Figma:** https://www.figma.com/design/wbdc45yrgm1ps89ch9Cvkc  
**Tablero:** https://github.com/users/CarlosEnriqueGarciaUnda/projects/2/views/1

## Descripción

IRON GYM permite a tres tipos de usuario acceder a las operaciones autorizadas de un gimnasio:

| Rol | Funciones principales |
| --- | --- |
| ADMIN | Dashboard, gestión de socios y usuarios, cobros, asistencias, membresías y planes. |
| ENTRENADOR | Dashboard, consulta de socios y registro de asistencias. |
| SOCIO | Consulta de sus propias membresías, pagos, asistencias y perfil. |

El frontend usa rutas protegidas para la experiencia de usuario. **La seguridad real se aplica desde Spring Security** mediante JWT, roles y comprobaciones en los controladores. El registro público asigna exclusivamente el rol `SOCIO`.

## Tecnologías

- **Frontend:** React 19, Vite 6, React Router 7, Axios y lucide-react.
- **Backend:** Java 21, Spring Boot 3.4.3, Spring Security, JWT, JPA y Bean Validation.
- **Base de datos:** MySQL 8 y Flyway. Las relaciones se crean con migraciones, no con `ddl-auto=create`.
- **Arquitectura:** controlador REST → servicio → repositorio JPA → MySQL.

```mermaid
flowchart LR
    UI[React + Vite] -->|HTTP /api + JWT| API[Spring Boot REST]
    API --> SEG[Spring Security]
    API --> SRV[Servicios]
    SRV --> JPA[Repositorios JPA]
    JPA --> DB[(MySQL)]
```

## Estructura

```text
IronGym-App/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/mx/edu/ito/irongym/
│       └── resources/db/migration/
│           ├── V1__schema.sql
│           └── V2__seed.sql
├── frontend/
│   ├── src/components/
│   ├── src/context/
│   ├── src/hooks/
│   ├── src/layouts/
│   ├── src/pages/
│   ├── src/routes/
│   └── src/services/
├── docs/
├── scripts/
└── README.md
```


Tablas adicionales: `revoked_tokens` para invalidación JWT; `attendances.recorded_by` también referencia a `users`. La relación **usuarios ↔ roles** es muchos a muchos a través de `user_roles`.

## Endpoints principales

| Método | Ruta | Permiso |
| --- | --- | --- |
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/register` | Público; crea SOCIO |
| GET | `/api/auth/me` | Autenticado |
| POST | `/api/auth/logout` | Autenticado |
| GET | `/api/dashboard/admin` | ADMIN |
| GET | `/api/dashboard/trainer` | ENTRENADOR |
| GET | `/api/dashboard/member` | SOCIO |
| GET / POST / PUT / DELETE | `/api/users` | Según operación: ADMIN y consulta ENTRENADOR |
| GET / POST / PUT / DELETE | `/api/payments` | ADMIN |
| GET / POST / PUT / DELETE | `/api/attendances` | Según operación: ADMIN / ENTRENADOR |
| GET / POST / PUT / DELETE | `/api/memberships` | ADMIN |
| GET | `/api/payments/mine`, `/api/memberships/mine`, `/api/attendances/mine` | SOCIO |

Las colecciones paginadas aceptan `page`, `size` y, cuando aplica, `q` desde Spring Data; la UI no pagina exclusivamente en el navegador.



## Colaboración GitHub

- Carlos: rama `feat/backend-core`.
- Uriel: rama `feat/frontend-ui` 



## Despliegue en Producción (VPS Azure con HTTPS)

- **URL de producción:** https://irongym-ito-2026.northcentralus.cloudapp.azure.com
- **Servidor:** Ubuntu Server en Microsoft Azure (`vps-act8-eq17`)
- **Proxy Inverso y SSL:** Nginx + Certbot (Let's Encrypt)
  - `/` sirve el compilado estático de React (`dist/` en `/var/www/html`).
  - `/api/` redirige peticiones hacia el backend Spring Boot en `http://127.0.0.1:8093/api/`.
- **Backend:** Java 17 / Spring Boot 3 ejecutándose como servicio `systemd` (`irongym.service`) en el puerto `8093`.
- **Base de Datos:** MySQL 8 (`iron_gym`) con migraciones automáticas gestionadas por Flyway.
