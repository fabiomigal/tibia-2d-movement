export const ENVIRONMENT_CYCLE_MS = 96_000;
export const WEATHER_CYCLE_MS = 24_000;

export type DayPhase = "dawn" | "day" | "dusk" | "night";
export type WeatherKind = "clear" | "rain" | "mist";

export type EnvironmentState = {
  phase: DayPhase;
  weather: WeatherKind;
  label: string;
};

const DAY_PHASES: readonly { phase: DayPhase; label: string }[] = [
  { phase: "dawn", label: "Amanhecer âmbar" },
  { phase: "day", label: "Dia claro" },
  { phase: "dusk", label: "Crepúsculo dourado" },
  { phase: "night", label: "Noite serena" },
];

const WEATHER: readonly WeatherKind[] = ["clear", "rain", "clear", "mist"];

/** Estado previsível: permite clima vivo sem cron, processo em segundo plano ou aleatoriedade de teste. */
export function resolveEnvironmentState(elapsedMs: number): EnvironmentState {
  const safeElapsed = Math.max(0, elapsedMs);
  const dayIndex = Math.floor((safeElapsed % ENVIRONMENT_CYCLE_MS) / (ENVIRONMENT_CYCLE_MS / DAY_PHASES.length));
  const weatherIndex = Math.floor((safeElapsed % (WEATHER_CYCLE_MS * WEATHER.length)) / WEATHER_CYCLE_MS);
  const day = DAY_PHASES[dayIndex] ?? DAY_PHASES[0]!;
  const weather = WEATHER[weatherIndex] ?? "clear";
  const weatherLabel = weather === "rain" ? " · Chuva fina" : weather === "mist" ? " · Névoa baixa" : "";
  return { phase: day.phase, weather, label: `${day.label}${weatherLabel}` };
}
