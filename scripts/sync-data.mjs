/**
 * Kopiert die Spieldaten aus dem Vault-Ordner `data/` als gebuendelte
 * Standarddaten nach `src/data/bundled/`.
 *
 * Dadurch bleibt das Plugin ohne Vault-Zugriff lauffaehig, waehrend der
 * Vault-Ordner zur Laufzeit als optionaler Override dient.
 */
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const sourceDir = resolve(projectRoot, "..", "data");
const targetDir = resolve(projectRoot, "src", "data", "bundled");

const FILES = [
  "klassen.json",
  "subklassen.json",
  "waffen.json",
  "ruestungen.json",
  "abstammungen.json",
  "gemeinschaften.json",
  "domaenen.json",
  "beute.json",
  "verbrauchsgueter.json",
];

async function main() {
  if (!existsSync(sourceDir)) {
    console.error(`Quelldaten-Ordner nicht gefunden: ${sourceDir}`);
    process.exit(1);
  }

  await mkdir(targetDir, { recursive: true });

  for (const file of FILES) {
    const from = resolve(sourceDir, file);
    const to = resolve(targetDir, file);
    if (!existsSync(from)) {
      console.warn(`Uebersprungen, Quelldatei fehlt: ${file}`);
      continue;
    }
    await copyFile(from, to);
    try {
      JSON.parse(await readFile(to, "utf8"));
    } catch (error) {
      console.error(`Ungueltiges JSON in ${file}: ${error.message}`);
      process.exit(1);
    }
    console.log(`Kopiert und validiert: ${file}`);
  }

  console.log("Synchronisierung der Spieldaten abgeschlossen.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
