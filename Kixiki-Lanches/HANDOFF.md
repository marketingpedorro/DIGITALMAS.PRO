---
schema: digitalmas-handoff-v1
project_id: C001
project_name: Kixiki Lanches
status: in_progress
stage: cierre-c001
current_player: mbappe
repo: marketingpedorro/DIGITALMAS.PRO
branch: fix/c001-per-item-save-feedback
pr: 6
checkpoint_head: dbb9261c54cb48aca3911044b0f36b067305336f
preview: https://deploy-preview-6--kixiki.netlify.app/
production: https://kixiki.netlify.app/
updated_at: 2026-08-21T16:05:00-03:00
---

# HANDOFF · C001 KIXIKI

## 🎯 Objetivo actual
Cerrar correctamente el proyecto piloto C001 Kixiki Lanches desde el estado técnico y visual verificado.

## ✅ Hecho
- **Panel do Dono**: interfaz pt-BR privada, alineada a la paleta Kixiki (forest, cream, mustard) y desacoplada de workspaces internos.
- **Persistencia y Feedback**: guardado reactivo por ítem con confirmación visual de servidor e integridad de datos.
- **Cardápio Público**: experiencia mobile-first, flip cards interactivas con contraste accesible y datos canónicos.
- **Gestión de Fotos**: upload y optimización de fotos reales de productos hacia asset store sin URLs manuales.
- **Fallbacks Neutrales**: protección ante estados incompletos en horarios, entrega y precios sin inventar promesas públicas.
- **Conversión WhatsApp**: CTAs directos por producto posicionados fuera del cuerpo rotatorio de las tarjetas.
- **Superficie Pública**: `404.html`, `robots.txt`, `sitemap.xml` y QR SVG para reseñas (Táctica Regalo).
- **Medición**: tracking de eventos clave y métricas operativas C001.

## ⚽ Próximos 3
1. QA visual real del cardápio y fotos en viewport móvil.
2. Smoke funcional restante del Panel do Dono y feedback de guardado.
3. VAR final → decisión de merge/publicación a producción.

## 🚧 Bloqueos
- Ninguno en el código ni en la infraestructura técnica de C001.

## 🛑 No tocar
- H1 estratégico.
- Dardo.
- DNS / dominios de producción.
- Producción sin GO y VAR aprobado.
- Proyectos externos o experimentos no relacionados.
- Migración general de Control Maestro fuera del alcance de C001.

## 🧪 Baseline
- **Tests**: `npm run test:owner` (77/77 tests OK).
- **Build**: `npm run netlify:build` exitoso.
- **Preview**: [Netlify Deploy Preview #6](https://deploy-preview-6--kixiki.netlify.app/)

## 🏃 Última entrega
- **Jugador anterior**: Haaland / Messi.
- **Nuevo jugador**: Mbappé (Antigravity).
- **Fecha**: 2026-08-21.
- **Último commit relevante**: `dbb9261` (fix/c001-per-item-save-feedback).
