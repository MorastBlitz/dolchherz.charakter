/**
 * Regeln fuer das Seelentier der Waldlaeufer-Subklasse Bestienbund.
 *
 * Quelle: Seelentierbogen und Regeltext in `klassen.json`.
 */
import { HOFFNUNG_MAX } from "./derived";
import type { CharakterDaten, CharakterSeelentier } from "../model/character";

/** Startwert Ausweichen laut Seelentierbogen. */
export const SEELENTIER_AUSWEICHEN_BASIS = 10;
/** Hoechstwert Ausweichen ("Auf der Hut" steigert je +2). */
export const SEELENTIER_AUSWEICHEN_MAX = 16;

/** Startwert der Stressfelder. */
export const SEELENTIER_STRESS_BASIS = 3;
/** Hoechstwert der Stressfelder ("Widerstandsfaehig" steigert je +1). */
export const SEELENTIER_STRESS_MAX = 6;

/** Wiederholbare Optionen lassen sich bis zu dreimal steigern. */
export const SEELENTIER_MAX_WIEDERHOLUNGEN = 3;

/** Schadenswuerfel: startet bei W6 und kann nicht tiefer fallen. */
export const SEELENTIER_WUERFEL = ["W6", "W8", "W10", "W12"];

/** Distanzen des Standardangriffs. */
export const SEELENTIER_DISTANZEN = [
  "unmittelbar",
  "sehr kurz",
  "kurz",
  "weit",
  "sehr weit",
];

export interface AusbildungOption {
  id: string;
  label: string;
  beschreibung: string;
  /** Mehrfach steigerbar bis SEELENTIER_MAX_WIEDERHOLUNGEN. */
  wiederholbar: boolean;
}

/** Ausbildungs-Optionen, die das Seelentier beim Stufenaufstieg waehlt. */
export const SEELENTIER_AUSBILDUNG: AusbildungOption[] = [
  {
    id: "intelligent",
    label: "Intelligent",
    beschreibung:
      "Dein Seelentier erhält einen permanenten +1 Bonus auf eine Seelentier-Erfahrung deiner Wahl.",
    wiederholbar: true,
  },
  {
    id: "licht-im-dunkeln",
    label: "Licht im Dunkeln",
    beschreibung:
      "Du erhältst ein zusätzliches Hoffnungsfeld für deinen Charakter, das du auf dem Seelentierbogen markierst.",
    wiederholbar: false,
  },
  {
    id: "trostspende",
    label: "Trostspende",
    beschreibung:
      "Einmal pro Rast kannst du deinem Seelentier Zuneigung zeigen. Du erhältst 1 Hoffnung, oder ihr löscht beide 1 Stress.",
    wiederholbar: false,
  },
  {
    id: "geruestet",
    label: "Gerüstet",
    beschreibung:
      "Wenn dein Seelentier Schaden erleidet, kannst du ein Rüstungsfeld markieren statt 1 Stress beim Seelentier.",
    wiederholbar: false,
  },
  {
    id: "wuetend",
    label: "Wütend",
    beschreibung:
      "Erhöhe den Schadenswürfel oder die Distanz deines Seelentieres um eine Einheit (W6 auf W8, kurz auf weit usw.).",
    wiederholbar: true,
  },
  {
    id: "widerstandsfaehig",
    label: "Widerstandsfähig",
    beschreibung:
      "Dein Seelentier erhält ein zusätzliches Stressfeld (bis maximal 6).",
    wiederholbar: true,
  },
  {
    id: "seelenband",
    label: "Seelenband",
    beschreibung:
      "Wenn du deinen letzten Trefferpunkt markierst, eilt dein Seelentier dir zu Hilfe: Würfle so viele W6, wie es unmarkierte Stressfelder hat, und markiere diese. Bei einer 6 löschst du deinen letzten Trefferpunkt.",
    wiederholbar: false,
  },
  {
    id: "auf-der-hut",
    label: "Auf der Hut",
    beschreibung:
      "Dein Seelentier erhält einen permanenten Bonus von +2 auf Ausweichen (bis maximal 16).",
    wiederholbar: true,
  },
];

/** Wahr, wenn der Charakter ein Seelentier besitzt (Bestienbund). */
export function hatSeelentier(char: CharakterDaten): boolean {
  return char.klasse === "Waldläufer" && char.subklasse === "Bestienbund";
}

export function getSeelentier(char: CharakterDaten): CharakterSeelentier {
  return char.seelentier;
}

/** Anzahl, wie oft eine Option gewaehlt wurde. */
export function zaehleAusbildung(char: CharakterDaten, id: string): number {
  return char.seelentier.ausbildung.filter((eintrag) => eintrag === id).length;
}

/** Anzahl der Ausbildungs-Optionen, die der Stufe entsprechend vergeben sind. */
export function getAusbildungAnzahl(char: CharakterDaten): number {
  return Math.max(0, Math.floor(char.stufe) - 1);
}

/** Hoechstzahl fuer eine einzelne Option. */
export function getAusbildungMaximum(option: AusbildungOption): number {
  return option.wiederholbar ? SEELENTIER_MAX_WIEDERHOLUNGEN : 1;
}

/**
 * Erhoeht oder verringert eine Ausbildungs-Option um einen Schritt.
 *
 * Eine Steigerung ist nur moeglich, solange noch ein Stufenaufstieg-Feld frei
 * ist und das Maximum der jeweiligen Option nicht erreicht wurde.
 */
export function aendereAusbildung(
  draft: CharakterDaten,
  id: string,
  delta: number,
): void {
  const option = SEELENTIER_AUSBILDUNG.find((eintrag) => eintrag.id === id);
  if (!option) return;

  const aktuell = zaehleAusbildung(draft, id);
  if (delta > 0) {
    if (aktuell >= getAusbildungMaximum(option)) return;
    if (draft.seelentier.ausbildung.length >= getAusbildungAnzahl(draft)) return;
    draft.seelentier.ausbildung.push(id);
  } else if (delta < 0 && aktuell > 0) {
    const index = draft.seelentier.ausbildung.indexOf(id);
    draft.seelentier.ausbildung.splice(index, 1);
  }
}

/** Ausweichen inklusive Bonus aus "Auf der Hut" (maximal 16). */
export function getSeelentierAusweichen(char: CharakterDaten): number {
  const bonus = 2 * zaehleAusbildung(char, "auf-der-hut");
  return Math.min(SEELENTIER_AUSWEICHEN_MAX, SEELENTIER_AUSWEICHEN_BASIS + bonus);
}

/** Stress-Maximum inklusive Zusatzfeldern aus "Widerstandsfaehig" (maximal 6). */
export function getSeelentierStressMax(char: CharakterDaten): number {
  const bonus = zaehleAusbildung(char, "widerstandsfaehig");
  return Math.min(SEELENTIER_STRESS_MAX, SEELENTIER_STRESS_BASIS + bonus);
}

/** Hoffnungs-Maximum des Charakters inklusive "Licht im Dunkeln". */
export function getHoffnungMax(char: CharakterDaten): number {
  const bonus = zaehleAusbildung(char, "licht-im-dunkeln") > 0 ? 1 : 0;
  return HOFFNUNG_MAX + bonus;
}
