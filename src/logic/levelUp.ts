/**
 * Regeln fuer den Stufenaufstieg.
 *
 * Die Fortschritte entsprechen der Liste auf dem Charaktermerkblatt.
 */
import { ATTRIBUT_KEY } from "./derived";
import type { CharakterDaten, CharakterErfahrung } from "../model/character";
import type { AttributName } from "../model/gameData";

export const MAX_STUFE = 10;

export interface RangErrungenschaft {
  erfahrung: boolean;
  uebung: boolean;
  attributMarkierungenLoeschen: boolean;
}

/** Rang-Errungenschaften auf Stufe 2, 5 und 8. */
export const RANG_ERRUNGENSCHAFTEN: Record<number, RangErrungenschaft> = {
  2: { erfahrung: true, uebung: true, attributMarkierungenLoeschen: false },
  5: { erfahrung: true, uebung: true, attributMarkierungenLoeschen: true },
  8: { erfahrung: true, uebung: true, attributMarkierungenLoeschen: true },
};

export interface FortschrittOption {
  id: string;
  label: string;
  beschreibung: string;
}

/** Auswahlbare Fortschritte beim Stufenaufstieg. */
export const FORTSCHRITTE: FortschrittOption[] = [
  {
    id: "attribute",
    label: "Zwei Attribute +1",
    beschreibung:
      "Erhöhe zwei nicht markierte Charakterattribute um +1 und markiere sie.",
  },
  {
    id: "tp",
    label: "+1 Trefferpunktfeld",
    beschreibung: "Erhalte dauerhaft ein zusätzliches TP-Feld (maximal 12).",
  },
  {
    id: "stress",
    label: "+1 Stressfeld",
    beschreibung: "Erhalte dauerhaft ein zusätzliches Stressfeld (maximal 12).",
  },
  {
    id: "erfahrung",
    label: "Zwei Erfahrungen +1",
    beschreibung: "Erhöhe zwei Erfahrungen um je +1.",
  },
  {
    id: "ausweichen",
    label: "Ausweichen +1",
    beschreibung: "Erhalte einen dauerhaften Bonus von +1 auf Ausweichen.",
  },
  {
    id: "uebung",
    label: "Übung +1",
    beschreibung:
      "Erhöhe die Übung um +1. Kostet zwei Fortschritte (beide Felder markieren).",
  },
  {
    id: "domaenenkarte",
    label: "Zusätzliche Domänenkarte",
    beschreibung:
      "Wähle eine weitere Domänenkarte deiner Stufe oder niedriger.",
  },
  {
    id: "subklasse",
    label: "Subklassenkarte aufwerten",
    beschreibung:
      "Nimm die nächste Karte deiner Subklasse (Spezialisierung, dann Meisterschaft).",
  },
  {
    id: "multiklasse",
    label: "Multiklasse",
    beschreibung:
      "Wähle eine zusätzliche Klasse, eine ihrer Domänen und ihre Klassenfähigkeit.",
  },
];

/** Fortschritts-Felder, die pro Stufenaufstieg zur Verfuegung stehen. */
export const FORTSCHRITTE_PRO_STUFE = 2;

export function kannAufsteigen(draft: CharakterDaten): boolean {
  return draft.stufe < MAX_STUFE;
}

/**
 * Verbraucht Fortschritts-Felder und meldet, ob genug vorhanden waren.
 *
 * Laut Regelwerk stehen pro Stufe zwei Fortschritte zur Verfuegung; die
 * Option "Uebung +1" kostet zwei Felder.
 */
export function verbraucheFortschritt(
  draft: CharakterDaten,
  kosten = 1,
): boolean {
  if ((draft.fortschritteOffen ?? 0) < kosten) return false;
  draft.fortschritteOffen -= kosten;
  return true;
}

/**
 * Steigert die Stufe und wendet die Rang-Errungenschaft an.
 *
 * @param anwenden Ob Erfahrung, Uebung und Markierungen automatisch gesetzt werden.
 */
export function applyStufenaufstieg(
  draft: CharakterDaten,
  anwenden = true,
): boolean {
  if (!kannAufsteigen(draft)) return false;

  draft.stufe += 1;
  draft.fortschritteOffen = FORTSCHRITTE_PRO_STUFE;
  if (!anwenden) return true;

  const errungenschaft = RANG_ERRUNGENSCHAFTEN[draft.stufe];
  if (!errungenschaft) return true;

  if (errungenschaft.uebung) {
    draft.uebung += 1;
  }
  if (errungenschaft.erfahrung) {
    draft.erfahrungen.push({ name: "", mod: 2 });
  }
  if (errungenschaft.attributMarkierungenLoeschen) {
    draft.attributMarkierungen = [];
  }
  return true;
}

/** Fortschritt: zwei Attribute um +1 erhoehen und markieren. */
export function erhoeheAttribute(
  draft: CharakterDaten,
  erstes: AttributName,
  zweites: AttributName,
): boolean {
  if (erstes === zweites) return false;
  if (draft.attributMarkierungen.includes(erstes)) return false;
  if (draft.attributMarkierungen.includes(zweites)) return false;
  if (!verbraucheFortschritt(draft)) return false;

  const keyA = ATTRIBUT_KEY[erstes];
  const keyB = ATTRIBUT_KEY[zweites];
  draft.attribute[keyA] += 1;
  draft.attribute[keyB] += 1;
  for (const attribut of [erstes, zweites]) {
    draft.attributMarkierungen.push(attribut);
  }
  return true;
}

/** Fortschritt: zwei Erfahrungen um +1 erhoehen. */
export function erhoeheErfahrungen(
  draft: CharakterDaten,
  ersterIndex: number,
  zweiterIndex: number,
): boolean {
  if (ersterIndex === zweiterIndex) return false;
  if (!draft.erfahrungen[ersterIndex] || !draft.erfahrungen[zweiterIndex]) {
    return false;
  }
  if (!verbraucheFortschritt(draft)) return false;

  for (const index of [ersterIndex, zweiterIndex]) {
    const erfahrung: CharakterErfahrung | undefined = draft.erfahrungen[index];
    if (erfahrung) erfahrung.mod += 1;
  }
  return true;
}

export function erhoeheTp(draft: CharakterDaten): boolean {
  if (!verbraucheFortschritt(draft)) return false;
  draft.tpZusatz += 1;
  return true;
}

export function erhoeheStress(draft: CharakterDaten): boolean {
  if (!verbraucheFortschritt(draft)) return false;
  draft.stressZusatz += 1;
  return true;
}

export function erhoeheAusweichen(draft: CharakterDaten): boolean {
  if (!verbraucheFortschritt(draft)) return false;
  draft.ausweichenBonus += 1;
  return true;
}

export function erhoeheUebung(draft: CharakterDaten): boolean {
  if (!verbraucheFortschritt(draft, 2)) return false;
  draft.uebung += 1;
  return true;
}

/** Setzt die Multiklasse-Auswahl. */
export function setzeMultiklasse(
  draft: CharakterDaten,
  klasse: string,
  domaene: string,
  klassenfaehigkeit: string,
  subklasse: string,
): void {
  draft.multiklasse = {
    klasse: klasse || null,
    domaene: domaene || null,
    klassenfaehigkeit: klassenfaehigkeit || null,
    subklasse: subklasse || null,
    auslage: draft.multiklasse.auslage ?? [],
  };
}
