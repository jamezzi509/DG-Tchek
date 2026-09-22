import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import WorkoutPanel from "./WorkoutPanel";
import type { DgTchekResult } from "../lib/core";

afterEach(cleanup);
const tchek: DgTchekResult = { input1: "25", input2: "28", list1: [], list2: [], common: ["16", "17", "36", "37"], pick3: [], pick4: [] };

describe("WorkoutPanel user flow", () => {
  it("shows the reverse-aware overlap without dropping original followers, and updates with the active comparison", () => {
    const view = render(<WorkoutPanel tchek={tchek} />);
    fireEvent.change(screen.getByLabelText("Dat pou verifye"), { target: { value: "2026-09-16" } });
    fireEvent.click(screen.getByRole("button", { name: "Wè boul komen" }));
    const section = screen.getByRole("heading", { name: "Tchek ou + Piramid" }).parentElement!;
    expect(within(section).getByText("16")).toBeTruthy();
    expect(within(section).getByText("17")).toBeTruthy();
    expect(screen.queryByText("16/61")).toBeNull();
    expect(screen.getByText("68")).toBeTruthy(); // unmatched pyramid pair stays visible
    const labels = ["1ye lo · Pick 3 dèyè", "2èm lo · Pick 4 devan", "3èm lo · Pick 4 dèyè"];
    labels.forEach((label, i) => fireEvent.change(screen.getByLabelText(label), { target: { value: ["58", "54", "73"][i] } }));
    const gydSection = screen.getByRole("heading", { name: "Tchek ou + GYD" }).parentElement!;
    expect(within(gydSection).getByText("36")).toBeTruthy();
    view.rerender(<WorkoutPanel tchek={{ ...tchek, common: ["00"] }} />);
    expect(within(gydSection).getByText("Pa gen boul komen.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Tiraj"), { target: { value: "Swa" } });
    expect((screen.getByLabelText(labels[0]) as HTMLInputElement).value).toBe("");
    expect(within(gydSection).getByText("Antre 3 lo GYD yo anvan.")).toBeTruthy();
  });
  it("does not mislabel missing inputs as an empty completed comparison", () => {
    render(<WorkoutPanel tchek={null} />);
    expect((screen.getByRole("button", { name: "Wè boul komen" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Antre tout 3 lo yo ak 2 chif chak pou wè GYD a.")).toBeTruthy();
  });
});
