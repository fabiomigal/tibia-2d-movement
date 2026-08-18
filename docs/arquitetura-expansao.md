# Arquitetura de expansão compatível com hospedagem atual

## Princípio de integração

O módulo `GameWorld` continua proprietário apenas do desenho do campo, do avatar, das colisões, dos controles e da câmera. Os sistemas adicionais comunicam-se por uma ponte de eventos tipada entre a cena e a interface React. Esse limite protege o comportamento aprovado contra regressões.

| Camada | Responsabilidade | Limite explícito |
|---|---|---|
| Cena 3D | Mostrar criaturas, portais, itens, indicadores de alvo e efeitos visuais; emitir eventos de interação. | Não calcula inventário, dano, XP nem validade de recompensas. |
| Runtime do jogo | Manter o personagem de desenvolvimento, região atual, entidades locais e estado transitório de combate. | Não altera `Player`, `MovementInput` nem `CameraController`. |
| Interface React | HUD, barras de recurso, atalhos, janelas de inventário, skills, mapa, cidade, caça idle e avisos. | Não resolve regras de combate ou de capacidade. |
| Serviços tRPC | Aplicar regras determinísticas de combate, inventário, loot, equipamento e recuperação de sessão. | Opera em procedimento público de desenvolvimento até autenticação ser solicitada. |
| Banco de dados | Persistir personagem de desenvolvimento, itens, equipamentos, regiões desbloqueadas e sessões de caça. | Não contém estado efêmero de renderização. |

## Dados persistidos

| Entidade | Dados essenciais |
|---|---|
| Personagem | Arquétipo, nível, XP, ouro, HP/MP/energia, atributos, posição/região, morte e última atualização. |
| Itens do personagem | Slot, raridade, peso, quantidade, equipado e metadados de item. |
| Skills | Nome, tipo elemental, custo, dano e status equipado. |
| Exploração | Região atual, regiões desbloqueadas, portais e andares alcançados. |
| Sessão idle | Monstro, estado, início, última resolução e recompensas acumuladas. |

## Modos operacionais

| Recurso | Nesta hospedagem | Preparação futura |
|---|---|---|
| Personagem e inventário | Persistência no banco via procedimentos do jogo. | Vinculação ao usuário autenticado. |
| Combate e IA | Resolução por chamada sob demanda; entidades em runtime local. | Loop regional contínuo e sincronização multiusuário. |
| Caça idle | Cálculo por tempo decorrido quando o jogador abre ou atualiza a sessão. | Processamento ativo em segundo plano. |
| Multiplayer | Não exposto neste estágio. | Canal de tempo real e FOV regional. |

## Contratos de domínio

As regras usam os sete elementos do documento: físico, fogo, gelo, energia, terra, sagrado e morte. O multiplicador segue `max(0, 2 - resistência)` com dano mínimo de um. A capacidade do inventário usa `50 + 25 × nível`, combinada ao limite de cinquenta slots. Itens, dano e recompensas serão calculados por serviços, e a interface apenas apresentará o resultado.

## Critério de preservação

Os arquivos `Player.ts`, `MovementInput.ts` e `CameraController.ts` não devem ser modificados por esta expansão. `GameWorld.ts` pode apenas receber camadas de entidades e eventos que não alcancem os métodos ou valores usados por essas três unidades.
