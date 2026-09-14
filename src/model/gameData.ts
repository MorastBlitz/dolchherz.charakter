/**
 * Typen fuer die Spieldaten aus dem Vault-Ordner `data/`.
 *
 * Die Feldnamen entsprechen exakt den Schluesseln der vorhandenen JSON-Dateien,
 * inklusive der deutschen Bezeichnungen und Sonderfaelle (z. B. `fuehrung`).
 */

export type AttributName =
  | "Agilitaet"
  | "Staerke"
  | "Geschick"
  | "Instinkt"
  | "Praesenz"
  | "Wissen";

/** Die sechs Attribute in der Reihenfolge des Charakterbogens. */
export const ATTRIBUTE: AttributName[] = [
  "Agilitaet",
  "Staerke",
  "Geschick",
  "Instinkt",
  "Praesenz",
  "Wissen",
];

export type WaffenTyp = "Primärwaffe" | "Sekundärwaffe";

export type Schadenstyp = "Magisch" | "Physisch" | "phy" | "mag";

export interface KlassenFaehigkeit {
  name: string;
  text: string;
}

export interface HoffnungsFaehigkeit {
  name: string;
  text: string;
}

export interface Bestiengestalt {
  name: string;
  rang: number;
  beispiele: string;
  attribut_bonus: string;
  ausweichen_bonus: number;
  angriff: {
    distanz: string;
    attribut: string;
    schaden: string;
    schadenstyp: Schadenstyp;
  };
  vorteile: string[];
  merkmale: KlassenFaehigkeit[];
}

/** Eine Auswahlgruppe des Startinventars ("WÄHLE 1 OPTION"). */
export interface StartOption {
  label: string;
  optionen: string[];
}

/** Empfohlene Startwerte einer Klasse laut Charakterbogen. */
export interface Empfehlungen {
  attribute: {
    agilitaet: number;
    staerke: number;
    geschick: number;
    instinkt: number;
    praesenz: number;
    wissen: number;
  };
  primaerwaffe: string;
  sekundaerwaffe: string | null;
  ruestung: string;
  startOptionen?: StartOption[];
}

export interface Klasse {
  name: string;
  name_full: string;
  beschreibung: string;
  domaenen: string[];
  ausweichen: number;
  trefferpunkte: number;
  klassengegenstaende: string;
  hoffnungsfaehigkeit: HoffnungsFaehigkeit;
  klassenfaehigkeiten: KlassenFaehigkeit[];
  bestiengestalten?: Bestiengestalt[];
  seelentier?: string;
  empfehlungen?: Empfehlungen;
}

export interface KlassenDatei {
  klassen?: Klasse[];
}

export type SubklassenGrad = "Basis" | "Spezialisierung" | "Meisterschaft";

export interface Subklasse {
  subklasse: string;
  grad: SubklassenGrad;
  kartentext: string;
  klasse: string;
  kartennummer: number;
}

export interface Waffe {
  name: string;
  attribut: AttributName | string;
  distanz: string;
  schaden: string;
  fuehrung: string;
  merkmal: string;
  typ: WaffenTyp;
  schadenstyp: Schadenstyp;
  rang: number;
}

export interface WaffenDatei {
  meta: { description: string; total: number; generated: string };
  waffen: Waffe[];
}

export interface Ruestung {
  name: string;
  /** Format "Mittel / Schwer", z. B. "5 / 11". */
  basisschwellen: string;
  basiswert: number;
  merkmal: string;
  rang: number;
}

export interface RuestungenDatei {
  meta: { description: string; total: number; generated: string };
  ruestungen: Ruestung[];
}

export interface HerkunftKarte {
  kartennummer: number;
  kategorie: string;
  titel: string;
  kartentext: string;
}

export type DomaenenKartenTyp = "Faehigkeit" | "Zauber" | "Zauberbuch";

export interface DomaenenKarte {
  domaene: string;
  domaene_full: string;
  name: string;
  typ: DomaenenKartenTyp | string;
  stufe: number;
  rueckrufkosten: number;
  kartentext: string;
  kartennummer: number;
}

export interface ItemListenDatei {
  meta: { description: string; total: number; generated: string };
  items: Gegenstand[];
}

export interface Gegenstand {
  wurf: string;
  name: string;
  beschreibung: string;
}

/** Sammlung aller geladenen Spieldaten in indizierter Form. */
export interface GameData {
  klassen: Klasse[];
  subklassen: Subklasse[];
  waffen: Waffe[];
  ruestungen: Ruestung[];
  abstammungen: HerkunftKarte[];
  gemeinschaften: HerkunftKarte[];
  domaenenkarten: DomaenenKarte[];
  beute: Gegenstand[];
  verbrauchsgueter: Gegenstand[];
}

/** Index fuer schnellen Zugriff per Name. */
export interface GameDataIndex {
  klasseByName: Map<string, Klasse>;
  subklassenByKlasse: Map<string, Subklasse[]>;
  waffeByName: Map<string, Waffe>;
  ruestungByName: Map<string, Ruestung>;
  abstammungByTitel: Map<string, HerkunftKarte>;
  gemeinschaftByTitel: Map<string, HerkunftKarte>;
  domaenenkarteByName: Map<string, DomaenenKarte>;
  beuteByName: Map<string, Gegenstand>;
  verbrauchsgutByName: Map<string, Gegenstand>;
}

/** Baut aus den geladenen Daten einen Index fuer Namenszugriffe. */
export function buildGameDataIndex(data: GameData): GameDataIndex {
  const subklassenByKlasse = new Map<string, Subklasse[]>();
  for (const subklasse of data.subklassen) {
    const list = subklassenByKlasse.get(subklasse.klasse) ?? [];
    list.push(subklasse);
    subklassenByKlasse.set(subklasse.klasse, list);
  }

  return {
    klasseByName: new Map(data.klassen.map((k) => [k.name, k])),
    subklassenByKlasse,
    waffeByName: new Map(data.waffen.map((w) => [w.name, w])),
    ruestungByName: new Map(data.ruestungen.map((r) => [r.name, r])),
    abstammungByTitel: new Map(data.abstammungen.map((a) => [a.titel, a])),
    gemeinschaftByTitel: new Map(data.gemeinschaften.map((g) => [g.titel, g])),
    domaenenkarteByName: new Map(data.domaenenkarten.map((d) => [d.name, d])),
    beuteByName: new Map(data.beute.map((b) => [b.name, b])),
    verbrauchsgutByName: new Map(
      data.verbrauchsgueter.map((v) => [v.name, v]),
    ),
  };
}
