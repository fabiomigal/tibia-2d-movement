# Campo uniforme do Vale de Âmbar

O runtime apresenta todos os mapas como um **único campo contínuo e transitável**. Cada unidade da grade usa a mesma sprite de relva fornecida e autorizada pelo usuário; não há variação por região, água, estrada, parede, ponte, casa, prop ou decoração sobreposta.

| Aspecto | Contrato atual |
|---|---|
| Textura de chão | `amber-field-uniform.png`, repetida uma vez por célula no plano global de 48 × 34 unidades |
| Áreas | Cidade de Âmbar, Estrada dos Ventos, Estalagem do Âmbar e Santuário da Lua compartilham o mesmo campo visual |
| Objetos de cenário | Nenhum objeto é visível no runtime |
| Colisões internas | Nenhuma; apenas os limites externos do mundo continuam ativos |
| Portais, criaturas e baús | Permanecem como pontos lógicos de interação, sem geometria visual no campo |
| Minimapa | Grade de campo com marcadores de jogador, criaturas e travessias |

> A remoção de bloqueios não altera os módulos congelados de movimentação, câmera ou entrada. Ela altera somente a instalação de obstáculos internos do mapa.

No modo hospedado, a imagem vem do armazenamento estático do projeto. No GitHub Pages, o workflow baixa a mesma sprite da release pública versionada e a publica em `field-assets/amber-field-uniform.png`.
