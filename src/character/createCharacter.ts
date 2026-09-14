/**
 * Anlegen neuer Charakter-Notizen mit vollstaendigem Bogen-Geruest.
 */
import { App, TFile, normalizePath } from "obsidian";

import {
  CHARACTER_FRONTMATTER_KEY,
  createCharacterTemplate,
  type CharakterDaten,
} from "../model/character";

/** Entfernt Zeichen, die in Dateinamen ungueltig sind. */
export function sanitizeFileName(name: string): string {
  const bereinigt = name
    .replace(/[\\/:*?"<>|#[\]^]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return bereinigt.length > 0 ? bereinigt : "Neuer Charakter";
}

/**
 * Erstellt eine neue Notiz mit Charakter-Frontmatter und Bogen-Codeblock.
 *
 * @returns Die neu angelegte Datei.
 */
export async function createCharacterFile(
  app: App,
  folder: string,
  name: string,
  klasse: string,
  overrides: Partial<CharakterDaten> = {},
): Promise<TFile> {
  const dir = folder ? normalizePath(folder) : "";

  if (dir && !(await app.vault.adapter.exists(dir))) {
    await app.vault.createFolder(dir).catch(() => undefined);
  }

  const base = sanitizeFileName(name);
  let path = dir ? normalizePath(`${dir}/${base}.md`) : `${base}.md`;
  let suffix = 2;
  while (app.vault.getAbstractFileByPath(path)) {
    const candidate = dir ? `${dir}/${base} ${suffix}.md` : `${base} ${suffix}.md`;
    path = normalizePath(candidate);
    suffix += 1;
  }

  const file = await app.vault.create(path, "");

  const template = createCharacterTemplate({ name, klasse, ...overrides });
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    frontmatter[CHARACTER_FRONTMATTER_KEY] = template;
  });

  await app.vault.append(file, "\n```daggerheart-sheet\n```\n");

  return file;
}
