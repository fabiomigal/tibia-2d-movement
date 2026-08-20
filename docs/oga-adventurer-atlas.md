# Atlas do aventureiro OGA — notas de integração

O arquivo publicado `/manus-storage/sprite_oga_f4502ba6.png` foi conferido visualmente a partir do original em `/home/ubuntu/webdev-static-assets/oga-adventurer/sprite_oga.png`. Ele mede **96 × 88 px** e usa uma grade contínua de **6 colunas × 8 linhas**, equivalente a frames de **16 × 11 px**.

| Linhas do atlas | Direção interpretada | Uso no jogo |
| --- | --- | --- |
| 0–3 | Sul, oeste, norte e leste | Direções cardinais do caminhar e repouso |
| 4–7 | Sudoeste, noroeste, nordeste e sudeste | Direções diagonais do caminhar e ataques curtos |

As colunas 0–3 descrevem a caminhada e a leitura de repouso. Como o recurso de TheNess não declara ciclos separados de ataque, impacto ou derrota, esses estados usam recortes estáveis da mesma sequência de locomoção. Essa escolha evita artefatos dos frames finais, preservando a leitura do personagem sem alterar qualquer regra de combate ou respawn.

> A textura deve ser amostrada com `NEAREST`, com eixo V invertido, para conservar os pixels nítidos e a orientação superior do mundo.
