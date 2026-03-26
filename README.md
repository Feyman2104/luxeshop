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

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.x | Framework de UI |
| **Vite** | 5.x | Bundler y servidor de desarrollo |
| **React Router DOM** | 6.x | Navegación SPA / Rutas |
| **JavaScript (ES6+)** | — | Lenguaje principal |
| **CSS3** | — | Estilos y animaciones |
| **Google Fonts** | — | Tipografías (Cormorant Garamond, DM Sans) |

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
| `/login` | `LoginPage` | Formulario de inicio de sesión |
| `/register` | `RegisterPage` | Formulario de registro de nuevo usuario |
| `/forgot-password` | `ForgotPage` | Solicitud de recuperación de contraseña |
| `/reset-password` | `ResetPage` | Formulario para nueva contraseña |

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

[https://github.com/tu-usuario/luxeshop](https://github.com/tu-usuario/luxeshop)
