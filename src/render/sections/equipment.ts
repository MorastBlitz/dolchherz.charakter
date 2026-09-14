/**
 * Ruestung und Waffen: Auswahl, Merkmale und abgeleitete Kennzahlen.
 *
 * Die Primaer- und Sekundaerwaffe sind die ausgeruesteten (aktiven) Waffen
 * laut Regelwerk. Die weiteren Waffenfelder sind nur mitgefuehrte Waffen und
 * haben keinen Einfluss auf abgeleitete Werte.
 */
import { formatSchadenswurf, getRang, getRuestung, getWaffe } from "../../logic/derived";
import type { WaffenTyp } from "../../model/gameData";
import type { SheetContext } from "../context";
import { field, sectionTitle, selectControl } from "../controls";

export function renderEquipment(ctx: SheetContext, parent: HTMLElement): void {
  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Rüstung & Waffen");
  const rang = getRang(ctx.char.stufe);

  renderRuestung(ctx, section, rang);

  const weaponGrid = section.createDiv({ cls: "dh-grid dh-grid--weapons" });
  renderWeaponSlot(ctx, weaponGrid, "primaer", "Primärwaffe", "Primärwaffe", rang);
  renderWeaponSlot(ctx, weaponGrid, "sekundaer", "Sekundärwaffe", "Sekundärwaffe", rang);

  renderWeitereWaffen(ctx, section, rang);
}

function renderRuestung(
  ctx: SheetContext,
  parent: HTMLElement,
  rang: number,
): void {
  const options = ctx.game.ruestungen
    .filter((ruestung) => ruestung.rang <= rang)
    .map((ruestung) => ({
      value: ruestung.name,
      label: `${ruestung.name} (${ruestung.basisschwellen}, Wert ${ruestung.basiswert})`,
    }));

  const grid = parent.createDiv({ cls: "dh-grid" });
  field(grid, "Aktive Rüstung", (cell) => {
    selectControl(cell, options, ctx.char.ruestung.name, (value) =>
      ctx.update((draft) => {
        draft.ruestung.name = value;
        draft.ruestung.markierteFelder = 0;
      }),
    );

    const ruestung = getRuestung(ctx.char, ctx.index);
    if (!ruestung) {
      cell.createDiv({
        cls: "dh-field__hint",
        text: "Ohne Rüstung: Mittlere Schwelle = Stufe, Schwere Schwelle = 2 × Stufe.",
      });
      return;
    }

    cell.createDiv({
      cls: "dh-field__hint",
      text: `Basisschwellen ${ruestung.basisschwellen} · Basiswert ${ruestung.basiswert}`,
    });
    if (ruestung.merkmal && ruestung.merkmal !== "-") {
      cell.createDiv({ cls: "dh-field__hint", text: ruestung.merkmal });
    }
  });
}

function renderWeaponSlot(
  ctx: SheetContext,
  parent: HTMLElement,
  slot: "primaer" | "sekundaer",
  label: string,
  typ: WaffenTyp,
  rang: number,
): void {
  const options = ctx.game.waffen
    .filter((waffe) => waffe.typ === typ && waffe.rang <= rang)
    .map((waffe) => ({ value: waffe.name, label: `${waffe.name} (${waffe.schaden})` }));

  field(parent, label, (cell) => {
    selectControl(cell, options, ctx.char.waffen[slot], (value) =>
      ctx.update((draft) => {
        draft.waffen[slot] = value;
      }),
    );

    const waffe = getWaffe(ctx.char, ctx.index, slot);
    if (!waffe) {
      cell.createDiv({ cls: "dh-field__hint", text: "Keine Waffe ausgerüstet." });
      return;
    }

    cell.createDiv({
      cls: "dh-field__hint",
      text: `${waffe.attribut} · ${waffe.distanz} · ${waffe.schaden} · ${waffe.fuehrung}`,
    });
    if (waffe.merkmal && waffe.merkmal !== "-") {
      cell.createDiv({ cls: "dh-field__hint", text: waffe.merkmal });
    }

    const schadenswurf = formatSchadenswurf(ctx.char, waffe);
    if (schadenswurf) {
      cell.createDiv({
        cls: "dh-field__roll",
        text: `Schadenswurf ${schadenswurf}`,
      });
    }
  });
}

function renderWeitereWaffen(
  ctx: SheetContext,
  parent: HTMLElement,
  rang: number,
): void {
  const inventarOptions = ctx.game.waffen
    .filter((waffe) => waffe.rang <= rang)
    .map((waffe) => ({ value: waffe.name, label: `${waffe.name} (${waffe.schaden})` }));

  const grid = parent.createDiv({ cls: "dh-grid" });
  for (let index = 0; index < 2; index += 1) {
    field(grid, `Weitere Waffe ${index + 1}`, (cell) => {
      selectControl(
        cell,
        inventarOptions,
        ctx.char.waffen.inventar[index] ?? "",
        (value) =>
          ctx.update((draft) => {
            const list = [...(draft.waffen.inventar ?? [])];
            list[index] = value;
            draft.waffen.inventar = list;
          }),
      );
    });
  }

  parent.createDiv({
    cls: "dh-field__hint",
    text: "Nur mitgeführt, nicht ausgerüstet: zählt nicht zu Ausweichen, Rüstungswert oder Schadenswurf.",
  });
}
