/** Horizonte em Miniatura: uma única janela de jogo preserva a imersão e deixa o mapa ocupar a tela. */
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";

const GameCanvas = lazy(() => import("./components/GameCanvas"));

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Suspense fallback={<main className="rpg-loading"><div><span>Vale de Âmbar</span><p>Preparando a expedição...</p></div></main>}>
          <GameCanvas />
        </Suspense>
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}
