# IRON GYM — Integración de las pantallas de gestión

**Rama de trabajo:** `feat/frontend-ui`  
**Responsable de la implementación y pruebas:** Uriel Eduardo Guzmán Ramírez  
**Issue:** #7 — Pantallas y formularios de gestión del gimnasio.

## Qué se incluye

- **App.jsx:** rutas de la aplicación. Los permisos de ADMIN, ENTRENADOR y SOCIO se validan con `ProtectedRoute`.
- **layouts/AppLayout.jsx:** menú lateral y barra superior con nombre, correo, rol y cierre de sesión.
- **pages/DashboardPage.jsx:** datos reales de `/api/dashboard/admin`, `/api/dashboard/trainer` y `/api/dashboard/member`.
- **pages/ManagementPage.jsx:** listados de socios, usuarios, cobros, asistencias, planes y mensualidades. No utiliza datos simulados.
- **components/ManagementForm.jsx:** formularios de alta y edición, validación en el frontend y envío al backend con Axios.
- **components/SocioPicker.jsx:** busca socios en Spring Boot; no descarga toda la tabla para usarla en un select.
- **components/SelectField.jsx:** campos desplegables con errores debajo.
- **pages/MyRecordsPage.jsx:** el socio solo consulta `/mine`; el servidor selecciona sus propios registros usando el JWT.
- **pages/ProfilePage.jsx:** modifica el nombre y el teléfono desde `/api/users/me`.
- **pages/RegisterPage.jsx:** registro público solo de SOCIO.
- **pages/RecoverPage.jsx:** recuperación por token; depende de que el servicio de correo esté habilitado en backend.
- **hooks/useServerPage.js:** la paginación y el filtro se envían a Spring Boot con `page`, `size`, `q`.
- **styles/app.css:** diseño responsivo oscuro y naranja.

## Dónde colocar los archivos

El ZIP tiene `frontend/` como primera carpeta. Extraer en la **raíz** de `IronGym`, NO dentro de `frontend`.

```powershell
cd "C:\Users\Acer\Music\IronGym"
$zip = "$env:USERPROFILE\Downloads\IRON_GYM_TICKET_7_PANTALLAS.zip"
Test-Path $zip
Expand-Archive -LiteralPath $zip -DestinationPath (Get-Location).Path -Force

# Eliminar páginas antiguas que ya no se usan (NO borra componentes).
Remove-Item ".\frontend\src\pages\RoleHome.jsx" -ErrorAction SilentlyContinue
Remove-Item ".\frontend\src\pages\ComponentesPreview.jsx" -ErrorAction SilentlyContinue

cd frontend
npm run build
npm run dev
```

## Advertencia sobre el login

Si **MySQL o Spring Boot no están funcionando**, podrás ver `/login`, `/registro` y `/recuperar`, pero no entrar en los módulos privados. El frontend **no contiene contraseñas de prueba ni autenticación simulada**.

Para entrar a los paneles, primero configura la base `iron_gym` en MySQL y arranca el backend. Las tres cuentas iniciales están en `backend/src/main/resources/db/migration/V2__seed.sql`, y solo se cargan al iniciar Flyway en una base nueva.

## Rutas y permisos

| Página | Permiso |
|---|---|
| `/panel`, `/perfil` | Cualquier usuario autenticado |
| `/socios`, `/asistencias` | ADMIN / ENTRENADOR (entrenador no edita socios ni elimina asistencias) |
| `/usuarios`, `/cobros`, `/mensualidades`, `/planes` | ADMIN |
| `/mi-membresia`, `/mis-pagos`, `/mis-asistencias` | SOCIO |

## Cómo validar tu trabajo antes de hacer el commit

1. `npm run build` debe terminar sin errores.
2. `/login` y `/registro` deben verse sin pantallas de ejercicios o simulación.
3. Con backend activo, inicia sesión con cada rol; comprueba los menús.
4. Un entrenador debe recibir acceso denegado en `/cobros` y no debe ver botones de edición de socios.
5. Un socio solo debe acceder a sus propias membresías, pagos y asistencias.
6. En Socios, al cambiar el texto de búsqueda, revisa en Network que la petición vaya a `/api/users?q=...&page=...`.
7. Crear o editar registros debe guardar en MySQL, no solo modificar visualmente la tabla.
8. Comprueba la vista de celular en las herramientas de desarrollo (ancho ~390 px).
9. Deja el Issue #7 abierto mientras falten pruebas con el backend.

## Preparar los archivos para Git

Desde la carpeta `IronGym`:

```powershell
git branch --show-current
git status
git add -A -- frontend/src frontend/GUIA_TICKET_7.md
git diff --cached --stat
# Solo después de revisar y probar los cambios:
git commit -m "feat(pages): implementar pantallas y formularios de IRON GYM (#7)"
git push
```

**No subir** `frontend/.env`, `node_modules`, `dist`, ni contraseñas reales.

Este avance no equivale todavía a un sistema desplegado ni a un backend probado. La integración y documentación finales corresponden al siguiente trabajo.
