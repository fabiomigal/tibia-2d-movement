# Assets — Vale de Âmbar

## Conjunto ativo — Aurora RPG

> Todos os assets ativos foram recortados da prancha de guia Aurora enviada pelo autor em 20 de agosto de 2026. O autor declarou que a imagem foi gerada sob seus comandos e autorizou expressamente o uso de seus sprites e elementos no Vale de Âmbar público.

**Direção de arte:** pixel art nítida em visão superior 3/4, contorno escuro de um pixel, luz superior esquerda e sombras curtas. A floresta combina verde-musgo, terra âmbar e água ciano; mina usa ardósia azul e cristais cianos; fortaleza trabalha com pedra grafite e luz quente; catacumbas usam pedra violeta e magia púrpura. Personagens e criaturas mantêm leitura forte em escalas entre um e dois tiles.

| Conjunto | Estado no runtime atual | Arquivos preservados |
|---|---|---|
| Campo, floresta, mina, fortaleza e catacumbas | Removidos do runtime; regiões são superfícies de cor sólida | Arquivos anteriores preservados apenas como histórico |
| Personagem principal | **Único atlas de imagem ativo**: Batedor de Ruínas em cinco atlas cardinais 4×4, com norte na linha superior | `batedor-ruinas-idle-4x4_e8c66a18.png`, `batedor-ruinas-walk-4x4_198bb673.png`, `batedor-ruinas-attack-4x4_f5f91a67.png`, `batedor-ruinas-hit-4x4_78b1c80e.png`, `batedor-ruinas-death-4x4_e8975156.png` |
| Criaturas | Marcadores sólidos, sem atlas de criatura ativo | Atlases anteriores preservados apenas como histórico |
| Baús, props e efeitos de mundo | Marcadores e geometrias sólidos, sem tiles ou props de imagem ativos | Arquivos anteriores preservados apenas como histórico |

> **Proveniência do Batedor de Ruínas:** gerado por Gemini sob comandos do usuário `fabiomigal@gmail.com`; uso autorizado pelo autor para o projeto Vale de Âmbar. O arquivo original é preservado fora da aplicação, em `webdev-static-assets/batedor-ruinas/`, e o runtime usa somente os atlas PNG publicados.

> **Pacote no GitHub:** a release [`sprites-batedor-ruinas-v1`](https://github.com/fabiomigal/tibia-2d-movement/releases/tag/sprites-batedor-ruinas-v1) preserva a fonte original, cinco atlas 4×4, os 80 quadros individuais, o manifesto de direções e o script reprodutível de preparação. Durante o workflow, os cinco atlas são extraídos dessa release para `sprites/batedor-ruinas/` no artefato do GitHub Pages; o modo estático do protagonista usa essas URLs públicas, enquanto o runtime hospedado continua carregando os atlas pelo armazenamento estático.

> **Acervo de floresta separado:** a spritesheet `Gemini_Generated_Image_atsht5atsht5atsh.jpg` fornecida pelo autor foi recortada e organizada em `ground`, `paths`, `water` e `props`, com catálogo técnico em [`docs/forest-sprite-catalog.md`](docs/forest-sprite-catalog.md). Nenhuma dessas tiles ou props é carregada no runtime atual: o mapa foi deliberadamente limpo para uma paleta de cores sólidas, preservando somente o atlas do Batedor de Ruínas.

Os conjuntos anteriores permanecem apenas como histórico documental e **não são referenciados pelo runtime ativo**. A troca não modifica movimentação, câmera, colisões, combate, portais, inventário ou controles.
