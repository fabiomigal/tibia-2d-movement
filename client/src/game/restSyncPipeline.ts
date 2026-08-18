export type RestSyncInput = {
  wasResting: boolean;
  worldReportsRest: boolean;
  isDead: boolean;
};

/** Decide se a transição de repouso deve ser persistida e se os recursos devem continuar sendo atualizados. */
export function resolveRestSync({ wasResting, worldReportsRest, isDead }: RestSyncInput) {
  const resting = worldReportsRest && !isDead;
  return {
    resting,
    shouldPersistTransition: wasResting !== resting,
    shouldRefreshResources: resting,
  };
}
