/** Horizonte em Miniatura: uma única janela de jogo preserva a imersão e deixa o mapa ocupar a tela. */
import ErrorBoundary from "./components/ErrorBoundary";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  return (
    <ErrorBoundary>
      <GameCanvas />
    </ErrorBoundary>
  );
}
