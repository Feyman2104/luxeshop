# Configuración de Firestore y Firebase Console

Esta guía resuelve dos problemas conocidos del proyecto:

1. **El dashboard solo muestra la sesión del proveedor actual** (al entrar con Google se ve la de Google, al cambiar a Facebook desaparece la de Google).
2. **El registro con email y contraseña dice "El registro está deshabilitado"**.

Ambos se arreglan en la consola de Firebase, no en el código.

---

## A. Aplicar reglas de Firestore (resuelve el problema #1)

### Causa

Cuando el mismo usuario humano entra con Google y luego con Facebook, Firebase Authentication les asigna **uids distintos** (uno por proveedor). Si las reglas de Firestore filtran lecturas por `request.auth.uid == resource.data.uid`, cada sesión solo es visible para el uid que la creó. Por eso al cambiar de proveedor "desaparecen" las sesiones anteriores.

### Solución

El dashboard está pensado como un **registro global de actividad** ("Actividad en tiempo real de todos los usuarios"). Las reglas deben permitir que cualquier usuario autenticado **lea** todas las sesiones, pero solo pueda **crear/actualizar** las suyas.

### Pasos

1. Ir a [Firebase Console](https://console.firebase.google.com/) → tu proyecto → **Firestore Database** → pestaña **Reglas**.
2. Reemplazar todo el contenido por el del archivo [`firestore.rules`](../firestore.rules) en la raíz del repo.
3. Click en **Publicar**.

### (Opcional) Deploy con Firebase CLI

Si tienes la CLI instalada:

```bash
firebase login
firebase use tu-mejor-version-shop
firebase deploy --only firestore:rules
```

---

## B. Habilitar Email/Password (resuelve el problema #2)

### Causa

El error `auth/operation-not-allowed` que aparece al registrarse significa que el proveedor **Email/Password** está deshabilitado en tu proyecto de Firebase. No es un bug del código — Firebase rechaza cualquier `createUserWithEmailAndPassword` cuando ese método está apagado.

### Pasos

1. Ir a [Firebase Console](https://console.firebase.google.com/) → tu proyecto → **Authentication** → pestaña **Sign-in method**.
2. Click en **Email/Password** en la lista de proveedores.
3. Activar el toggle **Enable**.
4. (Opcional, no recomendado para SOA) activar también "Email link (passwordless sign-in)".
5. Click en **Save**.

Después de guardar, el formulario de registro debe funcionar normalmente.

---

## Comprobación

1. Habilita Email/Password (paso B).
2. Publica las reglas (paso A).
3. En el navegador:
   - Cierra sesión completamente.
   - Entra con Google → ves tu tarjeta Google ● Activa.
   - Cierra sesión.
   - Entra con Facebook → ahora deben verse **AMBAS**: la de Google (Finalizada) y la de Facebook (Activa).
   - Repite con GitHub y email/password — el contador "Sesiones totales" debe ir subiendo.
