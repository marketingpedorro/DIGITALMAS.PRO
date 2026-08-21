---
schema: digitalmas-handoff-v1
project_id: C001
project_name: Kixiki Lanches
status: in_progress
stage: final-var
current_player: mbappe
repo: marketingpedorro/DIGITALMAS.PRO
branch: fix/c001-per-item-save-feedback
pr: 6
checkpoint_head: 30d25594d6f0fe6bf1fd0d95d18c5ef5950801b3
preview: https://deploy-preview-6--kixiki.netlify.app/
production: https://kixiki.netlify.app/
updated_at: 2026-08-21T18:13:00-03:00
---

# HANDOFF · C001 KIXIKI

## 🎯 Objetivo actual
Entregar PR #6 limpio, probado y listo para la decisión humana final (GO / NO-GO) de Andy y Messi.

## ✅ Hecho
- **Panel do Dono**: interfaz pt-BR privada, alineada a la paleta Kixiki (forest, cream, mustard), desacoplada de workspaces internos y con guardado reactivo por ítem con confirmación visual de servidor.
- **Cardápio Visual e Interactivo**: mobile-first, flip cards 3D; reverso estructurado con composición de ingredientes quando existem, o descripción comercial limpia sin mensajes de incertidumbre.
- **Simetría Geométrica Estricta**: altura fija e idéntica en todas las flip cards por breakpoint (480px de cuerpo + 56px CTA en desktop; 450px + 56px en móvil), eliminando desbordes en `.kx-menu-back` con scroll interno en `.kx-menu-back-copy` y anclaje inferior del footer/precio en la misma línea.
- **Rodapé Institucional e Identidad**: estructura y créditos exactos aprobados en 2 líneas ("Desenvolvido por Andrés Sebastián · DigitalMas.PRO" y "Fundador · Técnico Universitário em Web pela UNSL (Argentina)."), contraste optimizado DIA/NOITE (crema/verde en DIA, verde profundo/mostaza en NOITE) con enlaces limpios a Instagram, WhatsApp y Privacidade.
- **Aviso de Privacidade e LGPD**: página `/privacidade/` dedicada pt-BR, mobile-first, com 9 seções estruturadas, suporte dinâmico para tema DIA / NOITE com toggle e variáveis compartilhadas, documentando medição first-party sem cookies publicitários de terceiros (cookie banner não exigido).
- **Sitemap Técnico**: `/privacidade/` incorporada em `sitemap.xml`.
- **Migración Semántica Idempotente**: `upgradeLegacyOwnerData` compartida en memoria entre Owner y Public Projection para convertir descripciones compuestas existentes en ingredientes reales sin sobreescribir ediciones del dueño.
- **Tipografía y Reverso Premium**: jerarquía visual con acento mostaza superior, nombres en `clamp(1.65rem, 2.2vw, 2rem)`, descripciones en `1rem`, viñetas `•` en `0.95rem - 1rem` y paridad total DIA/NOITE.
- **Microfunnel Regalo WhatsApp DigitalMas**: CTA `"Quero meu presente no WhatsApp →"`, destino directo al WhatsApp operativo de DigitalMas con mensaje pre-cargado de atribución humana e inicialización segura del evento `gift_cta_click`.
- **Gestión de Fotos**: upload y optimización client-side (JPEG/PNG/WebP, máx 5 MB original, lado máx 1400 px, salida WebP calidad 0.82) hacia asset store sin URLs manuales.
- **Conversión WhatsApp**: CTAs directos por producto posicionados fuera del cuerpo rotatorio de las tarjetas.
- **Superficie Pública y 404**: `404.html` corregido con etiqueta visual `FORA DO CARDÁPIO`, `robots.txt`, `sitemap.xml` y QR SVG para reseñas (Táctica Regalo).
- **Medición y Aislamiento**: tracking de eventos C001 y métricas aisladas estrictamente entre preview y producción por prefijo de storage.
- **Higiene de `/public`**: remoción confirmada de 13 archivos huérfanos/legacy con cero referencias en el proyecto.

## ⚽ Próximos 3
1. Smoke autenticado privado.
2. GO / CORREGIR de Andy + Messi.
3. Merge / producción únicamente si GO.

## 🚧 Bloqueos
- **Bloqueo parcial de autenticación**: el entorno de QA no dispone de sesión Netlify Identity con rol `kixiki-owner` para interactuar en vivo con el panel privado en preview. Todos los flujos están 100% cubiertos por la suite automatizada (84/84 OK).

## 🛑 No tocar
- H1 estratégico.
- Dardo.
- DNS / dominios de producción.
- Producción sin GO y VAR aprobado.
- Proyectos externos o experimentos no relacionados.
- Migración general de Control Maestro fuera del alcance de C001.

## 🧪 Baseline
- **Tests**: `npm run test:owner` (84/84 tests OK).
- **Build**: `npm run netlify:build` exitoso.
- **Preview**: [Netlify Deploy Preview #6](https://deploy-preview-6--kixiki.netlify.app/)

## 🏃 Última entrega
- **Jugador anterior**: Mbappé (Pase #10 - Footer + Base Institucional).
- **Nuevo jugador**: Mbappé (Pase #10 - Microajuste Footer + Tema Privacidade).
- **Fecha**: 2026-08-21.
- **Último commit relevante**: `30d2559` (feat(c001): refine privacy structure and align institutional footer credit).
