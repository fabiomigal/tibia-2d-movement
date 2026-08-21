# Integração do Batedor de Ruínas

## Origem e autorização

O arquivo de origem `Gemini_Generated_Image_ypg5w1ypg5w1ypg5.jpg` foi fornecido pelo usuário e é preservado fora da aplicação em `webdev-static-assets/batedor-ruinas/`. O autor declarou a autorização de uso no Vale de Âmbar. A proveniência registrada é: **gerado por Gemini sob comandos do usuário `fabiomigal@gmail.com`; uso autorizado pelo autor para o projeto Vale de Âmbar.**

## Preparação do atlas

A prancha JPEG de 1264 × 843 px possui fundo quadriculado sem canal alfa. O script `prepare_batedor_atlas.py` remove somente pixels neutros conectados às bordas de cada recorte e cria cinco atlas RGBA de 384 × 384 px. Todos seguem uma grade de **4 colunas × 4 linhas** com células de 96 × 96 px e mantêm o contrato cardinal `sul`, `leste`, `norte`, `oeste` do controlador existente.

| Estado | Arquivo publicado | Regra de reprodução |
|---|---|---|
| Repouso | `/manus-storage/batedor-ruinas-idle-4x4_172055a4.png` | Quatro poses de repouso derivadas das amostras frontais e laterais |
| Caminhada | `/manus-storage/batedor-ruinas-walk-4x4_c6df36d3.png` | Quatro ciclos curtos de deslocamento |
| Ataque | `/manus-storage/batedor-ruinas-attack-4x4_6d483878.png` | Quatro fases de golpe sem loop |
| Dano | `/manus-storage/batedor-ruinas-hit-4x4_c45f3f51.png` | Reação de impacto sem loop |
| Derrota | `/manus-storage/batedor-ruinas-death-4x4_a1c8a2f0.png` | Sequência de queda sem loop |

As linhas norte e oeste são variações espelhadas dos recortes frontais e laterais quando a prancha não oferece uma amostra distinta para aquela direção. Isso preserva o mapeamento cardinal, a orientação superior do mundo e o comportamento do controlador, sem inventar arte nova.

## Verificação

Em 21 de agosto de 2026, o jogo foi verificado no modo demonstrativo em viewport desktop de 1280 × 720 e mobile de 375 × 812. O protagonista renderizou no mundo em visão superior com os atlas publicados; os painéis e controles responsivos continuam presentes. A checagem de tipos, os testes e os builds de produção e GitHub Pages foram executados com sucesso; o conjunto de testes registrou 118 aprovações em 44 arquivos.
