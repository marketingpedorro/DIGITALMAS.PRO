---
schema: digitalmas-handoff-v1
project_id: C001
project_name: Kixiki Lanches
status: in_progress
stage: v1-publica
current_player: mbappe
repo: marketingpedorro/DIGITALMAS.PRO
branch: fix/c001-mobile-cardapio-gift
updated_at: 2026-08-21T23:25:00-03:00
---

# HANDOFF · C001 KIXIKI

## 🎯 Objetivo actual
Publicación oficial de la V1 pública de Kixiki Lanches en producción tras la aprobación GO de Messi y Andy.

## ✅ Hecho
- **V1 Pública Aprobada (GO)**: validación completa de la experiencia visual pública, responsive y funcional.
- **Cardápio Visual e Interactivo**: mobile-first, flip cards 3D; simetría geométrica estricta (480px flip + 56px CTA desktop; 450px + 56px móvil) con reverso semántico `<ul>`/`<li>` para ingredientes y descripciones comerciales limpias.
- **Rodapé Institucional e Identidad**: inversión total de superficie DIA/NOITE (`#fff8e7` en DIA vs `#001e10` en NOITE), créditos íntegros a 2 líneas ("Desenvolvido por Andrés Sebastián · DigitalMas.PRO" y "Fundador · Técnico Universitário em Web pela UNSL (Argentina)."), y enlaces canónicos a Instagram, WhatsApp y Privacidade.
- **Aviso de Privacidade e LGPD First-Party**: página `/privacidade/` dedicada pt-BR, mobile-first, com 9 seções estruturadas, suporte dinâmico para tema DIA / NOITE e eliminação de dependência externa com fonte Montserrat local first-party (`/assets/montserrat-latin-400-900.woff2`).
- **Microfunnel Regalo WhatsApp DigitalMas**: CTA `"Quero meu presente no WhatsApp →"`, destino direto ao WhatsApp da DigitalMas com mensagem pré-formatada de atribuição e disparo seguro do evento `gift_cta_click`.
- **Superfície Pública e SEO**: `404.html` personalizado com etiqueta `FORA DO CARDÁPIO`, `sitemap.xml` atualizado com `/privacidade/`, `robots.txt` e QR SVG para avaliações (Táctica Regalo).
- **Medição Técnica**: telemetria first-party anônima agregada em Netlify Blobs isolada por prefixos entre preview e produção.
- **Higiene de `/public`**: 13 arquivos órfãos/legacy excluídos do repositório.

## ⚽ Próximos 3 (Fase Siguiente)
1. **Modelado Vibe + Arquitetura**: diagramas e especificação do Painel do Dono.
2. **Iteração Visual de Fotos Reais**: ingestão e publicação do catálogo de fotos dos lanches reais.
3. **Smoke Autenticado do Painel**: validação de ponta a ponta com sessão real de proprietário (`kixiki-owner`).

## 🚧 Bloqueos / Estado de Módulos
- **Painel do Dono (Privado / Congelado)**: O painel permanece isolado e protegido na infraestrutura interna, aguardando modelado formal e smoke autenticado para posterior liberação ao proprietário. Não impacta a V1 pública.

## 🛑 No tocar
- H1 estratégico.
- Dardo.
- DNS / dominios de producción sin autorización previa.
- Proyectos externos o experimentos no relacionados.
- Migración general de Control Maestro fuera del alcance de C001.

## 🧪 Baseline
- **Tests**: `npm run test:owner` (84/84 tests OK).
- **Build**: `npm run netlify:build` exitoso.
- **Producción**: [https://kixiki.digitalmas.pro/](https://kixiki.digitalmas.pro/)
- **Preview**: [Netlify Deploy Preview #6](https://deploy-preview-6--kixiki.netlify.app/)

## 🏃 Última entrega
- **Jugador anterior**: Mbappé (Pase #10 - Corrección Quirúrgica Footer NOITE).
- **Nuevo jugador**: Mbappé (Pase Final - Publicación V1 Oficial).
- **Fecha**: 2026-08-21.
- **Último commit relevante**: `2a39c84` (fix(c001): enforce full footer surface inversion in night theme).
