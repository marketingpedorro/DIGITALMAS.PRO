# BACKUP MANIFEST — MARKETING PEDORRO

Inventario técnico de archivos, rutas relativas, propósitos funcionales y dependencias locales para el backup autónomo.

## Tabla de Manifiesto de Archivos

| Ruta Relativa | Tipo | Propósito y Descripción | Licencia / Estado |
| :--- | :--- | :--- | :--- |
| `index.html` | HTML5 | Homepage vertical con navegación sticky, Hero, Definición, Problema, Pausa, Método, Cierre y Footer. | Propietario / Canon |
| `alternativa-c.html` | HTML5 | Experiencia interactiva de Storytelling Horizontal (Alternativa C) con 5 capítulos y carril desktop/móvil. | Propietario / Canon |
| `README.md` | Markdown | Documentación general de ejecución, testing local y criterios de diseño. | Documentación libre |
| `BACKUP_MANIFEST.md` | Markdown | Este inventario técnico de archivos y verificación de integridad. | Documentación libre |
| `LICENSES.md` | Markdown | Registro legal de fuentes, licencias de software y autorizaciones de assets. | Documentación legal |
| `css/styles.css` | CSS3 | Hojas de estilo unificadas: reset, tokens globales, tipografía, cómic grammar y responsive. | Propietario / Canon |
| `js/app.js` | JavaScript | Motor de interacción vanilla: carril horizontal, rueda/drag, teclado, accesibilidad y foco. | MIT / Propietario |
| `assets/images/hero-editorial.jpg` | JPEG (800×600) | Collage editorial para la sección Hero. | Generación gráfica propia |
| `assets/images/caos-editorial.jpg` | JPEG (800×600) | Textura gráfica de saturación y ruido en la sección de Problema. | Generación gráfica propia |
| `assets/images/claridad-editorial.jpg` | JPEG (800×600) | Textura geométrica y limpia en la sección de Método. | Generación gráfica propia |
| `assets/images/accion-editorial.jpg` | JPEG (800×600) | Textura visual de aceleración y momentum en Cierre. | Generación gráfica propia |
| `assets/images/placeholder-asset.svg` | SVG | Elemento vectorial gráfico para ilustrar la reserva técnica de assets canónicos. | Vectorial propio |
| `assets/images/README.md` | Markdown | Especificaciones y directivas de assets de imagen. | Documentación interna |
| `assets/fonts/README.md` | Markdown | Especificaciones tipográficas locales y declaración de fallback para Komika Axis. | Documentación interna |

## Verificación de Rutas
- Todas las rutas a imágenes son relativas: `assets/images/...`
- Todas las referencias tipográficas en CSS apuntan a: `../assets/fonts/...`
- No existen dependencias de CDN, servidores externos, ni APIs de terceros.
