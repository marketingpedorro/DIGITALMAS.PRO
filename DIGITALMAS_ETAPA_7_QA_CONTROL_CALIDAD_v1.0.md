# 🧪 ETAPA 7 · QA / CONTROL DE CALIDAD — DIGITALMAS.PRO

**Versión:** v1.0 · CANON DE AGENCIA  
**Estado:** DEFINITIVO para nuevos sitios y futuras iteraciones  
**Alcance:** landing pages, sitios institucionales, webs de negocios físicos, productos digitales y micrositios desarrollados por DigitalMas.PRO  
**Caso de validación inicial:** C001 Kixiki  
**Principio:** lo que falla una vez y puede repetirse se transforma en regla, checklist o gate reutilizable.

---

## 0. PROPÓSITO DE LA ETAPA

La ETAPA 7 existe para impedir que una versión técnicamente construida llegue a producción con fallos visuales, funcionales, de conversión, accesibilidad, rendimiento o comportamiento real en dispositivos.

No valida solamente “si el código funciona”.

Valida simultáneamente:

- que el sitio cargue;
- que todas las secciones críticas sean visibles;
- que el layout responda correctamente;
- que los componentes se puedan usar;
- que el usuario pueda completar el recorrido de negocio;
- que los CTAs lleguen al destino correcto;
- que el tracking aplicable funcione;
- que el sitio sea usable con teclado y accesibilidad base;
- que el comportamiento real en móvil no contradiga la emulación;
- que no existan defectos bloqueantes antes de publicar.

> **REGLA DE AUTORIDAD:** un Lighthouse/PageSpeed verde nunca reemplaza QA visual, funcional, de recorrido ni prueba real. Si el test sintético está verde pero un dispositivo real falla, manda el dispositivo real.

---

# 1. FRONTERA OPERATIVA · ETAPA 6 → 7 → 8

## ETAPA 6 · FUNCIONALIDAD / RELEASE CANDIDATE

Entrega una versión candidata completa en **preview/staging**.

Debe existir:

- URL de preview o entorno equivalente;
- commit/deploy identificable;
- funcionalidades previstas implementadas;
- assets incorporados;
- rutas disponibles;
- código suficientemente estable para auditar.

**No se considera producción definitiva.**

## ETAPA 7 · QA / CONTROL DE CALIDAD PRE-RELEASE

La misión es **intentar romper, recorrer, medir y validar** la Release Candidate.

No se corrige silenciosamente mientras se audita.

El ciclo correcto es:

`AUDITAR → DETECTAR → REPRODUCIR → CLASIFICAR → CORREGIR → RE-TEST → GATE`

## ETAPA 8 · PUBLICACIÓN

Solo comienza después del GO pre-release.

Incluye:

`merge main → deploy producción → dominio → DNS/SSL si aplica → smoke producción`

Si el smoke post-deploy falla:

**ETAPA 8 devuelve el sitio a ETAPA 7.**

---

# 2. PRINCIPIOS CANÓNICOS DE QA

1. **QA no es Lighthouse.** Performance es una subfase, no el veredicto total.
2. **Responsive no es solo ancho.** Debe verificarse visibilidad, legibilidad, interacción y recorrido.
3. **Captura parcial no equivale a recorrido.**
4. **DOM presente no significa usuario visible.**
5. **Una media query escrita no garantiza que gane en CSS computado.**
6. **Emulación no reemplaza dispositivo físico.**
7. **El user journey manda sobre componentes aislados.**
8. **Todo CTA crítico se prueba hasta su destino real.**
9. **Todo bug debe reproducirse antes de corregirse.**
10. **Todo fix se vuelve a probar en el mismo nivel donde fue descubierto.**
11. **No se publica con defectos críticos o altos abiertos.**
12. **Cada QA debe dejar evidencia reutilizable.**

---

# 3. INPUTS OBLIGATORIOS ANTES DE EMPEZAR

Antes del QA deben registrarse:

- Proyecto / cliente.
- URL de preview.
- Rama y commit SHA o deploy ID.
- Fecha.
- Auditor / agente.
- Mercados e idiomas aplicables.
- Funcionalidades críticas.
- CTAs/conversiones principales.
- Rutas públicas esperadas.
- Componentes críticos.
- Temas/estados visuales si existen.
- Tracking implementado si aplica.
- Navegadores/dispositivos prioritarios del proyecto.

