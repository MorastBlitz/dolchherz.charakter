/**
 * Standardzustaende des Regelwerks und ihre Verwaltung.
 */
import type { CharakterDaten } from "../model/character";

/** Standardzustaende des Regelwerks. */
export const STANDARD_ZUSTAENDE = ["versteckt", "festgesetzt", "verwundbar"] as const;

export type StandardZustand = (typeof STANDARD_ZUSTAENDE)[number];

export const ZUSTAND_LABEL: Record<StandardZustand, string> = {
  versteckt: "Versteckt",
  festgesetzt: "Festgesetzt",
  verwundbar: "Verwundbar",
};

/** Wirkung der Standardzustaende laut Regelwerk. */
export const ZUSTAND_BESCHREIBUNG: Record<StandardZustand, string> = {
  versteckt:
    "Alle Würfe gegen dich haben Nachteil. Endet, sobald du angreifst oder in die Sichtlinie gerätst.",
  festgesetzt:
    "Du kannst dich nicht bewegen, aber weiterhin von deiner Position aus handeln.",
  verwundbar: "Alle Würfe gegen dich haben Vorteil.",
};

/** Schaltet einen Zustand ein oder aus. */
export function toggleZustand(
  draft: CharakterDaten,
  zustand: string,
  aktiv: boolean,
): void {
  const vorhanden = draft.zustaende.includes(zustand);
  if (aktiv && !vorhanden) {
    draft.zustaende.push(zustand);
  } else if (!aktiv && vorhanden) {
    draft.zustaende = draft.zustaende.filter((eintrag) => eintrag !== zustand);
  }
}
