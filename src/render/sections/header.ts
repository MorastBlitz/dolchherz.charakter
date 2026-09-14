/**
 * Kopfbereich des Bogens: Identitaet, Auswahlfelder und abgeleitete Kennzahlen.
 */
import {
  getAusweichen,
  getRang,
  getRuestungswert,
  getSchadensschwellen,
  getStressMax,
  getTpMax,
  getUebung,
  isValidAttributVerteilung,
} from "../../logic/derived";
import type { SheetContext } from "../context";
import { badge, field, selectControl, stepperControl, textControl } from "../controls";
import { renderPortrait } from "../portrait";

export function renderHeader(ctx: SheetContext, parent: HTMLElement): void {
  const { char, game, index } = ctx;

  const header = parent.createDiv({ cls: "dh-sheet__header" });
  renderPortrait(
    ctx,
    header,
    "Porträt",
    { pfad: char.portrait, format: char.portraitFormat },
    (next) =>
      ctx.update((draft) => {
        draft.portrait = next.pfad;
        draft.portraitFormat = next.format;
      }),
  );

  const grid = header.createDiv({ cls: "dh-grid" });

  field(grid, "Name", (cell) =>
    textControl(cell, char.name, "Name", (value) =>
      ctx.update((draft) => {
        draft.name = value;
      }),
    ),
  );

  field(grid, "Pronomen", (cell) =>
    textControl(cell, char.pronomen, "Pronomen", (value) =>
      ctx.update((draft) => {
        draft.pronomen = value;
      }),
    ),
  );

  const klassenOptions = game.klassen.map((klasse) => ({
    value: klasse.name,
    label: klasse.name_full,
  }));
  field(grid, "Klasse", (cell) =>
    selectControl(cell, klassenOptions, char.klasse, (value) =>
      ctx.update((draft) => {
        draft.klasse = value;
        draft.subklasse = "";
      }),
    ),
  );

  const subklassen = (index.subklassenByKlasse.get(char.klasse) ?? []).filter(
    (subklasse) => subklasse.grad === "Basis",
  );
  field(grid, "Subklasse", (cell) =>
    selectControl(
      cell,
      subklassen.map((subklasse) => ({
        value: subklasse.subklasse,
        label: subklasse.subklasse,
      })),
      char.subklasse,
      (value) =>
        ctx.update((draft) => {
          draft.subklasse = value;
        }),
    ),
  );

  field(grid, "Stufe", (cell) =>
    stepperControl(cell, char.stufe, {
      min: 1,
      max: 10,
      onChange: (value) =>
        ctx.update((draft) => {
          draft.stufe = value;
        }),
    }),
  );

  field(grid, "Übung", (cell) =>
    stepperControl(cell, getUebung(char), {
      min: 0,
      max: 6,
      onChange: (value) =>
        ctx.update((draft) => {
          draft.uebung = value;
        }),
    }),
  );

  field(grid, "Abstammung", (cell) =>
    selectControl(
      cell,
      game.abstammungen.map((abstammung) => ({
        value: abstammung.titel,
        label: abstammung.titel,
      })),
      char.herkunft.abstammung,
      (value) =>
        ctx.update((draft) => {
          draft.herkunft.abstammung = value;
        }),
    ),
  );

  field(grid, "Gemeinschaft", (cell) =>
    selectControl(
      cell,
      game.gemeinschaften.map((gemeinschaft) => ({
        value: gemeinschaft.titel,
        label: gemeinschaft.titel,
      })),
      char.herkunft.gemeinschaft,
      (value) =>
        ctx.update((draft) => {
          draft.herkunft.gemeinschaft = value;
        }),
    ),
  );

  renderSummary(ctx, header);

  if (char.stufe === 1 && !isValidAttributVerteilung(char.attribute)) {
    header.createDiv({
      cls: "dh-field__hint",
      text: "Attributverteilung weicht von der Erstellung ab (+2/+1/+1/+0/+0/−1).",
    });
  }
}

function renderSummary(ctx: SheetContext, parent: HTMLElement): void {
  const { char, index } = ctx;
  const schwellen = getSchadensschwellen(char, index);
  const summary = parent.createDiv({ cls: "dh-summary" });

  badge(summary, "Rang", String(getRang(char.stufe)));
  badge(summary, "Übung", String(getUebung(char)));
  badge(summary, "Ausweichen", String(getAusweichen(char, index)));
  badge(summary, "Rüstungswert", String(getRuestungswert(char, index)));
  badge(summary, "Schwellen", `${schwellen.mittel} / ${schwellen.schwer}`);
  badge(summary, "TP", String(getTpMax(char, index)));
  badge(summary, "Stress", String(getStressMax(char)));
}