## 3.1 Componentes críticos

Cada proyecto define explícitamente qué partes no pueden fallar.

Ejemplos:

- Hero.
- Navegación.
- Catálogo/cardápio.
- Formulario.
- WhatsApp.
- Checkout.
- FAQ.
- Galería.
- Mapa.
- Sticky CTA.
- Área privada.
- Portal del cliente.
- Sección de regalo/referidos.

La lista cambia por proyecto.

**La metodología no depende de nombres específicos de Kixiki.**

---

# 4. ARQUITECTURA OPERATIVA DE LA ETAPA 7

## FASE 1 · INTEGRIDAD TÉCNICA / QA AUTOMÁTICO

### Por qué
Detectar errores estructurales antes de perder tiempo en QA visual.

### Qué revisar
- Build.
- Tests existentes.
- Syntax check.
- Errores JS.
- Errores de consola.
- Links internos.
- Anclas.
- Rutas críticas.
- 404.
- Sitemap XML si corresponde.
- robots.txt.
- Archivos públicos esperados.
- Recursos 404 inesperados.
- Formularios/configuraciones básicas que puedan verificarse automáticamente.

### Herramientas
- Suite propia del proyecto.
- Node/Python/scripts del repositorio.
- Linters cuando existan.
- `curl` o requests equivalentes.
- Validadores estructurales cuando aporten valor.

### Evidencia
- Log de tests.
- Resultado del build.
- Conteo PASS/FAIL.
- Errores detectados.
- Commit exacto auditado.

### PASS
- Build exitoso.
- Tests obligatorios verdes.
- 0 errores críticos de consola/runtime.
- Rutas críticas resolviendo correctamente.

### FAIL
Cualquier error que impida uso, navegación o reproducción confiable del sitio.

---

## FASE 2 · PERFORMANCE / CORE WEB VITALS

### Por qué
Una web visualmente correcta puede perder usuarios por demora, bloqueos o saltos.

### Herramientas base
- **Google PageSpeed Insights**.
- **Lighthouse**.
- **Chrome DevTools / Network / Performance**.
- CDP cuando el agente pueda instrumentarlo.
- WebPageTest solo si hace falta diagnóstico adicional.

### Probar
- Mobile.
- Desktop.
- LCP.
- CLS.
- INP si existe dato de campo.
- TBT como proxy de bloqueo en laboratorio.
- FCP.
- TTFB.
- Speed Index.
- Peso total.
- Peso de imágenes.
- Fuentes.
- CSS.
- JS.
- Recursos terceros.
- Render blocking.
- Cache/compression.
- Recurso y elemento LCP exactos.

### Referencia de calidad
**Core Web Vitals “Good” cuando existen datos válidos:**
- LCP ≤ 2.5 s
- INP ≤ 200 ms
- CLS ≤ 0.1

DigitalMas puede perseguir objetivos internos más exigentes, pero no debe presentarlos como umbrales oficiales universales.

### Regla
**El score Lighthouse no decide GO por sí solo.**

Un 100/100 puede coexistir con una sección invisible o una conversión rota.

### Evidencia
- Reporte Mobile.
- Reporte Desktop.
- Métricas.
- Top de recursos pesados.
- Diagnóstico de cuellos de botella.

---

## FASE 3 · ACCESIBILIDAD Y SEMÁNTICA

### Baseline
**WCAG 2.2 AA** como objetivo de agencia salvo exigencia contractual superior.

### Revisar
- Contraste.
- `alt` relevante.
- Labels/nombres accesibles.
- Jerarquía semántica.
- Navegación por teclado.
- `focus-visible`.
- Estados interactivos.
- Lectura y orden lógico.
- Formularios.
- Mensajes de error.
- `prefers-reduced-motion` cuando haya animaciones relevantes.
- Táctil razonable.

### Herramientas
- Lighthouse Accessibility.
- axe-core cuando aporte profundidad.
- DevTools.
- Navegación manual por teclado.

### Regla ergonómica interna
Para CTAs móviles DigitalMas buscará **44–48 px o más cuando el diseño lo permita**, aunque esto se trata como objetivo interno de ergonomía, no como una falsa certificación automática.

### PASS
- Sin barreras críticas para el recorrido principal.
- Teclado/foco operativos.
- Contrastes críticos aprobados.
- CTA principal identificable y operable.

