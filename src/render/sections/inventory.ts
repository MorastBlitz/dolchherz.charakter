/**
 * Inventar, Verbrauchsgueter und Gold.
 *
 * Beute und Inventar sind zusammengefuehrt: Alle Datenquellen legen ihre
 * Eintraege im Inventar ab.
 */
import type {
  CharakterGold,
  CharakterInventarEintrag,
} from "../../model/character";
import type { Gegenstand } from "../../model/gameData";
import type { SheetContext } from "../context";
import {
  actionButton,
  field,
  sectionTitle,
  selectControl,
  stepperControl,
} from "../controls";

export function renderInventory(ctx: SheetContext, parent: HTMLElement): void {
  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Inventar & Gold");

  renderGold(ctx, section);
  renderDatenQuellen(ctx, section);
  renderItems(ctx, section, ctx.char.inventar);
}


function renderGold(ctx: SheetContext, parent: HTMLElement): void {
  const grid = parent.createDiv({ cls: "dh-grid dh-grid--gold" });
  const felder: Array<[keyof CharakterGold, string]> = [
    ["handvoll", "Handvoll"],
    ["beutel", "Beutel"],
    ["truhe", "Truhe"],
  ];

  for (const [key, label] of felder) {
    field(grid, `Gold: ${label}`, (cell) => {
      stepperControl(cell, ctx.char.gold[key], {
        min: 0,
        max: 99,
        onChange: (value) =>
          ctx.update((draft) => {
            draft.gold[key] = value;
          }),
      });
    });
  }
}

/** Auswahl aus Beute- und Verbrauchsgut-Daten. */
function renderDatenQuellen(ctx: SheetContext, parent: HTMLElement): void {
  const grid = parent.createDiv({ cls: "dh-grid" });
  renderQuelle(ctx, grid, "Beute", ctx.game.beute);
  renderQuelle(ctx, grid, "Verbrauchsgut", ctx.game.verbrauchsgueter);
}

function renderQuelle(
  ctx: SheetContext,
  parent: HTMLElement,
  label: string,
  pool: Gegenstand[],
): void {
  let selected = "";
  let anzahl = 1;

  field(parent, label, (cell) => {
    selectControl(
      cell,
      pool.map((item) => ({ value: item.name, label: item.name })),
      "",
      (value) => {
        selected = value;
      },
    );

    const row = cell.createDiv({ cls: "dh-inline" });
    row.createSpan({ cls: "dh-field__hint", text: "Anzahl" });
    stepperControl(row, anzahl, {
      min: 1,
      max: 99,
      onChange: (value) => {
        anzahl = value;
      },
    });

    const actions = cell.createDiv({ cls: "dh-inline" });
    actionButton(actions, "Hinzufügen", () => {
      if (!selected) return;
      const item = pool.find((eintrag) => eintrag.name === selected);
      if (!item) return;
      const menge = anzahl;
      ctx.update((draft) => {
        draft.inventar.push({
          name: item.name,
          beschreibung: item.beschreibung,
          anzahl: menge,
        });
      });
    });
  });
}

function renderItems(
  ctx: SheetContext,
  parent: HTMLElement,
  items: CharakterInventarEintrag[],
): void {
  const wrap = parent.createDiv({ cls: "dh-card-list" });
  wrap.createDiv({
    cls: "dh-section__subtitle",
    text: `Inventar (${items.length})`,
  });

  if (items.length === 0) {
    wrap.createDiv({ cls: "dh-field__hint", text: "Keine Einträge." });
  }

  items.forEach((item, index) => {
    const row = wrap.createDiv({ cls: "dh-item" });
    const body = row.createDiv({ cls: "dh-item__body" });
    body.createDiv({ cls: "dh-item__name", text: item.name || "(ohne Namen)" });
    if (item.beschreibung) {
      body.createDiv({ cls: "dh-field__hint", text: item.beschreibung });
    }

    const meta = body.createDiv({ cls: "dh-inline" });
    meta.createSpan({ cls: "dh-field__hint", text: "Anzahl" });
    stepperControl(meta, item.anzahl, {
      min: 1,
      max: 99,
      onChange: (value) =>
        ctx.update((draft) => {
          if (draft.inventar[index]) draft.inventar[index].anzahl = value;
        }),
    });

    actionButton(row, "Entfernen", () =>
      ctx.update((draft) => {
        draft.inventar.splice(index, 1);
      }),
    );
  });

  const addRow = wrap.createDiv({ cls: "dh-inline" });
  const input = addRow.createEl("input", { cls: "dh-input" });
  input.setAttr("type", "text");
  input.placeholder = "Eigener Gegenstand";
  actionButton(addRow, "Hinzufügen", () => {
    const value = input.value.trim();
    if (!value) return;
    ctx.update((draft) => {
      draft.inventar.push({ name: value, anzahl: 1 });
    });
  });
}
