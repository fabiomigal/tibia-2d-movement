# Aurora RPG — Direção de Arte e Extração Autorizada

## Origem e autorização

Este conjunto visual é derivado da imagem de guia enviada pelo autor do projeto em 20 de agosto de 2026. O autor declarou que a imagem foi gerada por IA sob seus comandos e instruiu expressamente que os sprites e assets nela presentes sejam usados no Vale de Âmbar. Os recortes resultantes são destinados exclusivamente a este projeto público.

> A imagem é tratada como **fonte artística autorizada**. Esta substituição não altera movimentação, câmera, colisões, combate, portais, inventário, dados nem controles.

## Contrato visual

| Elemento | Fonte dentro da guia | Aplicação no jogo |
|---|---|---|
| Bioma de floresta | Lote B — Floresta do Orvalho | Gramado, flores, trilha, água e vegetação do exterior |
| Bioma de mina | Lote C — Mina de Brasa Azul | Pedra, cristal e superfícies internas do santuário |
| Fortaleza | Lote D — Fortaleza do Crepúsculo | Muralhas, pedra estrutural e passagens da estalagem |
| Catacumbas | Lote E — Catacumbas Violeta | Variações violetas de interior e acentos mágicos |
| Props | Lote F — Props e objetos interativos | Árvore, canteiro, rocha e baú de saque |
| Jogador | Lote G — Personagens jogáveis | Aventureiro principal em atlas de quatro direções |
| Criaturas | Lote I — Monstros pequenos e médios | Silhuetas substitutas de goblin e javali em atlas de quatro direções |
| Efeitos | Lote L — Efeitos visuais e indicadores | Partículas de poeira e apoio futuro para ataque, portal e cura |

## Regras de preparo

Os tiles são preservados como quadrados opacos para repetição. Personagens, criaturas, props e efeitos recebem recorte com canal alfa através da remoção programática somente do fundo creme uniforme da prancha, preservando contornos e a paleta original. Molduras, títulos e textos de catálogo ficam fora das áreas de corte.

Os atlas de ator usam quatro linhas compatíveis com o renderizador atual: sul, leste, norte e oeste. Quando a prancha traz apenas uma pose legível por criatura, ela é repetida de forma intencional nos quatro frames visuais; a lógica de estado, orientação, combate, dano e morte permanece inalterada.

## Revisão de recortes

A prancha de controle confirmou que os materiais de floresta, mina, fortaleza e catacumbas são utilizáveis como tiles opacos. Os recortes de aventureiro e criatura serão refinados para isolar apenas uma família visual por atlas, e os recortes de javali e poeira serão deslocados para excluir linhas de legenda do catálogo. Essa calibração afeta somente os pixels de origem e não os contratos de renderização.

A grade derivada dos lotes confirmou que os recortes de terreno devem permanecer nas regiões centrais sem bordas de card. A segunda calibração moveu gramado, trilha e água para células limpas da Floresta do Orvalho, isolou o Guardião de Cristais para o ator goblin e reposicionou os recortes de javali, baú e poeira abaixo das respectivas legendas.

Uma terceira calibração removeu uma margem de três pixels dos tiles repetidos antes de reampliá-los por vizinho mais próximo. Isso impede que linhas de separação da prancha se repitam na malha do mundo, mantendo a arte de origem sem criar novos desenhos.
