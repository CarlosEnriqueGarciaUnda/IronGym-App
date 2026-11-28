# IRON GYM — Ticket #8: integración y evidencias de pruebas

**Rama:** `feat/frontend-ui`  
**Objetivo:** validar que React consuma el backend real, mostrar errores correctamente y documentar resultados comprobables.

## 1. Preparación

- [ ] `mvn -version` confirma Maven + Java 21.
- [ ] `node -v` y `npm -v` funcionan.
- [ ] MySQL 8 está iniciado y existe la base vacía `iron_gym`.
- [ ] Spring Boot inicia en puerto 8080 sin errores y Flyway aplica V1/V2.
- [ ] React compila con `npm run build` y abre `http://localhost:5173/login`.
- [ ] `.env`, secretos JWT, contraseñas y `node_modules` NO aparecen en `git status`.

Ejecuta desde la raíz:

```powershell
# Una terminal: backend
cd backend
Copy-Item src\main\resources\application.properties.example src\main\resources\application.properties -ErrorAction SilentlyContinue
$env:DB_USER = 'root'
$env:DB_PASSWORD = 'CONTRASENA_MYSQL_LOCAL'
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
$env:JWT_SECRET_BASE64 = [Convert]::ToBase64String($bytes)
mvn spring-boot:run

# Otra terminal desde la raíz: frontend
cd frontend
Copy-Item .env.example .env -Force
npm install
npm run build
npm run dev
```

Sustituye `CONTRASENA_MYSQL_LOCAL` de forma privada. No captures ni publiques el valor en un commit. El `application.properties` y `.env` deben permanecer ignorados por Git.

## 2. Pruebas de la API

En una **tercera** terminal, desde la raíz, ejecuta:

```powershell
.\scripts\probar-api.ps1
# Para comprobar también ENTRENADOR y SOCIO:
.\scripts\probar-api.ps1 -TodosLosRoles
```

La prueba solicita los usuarios y contraseñas sin incluirlas en Git. Comprueba login válido/inválido, 401 sin sesión, datos paginados, restricciones 403, cierres de sesión y revocación de JWT. **No crea ni elimina registros.**

Fecha de ejecución: __________  Resultado (`OK`/`FALLO`): __________  Responsable: __________

## 3. Pruebas manuales en el navegador

Marca únicamente cuando hayas probado el caso real, no cuando solo compila:

| Caso | Acción y resultado esperado | Estado |
| --- | --- | --- |
| Login | Usuario válido entra al panel del rol | Pendiente |
| Validación | Correo mal escrito muestra error bajo el campo | Pendiente |
| ADMIN | Ve socios, cobros, asistencias, mensualidades y usuarios | Pendiente |
| ENTRENADOR | Puede consultar socios y registrar asistencia | Pendiente |
| ENTRENADOR | No puede abrir `/cobros` (403 backend) | Pendiente |
| SOCIO | Consulta `/mine`, no pagos de otros usuarios | Pendiente |
| Paginación | En Network: `/users?page=1&size=10&q=...` | Pendiente |
| Registro | Cuenta nueva se guarda en MySQL con rol SOCIO | Pendiente |
| CRUD | Alta/edición aparece al recargar, no solo temporalmente | Pendiente |
| Perfil | Cambiar nombre refleja el cambio en barra superior | Pendiente |
| Cierre | Logout revoca JWT y no permite acceso posterior | Pendiente |
| Celular | Vista responsive 390 px, sin desplazamiento horizontal excesivo | Pendiente |
| Recuperación | Correo real funciona cuando esté configurado Postfix | Pendiente externo |

**Cómo verificar la paginación:** abre F12 → Network → Fetch/XHR, busca `/users` y revisa que React solicite `page`, `size` y `q` al backend. Las respuestas de Spring Data tienen `content`, `number`, `totalPages` y `totalElements`.

## 4. Errores frecuentes

- **`npm error Missing script: dev`:** estás en la raíz; entra en `frontend`.
- **Login visible, pero no entra:** comprueba MySQL y API 8080 y `VITE_API_URL`.
- **401:** sin JWT, token caducado o credenciales incorrectas.
- **403:** la cuenta existe, pero el rol no autoriza la operación.
- **Conexión rechazada:** Spring Boot apagado, puerto equivocado o CORS mal configurado.
- **Falla Flyway:** revisa si la base ya contenía tablas anteriores. No borres datos sin respaldarlos.
- **PS error al ejecutar script:** utiliza PowerShell real; no modifiques políticas del sistema indiscriminadamente.

## 5. GitHub: evidencia y revisión

Issue #8: **Frontend: integración con API REST, pruebas y documentación**. Asignar a Uriel y dejar abierto hasta completar pruebas. Actualizar tablero cuando el equipo tenga permiso.

Después de efectuar pruebas, agrega únicamente los cambios reales, desde la raíz:

```powershell
git status
git add README.md docs scripts frontend/src
# Verifica no incluir secretos:
git diff --cached --stat
# Cuando efectivamente hayas probado lo documentado:
git commit -m "test(docs): verificar integración API y documentar IRON GYM (#8)"
git push
```

El siguiente paso **no es crear una rama nueva**. Se conserva `feat/frontend-ui`. Al terminar, abrir un único PR contra `main` (que Carlos debe crear desde backend si no existe). No fusionar antes de revisar.

**Bruno, VPS y HTTPS son actividades posteriores.** No afirmar que funcionan hasta probarlos.
