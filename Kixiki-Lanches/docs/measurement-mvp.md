# C001 · Medição MVP

Kixiki mede quatro ações públicas, sem cookies invasivos nem dados pessoais:

- `page_view`
- `whatsapp_click`
- `gift_view`
- `gift_cta_click`

O navegador conserva `utm_source`, `utm_medium`, `utm_campaign` e o referrer sem query string durante a sessão. `POST /api/kixiki-events` aplica uma allowlist explícita e grava eventos em `digitalmas-c001-events`, separado do Blob canônico do Painel do Dono e do Control Maestro.

Preview e produção usam prefixos diferentes. Assim, QA não contamina os números reais.

O dono autenticado com o perfil `kixiki-owner` verifica contagens e origens no bloco **Medição MVP · C001** da tela Início. A leitura vem de `GET /api/kixiki-metrics`; ela é agregada, read-only e não expõe eventos individuais.

`lead_created` e `client_won` ficam reservados para uma integração futura com uma fonte real de leads/clientes. Eles não pertencem à allowlist atual e não são emitidos pelo site.
