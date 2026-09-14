/**
 * Regelberechnungen fuer den Charakterbogen.
 *
 * Dieses Modul ist bewusst frei von Obsidian-Abhaengigkeiten und rein
 * funktional, damit es unit-getestet werden kann.
 */
import type {
  AttributName,
  GameDataIndex,
  Ruestung,
  Subklasse,
  Waffe,
} from "../model/gameData";
import type {
  CharakterAttribute,
  CharakterDaten,
  Rang,
} from "../model/character";

/** Anzeigenamen der Attribute. */
export const ATTRIBUT_LABEL: Record<AttributName, string> = {
  Agilitaet: "Agilität",
  Staerke: "Stärke",
  Geschick: "Geschick",
  Instinkt: "Instinkt",
  Praesenz: "Präsenz",
  Wissen: "Wissen",
};

/** Zuordnung der Attributnamen auf die Schluessel der Charakterdaten. */
export const ATTRIBUT_KEY: Record<AttributName, keyof CharakterAttribute> = {
  Agilitaet: "agilitaet",
  Staerke: "staerke",
  Geschick: "geschick",
  Instinkt: "instinkt",
  Praesenz: "praesenz",
  Wissen: "wissen",
};

/** Zuordnung der Attributnamen, wie sie in den Spieldaten stehen. */
const ATTRIBUT_FROM_LABEL: Record<string, AttributName> = {
  "Agilität": "Agilitaet",
  Agilitat: "Agilitaet",
  "Stärke": "Staerke",
  Staerke: "Staerke",
  Geschick: "Geschick",
  Instinkt: "Instinkt",
  "Präsenz": "Praesenz",
  Praesenz: "Praesenz",
  Wissen: "Wissen",
};

/** Uebersetzt einen Attributnamen aus den Spieldaten in den internen Namen. */
export function attributFromLabel(label: string): AttributName | null {
  return ATTRIBUT_FROM_LABEL[label] ?? null;
}

/** Grundwert der Stressfelder laut Regelwerk. */
export const STRESS_BASIS = 6;
/** Maximal erreichbare TP- und Stressfelder. */
export const TRACK_MAX = 12;

/**
 * Maximalwert der Hoffnung.
 *
 * Das SRD nennt keinen expliziten Hoechstwert; 6 ist der am Tisch uebliche
 * Standardwert und dient hier nur als Obergrenze der Darstellung.
 */
export const HOFFNUNG_MAX = 6;

/** Bereich eines Attributmodifikators ist -1 bis +2 bei der Erschaffung. */
export function getRang(stufe: number): Rang {
  if (stufe >= 8) return 4;
  if (stufe >= 5) return 3;
  if (stufe >= 2) return 2;
  return 1;
}

/**
 * Uebung aus der Stufe: Startwert 1, plus 1 auf Stufe 2, 5 und 8.
 * Zusaetzliche Erhoehungen ueber Fortschritte stehen in den Charakterdaten.
 */
export function getUebungAusStufe(stufe: number): number {
  let uebung = 1;
  if (stufe >= 2) uebung += 1;
  if (stufe >= 5) uebung += 1;
  if (stufe >= 8) uebung += 1;
  return uebung;
}

export function getUebung(char: CharakterDaten): number {
  return Math.max(0, Math.floor(char.uebung));
}

export interface RuestungEffekte {
  ausweichen: number;
  agilitaet: number;
  ruestungswert: number;
  schadensschwellen: number;
}

const EMPTY_EFFEKTE: RuestungEffekte = {
  ausweichen: 0,
  agilitaet: 0,
  ruestungswert: 0,
  schadensschwellen: 0,
};

/** Ersetzt typografische Minuszeichen durch ASCII-Minus. */
function normalizeSigns(text: string): string {
  return text.replace(/[\u2013\u2014\u2212]/g, "-");
}

/** Liest "±N auf X" aus einem Merkmalstext. */
function readSignedBonus(text: string, target: RegExp): number {
  const match = normalizeSigns(text).match(
    new RegExp(`([+-])\\s*(\\d+)\\s*(?:${target.source})`, "i"),
  );
  if (!match) {
    return 0;
  }
  const value = Number.parseInt(match[2], 10);
  return match[1] === "-" ? -value : value;
}

