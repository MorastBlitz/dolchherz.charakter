/**
 * Eigene Ansicht mit der Charakteruebersicht.
 *
 * Wird ueber das Ribbon-Symbol links oder per Befehl geoeffnet.
 */
import { ItemView, WorkspaceLeaf } from "obsidian";

import { renderOverview } from "../render/overview";

export const HUB_VIEW_TYPE = "dolchherz-charakter-hub";

export interface CharacterHubHost {
  /** Oeffnet den Dialog zum Anlegen eines neuen Charakters. */
  openNewCharacterModal(): void;
  /** Fuegt den Bogen-Codeblock in die aktuelle Markdown-Notiz ein. */
  insertSheetBlockIntoActiveNote(): void;
}

export class CharacterHubView extends ItemView {
  constructor(
    leaf: WorkspaceLeaf,
    private readonly host: CharacterHubHost,
  ) {
    super(leaf);
  }

  getViewType(): string {
    return HUB_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Dolchherz Charaktere";
  }

  getIcon(): string {
    return "dices";
  }

  async onOpen(): Promise<void> {
    this.render();
    this.registerEvent(
      this.app.metadataCache.on("changed", () => this.render()),
    );
    this.registerEvent(this.app.vault.on("delete", () => this.render()));
    this.registerEvent(this.app.vault.on("rename", () => this.render()));
  }

  private render(): void {
    const root = this.contentEl;
    root.empty();
    root.addClass("dh-hub");

    const actions = root.createDiv({ cls: "dh-hub__actions" });
    const neu = actions.createEl("button", {
      cls: "mod-cta",
      text: "Neuen Charakter erstellen",
    });
    neu.setAttr("type", "button");
    neu.addEventListener("click", () => this.host.openNewCharacterModal());

    const einfuegen = actions.createEl("button", {
      text: "Bogen in aktive Notiz einfügen",
    });
    einfuegen.setAttr("type", "button");
    einfuegen.addEventListener("click", () =>
      this.host.insertSheetBlockIntoActiveNote(),
    );

    root.createEl("h3", { text: "Charaktere im Vault" });
    const list = root.createDiv({ cls: "dh-hub__list" });
    renderOverview(this.app, list);
  }
}
