# Memória de Implementação — Vale de Âmbar

## Decisões confirmadas

- A primeira entrega é um protótipo local de movimentação; autenticação e multiplayer foram removidos do escopo imediato.
- O alvo é navegador desktop e móvel com o mesmo projeto responsivo, não um pacote nativo nesta etapa.
- A movimentação será contínua, com velocidade normalizada em diagonal, sem mover por teleporte entre células.
- Clique/toque no mundo usa movimento em direção a um alvo, enquanto teclado e joystick preservam controle contínuo de prioridade maior.
- Colisões serão determinísticas com círculos e limites do mundo; nenhuma dependência de motor físico é necessária.
- A arte segue a direção “Horizonte em Miniatura”, documentada em `ideas.md` e `ASSETS.md`.

## Próxima verificação relevante

Depois da implementação, capturar desktop e mobile, incluindo `?demo`, e confirmar que o avatar não treme, não atravessa obstáculos e mantém velocidade visualmente uniforme em diagonais.

## Observação de verificação

A primeira captura do modo `?demo` confirmou renderização de cena, HUD, avatar, obstáculos e anel de destino. Como as texturas geradas ainda estavam em processamento, foi reforçada a cor-base do solo para que a legibilidade do campo não dependa de um recurso visual transitório.

Uma camada-base de relva e água foi adicionada abaixo das texturas. Dessa forma, o campo mantém contraste funcional enquanto os recursos externos finalizam o carregamento; as texturas permanecem como acabamento de baixa opacidade.

A captura móvel em 375 × 812 confirmou o joystick no canto inferior esquerdo, a placa de rumo no canto inferior direito e o HUD compacto no topo sem sobreposição crítica. O mapa conserva o jogador no quadro e a câmera reduz a área vertical com segurança.

Os destinos bloqueados agora são cancelados após contato sem deslocamento real, evitando que o jogador permaneça pressionando visualmente contra uma colisão. A camada `CollisionWorld` recebeu testes para travessias longas, deslize tangencial e limites do mundo.

O teste de deslize foi calibrado para a geometria circular real: ele valida avanço tangencial relevante e distância mínima segura ao centro da rocha, sem impor um limite arbitrário a um único eixo.

Os materiais gerados possuem carregamento adiado por tipo MIME. Enquanto a URL retorna o placeholder SVG de processamento, o mapa exibe a camada procedimental de relva e água; quando a imagem final estiver disponível, a textura entra automaticamente sem recarregar a página.

As capturas de página completa ocultavam o canvas porque a janela do jogo usava posicionamento fixo. O enquadramento foi transferido para um contêiner relativo que ocupa a viewport, preservando a experiência de jogo e tornando o mapa verificável em capturas finais.

A revisão visual orientou uma passagem integrada: relevo de relva, caminhos cartográficos de baixa opacidade, margens de água, massas de folhagem em primeiro plano, silhuetas de árvores e pedras em múltiplas camadas e uma bússola operacional em CSS foram adicionados. O Âmbar de Rota fica limitado a destino, direção e estado operacional.

A iluminação hemisférica foi preservada nos materiais do mapa. Isso evita que o brilho emissivo reduzido seja a única fonte de luz e mantém visíveis as separações de terreno, água e objetos.

Os relevos ambientais foram reduzidos para uma textura discreta; o trajeto principal agora é desenhado por faixas curtas e rotacionadas, em vez de discos amplos. Isso melhora a sensação de caminho explorável e evita que a composição pareça um diagrama abstrato.

Como os tiles de relva, água e props ainda retornavam placeholders SVG, foi incorporado um recorte do terreno da referência visual como fundo ilustrado estável. Ele permanece abaixo da camada de colisões e recebe automaticamente os tiles finais quando estiverem disponíveis.

O riacho foi reposicionado para o oeste, em três trechos menores. A área de surgimento e a rota inicial agora permanecem abertas, enquanto água e limites continuam sendo obstáculos claros para o teste de colisão.

As capturas de validação confirmaram que o modo de demonstração desloca o avatar a 5,2 u/s, com anel de destino em Âmbar de Rota, área de movimento livre no centro e obstáculos laterais. Em 375 × 812, a placa de status, joystick e instrução tática permanecem separados e legíveis.
