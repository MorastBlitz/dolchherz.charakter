/**
 * Gemeinsamer Kontext fuer alle Render-Funktionen des Bogens.
 */
import type { App, TFile } from "obsidian";

import type { CharakterDaten } from "../model/character";
import type { GameData, GameDataIndex } from "../model/gameData";
import type { DaggerheartSettings } from "../settings/settings";

export interface SheetContext {
  app: App;
  file: TFile;
  /** Aktuelle Charakterdaten aus dem Frontmatter. */
  char: CharakterDaten;
  /** Geladene Spieldaten in Listenform. */
  game: GameData;
  /** Geladene Spieldaten indiziert nach Namen. */
  index: GameDataIndex;
  settings: DaggerheartSettings;
  /** Schreibt eine Aenderung ins Frontmatter. */
  update: (mutate: (draft: CharakterDaten) => void) => void;
  /** Erzwingt ein erneutes Rendern des Bogens. */
  requestRerender: () => void;
}
