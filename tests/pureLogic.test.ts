import { describe, expect, it } from "vitest";

import {
  applyStufenaufstieg,
  erhoeheAttribute,
  erhoeheAusweichen,
  erhoeheStress,
  erhoeheTp,
  erhoeheUebung,
  FORTSCHRITTE_PRO_STUFE,
} from "../src/logic/levelUp";
import { parseInventar } from "../src/logic/inventar";
import {
  aendereAusbildung,
  getAusbildungAnzahl,
  getHoffnungMax,
  getSeelentierAusweichen,
  getSeelentierStressMax,
  hatSeelentier,
  zaehleAusbildung,
} from "../src/logic/seelentier";
import { toggleZustand } from "../src/logic/zustaende";
import { createCharacterTemplate } from "../src/model/character";

describe("Stufenaufstieg", () => {
  it("wendet auf Stufe 2 die Rang-Errungenschaft an", () => {
    const char = createCharacterTemplate({ stufe: 1, uebung: 1 });
    applyStufenaufstieg(char);
    expect(char.stufe).toBe(2);
    expect(char.uebung).toBe(2);
    expect(char.erfahrungen).toHaveLength(3);
    expect(char.fortschritteOffen).toBe(FORTSCHRITTE_PRO_STUFE);
  });

  it("loescht auf Stufe 5 die Attributmarkierungen", () => {
    const char = createCharacterTemplate({
      stufe: 4,
      uebung: 2,
      attributMarkierungen: ["Agilitaet", "Staerke"],
    });
    applyStufenaufstieg(char);
    expect(char.stufe).toBe(5);
    expect(char.uebung).toBe(3);
    expect(char.attributMarkierungen).toEqual([]);
  });

  it("kann Rang-Errungenschaften auslassen", () => {
    const char = createCharacterTemplate({ stufe: 1, uebung: 1 });
    applyStufenaufstieg(char, false);
    expect(char.stufe).toBe(2);
    expect(char.uebung).toBe(1);
    expect(char.erfahrungen).toHaveLength(2);
  });

  it("erhoeht zwei Attribute und markiert sie", () => {
    const char = createCharacterTemplate({ fortschritteOffen: 2 });
    erhoeheAttribute(char, "Agilitaet", "Wissen");
    expect(char.attribute.agilitaet).toBe(1);
    expect(char.attribute.wissen).toBe(1);
    expect(char.attributMarkierungen).toEqual(["Agilitaet", "Wissen"]);
    expect(char.fortschritteOffen).toBe(1);
  });

  it("erhoeht einfache Fortschritte und verbraucht die Felder", () => {
    const char = createCharacterTemplate({ fortschritteOffen: 5 });
    erhoeheTp(char);
    erhoeheStress(char);
    erhoeheAusweichen(char);
    erhoeheUebung(char);
    expect(char.tpZusatz).toBe(1);
    expect(char.stressZusatz).toBe(1);
    expect(char.ausweichenBonus).toBe(1);
    expect(char.uebung).toBe(2);
    expect(char.fortschritteOffen).toBe(0);
  });

  it("kann ohne offene Felder keine Fortschritte anwenden", () => {
    const char = createCharacterTemplate();
    expect(erhoeheTp(char)).toBe(false);
    expect(char.tpZusatz).toBe(0);

    char.fortschritteOffen = 1;
    expect(erhoeheUebung(char)).toBe(false);
    expect(char.uebung).toBe(1);
    expect(char.fortschritteOffen).toBe(1);
  });
});

describe("Zustaende", () => {
  it("schaltet Zustaende um", () => {
    const char = createCharacterTemplate();
    toggleZustand(char, "versteckt", true);
    expect(char.zustaende).toContain("versteckt");
    toggleZustand(char, "versteckt", false);
    expect(char.zustaende).not.toContain("versteckt");
  });
});

describe("Inventar-Eingabe", () => {
  it("zerlegt kommagetrennte Eintraege und ignoriert Leerraum", () => {
    expect(parseInventar("Fackel, Seil, ")).toEqual([
      { name: "Fackel", anzahl: 1 },
      { name: "Seil", anzahl: 1 },
    ]);
  });

  it("liest eine fuehrende Anzahl", () => {
    expect(parseInventar("3 Fackel, 2 Leichter Lebenstrank")).toEqual([
      { name: "Fackel", anzahl: 3 },
      { name: "Leichter Lebenstrank", anzahl: 2 },
    ]);
  });
});

describe("Seelentier", () => {
  function bestienbund(overrides = {}) {
    return createCharacterTemplate({
      klasse: "Waldläufer",
      subklasse: "Bestienbund",
      ...overrides,
    });
  }

  it("ist nur bei der Subklasse Bestienbund aktiv", () => {
    expect(hatSeelentier(bestienbund())).toBe(true);
    expect(
      hatSeelentier(
        createCharacterTemplate({ klasse: "Waldläufer", subklasse: "Pfadsuche" }),
      ),
    ).toBe(false);
  });

  it("startet mit Ausweichen 10 und 3 Stressfeldern", () => {
    const char = bestienbund();
    expect(getSeelentierAusweichen(char)).toBe(10);
    expect(getSeelentierStressMax(char)).toBe(3);
  });

  it("steigert Auf der Hut bis auf hoechstens 16 Ausweichen", () => {
    const char = bestienbund({ stufe: 8 });
    for (let i = 0; i < 4; i += 1) {
      aendereAusbildung(char, "auf-der-hut", 1);
    }
    expect(zaehleAusbildung(char, "auf-der-hut")).toBe(3);
    expect(getSeelentierAusweichen(char)).toBe(16);
  });

  it("steigert Widerstandsfaehig bis auf hoechstens 6 Stressfelder", () => {
    const char = bestienbund({ stufe: 8 });
    for (let i = 0; i < 4; i += 1) {
      aendereAusbildung(char, "widerstandsfaehig", 1);
    }
    expect(zaehleAusbildung(char, "widerstandsfaehig")).toBe(3);
    expect(getSeelentierStressMax(char)).toBe(6);
  });

  it("vergibt eine Option pro erreichter Stufe", () => {
    const char = bestienbund({ stufe: 3 });
    expect(getAusbildungAnzahl(char)).toBe(2);

    aendereAusbildung(char, "intelligent", 1);
    aendereAusbildung(char, "trostspende", 1);
    aendereAusbildung(char, "seelenband", 1);
    expect(char.seelentier.ausbildung).toEqual(["intelligent", "trostspende"]);
  });

  it("gibt Licht im Dunkeln ein zusaetzliches Hoffnungsfeld", () => {
    const char = bestienbund({ stufe: 2 });
    expect(getHoffnungMax(char)).toBe(6);

    aendereAusbildung(char, "licht-im-dunkeln", 1);
    expect(getHoffnungMax(char)).toBe(7);
  });
});