/** Sammelt die mechanischen Boni von Ruestung und gefuehrten Waffen. */
export function getAusruestungsEffekte(
  char: CharakterDaten,
  index: GameDataIndex,
): RuestungEffekte {
  const effekte: RuestungEffekte = { ...EMPTY_EFFEKTE };

  const ruestung = getRuestung(char, index);
  if (ruestung) {
    effekte.ausweichen += readSignedBonus(ruestung.merkmal, /auf Ausweichen/);
    effekte.agilitaet += readSignedBonus(ruestung.merkmal, /auf Agilit/);
  }

  for (const name of [char.waffen.primaer, char.waffen.sekundaer]) {
    const waffe = name ? index.waffeByName.get(name) : undefined;
    if (!waffe) continue;
    effekte.ruestungswert += readSignedBonus(waffe.merkmal, /auf R.stung/);
    effekte.ausweichen += readSignedBonus(waffe.merkmal, /auf Ausweichen/);
  }

  return effekte;
}

export function getRuestung(
  char: CharakterDaten,
  index: GameDataIndex,
): Ruestung | undefined {
  return char.ruestung.name
    ? index.ruestungByName.get(char.ruestung.name)
    : undefined;
}

export function getKlasse(char: CharakterDaten, index: GameDataIndex) {
  return char.klasse ? index.klasseByName.get(char.klasse) : undefined;
}

export function getWaffe(
  char: CharakterDaten,
  index: GameDataIndex,
  slot: "primaer" | "sekundaer",
): Waffe | undefined {
  const name = char.waffen[slot];
  return name ? index.waffeByName.get(name) : undefined;
}

export function getSubklasse(
  char: CharakterDaten,
  index: GameDataIndex,
): Subklasse | undefined {
  if (!char.klasse || !char.subklasse) return undefined;
  const list = index.subklassenByKlasse.get(char.klasse) ?? [];
  return list.find(
    (s) => s.subklasse === char.subklasse && s.grad === "Basis",
  );
}

/** Parst "5 / 11" zu Mittlerer und Schwerer Schadensschwelle. */
export function parseBasisschwellen(value: string): {
  mittel: number;
  schwer: number;
} | null {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return null;
  return {
    mittel: Number.parseInt(match[1], 10),
    schwer: Number.parseInt(match[2], 10),
  };
}

export interface Schadensschwellen {
  mittel: number;
  schwer: number;
  /** Basiswerte der ausgeruesteten Ruestung ohne Stufenbonus. */
  basis: { mittel: number; schwer: number } | null;
}

/**
 * Schadensschwellen = Basisschwellen der Ruestung + Stufe.
 * Ohne Ruestung: Mittlere Schwelle = Stufe, Schwere Schwelle = 2 x Stufe.
 */
export function getSchadensschwellen(
  char: CharakterDaten,
  index: GameDataIndex,
): Schadensschwellen {
  const ruestung = getRuestung(char, index);
  const stufe = Math.max(1, Math.floor(char.stufe));
  const effekte = getAusruestungsEffekte(char, index);

  if (ruestung) {
    const basis = parseBasisschwellen(ruestung.basisschwellen);
    if (basis) {
      return {
        mittel: basis.mittel + stufe + effekte.schadensschwellen,
        schwer: basis.schwer + stufe + effekte.schadensschwellen,
        basis,
      };
    }
  }

  return {
    mittel: stufe + effekte.schadensschwellen,
    schwer: stufe * 2 + effekte.schadensschwellen,
    basis: null,
  };
}

/** Ruestungswert = Basiswert + Boni, begrenzt auf 12. */
export function getRuestungswert(
  char: CharakterDaten,
  index: GameDataIndex,
): number {
  const ruestung = getRuestung(char, index);
  if (!ruestung) return 0;
  const effekte = getAusruestungsEffekte(char, index);
  return Math.min(TRACK_MAX, ruestung.basiswert + effekte.ruestungswert);
}

/** Anzahl der Ruestungsfelder entspricht dem Ruestungswert. */
export function getRuestungsFelder(
  char: CharakterDaten,
  index: GameDataIndex,
): number {
  return getRuestungswert(char, index);
}

/** Ausweichen = Klassenwert + manuelle Boni + Ausruestungseffekte. */
export function getAusweichen(
  char: CharakterDaten,
  index: GameDataIndex,
): number {
  const klasse = getKlasse(char, index);
  const basis = klasse?.ausweichen ?? 0;
  const effekte = getAusruestungsEffekte(char, index);
  return Math.max(0, basis + char.ausweichenBonus + effekte.ausweichen);
}

/** Trefferpunkte-Maximum, begrenzt auf 12. */
export function getTpMax(
  char: CharakterDaten,
  index: GameDataIndex,
): number {
  const klasse = getKlasse(char, index);
  const basis = klasse?.trefferpunkte ?? 6;
  return Math.min(TRACK_MAX, basis + Math.max(0, char.tpZusatz));
}

/** Stress-Maximum, begrenzt auf 12. */
export function getStressMax(char: CharakterDaten): number {
  return Math.min(TRACK_MAX, STRESS_BASIS + Math.max(0, char.stressZusatz));
}

