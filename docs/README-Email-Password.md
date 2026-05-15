# Autenticación con Email y Contraseña

Implementación de autenticación con correo electrónico y contraseña usando **Firebase Authentication** en el proyecto **Tu Mejor Versión Shop**.

---

## 1. Habilitar el proveedor en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com) → tu proyecto → **Authentication**.
2. Click en la pestaña **Sign-in method**.
3. Click en **Email/Password**.
4. Activar el primer toggle (**Email/Password**) y guardar.

> El segundo toggle (**Email link / passwordless**) es opcional; para este proyecto se deja desactivado.

---

## 2. Instalación del SDK

```bash
npm install firebase
```

El proyecto ya incluye Firebase. No se requiere instalación adicional.

---

## 3. Inicialización (`src/lib/firebase.js`)

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

Las credenciales se guardan en `.env.local` (nunca se suben al repositorio).

---

## 4. Registro de usuario (`createUserWithEmailAndPassword`)

```js
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const cred = await createUserWithEmailAndPassword(auth, email, password);

// Agregar displayName
await updateProfile(cred.user, { displayName: name });

// Guardar en Firestore
await setDoc(doc(db, 'users', cred.user.uid), {
  uid:       cred.user.uid,
  name,
  email,
  createdAt: serverTimestamp(),
});
```

**Archivo:** `src/pages/RegisterPage.jsx`

---

## 5. Inicio de sesión (`signInWithEmailAndPassword`)

```js
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

const cred = await signInWithEmailAndPassword(auth, email, password);
// cred.user contiene uid, email, displayName, etc.
```

**Errores comunes:**

| Código | Significado |
|--------|-------------|
| `auth/user-not-found` | No existe el correo |
| `auth/wrong-password` | Contraseña incorrecta |
| `auth/invalid-credential` | Credenciales inválidas (Firebase v10+) |
| `auth/too-many-requests` | Cuenta bloqueada temporalmente |

**Archivo:** `src/pages/LoginPage.jsx`

---

## 6. Recuperación de contraseña (`sendPasswordResetEmail`)

Firebase envía un correo con un enlace que incluye un `oobCode` (one-time code).

```js
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

await sendPasswordResetEmail(auth, email);
// Firebase envía el email automáticamente
```

**Archivo:** `src/pages/ForgotPage.jsx`

---

## 7. Restablecer contraseña (`confirmPasswordReset`)

El enlace del correo redirige a `/reset-password?oobCode=XXX&mode=resetPassword`.

```js
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const oobCode = searchParams.get('oobCode');

// Verificar que el código es válido
await verifyPasswordResetCode(auth, oobCode);

// Aplicar la nueva contraseña
await confirmPasswordReset(auth, oobCode, newPassword);
```

**Archivo:** `src/pages/ResetPage.jsx`

---

## 8. Cierre de sesión (`signOut`)

```js
import { signOut } from 'firebase/auth';
await signOut(auth);
```

---

## 9. Flujo completo

```
Register → createUserWithEmailAndPassword → Firestore(users) → Dashboard
Login    → signInWithEmailAndPassword     → Firestore(sessions) → Dashboard
Forgot   → sendPasswordResetEmail         → Correo con link
Reset    → oobCode en URL → confirmPasswordReset → Login
Logout   → endSession (Firestore) → signOut → /login
```

---

## 10. Troubleshooting

- **`auth/email-already-in-use`**: El correo ya tiene cuenta. Usar Login o recuperar contraseña.
- **`auth/weak-password`**: Firebase exige mínimo 6 caracteres (el UI valida 8).
- **`auth/invalid-action-code`**: El `oobCode` expiró o ya fue usado. Solicitar nuevo correo.
- **Correo no llega**: Revisar spam. El remitente es `noreply@tu-mejor-version-shop.firebaseapp.com`.
- **Reglas de Firestore**: La colección `users` requiere que el usuario esté autenticado para escribir.
