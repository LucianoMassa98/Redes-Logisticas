# Frontend — Plataforma de Captación y Gestión Comercial de Leads

Aplicación web desarrollada con **React 19**, **Vite**, **Tailwind CSS**, **React Router v7**, **Lucide Icons** y **React Hook Form**.

Integra una landing page pública comercial de alta conversión y un panel administrativo privado con métricas en tiempo real, gestión de estados comerciales y trazabilidad de contactos.

---

## 1. Arquitectura y Estructura del Proyecto

```text
frontend/
├── src/
│   ├── config/             # Configuración de negocio, placeholders y constantes
│   ├── context/            # AuthContext con gestión de sesión y roles
│   ├── services/           # Clientes HTTP (Axios) para leads, auth, catálogo y dashboard
│   ├── components/
│   │   ├── common/         # Navbar, Footer, StatusBadge, Modales de Privacidad
│   │   ├── landing/        # Hero, Catálogo (5 servicios), Clientes, Formulario, FAQ
│   │   └── admin/          # Layout, Tablas con filtros, Pipeline de estados
│   ├── pages/
│   │   ├── LandingPage.jsx # Página de aterrizaje pública orientada a conversión
│   │   └── admin/          # Login, Dashboard comercial, Lista de leads y Detalle
│   ├── routes/             # AppRoutes con protección de rutas y barreras de rol
│   ├── App.jsx             # Contenedor raíz con proveedores de contexto
│   ├── index.css           # Directivas Tailwind, glassmorphism y estilos base
│   └── main.jsx            # Punto de entrada React 19
├── public/                 # Iconos y recursos estáticos
├── .env.example            # Plantilla de variables de entorno
├── tailwind.config.js      # Paleta de colores tecnológica y tipografía
├── vite.config.js          # Configuración del bundler Vite
├── package.json            # Dependencias y scripts npm
└── README.md
```

---

## 2. Requisitos Previos

- **Node.js**: v18.0.0 o superior (recomendado v22+).
- **npm** o gestor compatible.
- **Backend API**: En ejecución o con URL configurada.

---

## 3. Configuración de Variables de Entorno

Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base de los endpoints REST del backend | `http://localhost:4000/api/v1` |
| `VITE_COMPANY_NAME` | Nombre comercial de la empresa | `TechConnect & Seguridad` |
| `VITE_COMPANY_SLOGAN` | Lema comercial | `Seguridad electrónica y conectividad` |
| `VITE_COMPANY_PHONE` | Teléfono visible para llamadas | `+54 9 11 0000-0000` |
| `VITE_WHATSAPP_NUMBER` | Número de WhatsApp internacional para chat directo | `5491100000000` |
| `VITE_COMPANY_EMAIL` | Correo de contacto comercial | `contacto@serviciostecnologicos.com` |
| `VITE_COMPANY_ADDRESS` | Dirección comercial | `Av. Principal 1234, Of. 2B` |
| `VITE_DEFAULT_LOCALITY`| Localidad o ciudad de cabecera | `Córdoba` |

---

## 4. Comandos de Ejecución

- **Iniciar servidor de desarrollo**:
  ```bash
  npm run dev
  ```
  La aplicación estará disponible en `http://localhost:5173`.

- **Compilar para producción (Build)**:
  ```bash
  npm run build
  ```
  Genera el bundle optimizado en la carpeta `dist/`.

- **Previsualizar la compilación de producción**:
  ```bash
  npm run preview
  ```

---

## 5. Funcionalidades Principales

### 5.1. Landing Page Pública (`/`)
- **Hero Comercial**: Título de alto impacto, propuesta de valor y accesos rápidos.
- **Catálogo de 5 Servicios**:
  1. *Cámaras de seguridad cableadas* (DVR/NVR, cable estructurado, monitoreo en app móvil).
  2. *Cámaras con paneles solares* (100% autónomas para campos, galpones y tranqueras).
  3. *Internet satelital Starlink* (Anclajes y soportes en altura, pasamuros sellados y red local).
  4. *Televisión y streaming* (Smart TV, dongles y optimización de redes).
  5. *Redes y conectividad* (Cableado Ethernet Gigabit, Wi-Fi Mesh y eliminación de zonas muertas).
  - Cada tarjeta cuenta con el botón *"Solicitar información"*, el cual desplaza suavemente la vista y preselecciona dicho servicio en el formulario.
- **Clientes Objetivo**: Soluciones para Hogares, Locales comerciales, Oficinas, Hoteles y Campos.
- **Formulario de Captación de Leads**:
  - Validación antes del envío con React Hook Form.
  - Soporte de teléfonos argentinos e internacionales.
  - Multi-selección interactiva de servicios.
  - Geolocalización voluntaria opcional con advertencia de privacidad.
  - Protección anti-doble envío y feedback de carga.
  - Pantalla de confirmación con **Identificador de Solicitud (Lead ID)** y botón de WhatsApp con mensaje prearmado.
- **Transparencia y Legal**: Modal de Política de Privacidad completo y accesible.

### 5.2. Panel Administrativo Privado (`/admin`)
- **Acceso Autenticado**: Pantalla de login segura con refresh token en cookies `HttpOnly`.
- **Dashboard**: Indicadores en tiempo real (Total leads, nuevos, en contacto, presupuestos enviados, ganados, descartados, últimos 7 y 30 días, y barras de distribución por servicio).
- **Listado y Filtros**: Búsqueda por nombre y teléfono, filtros combinables por estado, servicio, localidad, tipo de cliente y rango de fechas, con paginación en servidor.
- **Exportación CSV**: Descarga en un click de los leads filtrados con BOM UTF-8 para Excel.
- **Detalle Integral del Lead**:
  - Botones de acción directa para abrir WhatsApp o iniciar llamada.
  - Stepper interactivo para transiciones de estado (`NEW` → `CONTACTED` → `QUALIFIED` → `VISIT_SCHEDULED` → `QUOTE_SENT` → `WON` / `LOST`).
  - Hilo de notas internas confidenciales con autor y fecha.
  - Línea de tiempo de auditoría con registro de cada cambio comercial.
  - Reasignación de operador comercial responsable.
  - Edición completa de datos de contacto y ubicación.
- **Gestión de Usuarios**: Creación de operadores y asignación de roles (`ADMIN` / `COMMERCIAL`).