---

# 5. FASE 4 · RESPONSIVE VISUAL + CROSS-BROWSER

Esta fase es obligatoria y debe ejecutar **scroll real completo**, no solamente capturas del hero.

## 5.1 Baseline de viewports de agencia

| Viewport | Uso |
|---|---|
| **375px** | móvil pequeño |
| **390px** | móvil estándar |
| **430px** | móvil grande |
| **768px** | tablet / intermedio |
| **1366px+** | desktop |

Estos viewports son baseline.  
Si un proyecto tiene un breakpoint particular, se agrega.

## 5.2 Matriz obligatoria de recorrido

| Viewport | Secciones críticas | Layout / legibilidad | Interacciones / CTA | Overflow horiz. | Consola | Estado |
|---|---|---|---|---|---|---|
| 375px | PASS / FAIL | PASS / FAIL | PASS / FAIL | 0 / detalle | 0 / detalle | 🟢/🟡/🔴 |
| 390px | PASS / FAIL | PASS / FAIL | PASS / FAIL | 0 / detalle | 0 / detalle | 🟢/🟡/🔴 |
| 430px | PASS / FAIL | PASS / FAIL | PASS / FAIL | 0 / detalle | 0 / detalle | 🟢/🟡/🔴 |
| 768px | PASS / FAIL | PASS / FAIL | PASS / FAIL | 0 / detalle | 0 / detalle | 🟢/🟡/🔴 |
| 1366px+ | PASS / FAIL | PASS / FAIL | PASS / FAIL | 0 / detalle | 0 / detalle | 🟢/🟡/🔴 |

## 5.3 Qué se verifica en cada viewport

- Header.
- Hero.
- H1/H2.
- CTA.
- Imágenes.
- Secciones largas.
- Grid/flex.
- Cards.
- Modales.
- Accordions.
- Formularios.
- Sticky/fixed.
- Footer.
- Layouts de una o varias columnas.
- Wrapping.
- Padding.
- Recortes.
- Scroll interno.
- Z-index.
- `opacity`.
- `visibility`.
- `display`.
- `transform`.
- Animaciones.
- IntersectionObserver.
- Estilos computados reales.
- Tema/estado si aplica.
- Orientación si el proyecto lo necesita.

## 5.4 Fallos que esta fase debe poder detectar

- Secciones presentes en DOM pero invisibles.
- `opacity: 0` permanente.
- Animaciones que nunca disparan.
- Layout comprimido.
- Especificidad CSS que anula reglas móviles.
- Scroll horizontal.
- Texto cortado.
- CTA fuera del viewport.
- Sticky superpuesto.
- Elementos tapados.
- Imágenes deformadas.
- Alturas incorrectas.
- Componentes imposibles de tocar.

## Herramientas
- Chrome DevTools.
- CDP.
- Navegación real.
- Playwright opcional para automatizar screenshots y flows.
- Firefox/WebKit/Chromium cuando el proyecto lo justifique.

---

# 6. FASE 5 · QA FUNCIONAL

### Objetivo
Comprobar que todos los componentes críticos hacen lo que prometen.

### Probar
- Menús.
- Links.
- WhatsApp.
- Teléfono.
- Email.
- Formularios.
- Validación.
- Modales.
- Tabs.
- Accordions.
- Flip cards.
- Carruseles.
- Theme toggle.
- Sticky CTA.
- Mapas.
- Checkout.
- Paneles/auth si existen.
- Estados de carga/error.
- Fallbacks.

### Regla
No basta con que “el botón exista”.

Debe comprobarse:

`acción → resultado esperado`

### PASS
Todas las funcionalidades críticas cumplen de punta a punta.

---

# 7. FASE 6 · USER JOURNEY COMPLETO

El QA deja de pensar por componente y actúa como usuario.

## Formato

Cada proyecto define al menos un recorrido primario.

Ejemplo genérico:

`Entrada → Hero → Entender oferta → Scroll → Prueba/Producto → Interacción → CTA → Destino → Confirmación`

Otros recorridos pueden ser:

`Landing → Formulario → Validación → Envío → Confirmación`

`Landing → Producto → Checkout → Pago/redirect`

`Landing → Catálogo → WhatsApp → Mensaje prellenado`

## En cada paso se valida

