# Subsistema independente de mapas em tiles

> O editor e o runtime descritos neste documento formam um subsistema novo e autocontido. Eles não importam, modificam nem dependem de `GameWorld`, `Player`, `MovementInput`, `CameraController`, `CollisionWorld` ou `DemoPilot` do protótipo Vale de Âmbar.

## Objetivo e fronteira

O sistema será instalado sob `client/src/tilemap/` e exposto em uma rota própria de editor. Seu estado de mapa será um documento JSON estruturado, com assets referenciados por identificador, camada e propriedades de colisão independentes da aparência visual. A rota do jogo continua disponível e sem alteração comportamental.

| Responsabilidade | Subsistema de tiles | Protótipo de jogo existente |
|---|---|---|
| Grade e coordenadas | `x`, `y`, `z`, tamanho de tile configurável | Coordenadas de mundo atuais |
| Camadas | Terreno, bordas, objetos, entidades e efeitos | Cena Babylon existente |
| Colisão | Dados declarativos por tile/objeto | Consulta de colisão do jogo, sem modificação |
| Editor | Pintura, seleção, propriedades, importação e exportação JSON | Não se aplica |
| Assets | Manifesto com licença e fonte | Assets anteriores não são reutilizados por este módulo |

## Estrutura prevista

```text
client/src/tilemap/
  model.ts          # contratos de mapa, tile, objeto, evento e asset
  demoMap.ts        # documento estruturado de demonstração
  validation.ts     # verificações puras de integridade
  TileMapCanvas.tsx # renderização 2D por grade e viewport
  MapEditor.tsx     # ferramentas e painéis do editor
  catalog.ts        # manifesto de assets e atribuições
```

O primeiro incremento será funcional no navegador: o mapa poderá ser pintado, ter colisões editadas, ser exportado para JSON e restaurado por importação. A persistência remota e o carregamento de pacotes externos serão adicionados como extensões posteriores, sem mudar o formato do documento.