/** Attributmodifikator inklusive Ausruestungseffekten. */
export function getAttributModifier(
  char: CharakterDaten,
  attribut: AttributName,
  index: GameDataIndex,
): number {
  const key = ATTRIBUT_KEY[attribut];
  const base = char.attribute[key] ?? 0;
  if (attribut === "Agilitaet") {
    return base + getAusruestungsEffekte(char, index).agilitaet;
  }
  return base;
}

export interface SchadensAusdruck {
  /** Wuerfelseiten, z. B. 8 fuer W8. */
  die: number;
  /** Flacher Modifikator, der nicht von der Uebung abhaengt. */
  flat: number;
  /** Schadenstyp, sofern angegeben. */
  typ: "mag" | "phy" | null;
}

/** Parst einen Waffenschaden wie "W10+3 mag" oder "W8 phy". */
export function parseSchadensausdruck(
  schaden: string,
): SchadensAusdruck | null {
  const match = schaden.trim().match(/^W(\d+)(?:\s*\+\s*(\d+))?\s*(mag|phy)?/i);
  if (!match) return null;
  return {
    die: Number.parseInt(match[1], 10),
    flat: match[2] ? Number.parseInt(match[2], 10) : 0,
    typ: match[3] ? (match[3].toLowerCase() as "mag" | "phy") : null,
  };
}

/** Schadenswurf einer Waffe: Anzahl Wuerfel = Uebung, flacher Modifikator bleibt. */
export function formatSchadenswurf(
  char: CharakterDaten,
  waffe: Waffe | undefined,
): string | null {
  if (!waffe) return null;
  const ausdruck = parseSchadensausdruck(waffe.schaden);
  if (!ausdruck) return null;
  const uebung = Math.max(1, getUebung(char));
  const wuerfel = `${uebung}W${ausdruck.die}`;
  const mod = ausdruck.flat > 0 ? `+${ausdruck.flat}` : "";
  const typ = ausdruck.typ ? ` ${ausdruck.typ}` : "";
  return `${wuerfel}${mod}${typ}`;
}

/** Maximalwert eines Schadenswurfs, fuer kritische Treffer. */
export function getSchadenswurfMaximum(
  char: CharakterDaten,
  waffe: Waffe | undefined,
): number {
  if (!waffe) return 0;
  const ausdruck = parseSchadensausdruck(waffe.schaden);
  if (!ausdruck) return 0;
  return Math.max(1, getUebung(char)) * ausdruck.die + ausdruck.flat;
}

/**
 * Bestimmt die Anzahl zu markierender TP anhand der Schadensschwellen.
 * Gibt 0 zurueck, wenn der Schaden unter der Mittleren Schwelle liegt.
 */
export function getTpMarkierungen(
  finalSchaden: number,
  schwellen: Pick<Schadensschwellen, "mittel" | "schwer">,
  useMassiveDamage = false,
): number {
  if (finalSchaden <= 0) return 0;
  if (finalSchaden >= schwellen.schwer) {
    if (useMassiveDamage && finalSchaden >= schwellen.schwer * 2) {
      return 4;
    }
    return 3;
  }
  if (finalSchaden >= schwellen.mittel) return 2;
  return 1;
}

/** Liest das Zauber-Attribut aus dem Basistext einer Subklasse. */
export function getZauberAttribut(
  subklasse: Subklasse | undefined,
): AttributName | null {
  if (!subklasse) return null;
  const match = subklasse.kartentext.match(
    /ZAUBER-ATTRIBUT:\*{0,2}\s*([A-ZÄÖÜ]+)/i,
  );
  if (!match) return null;
  const raw = match[1].toUpperCase();
  const mapping: Record<string, AttributName> = {
    PRÄSENZ: "Praesenz",
    PRAESENZ: "Praesenz",
    INSTINKT: "Instinkt",
    WISSEN: "Wissen",
    AGILITÄT: "Agilitaet",
    AGILITAET: "Agilitaet",
    STÄRKE: "Staerke",
    STAERKE: "Staerke",
    GESCHICK: "Geschick",
  };
  return mapping[raw] ?? null;
}

/** Anzahl freier (unmarkierter) Felder, begrenzt auf null. */
export function freieFelder(gesamt: number, markiert: number): number {
  return Math.max(0, gesamt - Math.max(0, markiert));
}

/** Hilfsfunktion fuer die Erstellung: prueft eine Attributverteilung. */
export function isValidAttributVerteilung(
  attribute: CharakterAttribute,
): boolean {
  const werte = Object.values(attribute).sort((a, b) => b - a);
  const erwartet = [2, 1, 1, 0, 0, -1];
  return werte.every((wert, i) => wert === erwartet[i]);
}
