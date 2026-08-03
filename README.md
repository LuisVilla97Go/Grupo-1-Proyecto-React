# 🛒 Proyecto Grupo 01 E-commerce - Frontend (Grupo 01-G32)

Bienvenido al repositorio oficial del frontend desarrollado por el **Grupo 01-G32**. Este proyecto es un sistema web de extremo a extremo que unifica una moderna **Tienda Virtual (E-commerce)** orientada a la conversión de clientes, con un potente **Panel de Control Administrativo (Dashboard & POS)** diseñado para la gestión comercial, control de inventario y análisis financiero en tiempo real.

---

## 🚀 Tecnologías y Justificación Técnica

Para garantizar un código limpio, escalable y una experiencia de usuario premium, hemos diseñado nuestra arquitectura sobre el siguiente _Stack Tecnológico_ (incluyendo herramientas adicionales avanzadas no vistas en clase):

- **Framework de UI:** React 19 (con TypeScript). _Justificación:_ TypeScript evita errores en tiempo de ejecución al tipar estrictamente nuestros modelos de datos (Productos, Ventas, Usuarios), garantizando que el sistema sea predecible y libre de fallos por datos indefinidos.
- **Empaquetador (Build Tool):** Vite 8. _Justificación:_ Proporciona un entorno de desarrollo extremadamente rápido con Hot Module Replacement (HMR) y nos permitió configurar un _Middleware local_ para simular una base de datos física persistente.
- **Gestor de Paquetes:** pnpm. _Justificación:_ A diferencia de npm o yarn, pnpm usa un sistema de almacenamiento global y enlaces duros que ahorra drásticamente espacio en disco y acelera las instalaciones.
- **Manejo de Estado Global:** Context API (`StoreContext`, `AuthContext`). _Justificación:_ Proporciona una solución nativa y ligera para mantener la sesión del usuario y el carrito accesibles globalmente, evitando el "prop drilling" sin la sobrecarga y complejidad que requeriría Redux.
- **Estilos (No visto en clase):** Tailwind CSS 4. _Justificación:_ Metodología "utility-first" que nos permitió maquetar interfaces responsivas y de diseño premium (glassmorphism, gradientes, animaciones) directamente en JSX sin necesidad de mantener y organizar múltiples archivos CSS externos.
- **Enrutamiento:** React Router v7. _Justificación:_ Estándar actual de la industria para construir Single Page Applications (SPAs), permitiéndonos crear tanto rutas públicas (`/cart`) como rutas privadas protegidas para administración (`/admin`).
- **Formularios y Validación (No visto en clase):** React Hook Form + Zod. _Justificación:_ React Hook Form mejora el rendimiento al evitar re-renderizados innecesarios en cada tecla presionada. Zod complementa validando los datos con esquemas estrictos (ej. asegurar que el stock o precio no sean negativos) antes de enviarlos a la base de datos.
- **Visualización de Datos (No visto en clase):** Recharts. _Justificación:_ Componentes de gráficos SVG declarativos que transforman los datos de ventas crudos en métricas visuales comprensibles y dinámicas dentro del Dashboard administrativo.
- **Notificaciones / Toasts (No visto en clase):** Sonner. _Justificación:_ Un sistema moderno de notificaciones que reemplaza los clásicos y bloqueantes `alert()`, ofreciendo feedback visual apilable y animado sin interrumpir el flujo de trabajo del usuario.
- **Iconografía:** Lucide React. _Justificación:_ Colección de íconos vectoriales consistentes y altamente personalizables directamente mediante props, lo que mantiene el bundle final muy ligero.

---

## 🔐 Acceso Administrativo (Rol: Administrador)

Para evaluar el sistema administrativo y el Punto de Venta (POS), acceda a través de la ruta protegida:

- **URL de Acceso:** `/login`

**Credenciales de Ingreso Disponibles:**

- **Usuario:** `Pfernandez` | **Contraseña:** `Pfernandez` _(Pedro Fernández)_
- **Usuario:** `Dminaya` | **Contraseña:** `Dminaya` _(Donatto Minaya)_
- **Usuario:** `Lvillavicencio` | **Contraseña:** `Lvillavicencio` _(Luis Villavicencio)_

---

## ✨ Características y Funcionalidades Clave

### 1. Tienda Virtual (E-commerce)

