# Assets — Vale de Âmbar

**Art direction:** Mundo de fantasia em vista superior como uma maquete pintada à mão. Relva em oliva, musgo e sálvia; pedra cinza-azulada; água verde-azulada; luz de fim de tarde; silhuetas limpas e sombras curtas. O jogador e o destino usam o Âmbar de Rota como contraste funcional. O ciclo ambiental modula a mesma base para amanhecer âmbar, dia claro, crepúsculo dourado e noite azul-profunda, com chuva fina e névoa baixa criadas proceduralmente em camadas sem novos assets externos.

## Referência visual

| Nome | Papel | Tamanho de exibição | Imagem |
|---|---|---:|---|
| Referência do Vale | Alvo de qualidade da composição, câmera e densidade | 16:9, viewport de demonstração | `/manus-storage/vale-ambar-reference_f045f52f.png` |

## Texturas

| Nome | Descrição | Tamanho de uso | Imagem |
|---|---|---:|---|
| Fundo ilustrado do campo | Recorte da referência para manter o campo identificável enquanto os tiles dedicados processam | 48 x 34 unidades | `/manus-storage/vale-ambar-field-fallback_07dc91d6.png` |
| Relva do vale | Relva quente e sutil para plano caminhável | tile de 3 x 3 unidades | `/manus-storage/vale-ambar-ground_0156fbee.png` |
| Água rasa | Água verde-azulada para riacho bloqueado | tile de 2 x 2 unidades | `/manus-storage/vale-ambar-water_d5e9092a.png` |

## Props e interface

| Nome | Descrição | Tamanho de uso | Imagem |
|---|---|---:|---|
| Kit de campo | Referência de rochas, ruína, árvore, relva e flores | props de 1 a 3 unidades | `/manus-storage/vale-ambar-props_4a163ff7.png` |
| Bússola de rota | Símbolo da marca, sem texto | 44 px no HUD; 64 px favicon | `/manus-storage/vale-ambar-logo_c80bfacc.png` |

## Atribuição de ativos

O fundo ilustrado e os dois materiais de terreno são carregados diretamente pelo `GameWorld`. A marca deve ser exibida pelo overlay React. A referência visual é usada para inspeção comparativa durante a verificação. O kit de campo define as silhuetas e cores dos props procedurais enquanto esta versão privilegia colisões estáveis a sprites recortados.
