/**
 * Datenmodell des Charakters, wie es im YAML-Frontmatter einer Notiz liegt.
 *
 * Alle Auswahlfelder (Klasse, Waffe, Ruestung, Domaenenkarten, ...) verweisen
 * per Namen auf die Spieldaten, damit eine Umbenennung der Datenbasis keine
 * Duplizierung im Frontmatter erzwingt.
 */

export const CHARACTER_VERSION = 1;
export const CHARACTER_FRONTMATTER_KEY = "daggerheart";
export const CHARACTER_TYPE = "character";

export type Rang = 1 | 2 | 3 | 4;

/** Seitenverhaeltnis der Portrait-Miniatur. */
export type PortraitFormat = "auto" | "1:1" | "3:2" | "2:3";

export interface CharakterAttribute {
  agilitaet: number;
  staerke: number;
  geschick: number;
  instinkt: number;
  praesenz: number;
  wissen: number;
}

export interface CharakterErfahrung {
  name: string;
  mod: number;
}

export interface CharakterHerkunft {
  abstammung: string;
  gemeinschaft: string;
  /** true, wenn Faehigkeiten aus zwei Abstammungen kombiniert wurden. */
  gemischt: boolean;
  /** Ausgewaehlte Abstammungsfaehigkeiten bei gemischter Abstammung. */
  abstammungsfaehigkeiten?: string[];
}

export interface CharakterRuestung {
  name: string;
  markierteFelder: number;
}

export interface CharakterWaffen {
  primaer: string;
  sekundaer: string;
  inventar: string[];
}

export interface CharakterDomaenenkarten {
  auslage: string[];
  reserve: string[];
}

export interface CharakterMultiklasse {
  klasse: string | null;
  domaene: string | null;
  klassenfaehigkeit: string | null;
  subklasse: string | null;
  auslage: string[];
}

export interface CharakterGold {
  handvoll: number;
  beutel: number;
  truhe: number;
}

export interface CharakterInventarEintrag {
  name: string;
  beschreibung?: string;
  /** Anzahl des Gegenstands, mindestens 1. */
  anzahl: number;
}

export interface CharakterSeelentierErfahrung {
  name: string;
  mod: number;
}

/** Begleitdaten des Seelentiers (Waldlaeufer-Subklasse Bestienbund). */
export interface CharakterSeelentier {
  name: string;
  tier: string;
  /** Vault-Pfad zum Bild des Seelentiers. */
  portrait: string;
  /** Seitenverhaeltnis der Seelentier-Miniatur. */
  portraitFormat: PortraitFormat;
  /** Schadenswuerfel, z. B. "W6". */
  schadenswuerfel: string;
  /** Distanz des Standardangriffs, z. B. "unmittelbar". */
  distanz: string;
  schadenstyp: "phy" | "mag";
  stressMarkiert: number;
  erfahrungen: CharakterSeelentierErfahrung[];
  /** Ids der gewaehlten Ausbildungs-Optionen. */
  ausbildung: string[];
}

export interface CharakterDaten {
  type: typeof CHARACTER_TYPE;
  version: number;
  name: string;
  pronomen: string;
  /** Vault-Pfad zum Charakterbild. */
  portrait: string;
  /** Seitenverhaeltnis der Charakter-Miniatur. */
  portraitFormat: PortraitFormat;
  klasse: string;
  subklasse: string;
  stufe: number;
  herkunft: CharakterHerkunft;
  attribute: CharakterAttribute;
  /** Attribute, die durch Fortschritte erhoeht und markiert wurden. */
  attributMarkierungen: string[];
  ausweichenBonus: number;
  uebung: number;
  /** Noch offene Fortschritts-Felder der aktuellen Stufe (0 bis 2). */
  fortschritteOffen: number;
  ruestung: CharakterRuestung;
  tpMarkiert: number;
  stressMarkiert: number;
  hoffnung: number;
  /** Durch Fortschritte oder Herkunft dauerhaft zusaetzliche TP-Felder. */
  tpZusatz: number;
  /** Durch Fortschritte oder Herkunft dauerhaft zusaetzliche Stress-Felder. */
  stressZusatz: number;
  erfahrungen: CharakterErfahrung[];
  waffen: CharakterWaffen;
  domaenenkarten: CharakterDomaenenkarten;
  multiklasse: CharakterMultiklasse;
  /** Nicht markierte Zustandsfelder, z. B. "versteckt", "festgesetzt". */
  zustaende: string[];
  inventar: CharakterInventarEintrag[];
  beute: CharakterInventarEintrag[];
  seelentier: CharakterSeelentier;
  gold: CharakterGold;
  notizen: string;
}

