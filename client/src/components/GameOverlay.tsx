import { useEffect, useMemo, useState } from "react";
import { Backpack, BookOpen, ChevronRight, CircleDot, Coins, Crosshair, Heart, Map, MapPin, PackageOpen, Pause, Play, RotateCcw, ScrollText, Shield, ShoppingBag, Sparkles, Swords, Target, WandSparkles, X, Zap } from "lucide-react";
import { ARCHETYPES, ELEMENT_COLOR, ELEMENT_LABEL, REGIONS, type DamageElement } from "@shared/game";
import { trpc } from "@/lib/trpc";
import type { GameStatus } from "@/game/types";
import { getMinimapMarkerTheme } from "@/game/minimapTheme";
import { groupLootChests } from "@/game/lootChestState";

type PanelKey = "character" | "inventory" | "equipment" | "skills" | "map" | "idle" | "merchant" | "quests" | "city" | "teleport" | "loot" | null;
type FeedbackPanel = Exclude<PanelKey, null>;
type ActionFeedback = { panel: FeedbackPanel; tone: "success" | "error"; message: string };

type Snapshot = {
  character: {
    name: string;
    archetype: string;
    level: number;
    xp: number;
    gold: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    energy: number;
    maxEnergy: number;
    strength: number;
    dexterity: number;
    vitality: number;
    intelligence: number;
    currentRegion: string;
    floor: number;
    capacity: number;
    currentWeight: number;
    isDead: boolean;
    autoPotionEnabled: boolean;
  };
  items: Array<{ id: number; name: string; kind: string; rarity: string; weight: number; quantity: number; slot: string; equipped: boolean; sellValue: number }>;
  skills: Array<{ id: number; key: string; name: string; element: DamageElement; damageBase: number; manaCost: number; energyCost: number; description: string; hotkey: string | null; equipped: boolean }>;
  activeHunt: { monsterKey: string; region: string; totalTurns: number; rewardsXp: number; rewardsGold: number } | null;
  quests: Array<{ id: number; questKey: string; name: string; status: "available" | "active" | "complete"; progress: number; target: number; rewardGold: number; rewardXp: number }>;
  drops: Array<{ id: number; chestKey: string; name: string; rarity: string; weight: number; x: number; z: number }>;
  encounters: Array<{ id: number; monsterKey: string; hp: number; maxHp: number; respawnAt: Date | null }>;
};

const FALLBACK_CHARACTER: Snapshot["character"] = {
  name: "Aventureiro de Âmbar", archetype: "fighter", level: 1, xp: 0, gold: 0,
  hp: 1, maxHp: 1, mp: 1, maxMp: 1, energy: 1, maxEnergy: 1,
  strength: 1, dexterity: 1, vitality: 1, intelligence: 1,
  currentRegion: "wind-road", floor: 0, capacity: 75, currentWeight: 0, isDead: false, autoPotionEnabled: true,
};

const DEMO_MONSTERS = [
  { key: "field-boar", name: "Javali do Campo", region: "wind-road", level: 1, element: "physical" as DamageElement, tone: "#b99064" },
  { key: "wind-goblin", name: "Goblin da Estrada", region: "wind-road", level: 3, element: "earth" as DamageElement, tone: "#82965c" },
  { key: "bamboo-archer", name: "Arqueiro Maligno", region: "bamboo-forest", level: 5, element: "physical" as DamageElement, tone: "#4c7d62" },
  { key: "ruin-golem", name: "Golem de Ruína", region: "elders-ruins", level: 8, element: "earth" as DamageElement, tone: "#7d8790" },
  { key: "grave-wraith", name: "Wraith do Cemitério", region: "cursed-graveyard", level: 12, element: "death" as DamageElement, tone: "#8e6db3" },
  { key: "dune-scorpion", name: "Escorpião das Dunas", region: "oasis", level: 18, element: "earth" as DamageElement, tone: "#c9954b" },
  { key: "sand-cobra", name: "Cobra da Areia", region: "desert-island", level: 22, element: "earth" as DamageElement, tone: "#b8a05a" },
  { key: "haunted-bat", name: "Morcego Assombrado", region: "ghost-forest", level: 27, element: "death" as DamageElement, tone: "#75558d" },
  { key: "ice-wolf", name: "Lobo Gélido", region: "frozen-land", level: 33, element: "ice" as DamageElement, tone: "#8dcbe4" },
  { key: "despair-titan", name: "Titã do Desespero", region: "valley-of-despair", level: 40, element: "physical" as DamageElement, tone: "#8b735a" },
  { key: "lava-golem", name: "Golem de Lava", region: "volcano", level: 48, element: "fire" as DamageElement, tone: "#d56a42" },
];

