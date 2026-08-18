export type MinimapMarkerTheme = "amber" | "jade" | "stone" | "violet" | "sun" | "ice" | "ember";

const THEME_BY_REGION: Record<string, MinimapMarkerTheme> = {
  "wind-road": "amber",
  "bamboo-forest": "jade",
  "elders-ruins": "stone",
  "cursed-graveyard": "violet",
  oasis: "sun",
  "desert-island": "sun",
  "ghost-forest": "violet",
  "frozen-land": "ice",
  "valley-of-despair": "stone",
  volcano: "ember",
};

/** Retorna a assinatura visual dos marcadores para a região informada. */
export function getMinimapMarkerTheme(region: string): MinimapMarkerTheme {
  return THEME_BY_REGION[region] ?? "amber";
}