const DEFAULT_ATTRIBUTE: CharakterAttribute = {
  agilitaet: 0,
  staerke: 0,
  geschick: 0,
  instinkt: 0,
  praesenz: 0,
  wissen: 0,
};

/** Erzeugt ein leeres, vollstaendiges Charakter-Geruest fuer neue Notizen. */
export function createCharacterTemplate(
  overrides: Partial<CharakterDaten> = {},
): CharakterDaten {
  return {
    type: CHARACTER_TYPE,
    version: CHARACTER_VERSION,
    name: "",
    pronomen: "",
    portrait: "",
    portraitFormat: "1:1",
    klasse: "",
    subklasse: "",
    stufe: 1,
    herkunft: {
      abstammung: "",
      gemeinschaft: "",
      gemischt: false,
      abstammungsfaehigkeiten: [],
    },
    attribute: { ...DEFAULT_ATTRIBUTE },
    attributMarkierungen: [],
    ausweichenBonus: 0,
    uebung: 1,
    fortschritteOffen: 0,
    ruestung: { name: "", markierteFelder: 0 },
    tpMarkiert: 0,
    stressMarkiert: 0,
    hoffnung: 2,
    tpZusatz: 0,
    stressZusatz: 0,
    erfahrungen: [
      { name: "", mod: 2 },
      { name: "", mod: 2 },
    ],
    waffen: { primaer: "", sekundaer: "", inventar: [] },
    domaenenkarten: { auslage: [], reserve: [] },
    multiklasse: {
      klasse: null,
      domaene: null,
      klassenfaehigkeit: null,
      subklasse: null,
      auslage: [],
    },
    zustaende: [],
    inventar: [],
    beute: [],
    seelentier: {
      name: "",
      tier: "",
      portrait: "",
      portraitFormat: "1:1",
      schadenswuerfel: "W6",
      distanz: "unmittelbar",
      schadenstyp: "phy",
      stressMarkiert: 0,
      erfahrungen: [
        { name: "", mod: 2 },
        { name: "", mod: 2 },
      ],
      ausbildung: [],
    },
    gold: { handvoll: 0, beutel: 0, truhe: 0 },
    notizen: "",
    ...overrides,
  };
}

/**
 * Normalisiert ein rohes Frontmatter-Objekt zu vollstaendigen Charakterdaten.
 * Fehlende Felder werden mit Standardwerten aufgefuellt, damit aeltere oder
 * handgeschriebene Notizen weiterhin gerendert werden koennen.
 */
export function normalizeCharacter(raw: unknown): CharakterDaten {
  const base = createCharacterTemplate();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const value = raw as Partial<CharakterDaten>;

  return {
    ...base,
    ...value,
    herkunft: { ...base.herkunft, ...(value.herkunft ?? {}) },
    attribute: { ...base.attribute, ...(value.attribute ?? {}) },
    ruestung: { ...base.ruestung, ...(value.ruestung ?? {}) },
    waffen: { ...base.waffen, ...(value.waffen ?? {}) },
    domaenenkarten: {
      ...base.domaenenkarten,
      ...(value.domaenenkarten ?? {}),
    },
    multiklasse: { ...base.multiklasse, ...(value.multiklasse ?? {}) },
    seelentier: {
      ...base.seelentier,
      ...(value.seelentier ?? {}),
      erfahrungen:
        Array.isArray(value.seelentier?.erfahrungen) &&
        value.seelentier.erfahrungen.length > 0
          ? value.seelentier.erfahrungen
          : base.seelentier.erfahrungen,
      ausbildung: value.seelentier?.ausbildung ?? [],
    },
    gold: { ...base.gold, ...(value.gold ?? {}) },
    erfahrungen:
      Array.isArray(value.erfahrungen) && value.erfahrungen.length > 0
        ? value.erfahrungen
        : base.erfahrungen,
    attributMarkierungen: value.attributMarkierungen ?? [],
    zustaende: value.zustaende ?? [],
    // Beute und Inventar sind zusammengefuehrt; vorhandene Beute wandert ins
    // Inventar, damit aeltere Notizen nichts verlieren.
    inventar: [
      ...normalisiereEintraege(value.inventar),
      ...normalisiereEintraege(value.beute),
    ],
    beute: [],
  };
}

/** Fuellt fehlende Anzahl-Angaben in Inventareintraegen auf 1 auf. */
function normalisiereEintraege(
  eintraege: CharakterInventarEintrag[] | undefined,
): CharakterInventarEintrag[] {
  if (!Array.isArray(eintraege)) return [];
  return eintraege.map((eintrag) => ({
    ...eintrag,
    name: eintrag?.name ?? "",
    anzahl: Math.max(1, Math.floor(eintrag?.anzahl ?? 1)),
  }));
}
