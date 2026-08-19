// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import MapEditor from "./MapEditor";

afterEach(cleanup);

describe("Cartógrafo do Vale", () => {
  it("seleciona uma célula e edita a colisão e o metadado do tile", () => {
    render(<MapEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Tile 1, 1" }));
    expect(screen.getByText("Tile selecionado")).toBeTruthy();

    const collision = screen.getByLabelText("Colisão do tile selecionado") as HTMLSelectElement;
    fireEvent.change(collision, { target: { value: "slow" } });
    expect(collision.value).toBe("slow");

    const note = screen.getByLabelText("Nota do tile selecionado") as HTMLInputElement;
    fireEvent.change(note, { target: { value: "margem segura" } });
    fireEvent.blur(note);
    expect(note.value).toBe("margem segura");
  });

  it("expõe propriedades editáveis para um objeto posicionado", () => {
    render(<MapEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Tile 2, 2" }));
    expect(screen.getByText("Objeto selecionado")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Interação do objeto selecionado"), { target: { value: "inspect" } });
    expect((screen.getByLabelText("Interação do objeto selecionado") as HTMLSelectElement).value).toBe("inspect");
  });

  it("exibe uma mensagem ao rejeitar JSON inválido no controle de importação", async () => {
    const view = render(<MapEditor />);
    const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, "files", { configurable: true, value: [{ text: async () => "{" }] });
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByText("Importação recusada: JSON inválido.")).toBeTruthy());
  });
});