- **Catálogo Dinámico y Precios de Oferta:** Renderizado automático de productos activos (`status === "published"`). Soporte nativo para "Precios Comparativos" (descuentos visuales tachados) manteniendo en privado el verdadero costo operativo del producto.
- **Experiencia de Compra (Cart & Checkout):** Layout premium a dos columnas con un resumen de carrito inteligente (sticky). Incluye una pasarela de pago simulada que soporta múltiples métodos (Efectivo, Tarjeta, Yape/Plin, Contraentrega) mediante flujos modales interactivos.
- **Logística "Contraentrega" Integrada:** Cuando un cliente selecciona pago Contraentrega, el sistema requiere obligatoriamente capturar sus **Datos de Envío** (Nombre y Dirección exacta), información que viaja directamente al panel del administrador para procesar el despacho.
- **Sincronización Transaccional:** Los pedidos realizados en la web impactan instantáneamente el inventario y se registran en el panel administrativo bajo la auditoría de **`Cliente Web / Ecommerce`**. Todo el carrito de compras es persistente, evitando pérdidas de información ante recargas accidentales.

### 2. Panel de Gestión Integral (`/admin`)

- **Dashboard Financiero:** Módulo de resumen con métricas clave del negocio y gráficos interactivos de ingresos por categoría y métodos de pago.
- **Punto de Venta (POS) Físico Rediseñado:** Panel de compras en vivo para sucursales físicas. Cuenta con un indicador de cantidad agregada sobre la foto de cada producto y alertas visuales de "Poco Stock".
- **Gestión de Caja en Tiempo Real:** Métricas agregadas al instante que muestran el **Total Recaudado**, **Ventas Procesadas** y el **Ticket Promedio** de la sesión. El historial de ventas muestra claramente la dirección de entrega de los pedidos web.
- **Trazabilidad de Ventas e IDs Secuenciales:** El sistema de persistencia genera **IDs secuenciales predecibles** (`prod-4`, `5`) en lugar de UUIDs aleatorios, manteniendo limpia la estructura de la base de datos simulada. Las ventas poseen identificadores únicos formateados con hashtag (ej: `#sale-739bdc08`) que incluyen el desglose completo de productos adquiridos.
- **Clonación Rápida de Inventario:** Capacidad de duplicar productos existentes con un solo clic. El clon genera automáticamente un nuevo SKU único y se establece en modo "Borrador" por seguridad, acelerando la carga masiva de catálogos.
- **Seguridad Perimetral:** Ruta protegida mediante el `AuthContext`. Redirección automática a `/login` ante intentos de acceso sin sesión activa.

### 3. Sistema de Notificaciones en Tiempo Real

- Panel desplegable centralizado (`NotificationsPopover.tsx`) para visualizar la actividad reciente del negocio.
- Generación automática de notificaciones persistidas en `notifications.json` tras cada venta web, venta física o modificación crítica del inventario.
- Control individual y general del estado de lectura, respaldado por un indicador numérico dinámico en la barra de navegación superior.

### 4. Arquitectura y Rendimiento

- **Arquitectura Limpia (Clean Architecture):** Lógica de negocio e interfaces (UI) estrictamente separadas. Por ejemplo, los gráficos complejos y las analíticas están aisladas en la carpeta `src/components/charts/` para evitar la sobrecarga del código del Dashboard.
- **Prevención de Errores (Doble Submit):** Formularios y modales protegidos contra envíos múltiples accidentales mediante estados bloqueantes y feedback visual interactivo (spinners).
- **Optimización de Renderizado:** Uso avanzado de memoización (`useMemo`) para el cálculo de grandes volúmenes de datos en las tablas de inventario y balances financieros, asegurando transiciones instantáneas sin "lag".
- **Diseño 100% Responsivo:** Interfaz adaptable a cualquier dispositivo móvil. Incluye una barra de navegación lateral colapsable para escritorio, atajos rápidos entre tienda y panel, y un menú tipo _Drawer_ deslizable para celulares y tablets.

### 5. Base de Datos Local Física y Compatibilidad Serverless (Vercel)

- El servidor de desarrollo de Vite fue configurado y extendido para actuar como un **micro-backend local**, interceptando las llamadas de guardado (`/api/save-*`).
- Esta innovación permite modificar físicamente y en tiempo real los archivos `.json` ubicados en `public/api/` (agregando, editando o eliminando productos, categorías o transacciones), **cumpliendo estrictamente con el requisito de consumo de APIs externas**.
- El sistema es "Production-ready" e "Inmortal": Si se despliega como frontend estático en plataformas en la nube sin sistema de archivos (como **Vercel**), la capa de persistencia prioriza automáticamente el `localStorage`, garantizando sincronización en tiempo real entre el POS y el E-commerce, sin sufrir pérdida de datos al recargar la página.

---

## 🛠️ Instalación y Configuración (Uso Estricto de `pnpm`)

1. Instala las dependencias del proyecto:
   ```bash
   pnpm install
   ```
2. Ejecuta el servidor de desarrollo local:
   ```bash
   pnpm dev
   ```
