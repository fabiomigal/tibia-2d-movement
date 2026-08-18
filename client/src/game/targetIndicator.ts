export type TargetIndicatorState = "idle" | "chase" | "attack" | "return";

export type TargetIndicatorStyle = {
  color: "#F2B84B" | "#E84545";
  glow: number;
  scale: number;
};

/** Define a leitura visual do anel da criatura, dando prioridade inequívoca ao alvo selecionado. */
export function getTargetIndicatorStyle(selected: boolean, state: TargetIndicatorState): TargetIndicatorStyle {
  if (selected) return { color: "#E84545", glow: 0.82, scale: 1.56 };
  if (state === "attack") return { color: "#F2B84B", glow: 0.42, scale: 1.32 };
  if (state === "chase") return { color: "#F2B84B", glow: 0.42, scale: 1.12 };
  return { color: "#F2B84B", glow: 0.42, scale: 1 };
}
