# Validação visual — ambiente e exploração

## Execução

Em 19 de agosto de 2026, o preview do Vale de Âmbar foi verificado em desktop (1280 × 720) e mobile (375 × 812), após a aprovação de TypeScript, build de produção e 115 testes automatizados.

| Viewport | Evidências observadas | Resultado |
| --- | --- | --- |
| Desktop, 1280 × 720 | Indicador de **Amanhecer âmbar**, campo em tiles, rio, ponte, spawns adicionais e HUD completo renderizados sem sobreposição do canvas. | Aprovado |
| Mobile, 375 × 812 | HUD, minimapa, mochila, encontros, atalhos e joystick permaneceram visíveis e acionáveis sobre o mundo. | Aprovado |

## Cobertura funcional

O ciclo ambiental é determinístico e publica fase do dia, tonalidade e clima no HUD. Chuva e névoa são camadas estritamente visuais e respeitam a preferência de redução de movimento. As regiões **Estalagem do Âmbar** e **Santuário da Lua** possuem áreas físicas distintas, colisores próprios e portais bidirecionais. O respawn persistido e visual utiliza uma única constante de **2.000 ms**, com o snapshot renovado ao término do atraso.

> As validações não modificaram `MovementInput.ts`, `Player.ts`, `CameraController.ts`, `CollisionWorld.ts` nem `DemoPilot.ts`.
