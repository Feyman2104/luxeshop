# GUÍA: Configuración de Jira y GitHub para el Proyecto LuxeShop

## PARTE 1 — GITHUB (Punto 2 de la evaluación)

### 1.1 Crear el repositorio en GitHub

1. Ve a https://github.com → botón **New repository**
2. Configura así:
   - **Repository name:** `luxeshop`
   - **Description:** `E-commerce SPA con React + Vite`
   - **Visibility:** Public
   - ✅ Add a README file
   - ✅ Add .gitignore → selecciona **Node**
3. Clic en **Create repository**

### 1.2 Estructura de ramas (branching strategy)

```
master          ← producción (rama principal protegida)
  └── develop   ← integración
        ├── feature/login-page
        ├── feature/register-page
        ├── feature/forgot-page
        └── feature/reset-page
```

**Comandos para crear las ramas:**

```bash
# Clonar el repositorio
git clone https://github.com/TU-USUARIO/luxeshop.git
cd luxeshop

# Crear rama develop desde master
git checkout -b develop
git push origin develop

# Crear ramas feature
git checkout -b feature/login-page develop
git push origin feature/login-page

git checkout develop
git checkout -b feature/register-page develop
git push origin feature/register-page

git checkout develop
git checkout -b feature/forgot-page develop
git push origin feature/forgot-page

git checkout develop
git checkout -b feature/reset-page develop
git push origin feature/reset-page
```

### 1.3 Flujo de trabajo con commits

Trabaja en cada feature con commits descriptivos:

```bash
# Ejemplo trabajando en LoginPage
git checkout feature/login-page

# Copia los archivos del proyecto aquí
# Luego agrega y commitea:
git add src/pages/LoginPage.jsx src/pages/auth.css
git commit -m "feat: add LoginPage with form validation and modal"
git push origin feature/login-page
```

**Convención de commits:**
```
feat: nueva funcionalidad
fix: corrección de bug
style: cambios de estilos
docs: documentación
refactor: refactorización
```

### 1.4 Crear Pull Requests (PR)

Una vez terminada cada feature:

1. Ve a GitHub → pestaña **Pull requests** → **New pull request**
2. **base:** `develop` ← **compare:** `feature/login-page`
3. Título: `feat: LoginPage - Formulario de inicio de sesión`
4. Descripción:
   ```
   ## Cambios realizados
   - Formulario controlado con useState
   - Validaciones: email, contraseña (min 6 chars)
   - Modal de confirmación con datos del formulario
   - Navegación a /register y /forgot-password
   
   ## Capturas
   [adjuntar screenshot]
   ```
5. Clic en **Create pull request** → luego **Merge pull request**

**Repite para cada feature.** Al final, crea un PR de `develop` → `master`.

### 1.5 Estructura de carpetas que debe verse en GitHub

```
luxeshop/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPage.jsx
│   │   ├── ResetPage.jsx
│   │   └── auth.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## PARTE 2 — JIRA (Punto 1 de la evaluación)

### 2.1 Crear el proyecto en Jira

1. Ve a https://www.atlassian.com/es/software/jira → **Pruébalo gratis**
2. Crea una cuenta con tu correo universitario
3. **Create project** → selecciona **Scrum**
4. **Project name:** `LuxeShop E-commerce`
5. **Project key:** `LUXE`

### 2.2 Integración GitHub ↔ Jira

1. En Jira: **Project settings** → **Integrations** → **GitHub**
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio `luxeshop`
4. ✅ Esto permite ver commits y PRs dentro de cada issue de Jira

**Cómo vincular un commit a Jira:**
```bash
# Incluye la clave del issue en el mensaje del commit
git commit -m "LUXE-1: feat: add LoginPage with form validation"
git commit -m "LUXE-2: feat: add RegisterPage with password strength"
```

### 2.3 Crear Épicas e Historias de Usuario

**Épica 1: Autenticación de Usuarios**
- Clave sugerida: `LUXE-1`

**Historias de Usuario bajo la épica:**

| Clave | Historia de Usuario | Criterios de Aceptación |
|-------|-------------------|------------------------|
| LUXE-2 | Como usuario, quiero iniciar sesión con email y contraseña para acceder a mi cuenta | Email válido, contraseña min 6 chars, redirige al home |
| LUXE-3 | Como usuario nuevo, quiero registrarme para crear una cuenta | Nombre, email, contraseña confirmada, min 8 chars |
| LUXE-4 | Como usuario, quiero recuperar mi contraseña olvidada via email | Email válido, mensaje de confirmación |
| LUXE-5 | Como usuario, quiero restablecer mi contraseña con un enlace seguro | Nueva contraseña, confirmación, min 8 chars |

**Tareas por historia (sub-tasks):**

Para LUXE-2 (LoginPage):
- [ ] Crear componente LoginPage.jsx
- [ ] Implementar formulario con useState
- [ ] Agregar validaciones de campos
- [ ] Implementar modal de confirmación
- [ ] Crear tests básicos

### 2.4 Configurar el Backlog y Tablero

1. **Backlog:** Ve a **Backlog** en Jira → arrastra las historias al Sprint 1
2. **Sprint 1:** Nombre `Sprint 1 - Autenticación`, duración 2 semanas
3. Clic en **Start Sprint**

**Tablero Kanban/Scrum:**
```
TO DO          IN PROGRESS      IN REVIEW        DONE
─────────      ───────────      ─────────        ────
LUXE-2         LUXE-3           —                —
LUXE-4
LUXE-5
```

A medida que trabajas, mueve las tarjetas según el avance.

### 2.5 Relacionar Commits con Issues

Cada vez que hagas commit en GitHub con la clave del issue (ej: `LUXE-2`), Jira mostrará automáticamente ese commit en el panel del issue. Para verlo:

1. Abre el issue `LUXE-2` en Jira
2. Scroll hacia abajo → sección **Development**
3. Verás los commits, branches y PRs relacionados

---

## RESUMEN DEL FLUJO COMPLETO

```
Jira (issue LUXE-2)
  → GitHub branch: feature/login-page
  → Commits con "LUXE-2: feat: ..."
  → Pull Request feature/login-page → develop
  → Merge a develop
  → (al finalizar sprint) Merge develop → master
  → En Jira: mover tarjeta a DONE
```
