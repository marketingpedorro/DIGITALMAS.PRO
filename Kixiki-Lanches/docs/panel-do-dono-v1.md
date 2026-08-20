# Painel do Dono v1 · C001 Kixiki

## Limite do painel

O painel em `/dono/` permite editar somente dados operacionais da Kixiki:

- delivery, área de atendimento, horários e retirada;
- horários semanais;
- produtos, preço, descrição, ingredientes, URL HTTPS de foto real e ativo/inativo;
- estado, data e evidência das três prioridades SEO aprovadas;
- checkpoints Dia 0, 14, 30, 60 e 90.

O modelo e a validação do servidor rejeitam campos adicionais. H1, Dardo, copy de conversão, CSS, branding, estrutura pública e dados de outros projetos não fazem parte do contrato aceito pelo endpoint.

## Acesso

O login reutiliza Netlify Identity, sem senha ou segredo no navegador/repositório. O endpoint `/api/kixiki-owner` exige no servidor:

1. sessão válida;
2. papel `kixiki-owner` no usuário.

Para ativar Carlos, um administrador do site deve convidar/criar o usuário no Netlify Identity e atribuir exatamente o papel `kixiki-owner`. Não compartilhar senha e não adicionar o papel de Director.

## Persistência isolada

- Store: `digitalmas-c001-owner`
- Chave: `c001/kixiki/owner/panel-v1.json`
- Schema: `digitalmas-c001-kixiki-owner-v1`

O registro é compartilhado entre sessões autorizadas da Kixiki e usa ETag para impedir que um aparelho antigo sobrescreva uma versão mais nova. O `localStorage` é apenas cache por ID de usuário; a fonte canônica é Netlify Blobs.

## Publicação

Os dados confirmados no painel não alteram automaticamente o site público. A DigitalMas revisa a evidência antes de transformar qualquer verdade operacional em promessa ou copy pública.
