/**
 * Uebersicht aller Charaktere im Vault.
 */
import { App, MarkdownRenderChild, TFile } from "obsidian";

import { getRang } from "../logic/derived";
import { CHARACTER_FRONTMATTER_KEY, CHARACTER_TYPE } from "../model/character";

export interface OverviewEntry {
  file: TFile;
  name: string;
  klasse: string;
  subklasse: string;
  stufe: number;
}

/** Sammelt alle Notizen, die einen Charakterbogen enthalten. */
export function collectCharacters(app: App): OverviewEntry[] {
  const entries: OverviewEntry[] = [];

  for (const file of app.vault.getMarkdownFiles()) {
    const raw = app.metadataCache.getFileCache(file)?.frontmatter?.[
      CHARACTER_FRONTMATTER_KEY
    ] as Record<string, unknown> | undefined;
    if (!raw || raw.type !== CHARACTER_TYPE) continue;

    entries.push({
      file,
      name: typeof raw.name === "string" && raw.name ? raw.name : file.basename,
      klasse: typeof raw.klasse === "string" ? raw.klasse : "–",
      subklasse: typeof raw.subklasse === "string" ? raw.subklasse : "–",
      stufe: typeof raw.stufe === "number" ? raw.stufe : 1,
    });
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function renderOverview(app: App, host: HTMLElement): void {
  host.empty();
  const container = host.createDiv({ cls: "dh-overview" });
  const entries = collectCharacters(app);

  if (entries.length === 0) {
    container.createDiv({
      cls: "dh-field__hint",
      text: "Keine Charaktere gefunden. Lege einen Charakterbogen an, damit er hier erscheint.",
    });
    return;
  }

  const table = container.createEl("table", { cls: "dh-overview__table" });
  const headRow = table.createEl("thead").createEl("tr");
  for (const label of ["Name", "Klasse", "Subklasse", "Stufe", "Rang"]) {
    headRow.createEl("th", { text: label });
  }

  const body = table.createEl("tbody");
  for (const entry of entries) {
    const row = body.createEl("tr");
    const nameCell = row.createEl("td");
    const link = nameCell.createEl("a", {
      cls: "internal-link",
      text: entry.name,
    });
    link.setAttr("data-href", entry.file.path);
    link.setAttr("href", entry.file.path);

    row.createEl("td", { text: entry.klasse });
    row.createEl("td", { text: entry.subklasse });
    row.createEl("td", { text: String(entry.stufe) });
    row.createEl("td", { text: String(getRang(entry.stufe)) });
  }
}

/** Haelt die Uebersicht aktuell, solange der Code-Block sichtbar ist. */
export class OverviewRenderChild extends MarkdownRenderChild {
  constructor(
    private readonly app: App,
    containerEl: HTMLElement,
  ) {
    super(containerEl);
    const rerender = () => renderOverview(this.app, this.containerEl);
    this.registerEvent(this.app.metadataCache.on("changed", rerender));
    this.registerEvent(this.app.vault.on("delete", rerender));
    this.registerEvent(this.app.vault.on("rename", rerender));
  }
}
