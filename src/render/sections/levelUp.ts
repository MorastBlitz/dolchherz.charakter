/**
 * Stufenaufstieg: Rang-Errungenschaften, Fortschritte und Multiklasse.
 *
 * Laut Regelwerk stehen pro Stufe zwei Fortschritts-Felder zur Verfuegung;
 * die Option "Uebung +1" kostet zwei Felder.
 */
import {
  ATTRIBUT_LABEL,
  getKlasse,
  getRang,
  getStressMax,
  getTpMax,
  getUebung,
  TRACK_MAX,
} from "../../logic/derived";
import {
  applyStufenaufstieg,
  erhoeheAttribute,
  erhoeheAusweichen,
  erhoeheErfahrungen,
  erhoeheStress,
  erhoeheTp,
  erhoeheUebung,
  FORTSCHRITTE,
  FORTSCHRITTE_PRO_STUFE,
  kannAufsteigen,
  RANG_ERRUNGENSCHAFTEN,
} from "../../logic/levelUp";
import { ATTRIBUTE, type AttributName } from "../../model/gameData";
import type { SheetContext } from "../context";
import { actionButton, field, sectionTitle, selectControl } from "../controls";

export function renderLevelUp(ctx: SheetContext, parent: HTMLElement): void {
  const { char } = ctx;
  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Stufenaufstieg");

  section.createDiv({
    cls: "dh-field__hint",
    text: `Stufe ${char.stufe} · Rang ${getRang(char.stufe)} · Übung ${getUebung(char)} · ${
      kannAufsteigen(char) ? "Aufstieg möglich" : "Maximale Stufe erreicht"
    }`,
  });

  const nextStufe = char.stufe + 1;
  const errungenschaft = RANG_ERRUNGENSCHAFTEN[nextStufe];
  if (errungenschaft) {
    const teile: string[] = [];
    if (errungenschaft.uebung) teile.push("Übung +1");
    if (errungenschaft.erfahrung) teile.push("neue Erfahrung +2");
    if (errungenschaft.attributMarkierungenLoeschen) {
      teile.push("Attributmarkierungen löschen");
    }
    section.createDiv({
      cls: "dh-field__hint",
      text: `Rang-Errungenschaft auf Stufe ${nextStufe}: ${teile.join(", ")}`,
    });
  }

  actionButton(
    section,
    "Stufe erhöhen (+1)",
    () =>
      ctx.update((draft) => {
        applyStufenaufstieg(draft, ctx.settings.autoApplyRankRewards);
      }),
    "mod-cta",
  );

  const offen = char.fortschritteOffen ?? 0;
  section.createDiv({
    cls: "dh-field__hint",
    text: `Offene Fortschritte dieser Stufe: ${offen}/${FORTSCHRITTE_PRO_STUFE}`,
  });

  section.createDiv({
    cls: "dh-section__subtitle",
    text: "Fortschritte (pro Stufe zwei wählen)",
  });
  const liste = section.createEl("ul", { cls: "dh-fortschritte" });
  for (const fortschritt of FORTSCHRITTE) {
    const item = liste.createEl("li");
    item.createEl("strong", { text: fortschritt.label });
    item.appendText(` – ${fortschritt.beschreibung}`);
  }

  renderAttributFortschritt(ctx, section);
  renderErfahrungFortschritt(ctx, section);
  renderEinfacheFortschritte(ctx, section);
  renderMultiklasse(ctx, section);
}

function renderAttributFortschritt(
  ctx: SheetContext,
  parent: HTMLElement,
): void {
  const { char } = ctx;
  const verfuegbar = ATTRIBUTE.filter(
    (attribut) => !char.attributMarkierungen.includes(attribut),
  );
  if (verfuegbar.length < 2) {
    parent.createDiv({
      cls: "dh-field__hint",
      text: "Nicht genügend unmarkierte Attribute. Die Rang-Errungenschaft auf Stufe 5 oder 8 löscht die Markierungen.",
    });
    return;
  }

  const options = verfuegbar.map((attribut) => ({
    value: attribut,
    label: ATTRIBUT_LABEL[attribut],
  }));

  let erstes: AttributName | null = null;
  let zweites: AttributName | null = null;

  const grid = parent.createDiv({ cls: "dh-grid dh-grid--fortschritt" });
  field(grid, "Attribut A", (cell) => {
    selectControl(cell, options, "", (value) => {
      erstes = value === "" ? null : (value as AttributName);
    });
  });
  field(grid, "Attribut B", (cell) => {
    selectControl(cell, options, "", (value) => {
      zweites = value === "" ? null : (value as AttributName);
    });
  });

  const action = parent.createDiv({ cls: "dh-inline" });
  actionButton(
    action,
    "Attribute +1/+1 anwenden",
    () => {
      if (!erstes || !zweites || erstes === zweites) return;
      const a = erstes;
      const b = zweites;
      ctx.update((draft) => {
        erhoeheAttribute(draft, a, b);
      });
    },
    "dh-button",
  ).disabled = (char.fortschritteOffen ?? 0) < 1;
}

