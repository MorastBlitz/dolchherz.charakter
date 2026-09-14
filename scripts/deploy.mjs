/**
 * Kopiert die Build-Artefakte in den Plugin-Ordner des Vaults:
 * .obsidian/plugins/dolchherz-charakterbogen/
 *
 * Ein frueherer Ordner unter dem alten Namen wird entfernt, damit das Plugin
 * nicht doppelt in Obsidian erscheint.
 */
import { access, copyFile, mkdir, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vaultRoot = resolve(projectRoot, "..");
const pluginsDir = resolve(vaultRoot, ".obsidian", "plugins");

const pluginId = "dolchherz-charakterbogen";
const legacyIds = ["daggerheart-character-sheet"];
const target = resolve(pluginsDir, pluginId);

const FILES = ["main.js", "manifest.json", "styles.css"];

async function main() {
  await access(resolve(projectRoot, "main.js"), constants.F_OK).catch(() => {
    console.error("main.js fehlt. Bitte zuerst `npm run build` ausfuehren.");
    process.exit(1);
  });

  for (const legacyId of legacyIds) {
    await rm(resolve(pluginsDir, legacyId), { recursive: true, force: true });
  }

  await mkdir(target, { recursive: true });

  for (const file of FILES) {
    await copyFile(resolve(projectRoot, file), resolve(target, file));
    console.log(`Kopiert: ${file}`);
  }

  console.log(`\nPlugin installiert unter: ${target}`);
  console.log(
    "In Obsidian aktivieren: Einstellungen > Community-Plugins > Dolchherz Charakterbogen.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
