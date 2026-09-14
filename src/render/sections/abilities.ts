/**
 * Klassen-, Subklassen-, Abstammungs- und Gemeinschaftsfaehigkeiten.
 *
 * Jede Kategorie wird in einem eigenen, einzeln ein- und ausklappbaren
 * Abschnitt dargestellt.
 */
import {
  ATTRIBUT_LABEL,
  getKlasse,
  getRang,
  getSubklasse,
  getZauberAttribut,
} from "../../logic/derived";
import type { SheetContext } from "../context";
import { sectionTitle } from "../controls";
import { renderRichText } from "../richText";

/** Vom Nutzer aufgeklappte Kategorien; initial ist alles eingeklappt. */
const offen = new Set<string>();

export function renderAbilities(ctx: SheetContext, parent: HTMLElement): void {
  const { char, index } = ctx;
  const section = parent.createDiv({ cls: "dh-section" });
  sectionTitle(section, "Fähigkeiten");

  const klasse = getKlasse(char, index);
  if (klasse) {
    collapsible(section, `klasse:${klasse.name}`, `Klassenfähigkeiten (${klasse.name_full})`, (body) => {
      for (const faehigkeit of klasse.klassenfaehigkeiten) {
        const wrap = body.createDiv({ cls: "dh-ability" });
        wrap.createDiv({ cls: "dh-ability__name", text: faehigkeit.name });
        renderRichText(wrap, faehigkeit.text);
      }
    });

    collapsible(section, `hoffnung:${klasse.name}`, "Hoffnungsfähigkeit (3 Hoffnung)", (body) => {
      const wrap = body.createDiv({ cls: "dh-ability" });
      wrap.createDiv({
        cls: "dh-ability__name",
        text: klasse.hoffnungsfaehigkeit.name,
      });
      renderRichText(wrap, klasse.hoffnungsfaehigkeit.text);
    });

    renderBestiengestalten(ctx, section, klasse);
  }

  const subklasse = getSubklasse(char, index);
  if (subklasse) {
    collapsible(
      section,
      `subklasse:${subklasse.klasse}:${subklasse.subklasse}`,
      `Subklasse – ${subklasse.subklasse}`,
      (body) => {
        const zauber = getZauberAttribut(subklasse);
        if (zauber) {
          body.createDiv({
            cls: "dh-field__hint",
            text: `Zauber-Attribut: ${ATTRIBUT_LABEL[zauber]}`,
          });
        }
        renderRichText(body, subklasse.kartentext);
      },
    );
  }

  const abstammung = index.abstammungByTitel.get(char.herkunft.abstammung);
  if (abstammung) {
    collapsible(
      section,
      `abstammung:${abstammung.titel}`,
      `Abstammung – ${abstammung.titel}`,
      (body) => renderRichText(body, abstammung.kartentext),
    );
  }

  const gemeinschaft = index.gemeinschaftByTitel.get(char.herkunft.gemeinschaft);
  if (gemeinschaft) {
    collapsible(
      section,
      `gemeinschaft:${gemeinschaft.titel}`,
      `Gemeinschaft – ${gemeinschaft.titel}`,
      (body) => renderRichText(body, gemeinschaft.kartentext),
    );
  }
}

/** Bestiengestalten des Druiden, gefiltert nach dem aktuellen Rang. */
function renderBestiengestalten(
  ctx: SheetContext,
  parent: HTMLElement,
  klasse: NonNullable<ReturnType<typeof getKlasse>>,
): void {
  const gestalten = klasse.bestiengestalten ?? [];
  if (gestalten.length === 0) return;

  const rang = getRang(ctx.char.stufe);
  const verfuegbar = gestalten
    .filter((gestalt) => gestalt.rang <= rang)
    .sort((a, b) => a.rang - b.rang || a.name.localeCompare(b.name, "de"));

  collapsible(
    parent,
    `bestiengestalten:${klasse.name}:${rang}`,
    `Bestiengestalten (Rang ${rang}, ${verfuegbar.length})`,
    (body) => {
      for (const gestalt of verfuegbar) {
        const wrap = body.createDiv({ cls: "dh-ability" });
        wrap.createDiv({ cls: "dh-ability__name", text: gestalt.name });
        if (gestalt.beispiele) {
          wrap.createDiv({ cls: "dh-field__hint", text: gestalt.beispiele });
        }
        if (gestalt.angriff) {
          wrap.createDiv({
            cls: "dh-field__hint",
            text: `${gestalt.attribut_bonus} · Ausweichen +${gestalt.ausweichen_bonus} · ${gestalt.angriff.distanz} ${gestalt.angriff.attribut} ${gestalt.angriff.schaden} ${gestalt.angriff.schadenstyp}`,
          });
        }
        if (gestalt.vorteile?.length) {
          wrap.createDiv({
            cls: "dh-field__hint",
            text: `Vorteil auf: ${gestalt.vorteile.join(", ")}`,
          });
        }
        for (const merkmal of gestalt.merkmale ?? []) {
          const merkmalWrap = wrap.createDiv({ cls: "dh-ability" });
          merkmalWrap.createDiv({ cls: "dh-ability__name", text: merkmal.name });
          renderRichText(merkmalWrap, merkmal.text);
        }
      }
    },
  );
}

/** Ein einzeln ein- und ausklappbarer Abschnitt mit dauerhaftem Zustand. */
function collapsible(
  parent: HTMLElement,
  key: string,
  label: string,
  build: (body: HTMLElement) => void,
): void {
  const details = parent.createEl("details", { cls: "dh-collapsible" });
  if (offen.has(key)) {
    details.setAttr("open", "");
  }
  details.createEl("summary", { cls: "dh-collapsible__summary", text: label });
  build(details.createDiv({ cls: "dh-collapsible__body" }));

  details.addEventListener("toggle", () => {
    if (details.open) {
      offen.add(key);
    } else {
      offen.delete(key);
    }
  });
}
