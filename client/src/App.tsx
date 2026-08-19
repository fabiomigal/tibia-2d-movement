/** Horizonte em Miniatura: uma única janela de jogo preserva a imersão e deixa o mapa ocupar a tela. */
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";

const GameCanvas = lazy(() => import("./components/GameCanvas"));
const MapEditor = lazy(() => import("./components/MapEditor"));

export default function App() {
  const isMapEditor = window.location.pathname === "/map-editor";
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Suspense fallback={<main className="rpg-loading"><div><span>Vale de Âmbar</span><p>Preparando a expedição...</p></div></main>}>
          {isMapEditor ? <MapEditor /> : <GameCanvas />}
        </Suspense>
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}