- ¿Se ve?
- ¿Se entiende?
- ¿Se puede usar?
- ¿El siguiente paso es evidente?
- ¿La interacción funciona?
- ¿El destino es correcto?
- ¿Existe un bloqueo?
- ¿Se pierde contexto?
- ¿La conversión principal sigue disponible?

### Evidencia
- Log del recorrido.
- Capturas.
- Video/grabación cuando aporte valor.
- Resultado PASS/FAIL por paso.

### PASS
El usuario puede completar el objetivo principal de principio a fin sin defecto bloqueante.

---

# 8. FASE 7 · DISPOSITIVO FÍSICO REAL

## Regla canónica

**Antes del GO final, al menos un teléfono físico debe recorrer la versión candidata.**

Si el público, tráfico o riesgo lo justifica, ampliar a iOS + Android físicos.

## Qué se prueba

- Carga inicial.
- Scroll humano continuo.
- Visibilidad de todas las secciones críticas.
- Touch.
- Sticky.
- Animaciones.
- Teclado móvil en formularios.
- WhatsApp/app nativa.
- Teléfono.
- Mapas.
- Viewport dinámico.
- Barra de navegador.
- Orientación cuando aplique.
- Tema DIA/NOITE si existe.
- Legibilidad real.

## Evidencia
- Capturas del dispositivo.
- Grabación de pantalla o video breve.
- Modelo/SO/browser.
- URL y commit probado.

## PASS
- 0 secciones críticas invisibles.
- 0 layouts rotos.
- 0 conversiones bloqueadas.
- Interacciones esenciales operables con touch.

## Regla de re-test físico
**Si un defecto fue encontrado en teléfono físico, el fix no se cierra con emulación.**

Se repite el recorrido físico.

---

# 9. FASE 8 · TRACKING Y CONVERSIÓN

Se ejecuta sobre lo que realmente exista en ese proyecto.

## Verificar
- CTA principal.
- WhatsApp.
- Número correcto.
- Mensaje correcto.
- `encodeURIComponent` o encoding equivalente.
- Formulario y endpoint.
- Checkout.
- `tel:`.
- Maps.
- Email.
- GA4.
- Meta Pixel.
- Eventos propios.
- UTM.
- Analytics.
- Confirmaciones.

## Herramientas
- DevTools Network.
- Google Tag Assistant si existe GA4/GTM.
- Helpers específicos si aplica.
- Navegación real.
- Consola/debug mode.

## PASS
Cada conversión llega a su destino correcto y genera el evento esperado cuando corresponde.

---

# 10. QA DE SEGURIDAD · CONDICIONAL SEGÚN RIESGO

No todo sitio requiere una auditoría de seguridad profunda.

Pero cuando existan:

- formularios;
- auth;
- paneles;
- datos del cliente;
- APIs;
- carga/edición de contenido;
- pagos;
- funciones serverless;

debe ampliarse QA con controles relevantes:

- HTTPS.
- Exposición de secretos.
- Sanitización/validación.
- CSP/cabeceras cuando correspondan.
- XSS básico.
- permisos.
- auth/session.
- rutas privadas.
- datos sensibles.
- rate limiting / anti-spam cuando aplique.

Los controles de seguridad avanzados no se inventan como requisito de una landing estática simple.

---

# 11. MATRIZ DE SEVERIDAD

| Nivel | Definición | Acción |
|---|---|---|
| 🔴 **CRÍTICO** | Impide usar, ver o completar conversión; crash; sección crítica invisible; seguridad grave; CTA principal roto | **NO-GO** |
| 🟠 **ALTO** | Degrada fuertemente mobile, accesibilidad, performance o funcionalidad clave | **CORREGIR ANTES DE PUBLICAR** |
| 🟡 **MEDIO** | Problema visible/no ideal pero no bloquea recorrido principal | Corregir o aceptar explícitamente |
| 🟢 **MENOR** | Detalle cosmético, microcopy o mejora futura | Puede ir a backlog |

## Regla
**GO exige 0 críticos y 0 altos abiertos.**

Los medios solo pueden quedar abiertos con decisión explícita y sin afectar conversión, accesibilidad esencial ni reputación.

---

# 12. CICLO DE UN DEFECTO

Todo fallo detectado sigue esta secuencia:

