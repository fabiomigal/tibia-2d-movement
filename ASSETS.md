# Assets — Vale de Âmbar

## Conjunto ativo — Aurora RPG

> Todos os assets ativos foram recortados da prancha de guia Aurora enviada pelo autor em 20 de agosto de 2026. O autor declarou que a imagem foi gerada sob seus comandos e autorizou expressamente o uso de seus sprites e elementos no Vale de Âmbar público.

**Direção de arte:** pixel art nítida em visão superior 3/4, contorno escuro de um pixel, luz superior esquerda e sombras curtas. A floresta combina verde-musgo, terra âmbar e água ciano; mina usa ardósia azul e cristais cianos; fortaleza trabalha com pedra grafite e luz quente; catacumbas usam pedra violeta e magia púrpura. Personagens e criaturas mantêm leitura forte em escalas entre um e dois tiles.

| Conjunto | Estado no runtime atual | Arquivos preservados |
|---|---|---|
| Grades de chão dos mapas | **Ativas em todos os mapas**: campo de Âmbar, Estrada dos Ventos, Estalagem e Santuário usam somente variações de piso, sem objetos ou estruturas | `amber-meadow-atlas_9c669b22.png`, `wind-trail-atlas_2727f147.png`, `inn-garden-atlas_4d8b2099.png`, `moon-clearing-atlas_b5f9ac1e.png` |
| Personagem principal | **Único atlas de imagem ativo**: Batedor de Ruínas em cinco atlas cardinais 4×4, com norte na linha superior | `batedor-ruinas-idle-4x4_e8c66a18.png`, `batedor-ruinas-walk-4x4_198bb673.png`, `batedor-ruinas-attack-4x4_f5f91a67.png`, `batedor-ruinas-hit-4x4_78b1c80e.png`, `batedor-ruinas-death-4x4_e8975156.png` |
| Criaturas | Marcadores sólidos, sem atlas de criatura ativo | Atlases anteriores preservados apenas como histórico |
| Baús, props e efeitos de mundo | Marcadores e geometrias sólidos, sem tiles ou props de imagem ativos | Arquivos anteriores preservados apenas como histórico |

> **Proveniência do Batedor de Ruínas:** gerado por Gemini sob comandos do usuário `fabiomigal@gmail.com`; uso autorizado pelo autor para o projeto Vale de Âmbar. O arquivo original é preservado fora da aplicação, em `webdev-static-assets/batedor-ruinas/`, e o runtime usa somente os atlas PNG publicados.

> **Pacote no GitHub:** a release [`sprites-batedor-ruinas-v1`](https://github.com/fabiomigal/tibia-2d-movement/releases/tag/sprites-batedor-ruinas-v1) preserva a fonte original, cinco atlas 4×4, os 80 quadros individuais, o manifesto de direções e o script reprodutível de preparação. Durante o workflow, os cinco atlas são extraídos dessa release para `sprites/batedor-ruinas/` no artefato do GitHub Pages; o modo estático do protagonista usa essas URLs públicas, enquanto o runtime hospedado continua carregando os atlas pelo armazenamento estático.

> **Acervo de floresta separado:** as spritesheets de chão e árvores fornecidas pelo autor foram recortadas e organizadas para uso futuro. O catálogo de cobertura, caminhos, água e props permanece em [`docs/forest-sprite-catalog.md`](docs/forest-sprite-catalog.md); o perfil e a distribuição exclusivamente terrestre dos quatro mapas estão descritos em [`docs/clean-map-ground-profiles.md`](docs/clean-map-ground-profiles.md). Apenas as tiles de chão são carregadas nesta etapa.

> **Tiles no GitHub Pages:** os quatro atlas são preservados na release pública [`clean-field-tiles-v1`](https://github.com/fabiomigal/tibia-2d-movement/releases/tag/clean-field-tiles-v1). O workflow os extrai para `tiles/clean-field/` no artefato estático, garantindo que a mesma grade de chão seja exibida no GitHub Pages.

Os conjuntos anteriores permanecem apenas como histórico documental e **não são referenciados pelo runtime ativo**. A troca não modifica movimentação, câmera, colisões, combate, portais, inventário ou controles.
