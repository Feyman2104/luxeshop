# Configuración de Firebase Storage (foto de perfil)

El modal "Cambiar foto de perfil" sube la imagen a Firebase Storage. Para que funcione hay que hacer **dos pasos manuales** en la consola de Firebase.

---

## A. Habilitar Storage

1. Ir a [Firebase Console](https://console.firebase.google.com/) → tu proyecto **Tu-mejor-version-shop**.
2. En el menú izquierdo: **Build → Storage**.
3. Click en **Comenzar / Get started**.
4. Cuando pregunte por reglas, deja la opción de **Modo de prueba** (lo cambiaremos en el paso B).
5. Selecciona la **misma región** que usaste para Firestore (por ejemplo `us-central1`).
6. Click **Listo**.

Esto crea el bucket `tu-mejor-version-shop.firebasestorage.app`.

---

## B. Publicar las reglas de Storage

1. En **Storage**, ir a la pestaña **Reglas**.
2. Borra todo el contenido y pega lo siguiente (el mismo contenido que el archivo [`storage.rules`](../storage.rules) en la raíz del repo):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

3. Click en **Publicar**.

### Qué hacen las reglas

- `read: if true` → cualquiera puede ver la foto de perfil (necesario para mostrarla en el dashboard sin estar autenticado todavía).
- `write: if request.auth != null && request.auth.uid == uid` → solo el dueño de la cuenta puede subir/cambiar su foto, y solo dentro de la carpeta `avatars/{su-uid}/`.

---

## (Opcional) Deploy con Firebase CLI

Si tienes la CLI instalada:

```bash
firebase login
firebase use tu-mejor-version-shop
firebase deploy --only storage
```

---

## Comprobación

1. En el dashboard, click en el avatar.
2. Elige una imagen JPG/PNG ≤ 2 MB → "Guardar foto".
3. Si todo funciona: el avatar de la sidebar se actualiza inmediatamente y la imagen aparece en Firebase Console → Storage → carpeta `avatars/{tu-uid}/`.
4. Si ves el error **"Firebase Storage rechazó la subida..."** significa que no completaste el paso A o B.