const RARITY_CLASS: Record<string, string> = {
  common: "rarity--common",
  uncommon: "rarity--uncommon",
  rare: "rarity--rare",
  epic: "rarity--epic",
  legendary: "rarity--legendary",
};

function ResourceBar({ label, value, max, tone, icon }: { label: string; value: number; max: number; tone: string; icon: React.ReactNode }) {
  const percentage = max ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="resource-bar">
      <span className="resource-bar__label">{icon}{label}</span>
      <div className="resource-bar__track"><span style={{ width: `${percentage}%`, background: tone }} /></div>
      <b>{value}/{max}</b>
    </div>
  );
}

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return <header className="rpg-panel__header"><span>{title}</span><button aria-label="Fechar painel" onClick={onClose}><X size={16} /></button></header>;
}

function ActionFeedback({ feedback }: { feedback?: ActionFeedback }) {
  if (!feedback) return null;
  return <p className={`action-feedback action-feedback--${feedback.tone}`} role="status">{feedback.message}</p>;
}

export default function GameOverlay({ status }: { status: GameStatus }) {
  const utils = trpc.useUtils();
  const bootstrap = trpc.game.bootstrap.useQuery(undefined, { refetchOnWindowFocus: false, retry: 1 });
  const data = bootstrap.data as Snapshot | undefined;
  const [panel, setPanel] = useState<PanelKey>(null);
  const [notice, setNotice] = useState("Campo aberto. Escolha um rumo ou prepare-se para caçar.");
  const [selectedSkill, setSelectedSkill] = useState<string>();
  const [panelFeedback, setPanelFeedback] = useState<ActionFeedback | null>(null);
  const [reviveFeedback, setReviveFeedback] = useState<ActionFeedback | null>(null);
  const [lastCombat, setLastCombat] = useState<{ monster: string; monsterKey: string; damage: number; counterDamage: number; element: DamageElement; critical: boolean; defeated: boolean; monsterHp: number; monsterMaxHp: number; xpGained: number; goldGained: number } | null>(null);
  const [selectedChestKey, setSelectedChestKey] = useState<string | null>(null);
  const merchant = trpc.game.merchant.useQuery(undefined, { enabled: panel === "merchant", retry: 1 });

  const refresh = async () => { await utils.game.bootstrap.invalidate(); };
  const combat = trpc.game.combat.useMutation({
    onSuccess: async (result) => {
      setLastCombat(result.result);
      setNotice(result.result.defeated ? `${result.result.monster} caiu. O drop aguarda no campo.` : `${result.result.monster} contra-atacou.`);
      window.dispatchEvent(new CustomEvent("vale:world-combat-state", { detail: { player: result.snapshot.character, monsters: result.snapshot.encounters.map((entry) => ({ key: entry.monsterKey, hp: entry.hp, maxHp: entry.maxHp })) } }));
      if (result.result.defeated) {
        window.dispatchEvent(new CustomEvent("vale:creature-defeated", { detail: { monsterKey: result.result.monsterKey } }));
      }
      await refresh();
    },
    onError: (error) => setNotice(error.message),
  });
  const inventory = trpc.game.inventory.useMutation({ onSuccess: refresh, onError: (error) => setNotice(error.message) });
  const travel = trpc.game.travel.useMutation({ onError: (error) => setNotice(error.message) });
  const idleStart = trpc.game.idleStart.useMutation({ onSuccess: async () => { setNotice("Caça automática iniciada. Volte mais tarde para resolver o tempo decorrido."); await refresh(); }, onError: (error) => setNotice(error.message) });
  const idleResume = trpc.game.idleResume.useMutation({ onSuccess: async (result) => { setNotice(result.turns ? `Caça resolvida: ${result.turns} turnos, +${result.xp} XP e +${result.gold} ouro.` : "A sessão ainda não acumulou um turno completo."); await refresh(); }, onError: (error) => setNotice(error.message) });
  const revive = trpc.game.revive.useMutation({ onSuccess: async () => { const message = "Você retornou à Estrada do Vento, com uma pequena penalidade."; setNotice(message); setReviveFeedback({ panel: "character", tone: "success", message }); await refresh(); }, onError: (error) => { setNotice(error.message); setReviveFeedback({ panel: "character", tone: "error", message: error.message }); } });
  const collectDrop = trpc.game.collectDrop.useMutation({ onSuccess: async () => { setNotice("Drop guardado na mochila."); await refresh(); }, onError: (error) => setNotice(error.message) });
  const autoPotion = trpc.game.autoPotion.useMutation({ onSuccess: refresh, onError: (error) => setNotice(error.message) });
  const merchantBuy = trpc.game.merchantBuy.useMutation({ onSuccess: async () => { setNotice("Compra concluída. O item foi guardado na mochila."); await refresh(); }, onError: (error) => setNotice(error.message) });
  const questAccept = trpc.game.questAccept.useMutation({ onSuccess: async () => { setNotice("Missão aceita. Os sinais da estrada agora contam para sua expedição."); await refresh(); }, onError: (error) => setNotice(error.message) });
  const questClaim = trpc.game.questClaim.useMutation({ onSuccess: async () => { setNotice("Recompensa recebida. A carta de expedição foi atualizada."); await refresh(); }, onError: (error) => setNotice(error.message) });
  const archetype = trpc.game.archetype.useMutation({ onSuccess: async () => { setNotice("Arquétipo definido. Seus atributos foram recalibrados para a expedição."); await refresh(); }, onError: (error) => setNotice(error.message) });
  const travelTo = (regionKey: string, panelKey: "map" | "teleport") => travel.mutate({ region: regionKey }, { onSuccess: async () => { const message = "Rota confirmada. A carta de expedição foi atualizada."; setNotice(message); setPanelFeedback({ panel: panelKey, tone: "success", message }); await refresh(); }, onError: (error) => { setNotice(error.message); setPanelFeedback({ panel: panelKey, tone: "error", message: error.message }); } });
  const openCityService = (target: "merchant" | "quests", message: string) => {
    setNotice(message);
    setPanelFeedback({ panel: "city", tone: "success", message });
    setPanel(target);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
      if (event.key.toLowerCase() === "i") setPanel("inventory");
      if (event.key.toLowerCase() === "e") setPanel("equipment");
      if (event.key.toLowerCase() === "c") setPanel("character");
      if (event.key.toLowerCase() === "m") setPanel("map");
      if (event.key.toLowerCase() === "h") setPanel("idle");
      if (event.key.toLowerCase() === "k") setPanel("skills");
      if (event.key.toLowerCase() === "t") setPanel("merchant");
      if (event.key.toLowerCase() === "b") setPanel("quests");
      if (event.key.toLowerCase() === "g") setPanel("city");
      if (event.key.toLowerCase() === "p") setPanel("teleport");
      if (/^F[1-4]$/.test(event.key)) setSelectedSkill(data?.skills.find((skill) => skill.hotkey === event.key)?.key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [data?.skills]);

  useEffect(() => {
    if (!data) return;
    window.dispatchEvent(new CustomEvent("vale:world-combat-state", { detail: { player: data.character, monsters: data.encounters.map((entry) => ({ key: entry.monsterKey, hp: entry.hp, maxHp: entry.maxHp })) } }));
    const chests = groupLootChests(data.drops);
    window.dispatchEvent(new CustomEvent("vale:loot-chests", { detail: chests }));
    if (selectedChestKey && !chests.some((chest) => chest.chestKey === selectedChestKey)) {
      setSelectedChestKey(null);
      setPanel((current) => current === "loot" ? null : current);
    }
  }, [data, selectedChestKey]);

  useEffect(() => {
    const onWorldInteraction = (event: Event) => {
      const interaction = (event as CustomEvent<{ kind: "npc" | "portal" | "stairs" | "monster"; label: string; monsterKey?: string }>).detail;
      if (!interaction) return;
      if (interaction.kind === "monster" && interaction.monsterKey) {
        setNotice(`Alvo marcado: ${interaction.label}. Aproxime-se para atacar.`);
        window.dispatchEvent(new CustomEvent("vale:attack-target", { detail: { monsterKey: interaction.monsterKey } }));
        return;
      }
      if (interaction.kind === "npc") { setNotice(`Você conversou com ${interaction.label}.`); setPanel("city"); return; }
      if (interaction.kind === "portal") { setNotice(`${interaction.label} está pronto para viagem.`); setPanel("teleport"); return; }
      setNotice(`${interaction.label}: selecione o andar no mapa de expedição.`);
      setPanel("map");
    };
    const onProximity = (event: Event) => {
      const interaction = (event as CustomEvent<{ label?: string } | null>).detail;
      if (interaction?.label) setNotice(`Próximo: ${interaction.label}. Toque ou clique para interagir.`);
    };
    const onCreatureAttack = (event: Event) => {
      const detail = (event as CustomEvent<{ label?: string }>).detail;
      if (detail?.label) setNotice(`${detail.label} se aproxima. Prepare uma habilidade ou afaste-se.`);
    };
    const onAttackReady = (event: Event) => {
      const monsterKey = (event as CustomEvent<{ monsterKey?: string }>).detail?.monsterKey;
      if (monsterKey) combat.mutate({ monsterKey, skillKey: selectedSkill });
    };
    const onOpenLootChest = (event: Event) => {
      const chestKey = (event as CustomEvent<{ chestKey?: string }>).detail?.chestKey;
      if (!chestKey) return;
      setSelectedChestKey(chestKey); setPanel("loot"); setNotice("Baú aberto. Escolha os itens que deseja guardar na mochila.");
    };
    window.addEventListener("vale:world-interaction", onWorldInteraction);
    window.addEventListener("vale:world-proximity", onProximity);
    window.addEventListener("vale:creature-attack", onCreatureAttack);
    window.addEventListener("vale:attack-target-ready", onAttackReady);
    window.addEventListener("vale:open-loot-chest", onOpenLootChest);
    return () => {
      window.removeEventListener("vale:world-interaction", onWorldInteraction);
      window.removeEventListener("vale:world-proximity", onProximity);
      window.removeEventListener("vale:creature-attack", onCreatureAttack);
      window.removeEventListener("vale:attack-target-ready", onAttackReady);
      window.removeEventListener("vale:open-loot-chest", onOpenLootChest);
    };
  }, [selectedSkill, combat]);

  const character = data?.character ?? FALLBACK_CHARACTER;
  const region = useMemo(() => REGIONS.find((entry) => entry.key === character.currentRegion) ?? REGIONS[0], [character.currentRegion]);
  const minimapMarkerTheme = getMinimapMarkerTheme(character.currentRegion);
  const nearbyMonsters = DEMO_MONSTERS.filter((monster) => monster.region === character.currentRegion);
  const activeSkill = data?.skills.find((skill) => skill.key === selectedSkill) ?? data?.skills.find((skill) => skill.equipped) ?? data?.skills[0];
  const lootChests = useMemo(() => groupLootChests(data?.drops ?? []), [data?.drops]);
  const selectedChest = lootChests.find((chest) => chest.chestKey === selectedChestKey) ?? null;
  const minimapPlayerStyle = { left: `${Math.min(96, Math.max(4, ((status.position[0] + 23.4) / 46.8) * 100))}%`, top: `${Math.min(96, Math.max(4, ((16.4 - status.position[1]) / 32.8) * 100))}%` };
  const minimapHotspotStyle = status.nearbyHotspot ? { left: `${Math.min(96, Math.max(4, ((status.nearbyHotspot.x + 23.4) / 46.8) * 100))}%`, top: `${Math.min(96, Math.max(4, ((16.4 - status.nearbyHotspot.z) / 32.8) * 100))}%` } : undefined;

  if (bootstrap.isLoading || !data) {
    return <div className="rpg-loading"><div><Sparkles size={22} /><p>Preparando o códice de Âmbar...</p></div></div>;
  }

  return (
    <>
      <section className="rpg-topbar" aria-label="Estado do personagem">
        <div className="traveler-card">
          <div className="traveler-card__portrait"><Shield size={27} /><span>Lv.{character.level}</span></div>
          <div className="traveler-card__body">
            <div className="traveler-card__title"><div><p>VIAJANTE</p><h1>{character.name}</h1></div><span className="gold"><Coins size={14}/>{character.gold}</span></div>
            <ResourceBar label="HP" value={character.hp} max={character.maxHp} tone="#cb5a55" icon={<Heart size={12} fill="currentColor" />} />
            <ResourceBar label="MP" value={character.mp} max={character.maxMp} tone="#5b99ce" icon={<WandSparkles size={12} />} />
            <ResourceBar label="EN" value={character.energy} max={character.maxEnergy} tone="#d6ad4b" icon={<Zap size={12} fill="currentColor" />} />
          </div>
        </div>
        <div className="location-plaque"><MapPin size={15}/><div><b>{region.name}</b><span>Andar {character.floor + 1} · {region.theme}</span></div></div>
      </section>
      <div className="world-brand" aria-label="Vale de Âmbar"><i><span/></i><div><b>VALE DE ÂMBAR</b><small>carta de expedição</small></div></div>

      <section className="rpg-minimap" aria-label="Minimapa de região">
        <div className="rpg-minimap__heading"><Map size={14}/><span>MAPA LOCAL</span></div>
        <div className={`rpg-minimap__map rpg-minimap__map--${character.currentRegion}`}>
          <i className="minimap-water minimap-water--one"/><i className="minimap-water minimap-water--two"/><i className="minimap-path"/>
          {status.monsters.map((monster) => { const tone = DEMO_MONSTERS.find((entry) => entry.key === monster.key)?.tone ?? "#d58d52"; return <b key={monster.key} className="minimap-monster" style={{ left: `${Math.min(96, Math.max(4, ((monster.x + 23.4) / 46.8) * 100))}%`, top: `${Math.min(96, Math.max(4, ((16.4 - monster.z) / 32.8) * 100))}%`, background: tone }} title={`${monster.name}: ${monster.hp}/${monster.maxHp} HP`}/>; })}
          {status.nearbyHotspot && <b className={`minimap-hotspot minimap-hotspot--${minimapMarkerTheme}`} style={minimapHotspotStyle} title={status.nearbyHotspot.label}/>}<b className={`minimap-player minimap-player--${minimapMarkerTheme}`} style={minimapPlayerStyle} title="Você"/><span className="minimap-compass">N</span>
        </div>
        <button onClick={() => setPanel("map")}>Abrir mapa <ChevronRight size={13}/></button>
      </section>

      <section className="rpg-actions" aria-label="Ações de jogo">
        <button className="action-key" onClick={() => setPanel("character")}><Shield size={18}/><span>C</span><b>Herói</b></button>
        <button className="action-key" onClick={() => setPanel("inventory")}><Backpack size={18}/><span>I</span><b>Mochila</b></button>
        <button className="action-key" onClick={() => setPanel("equipment")}><Shield size={18}/><span>E</span><b>Equipar</b></button>
        <button className="action-key" onClick={() => setPanel("skills")}><WandSparkles size={18}/><span>F</span><b>Magias</b></button>
        <button className="action-key" onClick={() => setPanel("idle")}><Play size={18}/><span>H</span><b>Caça idle</b></button>
        <button className="action-key" onClick={() => setPanel("merchant")}><ShoppingBag size={18}/><span>T</span><b>Mercador</b></button>
        <button className="action-key" onClick={() => setPanel("quests")}><ScrollText size={18}/><span>B</span><b>Missões</b></button>
        <button className="action-key" onClick={() => setPanel("city")}><MapPin size={18}/><span>G</span><b>Cidade</b></button>
        <button className="action-key" onClick={() => setPanel("teleport")}><Sparkles size={18}/><span>P</span><b>Portal</b></button>
      </section>

      <section className="combat-console" aria-label="Console de combate">
        <header><span><Swords size={15}/> ENCONTROS PRÓXIMOS</span><b>{status.movement}</b></header>
        {character.isDead ? (
          <div className="combat-console__dead"><p>Você caiu em batalha.</p><button onClick={() => revive.mutate()} disabled={revive.isPending}><RotateCcw size={14}/> {revive.isPending ? "Reviver..." : "Reviver na cidade"}</button><ActionFeedback feedback={reviveFeedback ?? undefined}/></div>
        ) : nearbyMonsters.length ? (
          <div className="combat-targets">
            {nearbyMonsters.map((monster) => { const encounter = data.encounters.find((entry) => entry.monsterKey === monster.key); return <button className="monster-target" key={monster.key} onClick={() => { setNotice(`Mira ajustada para ${monster.name}. Aproxime-se para atacar.`); window.dispatchEvent(new CustomEvent("vale:attack-target", { detail: { monsterKey: monster.key } })); }} disabled={combat.isPending || encounter?.hp === 0}>
              <i style={{ background: monster.tone }} /><span><b>{monster.name}</b><small>Lv.{monster.level} · {ELEMENT_LABEL[monster.element]}{encounter ? ` · ${encounter.hp}/${encounter.maxHp} HP` : " · pronto"}</small></span><Crosshair size={15}/>
            </button>; })}
          </div>
        ) : <p className="combat-console__empty">Nenhuma criatura catalogada nesta região por enquanto.</p>}
        <footer><Target size={13}/><span>{activeSkill ? `${activeSkill.name} selecionada` : "Carregando habilidades"}</span></footer>
      </section>

      <section className="rpg-notice" aria-live="polite">
        <span className="status-dot"/><p>{notice}</p>
      </section>

      {lootChests.length > 0 && <section className="ground-loot" aria-label="Baús de saque no campo"><header><PackageOpen size={14}/><b>BAÚS NO CAMPO</b></header>{lootChests.map((chest) => <button key={chest.chestKey} onClick={() => { setSelectedChestKey(chest.chestKey); setPanel("loot"); }}><span>Baú de expedição</span><small>{chest.drops.length} {chest.drops.length === 1 ? "item" : "itens"} · Abrir</small></button>)}</section>}

      {lastCombat && <div className={`damage-toast ${lastCombat.defeated ? "damage-toast--victory" : ""}`}>
        <b style={{ color: ELEMENT_COLOR[lastCombat.element] }}>{lastCombat.critical ? "CRÍTICO " : ""}{lastCombat.damage}</b>
        <span>{lastCombat.monster} {lastCombat.defeated ? `· +${lastCombat.xpGained} XP · +${lastCombat.goldGained} ouro` : `· contra-ataque ${lastCombat.counterDamage}`}</span>
      </div>}

      {panel === "character" && <aside className="rpg-panel rpg-panel--left" aria-label="Ficha do personagem"><PanelHeader title="Ficha do viajante" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body character-sheet"><div className="character-emblem"><Shield size={30}/><span>{ARCHETYPES.find((entry) => entry.key === character.archetype)?.name ?? character.archetype}</span></div>
          <div className="xp-card"><span>Próximo nível</span><b>{character.xp} XP</b><i><em style={{ width: `${Math.min(100, character.xp)}%` }}/></i></div>
          <dl><div><dt>Força</dt><dd>{character.strength}</dd></div><div><dt>Destreza</dt><dd>{character.dexterity}</dd></div><div><dt>Vitalidade</dt><dd>{character.vitality}</dd></div><div><dt>Inteligência</dt><dd>{character.intelligence}</dd></div></dl>
          <button className={`auto-pot ${character.autoPotionEnabled ? "auto-pot--on" : ""}`} onClick={() => autoPotion.mutate({ enabled: !character.autoPotionEnabled })}><Heart size={14}/><span>Auto-poção abaixo de 35% HP</span><b>{character.autoPotionEnabled ? "ATIVO" : "INATIVO"}</b></button>
          {character.level === 1 && <div className="archetype-picker"><span>Escolha de arquétipo</span>{ARCHETYPES.map((entry) => <button className={character.archetype === entry.key ? "archetype-picker__active" : ""} key={entry.key} onClick={() => archetype.mutate({ archetype: entry.key })} disabled={archetype.isPending}><b>{entry.name}</b><small>{entry.description}</small></button>)}</div>}
          <p className="panel-note">Atributos tornam dano, resistência e recursos mais consistentes a cada nível.</p>
        </div></aside>}

      {panel === "inventory" && <aside className="rpg-panel rpg-panel--left" aria-label="Mochila"><PanelHeader title="Mochila de expedição" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body"><div className="capacity"><span><Backpack size={15}/> Capacidade</span><b>{character.currentWeight}/{character.capacity} oz</b><i><em style={{ width: `${Math.min(100, (character.currentWeight / character.capacity) * 100)}%` }}/></i></div>
          <div className="inventory-list">{data.items.map((item) => <article className={`inventory-item ${RARITY_CLASS[item.rarity] ?? ""}`} key={item.id}><div className="inventory-item__glyph">{item.kind === "weapon" ? "⚔" : item.kind === "consumable" ? "✚" : "◆"}</div><div><b>{item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ""}</b><span>{item.rarity} · {item.weight * item.quantity} oz {item.equipped ? "· equipado" : ""}</span></div><div className="inventory-item__actions">{item.kind === "consumable" ? <button onClick={() => inventory.mutate({ action: "use", itemId: item.id })}>Usar</button> : item.slot !== "material" && <button onClick={() => inventory.mutate({ action: "equip", itemId: item.id })}>Equipar</button>}<button onClick={() => inventory.mutate({ action: "sell", itemId: item.id })}>Vender</button></div></article>)}</div>
        </div></aside>}

      {panel === "loot" && <aside className="rpg-panel rpg-panel--left" aria-label="Baú de saque"><PanelHeader title="Baú de expedição" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body loot-chest-panel">
          {selectedChest ? <><p className="panel-note">Selecione um item para transferi-lo para a mochila. O baú desaparece quando estiver vazio.</p><div className="inventory-list">{selectedChest.drops.map((drop) => <article className={`inventory-item ${RARITY_CLASS[drop.rarity] ?? ""}`} key={drop.id}><div className="inventory-item__glyph">✦</div><div><b>{drop.name}</b><span>{drop.rarity} · {drop.weight} oz</span></div><button className="panel-action" onClick={() => collectDrop.mutate({ dropId: drop.id })} disabled={collectDrop.isPending}>{collectDrop.isPending ? "Guardando..." : "Guardar"}</button></article>)}</div></> : <p className="panel-note">Este baú já foi esvaziado.</p>}
        </div></aside>}

      {panel === "equipment" && <aside className="rpg-panel rpg-panel--left" aria-label="Equipamentos"><PanelHeader title="Equipamentos em uso" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body"><p className="panel-note">Ajuste armas, armaduras e acessórios na mochila. A troca aplica-se por slot.</p><ActionFeedback feedback={panelFeedback?.panel === "equipment" ? panelFeedback : undefined}/><div className="inventory-list">{data.items.filter((item) => item.equipped).map((item) => <article className={`inventory-item ${RARITY_CLASS[item.rarity] ?? ""}`} key={item.id}><div className="inventory-item__glyph">◆</div><div><b>{item.name}</b><span>{item.slot} · {item.rarity} · equipado</span></div></article>)}{data.items.filter((item) => !item.equipped && item.slot !== "material" && item.slot !== "consumable").map((item) => <article className={`inventory-item ${RARITY_CLASS[item.rarity] ?? ""}`} key={`candidate-${item.id}`}><div className="inventory-item__glyph">◇</div><div><b>{item.name}</b><span>{item.slot} · pronto para equipar</span></div><button className="panel-action" onClick={() => inventory.mutate({ action: "equip", itemId: item.id }, { onSuccess: async () => { const message = `${item.name} equipado.`; setNotice(message); setPanelFeedback({ panel: "equipment", tone: "success", message }); await refresh(); }, onError: (error) => { setNotice(error.message); setPanelFeedback({ panel: "equipment", tone: "error", message: error.message }); } })}>Equipar</button></article>)}{!data.items.some((item) => item.equipped) && <p className="panel-note">Nenhum equipamento ativo.</p>}</div><button className="panel-action" onClick={() => setPanel("inventory")}>Abrir mochila</button></div></aside>}

      {panel === "skills" && <aside className="rpg-panel rpg-panel--left" aria-label="Habilidades"><PanelHeader title="Círculo de habilidades" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body skill-list">{data.skills.map((skill) => <button className={`skill-card ${activeSkill?.key === skill.key ? "skill-card--active" : ""}`} key={skill.id} onClick={() => { setSelectedSkill(skill.key); setNotice(`${skill.name} preparada para o próximo alvo.`); }}><i style={{ background: ELEMENT_COLOR[skill.element] }}><Sparkles size={15}/></i><span><b>{skill.name}</b><small>{skill.description}</small><em>{ELEMENT_LABEL[skill.element]} · {skill.damageBase} dano · {skill.manaCost ? `${skill.manaCost} MP` : `${skill.energyCost} EN`}</em></span>{skill.hotkey && <kbd>{skill.hotkey}</kbd>}</button>)}</div></aside>}

      {panel === "map" && <aside className="rpg-panel rpg-panel--wide" aria-label="Mapa de regiões"><PanelHeader title="Carta das regiões" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body region-list"><ActionFeedback feedback={panelFeedback?.panel === "map" ? panelFeedback : undefined}/>{REGIONS.map((entry, index) => { const unlocked = entry.level <= character.level; const current = entry.key === character.currentRegion; return <article className={`region-card ${current ? "region-card--current" : ""}`} key={entry.key}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{entry.name}</b><small>Nível recomendado {entry.level} · {entry.theme}</small></div><button disabled={!unlocked || current || travel.isPending} onClick={() => travelTo(entry.key, "map")}>{current ? "Aqui" : unlocked ? "Viajar" : `Lv.${entry.level}`}</button></article>; })}</div></aside>}

      {panel === "city" && <aside className="rpg-panel rpg-panel--left" aria-label="Posto do Vale"><PanelHeader title="Posto do Vale" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body city-panel"><p>Um refúgio de estrada para reorganizar a expedição antes de seguir pelos portais.</p><ActionFeedback feedback={panelFeedback?.panel === "city" ? panelFeedback : undefined}/><button className="city-action" onClick={() => openCityService("merchant", "Selene abriu sua caixa de provisões.")}><ShoppingBag size={17}/><span><b>Selene · Mercadora</b><small>Provisões, compras e venda de itens.</small></span><ChevronRight size={15}/></button><button className="city-action" onClick={() => openCityService("quests", "Arden preparou a carta de missões.")}><ScrollText size={17}/><span><b>Arden · Batedor</b><small>Missões e recompensas de exploração.</small></span><ChevronRight size={15}/></button><button className="city-action city-action--locked" onClick={() => { const message = "A caravana de longo alcance exige nível 15 e ainda não está disponível."; setNotice(message); setPanelFeedback({ panel: "city", tone: "error", message }); }}><MapPin size={17}/><span><b>Caravana distante</b><small>Transporte regional protegido.</small></span><X size={15}/></button></div></aside>}

      {panel === "teleport" && <aside className="rpg-panel rpg-panel--wide" aria-label="Portais de expedição"><PanelHeader title="Portais de expedição" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body region-list"><ActionFeedback feedback={panelFeedback?.panel === "teleport" ? panelFeedback : undefined}/>{REGIONS.map((entry, index) => { const ready = entry.level <= character.level; const current = entry.key === character.currentRegion; return <article className={`region-card ${current ? "region-card--current" : ""}`} key={entry.key}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{entry.name}</b><small>{entry.theme} · requer nível {entry.level}</small></div><button disabled={!ready || current || travel.isPending} onClick={() => travelTo(entry.key, "teleport")}>{current ? "Ancorado" : ready ? "Atravessar" : `Lv.${entry.level}`}</button></article>; })}</div></aside>}

      {panel === "idle" && <aside className="rpg-panel rpg-panel--left" aria-label="Caça idle"><PanelHeader title="Sessão de caça" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body idle-panel"><p>O caçador resolve os turnos pelo tempo decorrido quando você retorna. Nenhum processo contínuo é necessário nesta fase.</p>
          {data.activeHunt ? <div className="idle-active"><CircleDot size={18}/><b>Caça ativa: {data.activeHunt.monsterKey}</b><span>{data.activeHunt.totalTurns} turnos · {data.activeHunt.rewardsXp} XP · {data.activeHunt.rewardsGold} ouro</span><button onClick={() => idleResume.mutate()}><Play size={14}/> Resolver tempo decorrido</button></div> : <div className="idle-options">{nearbyMonsters.map((monster) => <button key={monster.key} onClick={() => idleStart.mutate({ monsterKey: monster.key })}><i style={{ background: monster.tone }}/><span><b>{monster.name}</b><small>Iniciar caça na região atual</small></span><Play size={14}/></button>)}</div>}
        </div></aside>}

      {panel === "merchant" && <aside className="rpg-panel rpg-panel--left" aria-label="Mercadora Selene"><PanelHeader title="Selene · Mercadora" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body merchant-panel"><p>O Posto do Vale compra itens da mochila e oferece provisões para expedições. As compras respeitam ouro, peso e slots.</p>{merchant.isLoading ? <p className="panel-note">Abrindo a caixa de provisões...</p> : merchant.data?.map((offer) => <article className={`merchant-offer ${RARITY_CLASS[offer.rarity] ?? ""}`} key={offer.id}><div><b>{offer.name}</b><small>{offer.description}</small><em>{offer.weight} oz · {offer.rarity}</em></div><button onClick={() => merchantBuy.mutate({ catalogKey: offer.catalogKey })} disabled={merchantBuy.isPending}><Coins size={13}/>{offer.price}</button></article>)}</div></aside>}

      {panel === "quests" && <aside className="rpg-panel rpg-panel--left" aria-label="Carta de missões"><PanelHeader title="Carta de expedição" onClose={() => setPanel(null)} />
        <div className="rpg-panel__body quest-panel">{data.quests.map((quest) => <article key={quest.id}><div><b>{quest.name}</b><small>{quest.status === "available" ? "Converse com Arden para iniciar." : quest.status === "complete" ? "Retorne ao posto para receber a recompensa." : `${quest.progress}/${quest.target} sinais rastreados`}</small><i><em style={{ width: `${(quest.progress / quest.target) * 100}%` }} /></i><span>+{quest.rewardXp} XP · +{quest.rewardGold} ouro</span></div>{quest.status === "available" ? <button onClick={() => questAccept.mutate({ questKey: quest.questKey })}>Aceitar</button> : quest.status === "complete" ? <button onClick={() => questClaim.mutate({ questKey: quest.questKey })}>Receber</button> : <b className="quest-active">Ativa</b>}</article>)}</div></aside>}
    </>
  );
}
