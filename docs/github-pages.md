# Demonstração no GitHub Pages

O repositório inclui o workflow `.github/workflows/deploy-pages.yml`. A cada envio para `main`, ele gera uma versão estática do cliente e a publica pelo GitHub Pages na rota do repositório.

> O GitHub Pages hospeda apenas arquivos estáticos. Assim, a demonstração preserva canvas, movimentação, câmera, cenário, HUD e interações locais; recursos que dependem do servidor tRPC e do banco de dados — como persistência, combate autoritativo e inventário salvo — continuam disponíveis na implantação gerenciada do projeto.

## Operação

O build estático é reproduzível localmente com `pnpm build:github-pages`. Para habilitar a primeira publicação, o repositório deve usar **GitHub Actions** como fonte do Pages. Depois que o workflow concluir, a URL esperada será:

`https://fabiomigal.github.io/tibia-2d-movement/`

O workflow possui permissões mínimas de leitura do conteúdo, escrita no Pages e token de identidade para a publicação do artefato.
