# Integração do Batedor de Ruínas

## Origem e autorização

O arquivo de origem `Gemini_Generated_Image_ypg5w1ypg5w1ypg5.jpg` foi fornecido pelo usuário e é preservado fora da aplicação em `webdev-static-assets/batedor-ruinas/`. O autor declarou a autorização de uso no Vale de Âmbar. A proveniência registrada é: **gerado por Gemini sob comandos do usuário `fabiomigal@gmail.com`; uso autorizado pelo autor para o projeto Vale de Âmbar.**

## Preparação do atlas

A prancha JPEG de 1264 × 843 px possui fundo quadriculado sem canal alfa. O script `prepare_batedor_atlas.py` remove somente pixels neutros conectados às bordas, exporta **80 quadros PNG individuais** e só então monta cinco atlas RGBA de 512 × 512 px. Todos seguem uma grade de **4 colunas × 4 linhas** com células transparentes de 128 × 128 px, na ordem `norte`, `leste`, `sul`, `oeste` de cima para baixo. O controlador aplica UV vertical invertido apenas ao Batedor de Ruínas para manter a cabeça no alto do plano do mundo.

| Estado | Arquivo publicado | Regra de reprodução |
|---|---|---|
| Repouso | `/manus-storage/batedor-ruinas-idle-4x4_e8c66a18.png` | Quatro poses de repouso isoladas por direção |
| Caminhada | `/manus-storage/batedor-ruinas-walk-4x4_198bb673.png` | Quatro ciclos curtos isolados por direção |
| Ataque | `/manus-storage/batedor-ruinas-attack-4x4_f5f91a67.png` | Quatro fases de golpe isoladas, sem loop |
| Dano | `/manus-storage/batedor-ruinas-hit-4x4_78b1c80e.png` | Reação de impacto isolada, sem loop |
| Derrota | `/manus-storage/batedor-ruinas-death-4x4_e8975156.png` | Sequência de queda isolada, sem loop |

As linhas `sul` e `oeste` são variações espelhadas dos recortes `norte` e `leste` quando a prancha não oferece uma amostra distinta para aquela direção. Isso preserva o mapeamento cardinal, a orientação superior do mundo e o comportamento do controlador, sem inventar arte nova ou misturar quadros vizinhos.

## Verificação

Em 21 de agosto de 2026, o jogo foi verificado no modo demonstrativo em viewport desktop de 1280 × 720 e mobile de 375 × 812. O protagonista renderizou no mundo em visão superior com os atlas publicados; os painéis e controles responsivos continuam presentes. A checagem de tipos, os testes e os builds de produção e GitHub Pages foram executados com sucesso; o conjunto de testes registrou 118 aprovações em 44 arquivos.

Na correção posterior, as prévias repetidas em desktop e mobile confirmaram o personagem verticalmente orientado no mundo e composto por células transparentes isoladas. A orientação do atlas foi consolidada como `norte`, `leste`, `sul`, `oeste`, de cima para baixo; a inversão V é aplicada somente ao Batedor de Ruínas para preservar essa ordem no plano horizontal.
