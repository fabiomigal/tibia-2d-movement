# Validação local do GitHub Pages

## Tentativa inicial

O build estático foi servido localmente pela rota equivalente a `/tibia-2d-movement/`. Os bundles principais e a folha de estilos foram solicitados, porém o elemento `#root` permaneceu vazio e a tela ficou branca. A prévia também requisitou um recurso legado em `/manus-storage/`, incompatível com o diretório estático.

| Verificação | Resultado |
| --- | --- |
| `pnpm check` | Aprovado |
| `pnpm test` | Aprovado: 115 testes em 44 arquivos |
| `pnpm build` | Aprovado: aplicação completa e servidor |
| `pnpm build:github-pages` | Aprovado: artefato estático |
| Rota estática sob o subdiretório do repositório | Aprovado após servidor local com prefixo equivalente ao Pages |
| Carregamento de assets no modo estático | Aprovado com fallback geométrico local para tiles e sprites |

> A aplicação monta o canvas e o HUD com dados demonstrativos locais. Os controles de movimento e as transições locais continuam disponíveis; combate, inventário persistido e demais mutações permanecem reservados ao ambiente completo com servidor.

## Habilitação no repositório

O workflow de deploy está configurado com as permissões necessárias, mas o GitHub requer que o **Pages** seja habilitado previamente em **Settings → Pages**, selecionando **GitHub Actions** como fonte de publicação. Essa configuração administrativa antecede o uso de workflows personalizados.

A tentativa de habilitar essa configuração pela autorização conectada retornou `403 Resource not accessible by integration`; a resposta da API exige as permissões administrativas `pages: write` e `administration: write`, indisponíveis ao token de integração. A seleção da fonte precisa, portanto, ser feita na interface do GitHub por uma conta administradora do repositório.

Referências oficiais: [configuração da fonte de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) e [workflows personalizados](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Publicação concluída

Em 20 de agosto de 2026, o GitHub Pages foi habilitado manualmente na conta administradora e o workflow `Publicar demonstração no GitHub Pages` foi concluído com êxito. A URL publicada respondeu com HTTP 200 e foi aberta no navegador, exibindo o canvas do jogo, HUD, minimapa, mochila e controles locais.

URL pública: <https://fabiomigal.github.io/tibia-2d-movement/>
