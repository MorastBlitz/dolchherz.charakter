/**
 * Verwaltung der Domaenenkarten in Auslage und Reserve.
 */
import { getKlasse, getStressMax } from "../../logic/derived";
import type { DomaenenKarte } from "../../model/gameData";
import type { SheetContext } from "../context";
import { actionButton, field, sectionTitle, selectControl } from "../controls";
import { renderRichText } from "../richText";

const AUSLAGE_MAX = 5;

/**
 * Normalisiert einen Domaenennamen auf den Schluessel der Kartendaten.
 *
 * Die Klassendaten nennen die Domaene "Arkana", die Kartendaten fuehren sie
 * unter "ARCANA"; ohne diese Zuordnung gingen die Karten der Arkana-Domaene
 * verloren.
 */
function domainKey(name: string): string {
  const key = name.trim().toUpperCase();
  return key === "ARKANA" ? "ARCANA" : key;
}

export function renderDomainCards(ctx: SheetContext, parent: HTMLElement): void {
  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Domänenkarten");

  const maxKarten = ctx.char.stufe + 1;
  const auslage = ctx.char.domaenenkarten.auslage;
  const reserve = ctx.char.domaenenkarten.reserve;
  const gesamt = auslage.length + reserve.length;
  const limitErreicht = gesamt >= maxKarten;

  const available = getAvailableCards(ctx);
  const addGrid = section.createDiv({ cls: "dh-grid" });
  let selected = "";

  field(addGrid, "Karte hinzufügen", (cell) => {
    if (available.length === 0) {
      cell.createDiv({
        cls: "dh-field__hint",
        text: "Keine weiteren Karten verfügbar.",
      });
      return;
    }

    selectControl(
      cell,
      available.map((karte) => ({
        value: karte.name,
        label: `[Stufe ${karte.stufe}] ${karte.domaene_full} · ${karte.name} (${karte.typ})`,
      })),
      "",
      (value) => {
        selected = value;
      },
    );

    const row = cell.createDiv({ cls: "dh-inline" });
    actionButton(row, "In Auslage", () => {
      if (!selected) return;
      ctx.update((draft) => {
        const owned = [
          ...draft.domaenenkarten.auslage,
          ...draft.domaenenkarten.reserve,
        ];
        if (owned.includes(selected)) return;
        if (owned.length >= maxKarten) return;
        if (draft.domaenenkarten.auslage.length >= AUSLAGE_MAX) return;
        draft.domaenenkarten.auslage.push(selected);
      });
    }).disabled = limitErreicht || auslage.length >= AUSLAGE_MAX;

    actionButton(row, "In Reserve", () => {
      if (!selected) return;
      ctx.update((draft) => {
        const owned = [
          ...draft.domaenenkarten.auslage,
          ...draft.domaenenkarten.reserve,
        ];
        if (owned.includes(selected)) return;
        if (owned.length >= maxKarten) return;
        draft.domaenenkarten.reserve.push(selected);
      });
    }).disabled = limitErreicht;

    cell.createDiv({
      cls: "dh-field__hint",
      text: `Auslage ${auslage.length}/${AUSLAGE_MAX} · Karten ${gesamt}/${maxKarten} (Stufe ${ctx.char.stufe})`,
    });
  });

  renderKartenListe(ctx, section, "Auslage", auslage, "auslage");
  renderKartenListe(ctx, section, "Reserve", reserve, "reserve");
}

function getAvailableCards(ctx: SheetContext): DomaenenKarte[] {
  const klasse = getKlasse(ctx.char, ctx.index);
  const klasseDomaenen = (klasse?.domaenen ?? []).map(domainKey);
  const multiDomaene = ctx.char.multiklasse.domaene
    ? domainKey(ctx.char.multiklasse.domaene)
    : null;
  const multiLimit = Math.ceil(ctx.char.stufe / 2);
  const owned = new Set([
    ...ctx.char.domaenenkarten.auslage,
    ...ctx.char.domaenenkarten.reserve,
  ]);

  return ctx.game.domaenenkarten
    .filter((karte) => {
      if (owned.has(karte.name)) return false;
      const domaene = domainKey(karte.domaene);
      if (klasseDomaenen.includes(domaene)) {
        return karte.stufe <= ctx.char.stufe;
      }
      if (multiDomaene && domaene === multiDomaene) {
        return karte.stufe <= multiLimit;
      }
      return false;
    })
    .sort((a, b) => a.stufe - b.stufe || a.kartennummer - b.kartennummer);
}

function renderKartenListe(
  ctx: SheetContext,
  parent: HTMLElement,
  titel: string,
  karten: string[],
  ziel: "auslage" | "reserve",
): void {
  const wrap = parent.createDiv({ cls: "dh-card-list" });
  wrap.createDiv({ cls: "dh-section__subtitle", text: `${titel} (${karten.length})` });

  if (karten.length === 0) {
    wrap.createDiv({ cls: "dh-field__hint", text: "Keine Karten." });
    return;
  }

  karten.forEach((name, index) => {
    const karte = ctx.index.domaenenkarteByName.get(name);
    const card = wrap.createDiv({ cls: "dh-card" });

    const header = card.createDiv({ cls: "dh-card__header" });
    header.createDiv({ cls: "dh-card__name", text: name });
    if (karte) {
      header.createDiv({
        cls: "dh-field__hint",
        text: `Stufe ${karte.stufe} · ${karte.typ} · Rückruf ${karte.rueckrufkosten}`,
      });
    }

    const actions = header.createDiv({ cls: "dh-inline" });
    if (ziel === "auslage") {
      actionButton(actions, "→ Reserve", () =>
        ctx.update((draft) => {
          const [moved] = draft.domaenenkarten.auslage.splice(index, 1);
          if (moved) draft.domaenenkarten.reserve.push(moved);
        }),
      );
    } else {
      actionButton(actions, "→ Auslage", () =>
        ctx.update((draft) => {
          const [moved] = draft.domaenenkarten.reserve.splice(index, 1);
          if (!moved) return;
          while (draft.domaenenkarten.auslage.length >= AUSLAGE_MAX) {
            const displaced = draft.domaenenkarten.auslage.pop();
            if (!displaced) break;
            draft.domaenenkarten.reserve.push(displaced);
          }
          draft.domaenenkarten.auslage.push(moved);
          const kosten = karte?.rueckrufkosten ?? 0;
          draft.stressMarkiert = Math.min(
            getStressMax(draft),
            draft.stressMarkiert + kosten,
          );
        }),
      );
    }

    actionButton(actions, "Entfernen", () =>
      ctx.update((draft) => {
        const list =
          ziel === "auslage"
            ? draft.domaenenkarten.auslage
            : draft.domaenenkarten.reserve;
        list.splice(index, 1);
      }),
    );

    if (karte) {
      renderRichText(card, karte.kartentext);
    }
  });
}
