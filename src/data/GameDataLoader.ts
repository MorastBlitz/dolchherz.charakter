/**
 * Laedt die Spieldaten und stellt sie indiziert bereit.
 *
 * Datenquellen in dieser Reihenfolge:
 * 1. Gebuendelte Standarddaten (immer vorhanden).
 * 2. Optionaler Vault-Ordner (`dataFolder`) als vollstaendiger Override.
 *
 * Der Vault-Zugriff wird mit mtime-basiertem Cache versehen, damit
 * wiederholte Rendervorgaenge keine Dateien erneut lesen.
 */
import { App, normalizePath } from "obsidian";

import {
  buildGameDataIndex,
  type GameData,
  type GameDataIndex,
} from "../model/gameData";
import { BUNDLED_GAME_DATA } from "./bundledData";
import type { DaggerheartSettings } from "../settings/settings";

interface CacheEntry {
  mtime: number;
  data: unknown;
}

const FILE_NAMES = {
  klassen: "klassen.json",
  subklassen: "subklassen.json",
  waffen: "waffen.json",
  ruestungen: "ruestungen.json",
  abstammungen: "abstammungen.json",
  gemeinschaften: "gemeinschaften.json",
  domaenen: "domaenen.json",
  beute: "beute.json",
  verbrauchsgueter: "verbrauchsgueter.json",
} as const;

export class GameDataLoader {
  private data: GameData = BUNDLED_GAME_DATA;
  private index: GameDataIndex = buildGameDataIndex(BUNDLED_GAME_DATA);
  private readonly cache = new Map<string, CacheEntry>();
  private usingVaultOverride = false;

  constructor(
    private readonly app: App,
    private readonly getSettings: () => DaggerheartSettings,
  ) {}

  getData(): GameData {
    return this.data;
  }

  getIndex(): GameDataIndex {
    return this.index;
  }

  isUsingVaultOverride(): boolean {
    return this.usingVaultOverride;
  }

  /** Laedt die Daten neu, inklusive eines eventuellen Vault-Overrides. */
  async reload(): Promise<void> {
    const settings = this.getSettings();
    let data: GameData | null = null;

    if (settings.useVaultData && settings.dataFolder) {
      data = await this.loadFromVault(settings.dataFolder);
    }

    this.usingVaultOverride = data !== null;
    this.data = data ?? BUNDLED_GAME_DATA;
    this.index = buildGameDataIndex(this.data);
  }

  /**
   * Prueft, ob sich Dateien im Override-Ordner geaendert haben.
   * Wird vom Renderer verwendet, um nur bei tatsaechlichen Aenderungen neu zu bauen.
   */
  async isStale(): Promise<boolean> {
    const settings = this.getSettings();
    if (!settings.useVaultData || !settings.dataFolder) {
      return false;
    }
    for (const fileName of Object.values(FILE_NAMES)) {
      const path = normalizePath(`${settings.dataFolder}/${fileName}`);
      const stat = await this.app.vault.adapter.stat(path);
      const mtime = stat?.mtime ?? 0;
      const cached = this.cache.get(path);
      if (!cached || cached.mtime !== mtime) {
        return true;
      }
    }
    return false;
  }

  private async loadFromVault(folder: string): Promise<GameData | null> {
    const read = <T>(fileName: string) =>
      this.readJson<T>(normalizePath(`${folder}/${fileName}`));

    const klassen = await read<unknown[]>(FILE_NAMES.klassen);
    if (!Array.isArray(klassen) || klassen.length === 0) {
      // Ohne Klassendaten ist kein sinnvoller Override moeglich.
      return null;
    }

    // `faehigkeiten.json` ist eine inhaltsgleiche Alternative zu `domaenen.json`.
    const domaenen =
      (await read<unknown[]>(FILE_NAMES.domaenen)) ??
      (await read<unknown[]>('faehigkeiten.json')) ??
      [];

    return {
      klassen: klassen as GameData["klassen"],
      subklassen:
        ((await read(FILE_NAMES.subklassen)) as GameData["subklassen"]) ?? [],
      waffen:
        (await this.readWrapped<GameData["waffen"]>(
          `${folder}/${FILE_NAMES.waffen}`,
          "waffen",
        )) ?? [],
      ruestungen:
        (await this.readWrapped<GameData["ruestungen"]>(
          `${folder}/${FILE_NAMES.ruestungen}`,
          "ruestungen",
        )) ?? [],
      abstammungen:
        ((await read(FILE_NAMES.abstammungen)) as GameData["abstammungen"]) ??
        [],
      gemeinschaften:
        ((await read(FILE_NAMES.gemeinschaften)) as GameData["gemeinschaften"]) ??
        [],
      domaenenkarten: domaenen as GameData["domaenenkarten"],
      beute:
        (await this.readWrapped<GameData["beute"]>(
          `${folder}/${FILE_NAMES.beute}`,
          "items",
        )) ?? [],
      verbrauchsgueter:
        (await this.readWrapped<GameData["verbrauchsgueter"]>(
          `${folder}/${FILE_NAMES.verbrauchsgueter}`,
          "items",
        )) ?? [],
    };
  }

  private async readWrapped<T>(
    path: string,
    key: string,
  ): Promise<T | null> {
    const parsed = await this.readJson<Record<string, unknown>>(
      normalizePath(path),
    );
    if (!parsed || !Array.isArray(parsed[key])) {
      return null;
    }
    return parsed[key] as T;
  }

  private async readJson<T>(path: string): Promise<T | null> {
    const adapter = this.app.vault.adapter;
    if (!(await adapter.exists(path))) {
      return null;
    }

    const stat = await adapter.stat(path);
    const mtime = stat?.mtime ?? 0;
    const cached = this.cache.get(path);
    if (cached && cached.mtime === mtime) {
      return cached.data as T;
    }

    try {
      const text = await adapter.read(path);
      const parsed = JSON.parse(text) as T;
      this.cache.set(path, { mtime, data: parsed });
      return parsed;
    } catch (error) {
      console.error(`[Daggerheart] Datei konnte nicht geladen werden: ${path}`, error);
      return null;
    }
  }
}
