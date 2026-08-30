# MARKETING PEDORRO — Backup Local Autónomo

Publicación editorial y sistema visual con gramática de cómic contemporáneo. Diseñado desde cero como un proyecto 100% estático, autónomo y sin conexión a Internet requerida.

---

## 1. Cómo Abrir y Probar el Sitio Localmente

Para garantizar el correcto funcionamiento de rutas relativas, fuentes locales y evitar restricciones de CORS o caché de navegadores, se recomienda servir los archivos mediante un servidor estático local.

### Opciones de Servidor Local

| Sistema / Herramienta | Comando en Terminal | URL de Acceso |
| :--- | :--- | :--- |
| **macOS / Linux (Python 3)** | `python3 -m http.server 8000` | `http://localhost:8000/` |
| **Windows (Python Launcher)** | `py -m http.server 8000` | `http://localhost:8000/` |
| **Node.js (si está instalado)** | `npx serve .` | `http://localhost:3000/` |
| **VS Code** | Clic derecho en `index.html` → *Open with Live Server* | URL generada por la extensión |

> **Nota de refresco:** Si realizás cambios en CSS o JS, recargá la página con `Cmd + Shift + R` (macOS) o `Ctrl + F5` (Windows/Linux) para evitar versiones en caché.

---

## 2. Arquitectura de Archivos

```text
marketing-pedorro/
├── index.html                  # Homepage vertical con narrativa completa
├── alternativa-c.html          # Storytelling horizontal interactivo (5 capítulos)
├── README.md                   # Instrucciones operativas y de testing
├── BACKUP_MANIFEST.md          # Inventario exhaustivo de archivos y licencias
├── LICENSES.md                 # Detalle de licencias de fuentes y assets
├── css/
│   └── styles.css              # Reset, tokens globales, tipografía y responsive
├── js/
│   └── app.js                  # Motor de interacción JavaScript Vanilla unificado
└── assets/
    ├── images/
    │   ├── hero-editorial.jpg       # Composición editorial del Hero
    │   ├── caos-editorial.jpg       # Textura del bloque de Problema
    │   ├── claridad-editorial.jpg   # Textura del bloque de Método
    │   ├── accion-editorial.jpg     # Textura del bloque de Cierre
    │   ├── placeholder-asset.svg    # Placeholder canónico explícito
    │   └── README.md                # Registro de imágenes
    └── fonts/
        ├── Bangers-Regular.woff2    # Tipografía display de impacto
        ├── Montserrat-Regular.woff2 # Tipografía de lectura e interfaz
        └── README.md                # Registro tipográfico y estado Komika Axis
```

---

## 3. Lógica de Interacción (`js/app.js`)

El archivo `js/app.js` concentra la totalidad del comportamiento dinámico mediante JavaScript nativo modular:

- `initHorizontalStory()`: Inicializa el carril horizontal en `alternativa-c.html`.
- `scrollToPanel(index, smooth)`: Desplaza el carril con precisión respetando la preferencia de movimiento del usuario.
- `syncActivePanel()`: Sincroniza la cinta de pasos, clases activas y el estado `aria-current="step"`.
- `updatePanelInert(activeIndex)`: Administra el foco de teclado para que elementos fuera del campo visual no atrapen la navegación accesible.
- `initPointerDrag()`: Permite arrastrar el carril con el ratón o trackpad sin anular los clics en botones o enlaces interactivos.
- `initKeyboardControls()`: Habilita navegación fluida con `ArrowLeft`, `ArrowRight`, `Home` y `End`.
- `initReducedMotion()`: Detecta `prefers-reduced-motion: reduce` y ajusta instantáneamente las transiciones a modo accesible.
- `initHomepageFeatures()`: Proporciona scroll suave para enlaces de anclaje en `index.html`.

---

## 4. Estado de Tipografías y Licencias

1. **Bangers** (OFL 1.1): Fuente display para H1, H2, números de viñeta y golpes conceptuales.
2. **Montserrat** (OFL 1.1): Fuente para lectura, párrafos, H3, navegación, botones y formularios.
3. **Komika Axis** (Acento opcional): **PENDIENTE DE LICENCIA Y ARCHIVO AUTORIZADO**. De acuerdo con las reglas de marca y transparencia técnica, no se realizan sustituciones silenciosas; el token `--font-display-accent` apunta a `var(--font-display-primary)` (Bangers) como fallback autorizado.

---

## 5. Cumplimiento de los 10 Criterios de Aceptación

1. **Sin dependencias**: Cero frameworks, sin compilación, sin backend, 100% estático.
2. **Portabilidad local**: Funciona con servidor local y todas las rutas relativas.
3. **Jerarquía tipográfica**: Bangers para impacto; Montserrat para lectura/UI; Komika Axis documentada.
4. **Exclamación del Hero**: Ubicada en capa frontal `position: absolute; z-index: 10; pointer-events: none;` sin bloquear clics ni quedar oculta.
5. **Carril horizontal desktop**: Se desplaza con rueda, trackpad, arrastre, teclado y botones sin depender de scroll vertical simulado.
6. **Degradación móvil**: En pantallas <= 768px, los paneles se apilan verticalmente sin desbordamiento horizontal.
7. **Sincronización de estado**: Cinta de progreso y `aria-current="step"` actualizados en tiempo real.
8. **Botones accesibles**: Los CTA de cada capítulo no quedan tapados por controles flotantes.
9. **Transiciones narrativas**: Progresión clara (Tensión → Pausa → Método → Salida) con aceleración `cubic-bezier(0.23, 1, 0.32, 1)`.
10. **Sin humo ni invenciones**: Placeholders canónicos explícitos para assets pendientes; sin testimonios ni marcas falsas.
