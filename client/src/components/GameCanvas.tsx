/**
 * Horizonte em Miniatura: React enquadra uma janela de exploração; Babylon domina o mapa.
 * O HUD usa pedra escura, papel translúcido e o Âmbar de Rota para leitura tática discreta.
 */
import React, { useEffect, useRef, useState } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameEngineOptions } from "@/game/engineOptions";
import { createGameScene, type GameHandle } from "@/game/scene";
import { appendRenderableCombatFloat } from "@/game/combatFloatLayer";
import type { ScreenCombatFloat } from "@/game/combatFloatEvents";
import type { GameStatus } from "@/game/types";
import { ZAO_START_POSITION } from "@shared/game";
import GameOverlay from "./GameOverlay";
import { resolveEnvironmentState } from "@/game/environment";

const initialStatus: GameStatus = {
  movement: "Aguardando comando",
  isResting: true,
  region: "bamboo-forest",
  speed: 0,
  hint: "WASD, setas, clique ou toque no terreno",
  environment: resolveEnvironmentState(0),
  position: [ZAO_START_POSITION.x, ZAO_START_POSITION.z],
  nearbyHotspot: null,
  monsters: [],
};

function MobileJoystick() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const emitVector = (x: number, y: number) => {
    window.dispatchEvent(
      new CustomEvent("vale:joystick", {
        detail: { x, z: -y },
      }),
    );
  };

  const updateFromPointer = (clientX: number, clientY: number) => {
    const element = joystickRef.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const radius = bounds.width * 0.28;
    let x = clientX - (bounds.left + bounds.width / 2);
    let y = clientY - (bounds.top + bounds.height / 2);
    const length = Math.hypot(x, y);

    if (length > radius) {
      x = (x / length) * radius;
      y = (y / length) * radius;
    }

    setKnob({ x, y });
    emitVector(x / radius, y / radius);
  };

  const release = () => {
    setKnob({ x: 0, y: 0 });
    emitVector(0, 0);
  };

  return (
    <div
      ref={joystickRef}
      className="touch-joystick"
      aria-label="Joystick de movimento"
      role="application"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromPointer(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          updateFromPointer(event.clientX, event.clientY);
        }
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        release();
      }}
      onPointerCancel={release}
    >
      <span
        className="touch-joystick__knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
      <span className="touch-joystick__caption">MOVER</span>
    </div>
  );
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const floatTimersRef = useRef<number[]>([]);
  const [status, setStatus] = useState<GameStatus>(initialStatus);
  const [worldReady, setWorldReady] = useState(false);
  const [combatFloats, setCombatFloats] = useState<ScreenCombatFloat[]>([]);
  const environment = status.environment ?? resolveEnvironmentState(0);

  useEffect(() => {
    const onStatus = (event: Event) => {
      const next = (event as CustomEvent<GameStatus>).detail;
      if (next) setStatus(next);
    };

    window.addEventListener("vale:status", onStatus);
    return () => window.removeEventListener("vale:status", onStatus);
  }, []);

  useEffect(() => {
    const onCombatFloat = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      const next = appendRenderableCombatFloat([], detail);
      if (next.length === 0) return;
      const [renderable] = next;
      setCombatFloats((current) => appendRenderableCombatFloat(current, detail));
      const timer = window.setTimeout(() => setCombatFloats((current) => current.filter((entry) => entry.id !== renderable.id)), renderable.lifetime * 1000);
      floatTimersRef.current.push(timer);
    };
    window.addEventListener("vale:combat-float-screen", onCombatFloat);
    return () => {
      window.removeEventListener("vale:combat-float-screen", onCombatFloat);
      floatTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      floatTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;
    setWorldReady(false);

    const engine = new Engine(canvas, true, createGameEngineOptions());
    let handle: GameHandle | null = null;
    let disposed = false;
    let renderedFirstFrame = false;

    createGameScene(engine, canvas)
      .then((sceneHandle) => {
        if (disposed) {
          sceneHandle.dispose();
          return;
        }
        handle = sceneHandle;
        engine.runRenderLoop(() => {
          sceneHandle.scene.render();
          if (!renderedFirstFrame) {
            renderedFirstFrame = true;
            requestAnimationFrame(() => {
              if (!disposed) setWorldReady(true);
            });
          }
        });
      })
      .catch((error) => {
        console.error("Não foi possível iniciar a cena do Vale de Âmbar.", error);
      });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <main className="game-shell" aria-label="Vale de Âmbar, campo de testes de movimentação">
      <canvas ref={canvasRef} className="game-canvas" tabIndex={0} />
      <div
        className={`world-environment world-environment--${environment.phase} world-environment--${environment.weather}`}
        aria-hidden="true"
      />
      <div className="combat-float-layer" aria-live="polite" aria-atomic="true">
        {combatFloats.map((entry) => <span key={entry.id} className={`combat-float combat-float--${entry.kind}`} style={{ left: entry.x, top: entry.y, animationDuration: `${entry.lifetime}s` }}>{entry.kind === "heal" ? "+" : "-"}{entry.value}</span>)}
      </div>

      {worldReady ? (
        <>
          <GameOverlay status={status} />
          <MobileJoystick />
        </>
      ) : (
        <div className="world-loading" role="status" aria-live="polite">
          <i aria-hidden="true" />
          <span>Preparando o campo de Âmbar…</span>
        </div>
      )}
    </main>
  );
}
