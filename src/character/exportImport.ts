/**
 * Export und Import von Charakterdaten als JSON.
 */
import { App, TFile, normalizePath } from "obsidian";

import { writeCharacter } from "../frontmatter/characterIO";
import { normalizeCharacter, type CharakterDaten } from "../model/character";

export function serializeCharacter(data: CharakterDaten): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function parseCharacterJson(text: string): CharakterDaten {
  return normalizeCharacter(JSON.parse(text));
}

/**
 * Schreibt die Charakterdaten als JSON-Datei neben der Notiz.
 *
 * @returns Der Pfad der erzeugten Datei.
 */
export async function exportCharacterJson(
  app: App,
  file: TFile,
  data: CharakterDaten,
): Promise<string> {
  const folder = file.parent?.path ?? "";
  const path = normalizePath(
    folder ? `${folder}/${file.basename}.json` : `${file.basename}.json`,
  );
  await app.vault.adapter.write(path, serializeCharacter(data));
  return path;
}

/** Liest eine JSON-Datei und schreibt sie in die Zielnotiz. */
export async function importCharacterFromFile(
  app: App,
  target: TFile,
  jsonFile: TFile,
): Promise<CharakterDaten> {
  const text = await app.vault.adapter.read(jsonFile.path);
  const data = parseCharacterJson(text);
  await writeCharacter(app, target, data);
  return data;
}
