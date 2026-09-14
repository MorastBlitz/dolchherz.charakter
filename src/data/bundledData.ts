/**
 * Gebuendelte Standard-Spieldaten.
 *
 * Die JSON-Dateien in `bundled/` werden durch `scripts/sync-data.mjs` aus dem
 * Vault-Ordner `data/` erzeugt und zur Build-Zeit in das Plugin eingebettet.
 */
import klassenRaw from "./bundled/klassen.json";
import subklassenRaw from "./bundled/subklassen.json";
import waffenRaw from "./bundled/waffen.json";
import ruestungenRaw from "./bundled/ruestungen.json";
import abstammungenRaw from "./bundled/abstammungen.json";
import gemeinschaftenRaw from "./bundled/gemeinschaften.json";
import domaenenRaw from "./bundled/domaenen.json";
import beuteRaw from "./bundled/beute.json";
import verbrauchsgueterRaw from "./bundled/verbrauchsgueter.json";

import type {
  DomaenenKarte,
  GameData,
  HerkunftKarte,
  ItemListenDatei,
  Klasse,
  RuestungenDatei,
  Subklasse,
  WaffenDatei,
} from "../model/gameData";

export const BUNDLED_GAME_DATA: GameData = {
  klassen: klassenRaw as unknown as Klasse[],
  subklassen: subklassenRaw as unknown as Subklasse[],
  waffen: (waffenRaw as unknown as WaffenDatei).waffen,
  ruestungen: (ruestungenRaw as unknown as RuestungenDatei).ruestungen,
  abstammungen: abstammungenRaw as unknown as HerkunftKarte[],
  gemeinschaften: gemeinschaftenRaw as unknown as HerkunftKarte[],
  domaenenkarten: domaenenRaw as unknown as DomaenenKarte[],
  beute: (beuteRaw as unknown as ItemListenDatei).items,
  verbrauchsgueter: (verbrauchsgueterRaw as unknown as ItemListenDatei).items,
};
