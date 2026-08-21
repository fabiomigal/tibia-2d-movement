# Catálogo de sprites de floresta

## Escopo

Esta organização preserva a spritesheet de floresta fornecida pelo autor como um acervo pronto para futuras etapas de composição de mapas. Os arquivos foram recortados em células de **32 × 32 px** e permanecem fora do runtime atual: o Vale de Âmbar usa temporariamente apenas materiais de cores sólidas, conforme solicitado.

| Categoria | Quantidade | Conteúdo preparado | Uso futuro previsto |
|---|---:|---|---|
| `ground` | 16 | Variações de relva, terra e piso de vegetação | Cobertura transitável |
| `paths` | 30 | Segmentos retos, curvas, bordas e cruzamentos de caminhos | Rotas e transições terrestres |
| `water` | 4 | Quatro cantos de borda de água | Lagos, rios e curvas de margem |
| `props` | 10 | Cogumelos, tronco, tufos de relva, pedras e rochas | Decoração e pontos de interesse |

## Estrutura preparada

O material-fonte e o pipeline reprodutível ficam em `webdev-static-assets/aurora-forest-catalog/`. A saída usa as pastas `derived/ground`, `derived/paths`, `derived/water` e `derived/props`; o arquivo `derived/forest-sprite-catalog.json` registra nome, categoria, dimensão, recorte de origem e necessidade de transparência para cada recurso.

> Os fundos quadriculados conectados às bordas foram removidos apenas dos itens de `props`, preservando transparência para futura colocação sobre terreno. As tiles de cobertura e caminho mantêm seu fundo integral para encaixe em grade.

## Estado de integração

As categorias estão **preparadas, mas não aplicadas**. A camada atual de mapa removeu tiles e props de imagem, usando a paleta sólida declarada em `zaoTileWorld.ts`. O único atlas de imagem ativo no runtime é o Batedor de Ruínas, personagem principal.

## Verificação visual

Em 21 de agosto de 2026, a cena foi verificada em viewport desktop de 1280 × 720 e mobile de 375 × 812. As regiões de relva, estrada, água, pedra, parede, obstáculos, baús e criaturas foram exibidas como superfícies ou marcadores de cor sólida. O Batedor de Ruínas permaneceu como a única sprite de imagem visível no campo; os controles, HUD, minimapa, inventário e pontos interativos continuaram presentes nos dois formatos.
