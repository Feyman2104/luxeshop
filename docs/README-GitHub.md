# Autenticación con GitHub

Implementación del login con GitHub usando **Firebase Authentication** + `GithubAuthProvider`.

---

## 1. Crear OAuth App en GitHub

1. Ir a [github.com](https://github.com) → tu perfil → **Settings**.
2. En la barra lateral izquierda, bajar hasta **Developer settings** → **OAuth Apps**.
3. Click en **New OAuth App**.
4. Completar el formulario:
   - **Application name**: `Tu Mejor Versión Shop`
   - **Homepage URL**: `http://localhost:5176` (en desarrollo)
   - **Authorization callback URL**:
     ```
     https://tu-mejor-version-shop.firebaseapp.com/__/auth/handler
     ```
5. Click **Register application**.
6. En la página de la app creada, anotar el **Client ID**.
7. Click **Generate a new client secret** y anotar el **Client Secret**.

> La **Authorization callback URL** la proporciona Firebase. Se encuentra en Firebase Console → Authentication → Sign-in method → GitHub → modal de configuración.

---

## 2. Habilitar GitHub en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) → tu proyecto → **Authentication**.
2. Pestaña **Sign-in method** → click en **GitHub**.
3. Activar el toggle.
4. Pegar el **Client ID** y el **Client Secret** obtenidos en el paso 1.
5. Click **Guardar**.

---

## 3. Configuración del proveedor (`src/lib/firebase.js`)

```js
import { GithubAuthProvider } from 'firebase/auth';

const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({ allow_signup: 'true' });

export const providers = { github: githubProvider };
```

El parámetro `allow_signup: 'true'` permite que usuarios sin cuenta GitHub se registren durante el flujo de OAuth.

---

## 4. Login con popup (`signInWithPopup`)

```js
import { signInWithPopup } from 'firebase/auth';
import { auth, providers } from '../lib/firebase';

const result = await signInWithPopup(auth, providers.github);
const user = result.user;

// user.displayName → Username de GitHub
// user.email       → Correo (si es público en GitHub)
// user.photoURL    → Avatar de GitHub
```

**Archivo:** `src/hooks/useSocialAuth.js`

---

## 5. Flujo de autenticación

```
Usuario click "Continuar con GitHub"
  → signInWithPopup abre popup de GitHub
  → GitHub pide autorizar la app OAuth
  → Usuario autoriza → GitHub devuelve code
  → Firebase intercambia code por token
  → Firebase registra/actualiza el usuario
  → startSession(user, 'github') → Firestore(sessions)
  → navigate('/dashboard')
```

---

## 6. Manejo de errores

| Código | Causa | Solución |
|--------|-------|----------|
| `auth/popup-blocked` | Popup bloqueado | Permitir popups en el navegador |
| `auth/popup-closed-by-user` | Usuario cerró el popup | Volver a intentar |
| `auth/account-exists-with-different-credential` | Email ya tiene cuenta con otro proveedor | Usar proveedor original |
| `auth/invalid-credential` | Client ID/Secret incorrectos | Verificar en Firebase Console |

---

## 7. Verificar en Firebase Console

1. **Authentication → Usuarios**: El usuario aparece con el ícono de GitHub.
2. **Firestore → sessions**: Nuevo documento con `method: "github"`.

---

## 8. Scopes adicionales (opcional)

Para solicitar acceso al email privado de GitHub:

```js
githubProvider.addScope('user:email');
```

Por defecto, GitHub solo comparte el email si está configurado como público en el perfil.

---

## 9. Troubleshooting

- **"redirect_uri_mismatch"**: La Authorization callback URL en GitHub OAuth App no coincide con la de Firebase. Copiar exactamente la URL que muestra Firebase Console.
- **Email vacío**: Si el usuario tiene su email privado en GitHub, `user.email` será `null`. Usa `user.displayName` como identificador.
- **Callback URL en producción**: Al desplegar, actualizar la **Homepage URL** y agregar la URL de producción como callback en la OAuth App de GitHub.
- **Client Secret expirado**: GitHub permite regenerar el secret. Actualizar el nuevo valor en Firebase Console.
