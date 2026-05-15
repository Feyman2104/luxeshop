# Autenticación con Facebook

Implementación del login con Facebook usando **Firebase Authentication** + `FacebookAuthProvider`.

---

## 1. Crear App en Facebook Developers

1. Ir a [developers.facebook.com](https://developers.facebook.com) e iniciar sesión.
2. Click en **Mis apps** → **Crear app**.
3. Seleccionar tipo: **Consumidor** (o **Ninguno** si no aparece).
4. Ingresar nombre de la app (ej: `TuMejorVersionShop`) y correo de contacto.
5. Click **Crear app**.
6. En el dashboard de la app, ir a **Configuración → Básica**.
7. Anotar el **ID de la app** y el **Clave secreta de la app**.

---

## 2. Configurar OAuth en la App de Facebook

1. En el panel izquierdo buscar **Facebook Login** → **Configuración**.
2. En **URI de redireccionamiento de OAuth válidos** agregar:
   ```
   https://tu-mejor-version-shop.firebaseapp.com/__/auth/handler
   ```
3. Guardar cambios.

> Esta URI la proporciona Firebase. Se encuentra en Firebase Console → Authentication → Sign-in method → Facebook → modal de configuración.

---

## 3. Habilitar Facebook en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) → tu proyecto → **Authentication**.
2. Pestaña **Sign-in method** → click en **Facebook**.
3. Activar el toggle.
4. Pegar el **ID de la app** y la **Clave secreta** obtenidos en el paso 1.
5. Click **Guardar**.

---

## 4. Configuración del proveedor (`src/lib/firebase.js`)

```js
import { FacebookAuthProvider } from 'firebase/auth';

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  auth_type: 'reauthenticate',
  display: 'popup',
});

export const providers = { facebook: facebookProvider };
```

---

## 5. Login con popup (`signInWithPopup`)

```js
import { signInWithPopup } from 'firebase/auth';
import { auth, providers } from '../lib/firebase';

const result = await signInWithPopup(auth, providers.facebook);
const user = result.user;

// user.displayName → Nombre de Facebook
// user.email       → Correo (si el usuario lo compartió)
// user.photoURL    → Foto de perfil
```

**Archivo:** `src/hooks/useSocialAuth.js`

---

## 6. Flujo de autenticación

```
Usuario click "Continuar con Facebook"
  → signInWithPopup abre popup de Facebook
  → Usuario autoriza la app
  → Facebook devuelve token a Firebase
  → Firebase registra/actualiza el usuario
  → startSession(user, 'facebook') → Firestore(sessions)
  → navigate('/dashboard')
```

---

## 7. Estado de la App en Facebook

Para que usuarios externos puedan hacer login, la app de Facebook debe estar en **modo Live** (no modo desarrollo). Durante desarrollo solo pueden iniciar sesión los usuarios agregados como **Testers** o **Developers** en la app.

Para activar modo Live:
1. Facebook Developers → tu app → **Modo de la app** (arriba) → cambiar de **Desarrollo** a **Activo**.
2. Facebook puede pedir que completes información de privacidad y revisión.

---

## 8. Manejo de errores

| Código | Causa | Solución |
|--------|-------|----------|
| `auth/popup-blocked` | Popup bloqueado | Permitir popups en el navegador |
| `auth/account-exists-with-different-credential` | Email ya existe con otro proveedor | Usar proveedor original |
| `auth/operation-not-allowed` | Facebook no está habilitado en Firebase | Verificar configuración |
| `auth/invalid-credential` | App ID/Secret incorrectos | Verificar credenciales en Firebase Console |

---

## 9. Verificar en Firebase Console

1. **Authentication → Usuarios**: El usuario aparece con el ícono de Facebook.
2. **Firestore → sessions**: Nuevo documento con `method: "facebook"`.

---

## 10. Troubleshooting

- **"URL no permitida"**: Agregar la URL del proyecto en **Facebook Login → Configuración → URI de redireccionamiento válidos**.
- **"La app está en modo desarrollo"**: Solo testers registrados pueden iniciar sesión. Cambiar a modo Live o agregar el usuario como tester.
- **Email vacío**: Facebook no siempre comparte el email. El usuario puede tener `email: null` en Firebase.
