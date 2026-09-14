import { describe, expect, it } from "vitest";

import { createCharacterTemplate, type CharakterDaten } from "../src/model/character";
import {
  buildGameDataIndex,
  type GameData,
  type GameDataIndex,
} from "../src/model/gameData";
import {
  formatSchadenswurf,
  getAttributModifier,
  getAusweichen,
  getRang,
  getRuestungswert,
  getSchadensschwellen,
  getTpMarkierungen,
  getUebung,
  getUebungAusStufe,
  getZauberAttribut,
  isValidAttributVerteilung,
  parseBasisschwellen,
  parseSchadensausdruck,
} from "../src/logic/derived";

function makeIndex(): GameDataIndex {
  const data: GameData = {
    klassen: [
      {
        name: "Barde",
        name_full: "BARDE*IN",
        beschreibung: "",
        domaenen: ["Kodex", "Anmut"],
        ausweichen: 10,
        trefferpunkte: 5,
        klassengegenstaende: "",
        hoffnungsfaehigkeit: { name: "Eine Szene machen", text: "" },
        klassenfaehigkeiten: [],
      },
    ],
    subklassen: [
      {
        subklasse: "Minnesang",
        grad: "Basis",
        kartentext: "**ZAUBER-ATTRIBUT:** PRÄSENZ.\n\n**Buehnentalent:** ...",
        klasse: "Barde",
        kartennummer: 1,
      },
    ],
    waffen: [
      {
        name: "Rapier",
        attribut: "Praesenz",
        distanz: "unmittelbar",
        schaden: "W8 phy",
        fuehrung: "einhändig",
        merkmal: "Schnell: ...",
        typ: "Primärwaffe",
        schadenstyp: "Physisch",
        rang: 1,
      },
      {
        name: "Rundschild",
        attribut: "Staerke",
        distanz: "unmittelbar",
        schaden: "W4 phy",
        fuehrung: "einhändig",
        merkmal: "Schützend: +1 auf Rüstung",
        typ: "Sekundärwaffe",
        schadenstyp: "Physisch",
        rang: 1,
      },
    ],
    ruestungen: [
      {
        name: "Lederrüstung",
        basisschwellen: "6 / 13",
        basiswert: 3,
        merkmal: "-",
        rang: 1,
      },
      {
        name: "Textilrüstung",
        basisschwellen: "5 / 11",
        basiswert: 3,
        merkmal: "Flexibel: +1 auf Ausweichen",
        rang: 1,
      },
      {
        name: "Metallrüstung",
        basisschwellen: "8 / 17",
        basiswert: 4,
        merkmal: "Sehr schwer: –2 auf Ausweichen; –1 auf Agilität",
        rang: 1,
      },
    ],
    abstammungen: [],
    gemeinschaften: [],
    domaenenkarten: [],
    beute: [],
    verbrauchsgueter: [],
  };

  return buildGameDataIndex(data);
}

const index = makeIndex();

function char(overrides: Partial<CharakterDaten> = {}): CharakterDaten {
  return createCharacterTemplate({
    klasse: "Barde",
    subklasse: "Minnesang",
    ...overrides,
  });
}

describe("Stufe und Uebung", () => {
  it("bestimmt den Rang aus der Stufe", () => {
    expect(getRang(1)).toBe(1);
    expect(getRang(4)).toBe(2);
    expect(getRang(5)).toBe(3);
    expect(getRang(7)).toBe(3);
    expect(getRang(8)).toBe(4);
    expect(getRang(10)).toBe(4);
  });

  it("erhoeht die Uebung auf Stufe 2, 5 und 8", () => {
    expect(getUebungAusStufe(1)).toBe(1);
    expect(getUebungAusStufe(2)).toBe(2);
    expect(getUebungAusStufe(4)).toBe(2);
    expect(getUebungAusStufe(5)).toBe(3);
    expect(getUebungAusStufe(7)).toBe(3);
    expect(getUebungAusStufe(8)).toBe(4);
  });

  it("verwendet die im Charakter gespeicherte Uebung", () => {
    expect(getUebung(char({ uebung: 3 }))).toBe(3);
  });
});

