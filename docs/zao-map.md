# Mapa de Zao

A primeira cidade foi integrada diretamente ao mundo Babylon.js do projeto. Como o jogo não utiliza OTBM ou um grid externo, o layout da referência foi convertido para uma área contínua de **54 × 54 unidades jogáveis**, mantendo a mesma leitura vertical da imagem original: rio central, estrada longitudinal, praça central, braços laterais, núcleos urbanos, áreas naturais e portões norte e sul.

| Região | Coordenadas aproximadas | Função |
|---|---:|---|
| Núcleo central | x -10 a 9, z -7 a 7 | Praça, casas, ponte, fonte e mercador |
| Rio central | x 1.25, z -25 a 25 | Barreira natural com travessia na ponte central |
| Braço oeste | x -24 a -2, z -8 | Canal lateral e rota de aproximação |
| Portão norte | x 1.25, z -23.2 | Entrada montanhosa e caminho principal |
| Portão sul | x 1.25, z 23.2 | Saída para o conector meridional |
| Zona noroeste | x -22 a -10, z 4 a 16 | Ruínas, árvores e spawn do javali |
| Zona nordeste | x 10 a 23, z -16 a 8 | Floresta, rochas e portal das ruínas |
| Zona sul | x -12 a 22, z 8 a 25 | Caminhos, vegetação e postos avançados |

O personagem inicia em **(-3, 2)**, próximo ao lado oeste da praça central. O rio bloqueia o deslocamento nos trechos norte e sul, enquanto a ponte central mantém a travessia jogável. As casas e muralhas registram colisões retangulares; árvores, pedras e ruínas continuam usando as colisões circulares já existentes no protótipo.

O minimapa foi sincronizado com os limites `ZAO_WORLD_BOUNDS` e passou a representar o rio central e o eixo transversal da cidade. A região exibida pelo HUD agora se chama **Zao**, e o backend usa a cidade `zao` para o catálogo inicial, mercador e ponto de reviver.

## Arquivos principais

A geometria da cidade está em `client/src/game/GameWorld.ts`. Os limites e a posição inicial estão em `shared/game.ts`. A inicialização persistente, cidade, mercador e reviver estão em `server/gameService.ts`. O minimapa e sua conversão de coordenadas ficam em `client/src/components/GameOverlay.tsx` e `client/src/index.css`.