1. **Detectar.**
2. **Reproducir.**
3. **Documentar evidencia.**
4. **Identificar causa.**
5. **Asignar severidad.**
6. **Proponer corrección mínima.**
7. **Implementar en rama/entorno controlado.**
8. **Re-test específico.**
9. **Re-test del user journey afectado.**
10. **Actualizar gate.**

## Regla de promoción

Después de cerrar un defecto:

> ¿Puede repetirse en otro cliente?

- **Sí** → se convierte en regla/checklist/gate del Proceso Maestro.
- **No** → permanece en HANDOFF/documentación del proyecto.

---

# 13. LECCIONES PROMOVIDAS DESDE C001 KIXIKI

## QA-001 · Responsive emulado ≠ experiencia móvil aprobada

Un QA inicial reportó breakpoints geométricamente correctos, pero un teléfono físico mostró una sección crítica invisible y un bloque roto.

### Regla
No existe GO responsive solo por:

- ancho de documento;
- ausencia de overflow;
- CLS;
- alturas iguales;
- screenshots parciales.

Debe existir recorrido completo.

---

## QA-002 · Performance verde ≠ sitio funcional

Lighthouse/CDP podía mostrar excelentes métricas mientras el sitio presentaba defectos visuales severos.

### Regla
Performance es una fase independiente.

Nunca reemplaza QA visual, funcional ni físico.

---

## QA-003 · Secciones largas y animaciones deben probarse durante scroll

Un target de gran altura puede interactuar de manera inesperada con IntersectionObserver, thresholds, transforms u opacity.

### Regla
Toda animación/reveal crítica se verifica mediante scroll completo en viewport pequeño.

No se impone un `threshold` universal: se valida el resultado.

---

## QA-004 · Media query escrita ≠ layout móvil correcto

Una regla desktop de mayor especificidad puede ganar la cascada y romper el mobile.

### Regla
Cuando un layout es crítico:

- revisar estilo computado;
- revisar especificidad;
- comprobar resultado en viewport;
- comprobar resultado en dispositivo real cuando corresponda.

---

## QA-005 · Un fix debe cerrarse en el mismo nivel del fallo

Si el bug apareció en dispositivo físico:

`fix → emulación PASS` no alcanza.

Debe ser:

`fix → emulación PASS → dispositivo físico PASS`

---

# 14. STACK MÍNIMO DE HERRAMIENTAS

| Herramienta | Uso | Obligatoria |
|---|---|---|
| Suite build/tests del proyecto | Integridad y regresiones | Sí |
| Google PageSpeed Insights | Performance pública / CWV | Sí para web pública |
| Lighthouse | Auditoría sintética | Sí |
| Chrome DevTools / CDP | Network, layout, consola, computed styles | Sí |
| Navegador real | Uso manual y journeys | Sí |
| Teléfono físico | Experiencia móvil real | Sí |
| Playwright | E2E/cross-browser/regresión visual | Según complejidad |
| axe-core | Accesibilidad adicional | Según complejidad |
| Tag Assistant | Tracking GA4/GTM | Si aplica |
| BrowserStack/SauceLabs | Matriz amplia device/browser | Si riesgo/costo lo justifica |
| SSL Labs / curl | Smoke/SSL post-deploy | Etapa 8 |

## Regla de herramientas
**No sumar una herramienta si no resuelve un hueco concreto.**

La herramienta nunca sustituye el criterio del gate.

---

# 15. EVIDENCIA OBLIGATORIA

Cada proyecto debe conservar un expediente QA.

Estructura recomendada:

```text
artifacts/
└── qa/
    └── <proyecto>_<fecha>/
        ├── 01_build_tests.log
        ├── 02_performance_mobile.*
        ├── 03_performance_desktop.*
        ├── 04_accessibility.*
        ├── responsive/
        │   ├── 375.*
        │   ├── 390.*
        │   ├── 430.*
        │   ├── 768.*
        │   └── desktop.*
        ├── user_journey/
        ├── device_real/
        ├── tracking/
        ├── defects.md
        └── FICHA_GATE_ETAPA_7.md
```

No todos los proyectos requieren exactamente estos nombres, pero la evidencia debe cubrir las mismas categorías.

---

# 16. FICHA GATE · ETAPA 7

