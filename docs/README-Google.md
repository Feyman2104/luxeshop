# Autenticación con Google

Implementación del login con Google usando **Firebase Authentication** + `GoogleAuthProvider`.

---

## 1. Habilitar Google en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) → tu proyecto → **Authentication**.
2. Pestaña **Sign-in method** → click en **Google**.
3. Activar el toggle.
4. Ingresar un **correo de soporte del proyecto** (requerido por Google).
5. Click **Guardar**.

> Firebase configura automáticamente el OAuth Client ID usando las credenciales del proyecto. No necesitas crear una app en Google Cloud Console manualmente.

---

## 2. Configuración del proveedor (`src/lib/firebase.js`)

```js
import { GoogleAuthProvider } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

// Forzar la pantalla de selección de cuenta aunque el usuario ya esté logueado
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const providers = { google: googleProvider };
```

---

## 3. Login con popup (`signInWithPopup`)

```js
import { signInWithPopup } from 'firebase/auth';
import { auth, providers } from '../lib/firebase';

const result = await signInWithPopup(auth, providers.google);
const user = result.user;

// user.displayName  → Nombre de la cuenta Google
// user.email        → Correo Gmail
// user.photoURL     → Foto de perfil
// user.uid          → ID único en Firebase
```

**Archivo:** `src/hooks/useSocialAuth.js`

---

## 4. Flujo de autenticación

```
Usuario click "Continuar con Google"
  → signInWithPopup abre popup de Google
  → Usuario selecciona su cuenta Google
  → Google devuelve credenciales a Firebase
  → Firebase registra/actualiza el usuario en Authentication
  → result.user disponible en la app
  → startSession(user, 'google') → Firestore(sessions)
  → navigate('/dashboard')
```

---

## 5. Manejo de errores

| Código | Causa | Solución |
|--------|-------|----------|
| `auth/popup-blocked` | Navegador bloqueó el popup | Permitir popups para el sitio |
| `auth/popup-closed-by-user` | Usuario cerró el popup | Volver a intentar |
| `auth/account-exists-with-different-credential` | El email ya tiene cuenta con otro proveedor | Usar el proveedor original |
| `auth/cancelled-popup-request` | Múltiples popups abiertos | Solo un popup a la vez |
| `auth/network-request-failed` | Sin conexión | Verificar internet |

---

## 6. Verificar en Firebase Console

Después de un login exitoso:

1. **Authentication → Usuarios**: El usuario aparece con el ícono de Google.
2. La columna **Proveedores** muestra `G` (Google).
3. **Firestore → sessions**: Nuevo documento con `method: "google"`.

---

## 7. Troubleshooting

- **Dominio no autorizado**: Si el popup dice "dominio no autorizado", ir a Firebase Console → Authentication → Settings → Authorized domains y agregar `localhost`.
- **Error en producción**: Agregar el dominio de producción en Authorized domains.
- **Facebook/GitHub tienen prioridad**: Si el usuario ya existe con esa cuenta, Firebase la vincula automáticamente al proveedor correcto.
