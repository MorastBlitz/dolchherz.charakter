/**
 * Liest und schreibt die Charakterdaten im YAML-Frontmatter einer Notiz.
 *
 * Zum Schutz vor Render-Schleifen wird nur geschrieben, wenn sich die Daten
 * tatsaechlich veraendert haben.
 */
import { App, TFile } from "obsidian";

import {
  CHARACTER_FRONTMATTER_KEY,
  createCharacterTemplate,
  normalizeCharacter,
  type CharakterDaten,
} from "../model/character";

/** Liest die Charakterdaten einer Notiz, falls vorhanden. */
export function readCharacter(
  app: App,
  file: TFile,
): CharakterDaten | null {
  const raw = readRaw(app, file);
  return raw === null ? null : normalizeCharacter(raw);
}

/** Liest den rohen Frontmatter-Block ohne Normalisierung. */
export function readRaw(app: App, file: TFile): unknown {
  const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
  if (!frontmatter) return null;
  return frontmatter[CHARACTER_FRONTMATTER_KEY] ?? null;
}

/**
 * Wendet eine Aenderung auf die Charakterdaten an.
 *
 * @returns true, wenn tatsaechlich geschrieben wurde.
 */
export async function updateCharacter(
  app: App,
  file: TFile,
  mutate: (draft: CharakterDaten) => void,
): Promise<boolean> {
  const current = normalizeCharacter(readRaw(app, file));
  const draft = clone(current);
  mutate(draft);

  if (serialize(draft) === serialize(current)) {
    return false;
  }

  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    frontmatter[CHARACTER_FRONTMATTER_KEY] = draft;
  });
  return true;
}

/**
 * Legt einen leeren Charakterbogen im Frontmatter an, falls noch keiner existiert.
 *
 * @returns true, wenn ein Bogen angelegt wurde.
 */
/**
 * Entfernt die Charakterdaten aus dem Frontmatter der Notiz.
 *
 * Die Notiz selbst bleibt erhalten.
 */
export async function deleteCharacter(app: App, file: TFile): Promise<void> {
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    delete frontmatter[CHARACTER_FRONTMATTER_KEY];
  });
}

export async function initCharacter(app: App, file: TFile): Promise<boolean> {
  if (readRaw(app, file) !== null) {
    return false;
  }
  const template = createCharacterTemplate();
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    frontmatter[CHARACTER_FRONTMATTER_KEY] = template;
  });
  return true;
}

/** Schreibt komplette Charakterdaten ins Frontmatter, z. B. beim Import. */
export async function writeCharacter(
  app: App,
  file: TFile,
  data: CharakterDaten,
): Promise<void> {
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    frontmatter[CHARACTER_FRONTMATTER_KEY] = data;
  });
}

/**
 * Abonniert Aenderungen an den Charakterdaten einer Notiz.
 *
 * @returns Funktion zum Abbestellen.
 */
export function watchCharacter(
  app: App,
  file: TFile,
  onChange: (data: CharakterDaten) => void,
): () => void {
  const ref = app.metadataCache.on("changed", (changedFile) => {
    if (changedFile.path !== file.path) return;
    onChange(normalizeCharacter(readRaw(app, changedFile)));
  });
  return () => app.metadataCache.offref(ref);
}

function clone(data: CharakterDaten): CharakterDaten {
  if (typeof structuredClone === "function") {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data)) as CharakterDaten;
}

function serialize(data: CharakterDaten): string {
  return JSON.stringify(data);
}