describe("Schadensschwellen", () => {
  it("parst Basisschwellen", () => {
    expect(parseBasisschwellen("5 / 11")).toEqual({ mittel: 5, schwer: 11 });
    expect(parseBasisschwellen("keine")).toBeNull();
  });

  it("addiert die Stufe zu den Basisschwellen der Ruestung", () => {
    const schwellen = getSchadensschwellen(
      char({ ruestung: { name: "Lederrüstung", markierteFelder: 0 }, stufe: 1 }),
      index,
    );
    expect(schwellen).toMatchObject({ mittel: 7, schwer: 14 });
  });

  it("nutzt Stufe und doppelte Stufe ohne Ruestung", () => {
    const schwellen = getSchadensschwellen(char({ stufe: 3 }), index);
    expect(schwellen).toMatchObject({ mittel: 3, schwer: 6, basis: null });
  });
});

describe("Ausruestungseffekte", () => {
  it("wertet Flexibel als Ausweichenbonus", () => {
    const value = getAusweichen(
      char({ ruestung: { name: "Textilrüstung", markierteFelder: 0 } }),
      index,
    );
    expect(value).toBe(11);
  });

  it("wertet Sehr schwer als Ausweichen- und Agilitaetsmalus", () => {
    const c = char({
      ruestung: { name: "Metallrüstung", markierteFelder: 0 },
      attribute: {
        agilitaet: 1,
        staerke: 0,
        geschick: 0,
        instinkt: 0,
        praesenz: 0,
        wissen: 0,
      },
    });
    expect(getAusweichen(c, index)).toBe(8);
    expect(getAttributModifier(c, "Agilitaet", index)).toBe(0);
  });

  it("addiert Schildbonus auf den Ruestungswert", () => {
    const value = getRuestungswert(
      char({
        ruestung: { name: "Textilrüstung", markierteFelder: 0 },
        waffen: { primaer: "Rapier", sekundaer: "Rundschild", inventar: [] },
      }),
      index,
    );
    expect(value).toBe(4);
  });

  it("liefert ohne Ruestung den Ruestungswert 0", () => {
    expect(getRuestungswert(char(), index)).toBe(0);
  });
});

describe("Schadenswurf", () => {
  it("parst Waffenschaden", () => {
    expect(parseSchadensausdruck("W10+3 mag")).toEqual({
      die: 10,
      flat: 3,
      typ: "mag",
    });
    expect(parseSchadensausdruck("W8 phy")).toEqual({
      die: 8,
      flat: 0,
      typ: "phy",
    });
  });

  it("multipliziert Wuerfel mit der Uebung", () => {
    const c = char({
      uebung: 2,
      waffen: { primaer: "Rapier", sekundaer: "", inventar: [] },
    });
    expect(formatSchadenswurf(c, index.waffeByName.get("Rapier"))).toBe("2W8 phy");
  });
});

describe("Schaden markieren", () => {
  const schwellen = { mittel: 7, schwer: 14 };

  it("bestimmt die Anzahl der TP", () => {
    expect(getTpMarkierungen(0, schwellen)).toBe(0);
    expect(getTpMarkierungen(5, schwellen)).toBe(1);
    expect(getTpMarkierungen(7, schwellen)).toBe(2);
    expect(getTpMarkierungen(14, schwellen)).toBe(3);
  });

  it("beruecksichtigt optional massiven Schaden", () => {
    expect(getTpMarkierungen(28, schwellen, false)).toBe(3);
    expect(getTpMarkierungen(28, schwellen, true)).toBe(4);
  });
});

describe("Zauber-Attribut", () => {
  it("liest das Zauber-Attribut aus der Basiskarte", () => {
    expect(getZauberAttribut(index.subklassenByKlasse.get("Barde")?.[0])).toBe(
      "Praesenz",
    );
  });
});

describe("Attributverteilung", () => {
  it("akzeptiert die Standardverteilung", () => {
    expect(
      isValidAttributVerteilung({
        agilitaet: 2,
        staerke: 1,
        geschick: 1,
        instinkt: 0,
        praesenz: 0,
        wissen: -1,
      }),
    ).toBe(true);
  });

  it("lehnt abweichende Summen ab", () => {
    expect(
      isValidAttributVerteilung({
        agilitaet: 2,
        staerke: 2,
        geschick: 2,
        instinkt: 2,
        praesenz: 2,
        wissen: 2,
      }),
    ).toBe(false);
  });
});
