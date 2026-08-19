import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import { Download, Eraser, Eye, FileUp, Grid2X2, Layers3, MapPinned, MousePointer2, Plus, Upload } from "lucide-react";
import { TILE_ASSET_MANIFEST, TILE_ASSET_IDS, getTileAsset } from "../tilemap/catalog";
import { TileMapCanvas } from "../tilemap/TileMapCanvas";
import { createDemoTileMap, eraseTile, paintTile, putObject, removeObjectsAt, updateObjectProperties, updateTileProperties, type EditorTool } from "../tilemap/editorState";
import { TILEMAP_LAYER_IDS, type CollisionKind, type TileMapLayerId } from "../tilemap/model";
import { parseTileMapImport } from "../tilemap/importing";

const COLLISIONS: CollisionKind[] = ["walkable", "blocked", "water", "danger", "slow", "teleport", "interaction"];
const OBJECT_ASSETS = new Set(["tree", "oak", "bush", "wall", "roof", "barrel", "fence", "fence_long"]);

function downloadMapJson(map: ReturnType<typeof createDemoTileMap>) {
  const content = JSON.stringify(map, null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${map.mapId}.tilemap.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function MapEditor() {
  const [map, setMap] = useState(createDemoTileMap);
  const [activeAssetId, setActiveAssetId] = useState("grass");
  const [activeLayer, setActiveLayer] = useState<TileMapLayerId>("ground");
  const [tool, setTool] = useState<EditorTool>("paint");
  const [collision, setCollision] = useState<CollisionKind>("walkable");
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [showCollision, setShowCollision] = useState(false);
  const [viewport, setViewport] = useState({ left: 0, top: 0, width: 20, height: 14, overscan: 2 });
  const [message, setMessage] = useState("Mapa demonstrativo carregado. Selecione um tile e pinte a grade.");
  const importRef = useRef<HTMLInputElement>(null);
  const selectedAsset = getTileAsset(activeAssetId);
  const selectedTile = useMemo(() => selectedCell ? map.levels[0].layers[activeLayer].tiles.find((tile) => tile.x === selectedCell.x && tile.y === selectedCell.y) : undefined, [activeLayer, map, selectedCell]);
  const selectedObject = useMemo(() => selectedCell ? map.levels[0].objects.find((object) => object.x === selectedCell.x && object.y === selectedCell.y) : undefined, [map, selectedCell]);

  const counts = useMemo(() => {
    const level = map.levels[0];
    return { tiles: TILEMAP_LAYER_IDS.reduce((sum, layer) => sum + level.layers[layer].tiles.length, 0), objects: level.objects.length };
  }, [map]);

  const editCell = (cell: { x: number; y: number }) => {
    setSelectedCell(cell);
    if (tool === "erase") {
      setMap((current) => removeObjectsAt(eraseTile(current, { ...cell, layer: activeLayer }), cell));
      setMessage(`Célula ${cell.x}, ${cell.y} limpa.`);
      return;
    }
    if (tool === "object") {
      if (!OBJECT_ASSETS.has(activeAssetId)) {
        setMessage("Escolha um objeto, construção ou prop para usar a ferramenta de objeto.");
        return;
      }
      setMap((current) => putObject(current, { assetId: activeAssetId, x: cell.x, y: cell.y, width: 1, height: 1, collision, interaction: collision === "interaction" ? "inspect" : "none", layer: activeLayer === "ground" ? "objects" : activeLayer }));
      setMessage(`Objeto ${selectedAsset?.name ?? activeAssetId} posicionado em ${cell.x}, ${cell.y}.`);
      return;
    }
    setMap((current) => paintTile(current, { assetId: activeAssetId, x: cell.x, y: cell.y, layer: activeLayer, collision }));
    setMessage(`${selectedAsset?.name ?? activeAssetId} aplicado em ${cell.x}, ${cell.y}.`);
  };

  const importMap = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = parseTileMapImport(await file.text(), TILE_ASSET_IDS);
      if (!result.ok) {
        setMessage(`Importação recusada: ${result.message}`);
        return;
      }
      setMap(result.map);
      setSelectedCell(null);
      setMessage(`Mapa ${result.map.name} importado e validado.`);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <main className="map-editor-page">
      <header className="map-editor-header">
        <div className="map-editor-brand"><span><MapPinned size={18} /></span><div><p>Vale de Âmbar · ferramentas</p><h1>Cartógrafo do Vale</h1></div></div>
        <div className="map-editor-header__meta"><span>Tilemap JSON v{map.formatVersion}</span><span>{map.width} × {map.height}</span></div>
        <div className="map-editor-header__actions">
          <button type="button" className="editor-button editor-button--quiet" onClick={() => window.location.assign("/")}>Voltar ao jogo</button>
          <button type="button" className="editor-button editor-button--quiet" onClick={() => importRef.current?.click()}><Upload size={15} /> Importar</button>
          <button type="button" className="editor-button editor-button--accent" onClick={() => downloadMapJson(map)}><Download size={15} /> Exportar JSON</button>
          <input ref={importRef} className="sr-only" type="file" accept="application/json,.json" onChange={importMap} />
        </div>
      </header>

      <section className="map-editor-layout">
        <aside className="map-editor-panel map-editor-palette" aria-label="Paleta de assets">
          <div className="editor-panel-heading"><div><p>Biblioteca</p><h2>Assets licenciados</h2></div><FileUp size={17} /></div>
          <p className="editor-panel-copy">CC0 · Kenney. Clique para escolher um asset antes de editar.</p>
          <div className="asset-grid">
            {TILE_ASSET_MANIFEST.map((asset) => <button key={asset.assetId} type="button" className={`asset-chip ${activeAssetId === asset.assetId ? "is-active" : ""}`} onClick={() => setActiveAssetId(asset.assetId)}><span style={{ backgroundImage: `url(${asset.localFilename})` }} /><b>{asset.name}</b><small>{asset.category}</small></button>)}
          </div>
          <a className="editor-manifest-link" href="https://opengameart.org/content/rpg-pack-base-set" target="_blank" rel="noreferrer">Ver fonte e licença</a>
        </aside>

        <section className="map-editor-workspace">
          <div className="editor-toolbar">
            <div className="editor-tool-group" aria-label="Ferramentas">
              <button type="button" className={`editor-icon-button ${tool === "paint" ? "is-active" : ""}`} onClick={() => setTool("paint")} title="Pincel"><MousePointer2 size={16} /></button>
              <button type="button" className={`editor-icon-button ${tool === "erase" ? "is-active" : ""}`} onClick={() => setTool("erase")} title="Apagar"><Eraser size={16} /></button>
              <button type="button" className={`editor-icon-button ${tool === "object" ? "is-active" : ""}`} onClick={() => setTool("object")} title="Objeto"><Plus size={16} /></button>
            </div>
            <label className="editor-select"><Layers3 size={14} /><span>Camada</span><select value={activeLayer} onChange={(event) => setActiveLayer(event.target.value as TileMapLayerId)}>{TILEMAP_LAYER_IDS.map((layer) => <option key={layer} value={layer}>{layer.replaceAll("_", " ")}</option>)}</select></label>
            <label className="editor-select"><Grid2X2 size={14} /><span>Colisão</span><select value={collision} onChange={(event) => setCollision(event.target.value as CollisionKind)}>{COLLISIONS.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <button type="button" className={`editor-toggle ${showCollision ? "is-active" : ""}`} onClick={() => setShowCollision((current) => !current)}><Eye size={14} /> Colisão</button>
          </div>
          <div className="editor-canvas-shell">
            <TileMapCanvas map={map} viewport={viewport} selectedCell={selectedCell} showCollision={showCollision} onCellSelect={editCell} />
          </div>
          <footer className="editor-workspace-footer"><span>{message}</span><div><button type="button" onClick={() => setViewport((current) => ({ ...current, left: Math.max(0, current.left - 4) }))}>◀ Oeste</button><button type="button" onClick={() => setViewport((current) => ({ ...current, left: Math.min(map.width - current.width, current.left + 4) }))}>Leste ▶</button></div></footer>
        </section>

        <aside className="map-editor-panel map-editor-inspector" aria-label="Propriedades da seleção">
          <div className="editor-panel-heading"><div><p>Inspecionar</p><h2>Propriedades</h2></div><Grid2X2 size={17} /></div>
          {selectedCell ? <div className="inspector-content"><div className="cell-badge">{selectedCell.x}, {selectedCell.y}</div><dl><div><dt>Ferramenta</dt><dd>{tool}</dd></div><div><dt>Camada</dt><dd>{activeLayer}</dd></div><div><dt>Asset</dt><dd>{selectedTile ? getTileAsset(selectedTile.assetId)?.name : selectedObject ? getTileAsset(selectedObject.assetId)?.name : selectedAsset?.name ?? activeAssetId}</dd></div><div><dt>Colisão</dt><dd>{selectedTile?.collision ?? selectedObject?.collision ?? collision}</dd></div></dl><div className="property-editor" key={`${selectedCell.x}-${selectedCell.y}-${activeLayer}`}><p>Tile selecionado</p><label>Colisão<select aria-label="Colisão do tile selecionado" value={selectedTile?.collision ?? collision} onChange={(event) => { if (!selectedTile) return; const next = event.target.value as CollisionKind; setMap((current) => updateTileProperties(current, { ...selectedCell, layer: activeLayer, collision: next, note: String(selectedTile.properties?.note ?? "") })); setCollision(next); }}><option value="walkable">walkable</option>{COLLISIONS.filter((value) => value !== "walkable").map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Nota<input aria-label="Nota do tile selecionado" defaultValue={String(selectedTile?.properties?.note ?? "")} onBlur={(event) => { if (!selectedTile) return; const note = event.currentTarget.value; setMap((current) => updateTileProperties(current, { ...selectedCell, layer: activeLayer, collision: selectedTile.collision ?? collision, note })); }} placeholder="metadado" /></label>{selectedObject && <><p>Objeto selecionado</p><label>Interação<select aria-label="Interação do objeto selecionado" value={selectedObject.interaction ?? "none"} onChange={(event) => { const interaction = event.target.value as "none" | "inspect" | "door" | "chest" | "teleport"; setMap((current) => updateObjectProperties(current, { objectId: selectedObject.objectId, collision: selectedObject.collision, interaction, rotation: selectedObject.rotation ?? 0, note: String(selectedObject.properties?.note ?? "") })); }}><option value="none">none</option><option value="inspect">inspect</option><option value="door">door</option><option value="chest">chest</option><option value="teleport">teleport</option></select></label><label>Rotação<select aria-label="Rotação do objeto selecionado" value={selectedObject.rotation ?? 0} onChange={(event) => { const rotation = Number(event.target.value) as 0 | 90 | 180 | 270; setMap((current) => updateObjectProperties(current, { objectId: selectedObject.objectId, collision: selectedObject.collision, interaction: selectedObject.interaction ?? "none", rotation, note: String(selectedObject.properties?.note ?? "") })); }}><option value={0}>0°</option><option value={90}>90°</option><option value={180}>180°</option><option value={270}>270°</option></select></label><label>Nota<input aria-label="Nota do objeto selecionado" defaultValue={String(selectedObject.properties?.note ?? "")} onBlur={(event) => { const note = event.currentTarget.value; setMap((current) => updateObjectProperties(current, { objectId: selectedObject.objectId, collision: selectedObject.collision, interaction: selectedObject.interaction ?? "none", rotation: selectedObject.rotation ?? 0, note })); }} placeholder="metadado" /></label></>}<button type="button" className="editor-button editor-button--wide" onClick={() => { setMap((current) => removeObjectsAt(current, selectedCell)); setMessage("Objetos da célula removidos."); }}>Remover objeto da célula</button></div></div> : <div className="inspector-empty"><Grid2X2 size={24} /><p>Selecione uma célula para editar suas propriedades.</p></div>}
          <div className="editor-summary"><span>{counts.tiles} tiles</span><span>{counts.objects} objetos</span><span>{map.levels[0].entities.length} entidades</span></div>
        </aside>
      </section>
    </main>
  );
}
