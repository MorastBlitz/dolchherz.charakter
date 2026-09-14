/**
 * Ressourcen-Tracker (TP, Stress, Ruestung, Hoffnung) und Schadensrechner.
 */
import {
  freieFelder,
  getRuestungsFelder,
  getSchadensschwellen,
  getStressMax,
  getTpMax,
  getTpMarkierungen,
} from "../../logic/derived";
import { getHoffnungMax } from "../../logic/seelentier";
import type { SheetContext } from "../context";
import { field, numberedSlots, sectionTitle } from "../controls";
import { renderZustaende } from "./zustaende";

export function renderTracks(ctx: SheetContext, parent: HTMLElement): void {
  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Schaden & Gesundheit");

  const grid = section.createDiv({ cls: "dh-grid dh-grid--tracks" });
  renderTpTrack(ctx, grid);

  if (ctx.char.ruestung.name) {
    renderRuestungTrack(ctx, grid);
  }

  renderStressTrack(ctx, grid);
  renderHoffnungTrack(ctx, grid);

  renderDamageCalculator(ctx, section);
  renderZustaende(ctx, section);
}

function renderTpTrack(ctx: SheetContext, parent: HTMLElement): void {
  const { char, index } = ctx;
  const max = getTpMax(char, index);

  field(parent, `Trefferpunkte ${char.tpMarkiert}/${max}`, (cell) => {
    numberedSlots(cell, max, char.tpMarkiert, (value) =>
      ctx.update((draft) => {
        draft.tpMarkiert = value;
      }),
    );
    if (char.tpMarkiert >= max) {
      cell.createDiv({
        cls: "dh-warning",
        text: "Alle TP markiert: Todeszug fällig.",
      });
    }
  });
}

function renderStressTrack(ctx: SheetContext, parent: HTMLElement): void {
  const { char } = ctx;
  const max = getStressMax(char);
  const frei = freieFelder(max, char.stressMarkiert);

  field(parent, `Stress ${char.stressMarkiert}/${max}`, (cell) => {
    numberedSlots(cell, max, char.stressMarkiert, (value) =>
      ctx.update((draft) => {
        draft.stressMarkiert = value;
      }),
    );
    if (frei === 0) {
      cell.createDiv({
        cls: "dh-warning",
        text: "Gesamter Stress markiert: Verwundbar.",
      });
    }
  });
}

function renderRuestungTrack(ctx: SheetContext, parent: HTMLElement): void {
  const { char, index } = ctx;
  const felder = getRuestungsFelder(char, index);

  field(parent, `Rüstung ${char.ruestung.markierteFelder}/${felder}`, (cell) => {
    cell.createDiv({ cls: "dh-field__hint", text: char.ruestung.name });
    numberedSlots(cell, felder, char.ruestung.markierteFelder, (value) =>
      ctx.update((draft) => {
        draft.ruestung.markierteFelder = value;
      }),
    );
    if (felder === 0) {
      cell.createDiv({
        cls: "dh-field__hint",
        text: "Ohne Rüstung können keine Rüstungsfelder markiert werden.",
      });
    }
  });
}

function renderHoffnungTrack(ctx: SheetContext, parent: HTMLElement): void {
  const { char } = ctx;
  const max = getHoffnungMax(char);
  field(parent, `Hoffnung ${char.hoffnung}/${max}`, (cell) => {
    numberedSlots(cell, max, char.hoffnung, (value) =>
      ctx.update((draft) => {
        draft.hoffnung = value;
      }),
    );
    if (max > 6) {
      cell.createDiv({
        cls: "dh-field__hint",
        text: "Enthält ein zusätzliches Hoffnungsfeld durch „Licht im Dunkeln“.",
      });
    }
  });
}

function severityLabel(markierungen: number): string {
  switch (markierungen) {
    case 0:
      return "Kein Schaden";
    case 1:
      return "Leicht (1 TP)";
    case 2:
      return "Mittel (2 TP)";
    case 3:
      return "Schwer (3 TP)";
    default:
      return "Massiv (4 TP)";
  }
}

function renderDamageCalculator(ctx: SheetContext, parent: HTMLElement): void {
  const { char, index } = ctx;
  const schwellen = getSchadensschwellen(char, index);
  const tpMax = getTpMax(char, index);
  const ruestungsFelder = getRuestungsFelder(char, index);
  const freieRuestungsfelder = freieFelder(
    ruestungsFelder,
    char.ruestung.markierteFelder,
  );

  const wrap = parent.createDiv({ cls: "dh-damage" });
  wrap.createDiv({ cls: "dh-section__subtitle", text: "Schaden anwenden" });
  wrap.createDiv({
    cls: "dh-field__hint",
    text: `Schwellen ${schwellen.mittel} / ${schwellen.schwer}`,
  });

  const controls = wrap.createDiv({ cls: "dh-damage__controls" });
  const input = controls.createEl("input", { cls: "dh-input dh-damage__input" });
  input.setAttr("type", "number");
  input.setAttr("min", "0");
  input.placeholder = "Schaden";

  const resistLabel = controls.createEl("label", { cls: "dh-checkbox" });
  const resist = resistLabel.createEl("input");
  resist.setAttr("type", "checkbox");
  resistLabel.createSpan({ text: "Resistenz" });

  const preview = wrap.createDiv({
    cls: "dh-damage__preview",
    text: "Schaden eingeben.",
  });

  const actions = wrap.createDiv({ cls: "dh-damage__actions" });
  const applyButton = actions.createEl("button", {
    cls: "mod-cta",
    text: "Schaden markieren",
  });
  applyButton.setAttr("type", "button");
  const armorButton = actions.createEl("button", {
    text: "Rüstungsfeld & reduzieren",
  });
  armorButton.setAttr("type", "button");

  const readResult = () => {
    const raw = Number.parseInt(input.value, 10);
    if (!Number.isFinite(raw) || raw <= 0) return null;
    const effektiv = resist.checked ? Math.ceil(raw / 2) : raw;
    const markierungen = getTpMarkierungen(
      effektiv,
      schwellen,
      ctx.settings.useMassiveDamage,
    );
    return { effektiv, markierungen };
  };

  const refresh = () => {
    const result = readResult();
    if (!result) {
      preview.setText("Schaden eingeben.");
      applyButton.disabled = true;
      armorButton.disabled = true;
      return;
    }
    preview.setText(
      `${result.effektiv} Schaden → ${severityLabel(result.markierungen)}`,
    );
    applyButton.disabled = false;
    armorButton.disabled =
      result.markierungen === 0 || freieRuestungsfelder === 0;
  };

  input.addEventListener("input", refresh);
  resist.addEventListener("change", refresh);

  applyButton.disabled = true;
  armorButton.disabled = true;

  applyButton.addEventListener("click", () => {
    const result = readResult();
    if (!result || result.markierungen === 0) return;
    ctx.update((draft) => {
      draft.tpMarkiert = Math.min(tpMax, draft.tpMarkiert + result.markierungen);
    });
  });

  armorButton.addEventListener("click", () => {
    const result = readResult();
    if (!result || result.markierungen === 0) return;
    const reduziert = Math.max(0, result.markierungen - 1);
    ctx.update((draft) => {
      draft.ruestung.markierteFelder = Math.min(
        ruestungsFelder,
        draft.ruestung.markierteFelder + 1,
      );
      draft.tpMarkiert = Math.min(tpMax, draft.tpMarkiert + reduziert);
    });
  });
}
