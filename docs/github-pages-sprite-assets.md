# Atlas do Batedor de Ruínas no GitHub Pages

## Contrato de publicação

O workflow `deploy-pages.yml` baixa o pacote versionado `vale-ambar-batedor-ruinas-v1.zip` da release pública `sprites-batedor-ruinas-v1` depois do build estático. Em seguida, extrai exclusivamente os cinco atlas PNG para `dist/public/sprites/batedor-ruinas/`. O modo estático do personagem principal resolve essas imagens a partir de `import.meta.env.BASE_URL`, preservando o subdiretório `/tibia-2d-movement/` do GitHub Pages.

## Validação local

Em 21 de agosto de 2026, a extração local do pacote foi reproduzida com sucesso e confirmou os cinco arquivos esperados: `idle`, `walk`, `attack`, `hit` e `death`. A prévia inicial do artefato estático ainda exibiu uma tela em branco na janela automatizada, embora o bundle principal e o atlas `idle` tenham respondido com HTTP 200 no subdiretório `/tibia-2d-movement/`. A inspeção do documento mostrou que o script e a folha de estilos foram baixados, mas o contêiner React não montou um canvas nessa prévia temporária. Como esse servidor não reproduz integralmente o ambiente GitHub Pages, a confirmação definitiva será feita no domínio publicado após o workflow.
