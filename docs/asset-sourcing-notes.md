# Verificação inicial de assets para o editor

O primeiro candidato selecionado para o mapa demonstrativo é o **RPG pack: base set**, publicado por **Kenney** no OpenGameArt. A página identifica o pacote como arte 2D, traz tags de **CC0** e informa que contém terreno, água, construções, telhados, janelas e caixotes. A página também esclarece que o crédito a `Kenney.nl` é opcional. [1]

| Fonte candidata | Autor | Uso previsto | Licença registrada | Atribuição |
|---|---|---|---|---|
| RPG pack: base set | Kenney | Terreno, estrada, água, construções e objetos do mapa demonstrativo | CC0, conforme indicação da página de origem | Opcional; registro mantido no manifesto |

O arquivo só será incorporado após a conferência de seu conteúdo e de seus metadados locais. Não serão usados assets Zao anteriormente fornecidos nem mapas derivados de jogos comerciais.

## Inspeção local

A prévia extraída do pacote confirma a presença de variações de gramado, estrada de terra, água, pedra, telhados, construções, vegetação, cercas e portas. A primeira imagem individual inspecionada, `rpgTile000.png`, é um tile de grama com borda de estrada de terra e mede 64 × 64 pixels. A importação do editor preservará esse tamanho nativo por asset, enquanto a grade lógica padrão continua configurável em 32 pixels.

Na prévia do editor, a variação inicialmente catalogada para o gramado revelou bordas de terra repetidas. A inspeção de `rpgTile003.png` confirmou um tile de gramado uniforme de 64 × 64 pixels; ele substitui a variação com borda na camada-base do mapa demonstrativo.

## Inspeção para drops em campo

Os props `rpgTile184.png` e `rpgTile188.png` foram inspecionados e identificados respectivamente como barril e porta/janela. Ambos foram descartados para o drop, pois não comunicam baú de saque. O baú será selecionado do mesmo pacote CC0 e publicado separadamente para o mundo Babylon, com fonte e licença registradas no manifesto.

## Sprite de baú para drops

O spritesheet `chests_32x32.png` de **Blarumyrran**, obtido em [OpenGameArt](https://opengameart.org/content/treasure-chests-32x32-and-16x16), foi conferido como conteúdo **CC0**. A folha mede 96 × 160 pixels e organiza frames de 32 × 32 pixels; o primeiro frame fechado será aplicado ao drop em campo. A imagem será tratada como atlas no Babylon, sem depender de qualquer backdrop externo.

## Referências

[1] [OpenGameArt — RPG pack: base set](https://opengameart.org/content/rpg-pack-base-set)
