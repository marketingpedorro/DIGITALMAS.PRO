---
schema: digitalmas-handoff-v1
project_id: C001
project_name: Kixiki Lanches
status: in_progress
stage: pre-var
current_player: mbappe
repo: marketingpedorro/DIGITALMAS.PRO
branch: fix/c001-per-item-save-feedback
pr: 6
checkpoint_head: 1ab442bbd1217e9235084931f28b4923e1ce0721
preview: https://deploy-preview-6--kixiki.netlify.app/
production: https://kixiki.netlify.app/
updated_at: 2026-08-21T16:55:00-03:00
---

# HANDOFF · C001 KIXIKI

## 🎯 Objetivo actual
Completar el cierre técnico de C001 Kixiki Lanches y entregar el paquete listo para VAR final de Messi / Andy.

## ✅ Hecho
- **Panel do Dono**: interfaz pt-BR privada, alineada a la paleta Kixiki (forest, cream, mustard) y desacoplada de workspaces internos.
- **Persistencia y Feedback**: guardado reactivo por ítem con confirmación visual de servidor e integridad de datos.
- **Cardápio Público y Reverso de Cards**: experiencia mobile-first, flip cards interactivas con contraste accesible; reverso estructurado con lista de ingredientes o estado neutral sin espacios vacíos.
- **Gestión de Fotos**: upload y optimización de fotos reales de productos hacia asset store sin URLs manuales.
- **Fallbacks Neutrales**: protección ante estados incompletos en horarios, entrega y precios sin inventar promesas públicas.
- **Conversión WhatsApp**: CTAs directos por producto posicionados fuera del cuerpo rotatorio de las tarjetas.
- **Superficie Pública y 404**: `404.html` corregido con etiqueta visual `FORA DO CARDÁPIO`, `robots.txt`, `sitemap.xml` y QR SVG para reseñas (Táctica Regalo).
- **Medición y Aislamiento**: tracking de eventos C001 y métricas aisladas estrictamente entre preview y producción por prefijo de storage.
- **Auditoría Higiene `/public`**: clasificación completa de 46 archivos públicos entre runtime, assets y candidatos huérfanos/legacy.

## ⚽ Próximos 3
1. VAR final de Messi / Andy sobre Deploy Preview #6.
2. Gate de Higiene Public (limpieza de archivos huérfanos/legacy identificados).
3. Merge de PR #6 a main y publicación controlada a producción.

## 🚧 Bloqueos
- **Bloqueo parcial de autenticación**: el entorno de QA no dispone de sesión Netlify Identity con rol `kixiki-owner` para interactuar en vivo con el panel privado en preview. Todos los flujos están 100% cubiertos por la suite automatizada (79/79 OK).

## 🛑 No tocar
- H1 estratégico.
- Dardo.
- DNS / dominios de producción.
- Producción sin GO y VAR aprobado.
- Proyectos externos o experimentos no relacionados.
- Migración general de Control Maestro fuera del alcance de C001.

## 🧪 Baseline
- **Tests**: `npm run test:owner` (79/79 tests OK).
- **Build**: `npm run netlify:build` exitoso.
- **Preview**: [Netlify Deploy Preview #6](https://deploy-preview-6--kixiki.netlify.app/)

## 🏃 Última entrega
- **Jugador anterior**: Mbappé (Pase #10 - Cierre 404).
- **Nuevo jugador**: Mbappé (Pase #10 - Recuperación Pelota Haaland).
- **Fecha**: 2026-08-21.
- **Último commit relevante**: `1ab442b` (fix(c001): apply approved 404 visual label and prepare pre-var handoff).