3. Construye el proyecto para producción y comprueba los tipos de TypeScript:
   ```bash
   pnpm build
   ```
   > **💡 Nota Técnica sobre Producción (Carpeta `dist`):**
   > Al ejecutar `pnpm build`, Vite escanea todo nuestro código fuente (`src`), compila TypeScript a JavaScript nativo, y purga Tailwind CSS eliminando las miles de clases no utilizadas. El resultado final se comprime, ofusca y se guarda en la carpeta **`dist`** (Distribution). Esta carpeta contiene el producto final puro que el navegador entiende, y es la única que subimos a servidores en la nube como Vercel o Hostinger.

## 📁 Arquitectura de Carpetas y Diccionario de Archivos

La estructura del proyecto sigue una arquitectura basada en la Separación de Preocupaciones (Separation of Concerns) y alineada al dominio de negocio:

```text
c:\dash_tienda/
├── public/                       # Archivos estáticos servidos por Vite
│   ├── api/                      # Archivos JSON leídos por el cliente (GET)
│   └── favicon.svg
├── scripts/                      # Scripts de automatización (sincronización de datos)
│   └── sync-data.js
├── server/
│   └── data/                     # Base de Datos Local Física (DevSecOps)
│       ├── categories.json
│       ├── notifications.json
│       ├── products.json
│       ├── sales.json
│       └── users.json
├── skills/                       # Sistema de Inteligencia y Guías de IA
│   ├── architecture/             # Guía de arquitectura y rutas
│   ├── clean-code/              # Reglas de Clean Code y refactorización
│   ├── devsecops/                # Seguridad y protección de datos
│   ├── frontend/                 # Estándares de React 19 + TypeScript
│   ├── local-db/                 # Guía de Vite Middleware (Micro-backend)
│   ├── modern-updates/           # Protocolo de actualizaciones y patrones modernos
│   ├── package-manager/          # Uso obligatorio de pnpm
│   ├── qa-testing/               # Protocolo de pruebas de UI y flujos
│   ├── SEO/                      # Optimización SEO y accesibilidad
│   ├── skill-creation/           # Meta-skill para redactar nuevas guías
│   ├── ui-ux/                    # Diseño premium y responsivo
│   └── SKILL.md                  # Orquestador Maestro de la IA
├── src/                          # Código fuente principal de la aplicación
│   ├── components/               # Componentes visuales reutilizables
│   │   ├── charts/               # Gráficos encapsulados de Recharts
│   │   ├── layout/               # Estructuras de navegación maestra
│   │   ├── ImageUploader.tsx     # Carga y conversión de imágenes en Base64
│   │   └── TemplateModal.tsx     # Modal genérico estandarizado
│   ├── contexts/                 # Manejo de Estado Global (Context API)
│   │   ├── AuthContext.tsx       # Sesiones, autenticación y seguridad
│   │   └── StoreContext.tsx      # Inventario, carrito, transacciones y generador de IDs secuenciales
│   ├── pages/                    # Vistas y pantallas divididas por dominio
│   │   ├── admin/                # Panel de Control y POS Privado B2B
│   │   ├── auth/                 # Autenticación de personal
│   │   └── shop/                 # Tienda Virtual Pública B2C
│   ├── services/                 # Capa de comunicación con la API (api.ts)
│   ├── types/                    # Contratos e interfaces estrictas TypeScript
│   ├── App.tsx                   # Enrutador principal (React Router v7)
│   ├── index.css                 # Estilos globales y Tailwind CSS 4
│   └── main.tsx                  # Punto de montaje inicial en el DOM
├── dist/                         # Bundle final de producción (pnpm build)
├── eslint.config.js              # Reglas del linter
├── package.json                  # Dependencias y scripts
├── README.md                     # Documentación oficial del proyecto
├── vercel.json                   # Configuración SPA infalible para Vercel
└── vite.config.ts                # Configuración de Vite + Middleware local
```

### 🗄️ Nivel de Raíz (Root)

- `server/data/`: Directorio crítico que actúa como nuestro motor de **Base de Datos Local** durante el desarrollo. Vite intercepta las peticiones y modifica estos archivos físicamente para lograr persistencia.
  - `products.json`: Almacena el catálogo completo del inventario (precios, stock, imágenes en base64).
  - `sales.json`: Registro histórico inmutable de todas las transacciones financieras (pedidos web y ventas de caja).
  - `users.json`: Tabla de credenciales con contraseñas y roles (Admin/User) para el acceso al sistema.
  - `categories.json`: Define el árbol de clasificación de los productos de la tienda.
  - `notifications.json`: Cola persistente del sistema de alertas en tiempo real.
