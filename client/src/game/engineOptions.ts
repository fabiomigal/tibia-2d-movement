/** Mantém o renderizador compatível com navegadores e ambientes de preview que não expõem WebGL2 de forma confiável. */
export function createGameEngineOptions() {
  return {
    preserveDrawingBuffer: true,
    stencil: true,
    adaptToDeviceRatio: true,
    disableWebGL2Support: true,
  };
}
