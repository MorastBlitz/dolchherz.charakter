/**
 * Seelentier der Waldlaeufer-Subklasse Bestienbund.
 *
 * Der Bogen folgt dem Seelentierbogen: Ausweichen, Stress, Angriff & Schaden,
 * zwei Erfahrungen und die Ausbildungs-Optionen beim Stufenaufstieg.
 */
import { getKlasse } from "../../logic/derived";
import {
  aendereAusbildung,
  getAusbildungAnzahl,
  getAusbildungMaximum,
  getSeelentierAusweichen,
  getSeelentierStressMax,
  hatSeelentier,
  SEELENTIER_AUSBILDUNG,
  SEELENTIER_DISTANZEN,
  SEELENTIER_WUERFEL,
  zaehleAusbildung,
} from "../../logic/seelentier";
import type { SheetContext } from "../context";
import {
  actionButton,
  field,
  numberedSlots,
  sectionTitle,
  selectControl,
  stepperControl,
  textControl,
  toggleControl,
} from "../controls";
import { renderPortrait } from "../portrait";
import { renderRichText } from "../richText";

export function renderSeelentier(ctx: SheetContext, parent: HTMLElement): void {
  if (!hatSeelentier(ctx.char)) return;

  const tier = ctx.char.seelentier;
  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Seelentier (Bestienbund)");

  renderPortrait(
    ctx,
    section,
    "Seelentier",
    { pfad: tier.portrait, format: tier.portraitFormat },
    (next) =>
      ctx.update((draft) => {
        draft.seelentier.portrait = next.pfad;
        draft.seelentier.portraitFormat = next.format;
      }),
  );

  const grid = section.createDiv({ cls: "dh-grid" });
  field(grid, "Name", (cell) =>
    textControl(cell, tier.name, "Name", (value) =>
      ctx.update((draft) => {
        draft.seelentier.name = value;
      }),
    ),
  );

  field(grid, "Tier", (cell) =>
    textControl(cell, tier.tier, "z. B. Wolf", (value) =>
      ctx.update((draft) => {
        draft.seelentier.tier = value;
      }),
    ),
  );

  field(grid, `Ausweichen ${getSeelentierAusweichen(ctx.char)}`, (cell) => {
    cell.createDiv({
      cls: "dh-field__hint",
      text: "Startwert 10 · Auf der Hut: +2 je Stufe (max. 16).",
    });
  });

  const stressMax = getSeelentierStressMax(ctx.char);
  field(grid, `Stress ${tier.stressMarkiert}/${stressMax}`, (cell) => {
    numberedSlots(cell, stressMax, tier.stressMarkiert, (value) =>
      ctx.update((draft) => {
        draft.seelentier.stressMarkiert = Math.max(0, Math.min(stressMax, value));
      }),
    );
    cell.createDiv({
      cls: "dh-field__hint",
      text: "Startwert 3 · Widerstandsfähig: +1 Feld je Stufe (max. 6).",
    });
  });

  field(grid, "Schadenswürfel", (cell) =>
    selectControl(
      cell,
      SEELENTIER_WUERFEL.map((wert) => ({ value: wert, label: wert })),
      tier.schadenswuerfel,
      (value) =>
        ctx.update((draft) => {
          draft.seelentier.schadenswuerfel = value || "W6";
        }),
    ),
  );

  field(grid, "Distanz", (cell) =>
    selectControl(
      cell,
      SEELENTIER_DISTANZEN.map((wert) => ({ value: wert, label: wert })),
      tier.distanz,
      (value) =>
        ctx.update((draft) => {
          draft.seelentier.distanz = value || "unmittelbar";
        }),
    ),
  );

  field(grid, "Schadenstyp", (cell) =>
    selectControl(
      cell,
      [
        { value: "phy", label: "physisch" },
        { value: "mag", label: "magisch" },
      ],
      tier.schadenstyp,
      (value) =>
        ctx.update((draft) => {
          draft.seelentier.schadenstyp = value === "mag" ? "mag" : "phy";
        }),
    ),
  );

  const expGrid = section.createDiv({ cls: "dh-grid" });
  tier.erfahrungen.forEach((erfahrung, index) => {
    field(expGrid, `Erfahrung ${index + 1}`, (cell) => {
      textControl(cell, erfahrung.name, "Bezeichnung", (value) =>
        ctx.update((draft) => {
          if (draft.seelentier.erfahrungen[index]) {
            draft.seelentier.erfahrungen[index].name = value;
          }
        }),
      );
      stepperControl(cell, erfahrung.mod, {
        min: 0,
        max: 6,
        onChange: (value) =>
          ctx.update((draft) => {
            if (draft.seelentier.erfahrungen[index]) {
              draft.seelentier.erfahrungen[index].mod = value;
            }
          }),
      });
    });
  });

  renderAusbildung(ctx, section);
}

function renderAusbildung(ctx: SheetContext, parent: HTMLElement): void {
  const gewaehlt = ctx.char.seelentier.ausbildung.length;
  const verfuegbar = getAusbildungAnzahl(ctx.char);

  parent.createDiv({
    cls: "dh-section__subtitle",
    text: `Ausbildung (${gewaehlt}/${verfuegbar})`,
  });
  parent.createDiv({
    cls: "dh-field__hint",
    text: "Bei jedem Stufenaufstieg wählst du eine Option. Intelligent, Wütend, Widerstandsfähig und Auf der Hut lassen sich bis zu dreimal steigern.",
  });

  const grid = parent.createDiv({ cls: "dh-grid dh-grid--zustaende" });
  for (const option of SEELENTIER_AUSBILDUNG) {
    const anzahl = zaehleAusbildung(ctx.char, option.id);
    const maximum = getAusbildungMaximum(option);

    field(grid, option.label, (cell) => {
      if (option.wiederholbar) {
        const row = cell.createDiv({ cls: "dh-inline" });
        row.createSpan({ cls: "dh-field__hint", text: `${anzahl}/${maximum}` });
        actionButton(row, "−", () =>
          ctx.update((draft) => {
            aendereAusbildung(draft, option.id, -1);
          }),
        ).disabled = anzahl <= 0;
        actionButton(row, "+", () =>
          ctx.update((draft) => {
            aendereAusbildung(draft, option.id, 1);
          }),
        ).disabled = anzahl >= maximum || gewaehlt >= verfuegbar;
      } else {
        const wrapper = toggleControl(cell, anzahl > 0, option.label, (checked) =>
          ctx.update((draft) => {
            aendereAusbildung(draft, option.id, checked ? 1 : -1);
          }),
        );
        if (anzahl === 0 && gewaehlt >= verfuegbar) {
          wrapper.querySelector("input")?.setAttribute("disabled", "true");
        }
      }
      cell.createDiv({ cls: "dh-field__hint", text: option.beschreibung });
    });
  }

  const regeln = getKlasse(ctx.char, ctx.index)?.seelentier;
  if (regeln) {
    const details = parent.createEl("details", { cls: "dh-collapsible" });
    details.createEl("summary", {
      cls: "dh-collapsible__summary",
      text: "Seelentier-Regeln",
    });
    renderRichText(details.createDiv({ cls: "dh-collapsible__body" }), regeln);
  }
}