- `public/api/`: Carpeta espejo de lectura. Sirve los `.json` al cliente simulando respuestas REST `GET`.
- `dist/`: (_Se genera automáticamente_) Contiene la versión de producción empaquetada, minificada y ofuscada lista para subirse al servidor de hosting (Vercel).
- `package.json` / `pnpm-lock.yaml`: Registro estricto de las dependencias, scripts de construcción y metadatos del proyecto.
- `vite.config.ts`: Configuración central del empaquetador Vite, donde hemos inyectado nuestro "Middleware" de persistencia para atrapar peticiones `/api/save-*`.

### ⚛️ Nivel Lógico (`src/`)

Aquí reside el 100% del código fuente de React y la interfaz de usuario.

#### 🧩 `src/components/` (Componentes Modulares)

Ladrillos reutilizables que no tienen estado de página, solo reciben "props".

- **`layout/`**: Define los "marcos" estructurales de las páginas.
  - `Sidebar.tsx`: Menú lateral izquierdo (Admin).
  - `TopNav.tsx`: Barra superior para búsquedas rápidas y notificaciones.
  - `Layout.tsx`: Contenedor maestro que envuelve al sistema y define el diseño responsivo general (el Drawer en móviles).
  - `NotificationsPopover.tsx`: El menú desplegable inteligente que muestra los eventos y su estado de lectura.
- **`charts/`**: Encapsulación de complejidad visual.
  - `CategoryRevenueChart.tsx` y `PaymentMethodsChart.tsx`: Aislan la lógica de `recharts` para no contaminar la vista del Dashboard. Reciben datos puros y dibujan SVGs interactivos.
- `TemplateModal.tsx`: Componente maestro que estandariza todas las ventanas modales flotantes.
- `ImageUploader.tsx`: Lógica de conversión de imágenes JPG/PNG a cadenas `Base64` directamente en el navegador.

#### 🧠 `src/contexts/` (Estados Globales)

Manejo de la memoria viva de la aplicación utilizando la API Context nativa (sustituto ligero de Redux).

- `AuthContext.tsx`: Almacena la sesión viva del usuario (`user`, `login()`, `logout()`) y dictamina si alguien puede acceder a la zona `/admin`.
- `StoreContext.tsx`: El "Cerebro Comercial". Contiene todo el inventario, el carrito de compras actual, y los métodos para agregar al carrito, finalizar ventas o mutar categorías. Conecta directamente con la API.

#### 🔌 `src/services/` (Capa de Red)

- `api.ts`: Abstracción asíncrona. Aquí están definidos los `fetch()` que hablan con la base de datos (ya sea la local o el `localStorage` en producción). Aislar esto aquí nos permite cambiar de Backend en el futuro modificando solo un archivo.

#### 🏷️ `src/types/` (Contratos TypeScript)

- `product.ts`, `sale.ts`, `user.ts`, `notification.ts`: Definen las "Interfaces" (la forma exacta que deben tener los datos). Evita errores de variables "undefined" o campos faltantes (por ejemplo, obliga a que una `Sale` tenga un `total` de tipo `number`).
- `index.ts`: Archivo barril (Barrel File) para exportar de forma limpia todos los tipos de golpe.

#### 🖥️ `src/pages/` (Vistas / Rutas Principales)

Los archivos de este nivel sí son pantallas completas enlazadas a una URL.

- **`auth/`**:
  - `Login.tsx` (`/login`): Formulario estricto de inicio de sesión.
- **`shop/` (Dominio E-commerce B2C)**:
  - `StoreFront.tsx` (`/`): Pantalla principal de la tienda, escaparate de catálogo y filtros.
  - `CartFront.tsx` (`/cart`): Pantalla transaccional y pasarela de pago del cliente final.
- **`admin/` (Dominio ERP/POS B2B)**:
  - `Dashboard.tsx` (`/admin`): Centro de mando. Importa los gráficos y dibuja el estado financiero general.
  - `Sales.tsx`: Historial de facturación y el Punto de Venta (POS) diseñado para operarios físicos de tienda.
  - `Products.tsx`: CRUD (Crear, Leer, Actualizar, Borrar) total del catálogo.
  - `Categories.tsx`: Administración del árbol de categorías de negocio.
  - `Users.tsx`: Gestión de personal y credenciales de acceso.
  - `Settings.tsx` & `Lowstock.tsx`: Paneles secundarios de reportes y configuración operativa.

#### 🚀 Puntos de Entrada

- `App.tsx`: El mapa de navegación. Define las rutas de `React Router v7` y dictamina qué rutas son públicas (`/`) y cuáles están bloqueadas y exigen sesión (`/admin`).
- `main.tsx`: El archivo inyector. Toma nuestra app de React y la "pega" físicamente en el `index.html` del navegador.
