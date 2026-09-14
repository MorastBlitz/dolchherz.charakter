/**
 * Zustandsverwaltung.
 *
 * Wird innerhalb der Sektion "Schaden & Gesundheit" gerendert.
 */
import { getStressMax } from "../../logic/derived";
import {
  STANDARD_ZUSTAENDE,
  toggleZustand,
  ZUSTAND_BESCHREIBUNG,
  ZUSTAND_LABEL,
} from "../../logic/zustaende";
import type { SheetContext } from "../context";
import { toggleControl } from "../controls";

export function renderZustaende(ctx: SheetContext, parent: HTMLElement): void {
  parent.createDiv({ cls: "dh-section__subtitle", text: "Zustände" });

  const grid = parent.createDiv({ cls: "dh-grid dh-grid--zustaende" });
  for (const zustand of STANDARD_ZUSTAENDE) {
    const cell = grid.createDiv({ cls: "dh-field" });
    toggleControl(
      cell,
      ctx.char.zustaende.includes(zustand),
      ZUSTAND_LABEL[zustand],
      (checked) =>
        ctx.update((draft) => {
          toggleZustand(draft, zustand, checked);
        }),
    );
    cell.createDiv({
      cls: "dh-field__hint",
      text: ZUSTAND_BESCHREIBUNG[zustand],
    });
  }

  const stressMax = getStressMax(ctx.char);
  if (ctx.char.stressMarkiert >= stressMax) {
    parent.createDiv({
      cls: "dh-warning",
      text: "Gesamter Stress markiert: Verwundbar bis mindestens 1 Stress gelöscht wird.",
    });
  }
}
