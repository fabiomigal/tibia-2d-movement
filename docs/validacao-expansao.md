# Validação da expansão

## Resultado técnico

Em 18 de agosto de 2026, a checagem `pnpm check` concluiu sem erros e `pnpm test` aprovou sete testes em duas suítes. A cobertura atual valida logout de infraestrutura e regras de domínio de dano elemental, capacidade, progressão e regiões.

## Resultado visual

As verificações de tela confirmaram que o HUD de personagem, mapa local, lista de encontros, atalhos, joystick mobile e marca Âmbar coexistem com o canvas. O marcador do minimapa recebe a posição da telemetria da cena, enquanto um hotspot próximo recebe sinal próprio. Em desktop, a rota de demonstração mostra o anel de destino sem alterar a câmera. Em tela de 390 × 844 px, o joystick, os atalhos e a telemetria continuam acessíveis.

## Observação de regressão

Os módulos `Player.ts`, `MovementInput.ts` e `CameraController.ts` permanecem fora das alterações da expansão. As adições no mundo limitam-se a entidades, sinais de proximidade e telemetria de leitura.
