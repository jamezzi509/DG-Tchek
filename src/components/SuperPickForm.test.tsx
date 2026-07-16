import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuperPickForm from "./SuperPickForm";

describe("SuperPickForm real keystroke simulation", () => {
  it("typing 39, 35, 35, 36 in order via auto-advance submits the correct 4 values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SuperPickForm onSubmit={onSubmit} onClear={() => {}} />);

    const a1 = document.getElementById("sp-input-a1") as HTMLInputElement;
    // No autoFocus anymore on a1 in the inline layout — user must click it first,
    // exactly like a real user would.
    await user.click(a1);
    await user.keyboard("39");
    await user.keyboard("35");
    await user.keyboard("35");
    await user.keyboard("36");

    console.log("Final DOM values:", {
      a1: (document.getElementById("sp-input-a1") as HTMLInputElement).value,
      b1: (document.getElementById("sp-input-b1") as HTMLInputElement).value,
      a2: (document.getElementById("sp-input-a2") as HTMLInputElement).value,
      b2: (document.getElementById("sp-input-b2") as HTMLInputElement).value,
    });
    console.log("onSubmit calls:", JSON.stringify(onSubmit.mock.calls));

    expect(onSubmit).toHaveBeenCalledWith(["39", "35"], ["35", "36"]);
  });

  it("re-clicking into an already-filled box and retyping doesn't cross-contaminate other fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SuperPickForm onSubmit={onSubmit} onClear={() => {}} />);

    const a1 = document.getElementById("sp-input-a1") as HTMLInputElement;
    const a2 = document.getElementById("sp-input-a2") as HTMLInputElement;

    // First full comparison via auto-advance
    await user.click(a1);
    await user.keyboard("66364777");
    onSubmit.mockClear();

    // Now click back into a1 (already "66") and retype it directly, without
    // hitting Efase first — this is what a real user does when fixing a typo.
    await user.click(a1);
    await user.keyboard("{Backspace}{Backspace}39");
    await user.click(document.getElementById("sp-input-b1") as HTMLInputElement);
    await user.keyboard("{Backspace}{Backspace}35");
    await user.click(a2);
    await user.keyboard("{Backspace}{Backspace}35");
    await user.click(document.getElementById("sp-input-b2") as HTMLInputElement);
    await user.keyboard("{Backspace}{Backspace}36");

    const finalValues = {
      a1: (document.getElementById("sp-input-a1") as HTMLInputElement).value,
      b1: (document.getElementById("sp-input-b1") as HTMLInputElement).value,
      a2: (document.getElementById("sp-input-a2") as HTMLInputElement).value,
      b2: (document.getElementById("sp-input-b2") as HTMLInputElement).value,
    };
    console.log("Retype final DOM values:", finalValues);
    console.log("onSubmit calls after retype:", JSON.stringify(onSubmit.mock.calls));

    expect(finalValues).toEqual({ a1: "39", b1: "35", a2: "35", b2: "36" });
    expect(onSubmit).toHaveBeenLastCalledWith(["39", "35"], ["35", "36"]);
  });
});