```markdown
# 📋 FICHA DE LIBERACIÓN DE CALIDAD · ETAPA 7

Proyecto:
Cliente:
Preview URL:
Rama:
Commit/Deploy:
Fecha:
Auditor:

## RESULTADOS

Integridad técnica:        PASS / FAIL
Performance Mobile:       PASS / FAIL
Performance Desktop:      PASS / FAIL
Accesibilidad:            PASS / FAIL
Responsive 375:           PASS / FAIL
Responsive 390:           PASS / FAIL
Responsive 430:           PASS / FAIL
Responsive 768:           PASS / FAIL
Responsive Desktop:       PASS / FAIL
Funcionalidad:            PASS / FAIL
User Journey:             PASS / FAIL
Cross-browser:            PASS / FAIL / N/A
Dispositivo físico:       PASS / FAIL
Tracking / Conversión:    PASS / FAIL / N/A
Seguridad específica:     PASS / FAIL / N/A

Defectos críticos abiertos:
Defectos altos abiertos:
Defectos medios abiertos:
Defectos menores abiertos:

## VEREDICTO

[ ] 🟢 GO
[ ] 🟡 CORREGIR
[ ] 🔴 NO-GO

Observaciones:
Evidencias:
Próxima acción:
```

---

# 17. DEFINICIÓN DE GO / CORREGIR / NO-GO

## 🟢 GO

Solo cuando:

- 0 críticos abiertos;
- 0 altos abiertos;
- user journey principal completo;
- mobile físico aprobado;
- conversiones críticas aprobadas;
- build/tests aprobados;
- responsive aprobado;
- no existe bloqueo conocido que pueda dañar producción.

## 🟡 CORREGIR

Cuando:

- existe defecto reproducible corregible;
- el sitio todavía no debe publicarse;
- no hace falta replantear arquitectura completa;
- se devuelve a la subfase afectada.

## 🔴 NO-GO

Cuando:

- la Release Candidate no es auditable;
- falla funcionalidad central;
- existe riesgo de seguridad grave;
- secciones/conversiones principales no funcionan;
- los fallos obligan a replantear arquitectura o implementación relevante.

---

# 18. ETAPA 8 · SMOKE POST-DEPLOY

El smoke no pertenece al GO pre-release de ETAPA 7.

Ocurre después del deploy de ETAPA 8.

Verificar:

- Dominio oficial.
- HTTPS válido.
- Redirecciones.
- `/`.
- Rutas críticas.
- 404.
- sitemap.
- robots.
- CTA principal.
- Form/WhatsApp/checkout principal.
- Assets.
- Consola.
- No mixed content.
- Producción corresponde al commit aprobado.

## Resultado

**PASS** → producción confirmada.  
**FAIL** → rollback/corrección y regreso a ETAPA 7.

---

# 19. PLANTILLA DE RECORRIDO PARA CADA NUEVO PROYECTO

Antes del QA completar:

```text
RECORRIDO PRINCIPAL:
Entrada
→ __________________
→ __________________
→ __________________
→ Conversión
→ Confirmación

COMPONENTES CRÍTICOS:
1.
2.
3.
4.
5.

CONVERSIONES:
1.
2.

ESTADOS/TEMAS:
- __________________

VIEWPORT EXTRA:
- __________________

NAVEGADORES/DISPOSITIVOS PRIORITARIOS:
- __________________
```

Después ejecutar ese recorrido en:

`375 → 390 → 430 → 768 → Desktop → móvil físico`

---

# 20. REGLA FINAL DE LA AGENCIA

> **DigitalMas no aprueba una web porque “parece terminada”. La aprueba cuando existe evidencia de que funciona técnicamente, se ve bien, se puede usar, convierte y sobrevive al recorrido real de un usuario.**

Y la regla que nace directamente de C001:

> **El test automático reduce riesgo. El usuario real define la realidad.**

---

# 21. MANTENIMIENTO DEL CANON

Esta ETAPA 7 es canónica desde v1.0.

Puede evolucionar únicamente cuando:

1. un nuevo proyecto expone un hueco real;
2. el fallo se reproduce;
3. la regla propuesta sirve para más de un caso;
4. no introduce complejidad innecesaria;
5. el cambio se documenta con versión.

Formato sugerido:

- v1.0 — baseline nacido de C001.
- v1.1 — mejoras sin cambiar arquitectura del gate.
- v2.0 — cambio sustancial de metodología.

No se agregan reglas por moda ni por una herramienta nueva.

---

**© 2026 DigitalMas.PRO · Proceso Maestro Web · ETAPA 7 QA / Control de Calidad**
