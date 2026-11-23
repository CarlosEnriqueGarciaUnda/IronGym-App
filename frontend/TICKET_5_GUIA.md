# IRON GYM — Ticket #5: React Router + Axios + JWT

**Responsable:** Uriel Eduardo Guzmán Ramírez  
**Rama:** `feat/frontend-ui`  
**Issue:** https://github.com/CarlosEnriqueGarciaUnda/IronGym-App/issues/5

## Qué construimos

| Archivo | Responsabilidad |
| --- | --- |
| `src/main.jsx` | Monta React en `index.html`. |
| `src/App.jsx` | Define las rutas públicas y protegidas. |
| `src/context/AuthContext.jsx` | Login, cierre de sesión, perfil y roles. |
| `src/routes/ProtectedRoute.jsx` | Bloquea rutas de usuarios sin sesión o rol. |
| `src/services/api.js` | Axios, URL del backend, JWT y mensajes de error. |
| `src/pages/LoginPage.jsx` | Formulario funcional con validación bajo cada campo. |
| `src/pages/RoleHome.jsx` | Panel inicial para probar cada rol. Los CRUD vendrán después. |
| `src/styles/base.css` | Estilo oscuro/naranja y diseño adaptable a móvil. |

## Contrato real del backend de Carlos

- `POST /api/auth/login` recibe `{ "email": "...", "password": "..." }`.
- Devuelve `{ "token": "...", "user": { "id": 1, "name": "...", "email": "...", "roles": ["ADMIN"] } }`.
- `GET /api/auth/me` obtiene los datos actuales del usuario usando `Authorization: Bearer <token>`.
- `POST /api/auth/logout` invalida el token en el servidor.
- Los roles son **ADMIN, ENTRENADOR y SOCIO**; los verifica también Spring Security.

## Cómo instalar este cambio

1. Extrae el ZIP **en la raíz `C:\Users\Acer\Music\IronGym`**, no dentro de `frontend/`.
2. Verifica que exista `frontend/src/main.jsx` y `frontend/src/App.jsx`.
3. En terminal de VS Code:

```powershell
cd "C:\Users\Acer\Music\IronGym"
git branch --show-current
cd frontend
Copy-Item .env.example .env
npm run dev
```

4. Abre http://localhost:5173. Debe aparecer el formulario incluso sin backend.
5. Para iniciar sesión es necesario encender **Spring Boot y MySQL**. Con backend apagado, el frontend muestra un mensaje de conexión.
6. Para volver a la raíz de Git, usa `cd ..`.

## Pruebas que debo realizar antes de subir el commit

- [ ] Abre el login sin errores de Vite.
- [ ] Muestra errores bajo correo y contraseña cuando faltan datos.
- [ ] Si el backend está apagado, muestra un mensaje claro de conexión.
- [ ] Con backend encendido, login devuelve un token válido y abre `/panel`.
- [ ] Con un usuario SOCIO, la ruta `/admin` redirige a `/sin-acceso`.
- [ ] Si no tengo sesión, abrir `/panel` redirige a `/login`.
- [ ] Cerrar sesión elimina el token y el backend lo invalida.
- [ ] La vista de celular no se desborda horizontalmente.

## Cómo hacer el primer commit (solo DESPUÉS de probar)

```powershell
git status
git diff --stat
git add frontend/src frontend/.env.example frontend/TICKET_5_GUIA.md frontend/package-lock.json
git diff --cached --stat
git commit -m "feat(ui): configurar React Router, rutas por rol y cliente Axios JWT (#5)"
git push -u origin feat/frontend-ui
```

**Seguridad:** `sessionStorage` guarda el JWT solo durante la pestaña/sesión del navegador; no lo incluyas jamás en commits ni capturas. En producción se recomienda una estrategia de sesión más robusta frente a XSS. El backend continúa siendo la autoridad final sobre los roles.

**Nota:** Este Ticket #5 **no** contiene todavía páginas CRUD terminadas, registro completo ni comunicaciones reales. Eso pertenece a fases posteriores y requiere el backend funcionando.
