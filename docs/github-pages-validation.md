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
