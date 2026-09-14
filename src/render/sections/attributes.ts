/**
 * Attribute und Erfahrungen.
 */
import { ATTRIBUT_KEY, ATTRIBUT_LABEL } from "../../logic/derived";
import { ATTRIBUTE, type AttributName } from "../../model/gameData";
import type { SheetContext } from "../context";
import { field, sectionTitle, stepperControl, textControl } from "../controls";

export function renderAttributes(ctx: SheetContext, parent: HTMLElement): void {
  const { char } = ctx;

  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Attribute & Erfahrungen");

  const grid = section.createDiv({ cls: "dh-grid dh-grid--attributes" });
  for (const attribut of ATTRIBUTE) {
    renderAttributField(ctx, grid, attribut);
  }

  renderExperiences(ctx, section);
}

function renderAttributField(
  ctx: SheetContext,
  parent: HTMLElement,
  attribut: AttributName,
): void {
  const { char } = ctx;
  const key = ATTRIBUT_KEY[attribut];

  field(parent, ATTRIBUT_LABEL[attribut], (cell) => {
    stepperControl(cell, char.attribute[key], {
      min: -3,
      max: 5,
      onChange: (value) =>
        ctx.update((draft) => {
          draft.attribute[key] = value;
        }),
    });
  });
}

function renderExperiences(ctx: SheetContext, parent: HTMLElement): void {
  const { char } = ctx;
  const grid = parent.createDiv({ cls: "dh-grid dh-grid--experiences" });

  char.erfahrungen.forEach((erfahrung, index) => {
    field(grid, `Erfahrung ${index + 1}`, (cell) => {
      textControl(cell, erfahrung.name, "Bezeichnung", (value) =>
        ctx.update((draft) => {
          if (draft.erfahrungen[index]) {
            draft.erfahrungen[index].name = value;
          }
        }),
      );

      stepperControl(cell, erfahrung.mod, {
        min: 0,
        max: 6,
        onChange: (value) =>
          ctx.update((draft) => {
            if (draft.erfahrungen[index]) {
              draft.erfahrungen[index].mod = value;
            }
          }),
      });
    });
  });
}