function renderErfahrungFortschritt(
  ctx: SheetContext,
  parent: HTMLElement,
): void {
  const options = ctx.char.erfahrungen.map((erfahrung, index) => ({
    value: String(index),
    label: erfahrung.name || `Erfahrung ${index + 1}`,
  }));
  if (options.length < 2) return;

  let erster: number | null = null;
  let zweiter: number | null = null;

  const grid = parent.createDiv({ cls: "dh-grid dh-grid--fortschritt" });
  field(grid, "Erfahrung A", (cell) => {
    selectControl(cell, options, "", (value) => {
      erster = value === "" ? null : Number.parseInt(value, 10);
    });
  });
  field(grid, "Erfahrung B", (cell) => {
    selectControl(cell, options, "", (value) => {
      zweiter = value === "" ? null : Number.parseInt(value, 10);
    });
  });

  const action = parent.createDiv({ cls: "dh-inline" });
  actionButton(
    action,
    "Erfahrungen +1/+1 anwenden",
    () => {
      if (erster === null || zweiter === null || erster === zweiter) return;
      const a = erster;
      const b = zweiter;
      ctx.update((draft) => {
        erhoeheErfahrungen(draft, a, b);
      });
    },
    "dh-button",
  ).disabled = (ctx.char.fortschritteOffen ?? 0) < 1;
}

function renderEinfacheFortschritte(
  ctx: SheetContext,
  parent: HTMLElement,
): void {
  const { char, index } = ctx;
  const offen = char.fortschritteOffen ?? 0;
  const row = parent.createDiv({ cls: "dh-inline dh-inline--wrap" });

  actionButton(row, "+1 TP-Feld", () =>
    ctx.update((draft) => {
      erhoeheTp(draft);
    }),
  ).disabled = offen < 1 || getTpMax(char, index) >= TRACK_MAX;

  actionButton(row, "+1 Stress-Feld", () =>
    ctx.update((draft) => {
      erhoeheStress(draft);
    }),
  ).disabled = offen < 1 || getStressMax(char) >= TRACK_MAX;

  actionButton(row, "+1 Ausweichen", () =>
    ctx.update((draft) => {
      erhoeheAusweichen(draft);
    }),
  ).disabled = offen < 1;

  actionButton(row, "+1 Übung", () =>
    ctx.update((draft) => {
      erhoeheUebung(draft);
    }),
  ).disabled = offen < 2;
}

function renderMultiklasse(ctx: SheetContext, parent: HTMLElement): void {
  const { char, game, index } = ctx;
  if (char.stufe < 5) return;

  const hauptklasse = getKlasse(char, index);
  parent.createDiv({
    cls: "dh-section__subtitle",
    text: `Multiklasse${hauptklasse ? ` (Hauptklasse ${hauptklasse.name})` : ""}`,
  });

  const gewaehlteKlasse = char.multiklasse.klasse ?? "";
  const multiKlasse = index.klasseByName.get(gewaehlteKlasse);

  const grid = parent.createDiv({ cls: "dh-grid dh-grid--fortschritt" });

  field(grid, "Zusätzliche Klasse", (cell) => {
    selectControl(
      cell,
      game.klassen.map((klasse) => ({ value: klasse.name, label: klasse.name_full })),
      gewaehlteKlasse,
      (value) =>
        ctx.update((draft) => {
          draft.multiklasse = {
            klasse: value || null,
            domaene: null,
            klassenfaehigkeit: null,
            subklasse: null,
            auslage: draft.multiklasse.auslage ?? [],
          };
        }),
    );
  });

  field(grid, "Domäne", (cell) => {
    selectControl(
      cell,
      (multiKlasse?.domaenen ?? []).map((domaene) => ({
        value: domaene,
        label: domaene,
      })),
      char.multiklasse.domaene ?? "",
      (value) =>
        ctx.update((draft) => {
          draft.multiklasse.domaene = value || null;
        }),
    );
  });

  field(grid, "Klassenfähigkeit", (cell) => {
    selectControl(
      cell,
      (multiKlasse?.klassenfaehigkeiten ?? []).map((faehigkeit) => ({
        value: faehigkeit.name,
        label: faehigkeit.name,
      })),
      char.multiklasse.klassenfaehigkeit ?? "",
      (value) =>
        ctx.update((draft) => {
          draft.multiklasse.klassenfaehigkeit = value || null;
        }),
    );
  });

  field(grid, "Subklasse", (cell) => {
    const subklassen = (
      index.subklassenByKlasse.get(gewaehlteKlasse) ?? []
    ).filter((subklasse) => subklasse.grad === "Basis");
    selectControl(
      cell,
      subklassen.map((subklasse) => ({
        value: subklasse.subklasse,
        label: subklasse.subklasse,
      })),
      char.multiklasse.subklasse ?? "",
      (value) =>
        ctx.update((draft) => {
          draft.multiklasse.subklasse = value || null;
        }),
    );
  });

  if (char.multiklasse.klasse) {
    parent.createDiv({
      cls: "dh-field__hint",
      text: `Aktiv: ${char.multiklasse.klasse} · Domäne ${
        char.multiklasse.domaene ?? "–"
      } · ${char.multiklasse.klassenfaehigkeit ?? "–"}`,
    });
  }
}
