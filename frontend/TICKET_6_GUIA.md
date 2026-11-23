# IRON GYM — Ticket #6: componentes reutilizables

**Responsable:** Uriel Eduardo Guzmán Ramírez  
**Rama:** `feat/frontend-ui`  
**Issue:** https://github.com/CarlosEnriqueGarciaUnda/IronGym-App/issues/6

## Antes de copiar

Este paquete es **incremental**. Debes tener ya instalado el Ticket #5 en el repositorio de Carlos y estar trabajando en su rama `feat/frontend-ui`.

No se reemplaza ni se modifica `backend/`. No se instala React de nuevo. El ZIP lleva una carpeta `frontend/` con nuevos componentes y modificaciones pequeñas en `App.jsx`, `main.jsx`, `LoginPage.jsx` y `RoleHome.jsx`.

## Explicación de cada componente

| Archivo | Qué hace |
| --- | --- |
| `src/components/Button.jsx` | Un botón con estilos `primary`, `secondary`, `danger` y estado de carga. |
| `src/components/FormInput.jsx` | Campo de formulario con etiqueta, mensaje de ayuda y error accesible bajo el input. |
| `src/components/Navbar.jsx` | Muestra el nombre, correo y rol del usuario autenticado; permite cerrar sesión. |
| `src/components/ModalConfirm.jsx` | Pide confirmación sin `window.confirm()`; admite Escape y navegación con teclado. |
| `src/components/TableCustom.jsx` | Muestra la respuesta de paginación `Page` de Spring Boot y comunica el cambio de página. **No pagina localmente**. |
| `src/styles/components.css` | Estilos negros/naranjas compartidos, adaptados a móvil. |
| `src/pages/ComponentesPreview.jsx` | **Solo modo desarrollo**: ejemplos visuales para probar los componentes sin backend. |

## Cómo instalar en tu PC (PowerShell)

Abre VS Code en `C:\Users\Acer\Music\IronGym`.

```powershell
cd "C:\Users\Acer\Music\IronGym"
$zip = "$env:USERPROFILE\Downloads\IRON_GYM_TICKET_6_COMPONENTES.zip"
Test-Path $zip
Expand-Archive -LiteralPath $zip -DestinationPath (Get-Location).Path -Force
cd frontend
npm run build
npm run dev
```

Si `Test-Path $zip` muestra `False`, localiza el ZIP y cambia esa ruta antes de extraerlo. Si la consola está en `frontend`, vuelve primero a la raíz con `cd ..`.

En el navegador abre:

- http://localhost:5173/login — el login ahora utiliza `FormInput` y `Button`.
- http://localhost:5173/componentes — vista de prueba de Ticket #6, **solo con `npm run dev`**.

La vista `/componentes` no se registra en producción. Sus nombres y filas son **ejemplos visuales**, no datos del gimnasio.

## Lo que falta hasta el Ticket #8

`TableCustom` espera un objeto con `content`, `number`, `totalPages` y `totalElements`, igual que Spring Data. En este ticket se construye el componente; la petición real `GET /api/...?...&page=...` y el manejo de filtros se implementarán en las pantallas de los siguientes tickets. Los botones de la vista previa no crean socios ni cobros.

## Pruebas antes del commit

- [ ] `npm run build` termina sin errores.
- [ ] `/login` muestra errores bajo el correo y la contraseña.
- [ ] `/componentes` abre en modo desarrollo.
- [ ] El botón de confirmación abre el modal; Cancelar y Escape lo cierran.
- [ ] La tabla muestra sus controles `Anterior` y `Siguiente` y comunica el número de página solicitado.
- [ ] La vista es utilizable en el ancho de un celular.
- [ ] `git status` muestra únicamente cambios relacionados con el frontend.
- [ ] El listado de archivos preparados no incluye `.env`, `node_modules/`, `dist/` ni archivos del backend.

## Cuando pruebes los componentes: commit #6

Desde la raíz de `IronGym` (o usa estas rutas relativas desde la raíz):

```powershell
git branch --show-current
git status
git add frontend/src frontend/TICKET_6_GUIA.md
git diff --cached --stat
git commit -m "feat(ui): crear componentes reutilizables para IRON GYM (#6)"
git push
```

El issue #6 se puede vincular al commit con `(#6)`, pero **no se cierra automáticamente**. Cierra los issues solo después de probar la funcionalidad. Si aún no tienes permisos para editar el tablero, Carlos podrá ayudarte a actualizar la columna.
