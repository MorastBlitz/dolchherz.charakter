/**
 * Hilfsfunktionen fuer Inventareintraege.
 */
import type { CharakterInventarEintrag } from "../model/character";

/**
 * Zerlegt eine kommagetrennte Eingabe in Inventareintraege.
 *
 * Eine fuehrende Zahl mit Leerzeichen wird als Anzahl gelesen,
 * z. B. "3 Fackel" -> { name: "Fackel", anzahl: 3 }.
 */
export function parseInventar(text: string): CharakterInventarEintrag[] {
  return text
    .split(",")
    .map((eintrag) => eintrag.trim())
    .filter((eintrag) => eintrag.length > 0)
    .map((eintrag) => {
      const match = eintrag.match(/^(\d+)\s+(.*)$/);
      if (match) {
        return {
          name: match[2].trim(),
          anzahl: Math.max(1, Number.parseInt(match[1], 10)),
        };
      }
      return { name: eintrag, anzahl: 1 };
    });
}
