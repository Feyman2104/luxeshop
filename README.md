# 🛍️ LuxeShop — E-commerce SPA

> Aplicación de comercio electrónico construida como SPA (Single Page Application) con React + Vite.

---

## 📋 Descripción del Proyecto

**LuxeShop** es una plataforma de e-commerce moderna que permite a los usuarios explorar productos, gestionar su cuenta y realizar compras en línea. Este repositorio contiene el frontend de la aplicación, desarrollado bajo la arquitectura SPA con React, incluyendo el sistema completo de autenticación de usuarios.

---

## 👤 Integrantes del Equipo

| Nombre | Rol | GitHub |
|--------|-----|--------|
| FEYMAN EDUARDO JOYA SERNA | Desarrollador Full-Stack | [@Feyman2104](https://github.com/Feyman2104/luxeshop/tree/main) |

---

## 📚 Documentación de Autenticación

| Proveedor | README |
|-----------|--------|
| Email / Contraseña | [docs/README-Email-Password.md](docs/README-Email-Password.md) |
| Google | [docs/README-Google.md](docs/README-Google.md) |
| Facebook | [docs/README-Facebook.md](docs/README-Facebook.md) |
| GitHub | [docs/README-GitHub.md](docs/README-GitHub.md) |

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.x | Framework de UI |
| **Vite** | 5.x | Bundler y servidor de desarrollo |
| **React Router DOM** | 6.x | Navegación SPA / Rutas |
| **Firebase Auth** | 12.x | Autenticación (Email, Google, Facebook, GitHub) |
| **Firebase Firestore** | 12.x | Base de datos (usuarios y sesiones) |
| **JavaScript (ES6+)** | — | Lenguaje principal |
| **CSS3** | — | Estilos y animaciones |

---

## 📁 Estructura del Proyecto

```
luxeshop/
├── public/
│   └── vite.svg
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx       # Vista de inicio de sesión
│   │   ├── RegisterPage.jsx    # Vista de registro de usuario
│   │   ├── ForgotPage.jsx      # Vista de recuperación de contraseña
│   │   ├── ResetPage.jsx       # Vista de restablecimiento de contraseña
│   │   └── auth.css            # Estilos compartidos de autenticación
│   ├── App.jsx                 # Componente raíz + configuración de rutas
│   └── main.jsx                # Punto de entrada de la aplicación
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | → Redirect | Redirige automáticamente a `/login` |
| `/login` | `LoginPage` | Inicio de sesión (email/pass + social) |
| `/register` | `RegisterPage` | Registro (guarda en Firestore `users`) |
| `/forgot-password` | `ForgotPage` | Envía email de recuperación real |
| `/reset-password` | `ResetPage` | Cambia contraseña con `oobCode` de Firebase |
| `/dashboard` | `DashboardPage` | Perfil del usuario autenticado |
| `/sessions` | `SessionsPage` | Historial de sesiones con buscador |

---

## ✅ Funcionalidades Implementadas

- [x] **LoginPage** — Validación de email y contraseña, modal de confirmación
- [x] **RegisterPage** — Validación de campos, confirmación de contraseña, indicador de fortaleza
- [x] **ForgotPage** — Validación de email, estado de envío exitoso
- [x] **ResetPage** — Doble validación de contraseña, medidor de fortaleza
- [x] Navegación fluida entre vistas con `react-router-dom`
- [x] Formularios controlados con `useState`
- [x] Modal de datos por formulario (sin conexión a backend)
- [x] Diseño responsivo (mobile + desktop)

---

## 🔗 Repositorio

[https://github.com/Feyman2104/luxeshop](https://github.com/Feyman2104/luxeshop)
