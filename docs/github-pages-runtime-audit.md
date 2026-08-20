# Auditoria de runtime — GitHub Pages

## Resultado

O build com `GITHUB_PAGES=true VITE_STATIC_DEMO=true` foi servido localmente sob o prefixo `/tibia-2d-movement/`, simulando a URL final do GitHub Pages. O canvas, o HUD, o minimapa e a demonstração local foram carregados normalmente.

| Verificação | Resultado |
| --- | --- |
| TypeScript | Aprovado |
| Build estático | Aprovado |
| Prefixo de subdiretório do repositório | Aprovado |
| Chamadas a `/api/*` do projeto | Nenhuma |
| Chamadas a `/manus-storage/*` | Nenhuma |
| Recursos locais e favicon | Aprovados |

> A única chamada residual observada é o envio de analytics do ambiente de preview. Ela não pertence ao backend nem ao armazenamento do projeto e não integra o fluxo de jogo no GitHub Pages.

