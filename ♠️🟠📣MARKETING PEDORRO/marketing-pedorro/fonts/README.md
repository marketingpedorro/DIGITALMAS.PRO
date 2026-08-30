# Registro de Tipografías — MARKETING PEDORRO

Este directorio contiene las definiciones de fuentes tipográficas para el funcionamiento offline del sitio.

## Jerarquía y Fuentes Asignadas

1. **Bangers** (`Bangers-Regular.woff2`):
   - **Uso**: Display principal, títulos H1, H2, números de panel, sellos y palabras de alto impacto.
   - **Licencia**: SIL Open Font License (OFL) 1.1.
   - **Fallback CSS**: `Impact, Charcoal, "Arial Black", sans-serif`.

2. **Montserrat** (`Montserrat-Regular.woff2`, `Montserrat-Medium.woff2`, `Montserrat-SemiBold.woff2`, `Montserrat-Bold.woff2`, `Montserrat-ExtraBold.woff2`):
   - **Uso**: Lectura, navegación, interfaz, H3, bajadas, botones, listas, formularios y pie de página.
   - **Licencia**: SIL Open Font License (OFL) 1.1.
   - **Fallback CSS**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

3. **Komika Axis** (Opcional / Acento):
   - **Estado**: **PENDIENTE DE LICENCIA Y ARCHIVO AUTORIZADO**.
   - **Comportamiento**: Siguiendo la regla de oro del proyecto, **no se inventan ni suplantan silenciosamente archivos con derechos**. En `:root`, el token `--font-display-accent` apunta a `var(--font-display-primary)` (Bangers) como fallback autorizado hasta que se disponga del archivo oficial con su respectiva licencia.

## Reglas @font-face en CSS
Las fuentes se definen en `css/styles.css` con `font-display: swap` y rutas relativas `../assets/fonts/...`. Si los binarios `.woff2` locales no están presentes en un entorno reducido, el navegador utiliza automáticamente la cadena de fallbacks nativos especificada en los tokens de `:root`.
