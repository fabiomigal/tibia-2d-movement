# Correção de orientação Aurora

## Incidente

Após a integração dos recortes Aurora, o usuário reportou que **tiles, props e sprites apareciam de cabeça para baixo**. O problema estava restrito à apresentação: a lógica de movimento, a câmera, as colisões, o combate e os eventos do jogo não foram alterados.

## Correção aplicada

Os planos horizontais de cenário, interiores, decorações, baús e materiais de fallback agora aplicam uma inversão UV vertical consistente (`vOffset = 1`, `vScale = -1`). Os atlases de atores, por sua vez, usam o sentido V nativo, preservando a imagem de cada célula e a ordem cardinal declarada no atlas.

## Verificação visual

As prévias em **1280 × 720** e **375 × 812** confirmaram a renderização dos materiais e personagens após a correção, mantendo HUD, joystick, mapa local e painéis de inventário legíveis. A verificação automatizada também confirmou TypeScript e 117 testes aprovados antes da revisão visual.

## Escopo preservado

Não foram modificados `MovementInput.ts`, `Player.ts`, `CameraController.ts`, `CollisionWorld.ts`, `DemoPilot.ts` nem a geometria em `zaoMapLayout.ts`.
