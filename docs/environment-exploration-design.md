# Ambiente e exploração — Vale de Âmbar

## Direção visual

O ciclo ambiental preserva a leitura de **Horizonte em Miniatura**: amanhecer âmbar, dia claro, entardecer dourado e noite azul-profunda. Chuva será formada por traços finos e névoa por camadas translúcidas na interface, sempre sem bloquear entrada, HUD ou contraste das criaturas. A referência visual existente do Vale continua sendo a âncora de composição; a nova camada apenas modula sua paleta.

| Sistema | Decisão | Motivo |
| --- | --- | --- |
| Dia/noite | Ciclo determinístico de 96 segundos no loop de renderização | Mantém o efeito testável e não exige processo contínuo externo. |
| Clima | Sequência previsível de céu limpo, chuva e névoa | Oferece variação visual legível sem aleatoriedade que dificulte testes. |
| Interiores | Estalagem do Âmbar, em área distinta do mundo contínuo | Cria exploração imediata sem alterar câmera, entrada ou modelo de deslocamento. |
| Novo mapa | Santuário da Lua, acessado pelo Portal das Ruínas | Acrescenta uma zona de floresta enevoada com encontro próprio. |
| Portais | Hotspots com destino explícito e retorno bidirecional | Evita telas genéricas e mantém o jogador no fluxo de exploração. |
| Respawn | Dois segundos gravados no encontro e refletidos pelo HUD | O retorno da criatura é consistente entre o snapshot persistido e o mundo visual. |

> Os efeitos temporizados pertencem ao ciclo local do jogo e ao timestamp persistido do encontro. Não há tarefa agendada, processo em segundo plano ou serviço externo.

