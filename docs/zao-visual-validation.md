# QA visual — Cidade de Âmbar e Estrada dos Ventos

> **Escopo:** correção de escala e orientação das sprites Zao, minimapa baseado no layout e colisões do cenário. A movimentação e a câmera não foram modificadas.

| Verificação | Desktop | Mobile (375 × 812) | Evidência reproduzível |
|---|---|---|---|
| Sprite do aventureiro assentada no terreno | Aprovada | Aprovada | Prévia `/?demo`; regra UV coberta por `spriteAnimation.test.ts` |
| Minimapa com rio, vias, ponte, muralhas e estruturas | Aprovada | Aprovada | Prévia `/?demo`; fonte única `getZaoMapFeatures` |
| Elementos do HUD legíveis sem ocultar o mapa | Aprovada | Aprovada | Prévia responsiva e CSS de minimapa |
| Travessia entre subáreas | Aprovada | Aprovada | `zaoMapNavigation.integration.test.ts` |
| Rios bloqueiam e pontes permanecem transitáveis | Aprovada | Aprovada | Teste integrado com `CollisionWorld` e `Player` |

## Comandos de regressão

```bash
pnpm check
pnpm test
pnpm build
```

O conjunto atual contém **78 testes**. A validação de navegação confirma rios bloqueados e travessia por ambas as pontes; a validação de sprites confirma o recorte vertical invertido necessário para preservar a orientação visual no plano horizontal.
