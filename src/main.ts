import {
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
  MarkdownView,
  Notice,
  Plugin,
  TFile,
} from "obsidian";

import {
  exportCharacterJson,
  importCharacterFromFile,
} from "./character/exportImport";
import { GameDataLoader } from "./data/GameDataLoader";
import {
  initCharacter,
  readCharacter,
  updateCharacter,
  watchCharacter,
} from "./frontmatter/characterIO";
import { OverviewRenderChild, renderOverview } from "./render/overview";
import { renderSheet } from "./render/SheetRenderer";
import type { SheetContext } from "./render/context";
import { DaggerheartSettingTab } from "./settings/SettingsTab";
import { DEFAULT_SETTINGS, type DaggerheartSettings } from "./settings/settings";
import { JsonFileSuggestModal } from "./ui/JsonFileSuggest";
import { NewCharacterModal } from "./ui/NewCharacterModal";
import { CharacterHubView, HUB_VIEW_TYPE } from "./view/CharacterHubView";

const SHEET_BLOCK = "daggerheart-sheet";
const OVERVIEW_BLOCK = "daggerheart-overview";

export default class DaggerheartCharacterSheetPlugin extends Plugin {
  settings: DaggerheartSettings = { ...DEFAULT_SETTINGS };

  private loader!: GameDataLoader;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.loader = new GameDataLoader(this.app, () => this.settings);
    await this.loader.reload();

    this.registerMarkdownCodeBlockProcessor(SHEET_BLOCK, (_source, el, ctx) => {
      this.renderSheetBlock(el, ctx);
    });

    this.registerMarkdownCodeBlockProcessor(OVERVIEW_BLOCK, (_source, el, ctx) => {
      ctx.addChild(new OverviewRenderChild(this.app, el));
      renderOverview(this.app, el);
    });

    this.registerView(HUB_VIEW_TYPE, (leaf) => new CharacterHubView(leaf, this));

    this.addRibbonIcon("dices", "Dolchherz: Charakterübersicht", () => {
      void this.openHub();
    });

    this.addSettingTab(new DaggerheartSettingTab(this.app, this));

    this.addCommand({
      id: "insert-character-sheet-block",
      name: "Charakterbogen-Codeblock einfügen",
      editorCallback: (editor) => {
        editor.replaceSelection(`\`\`\`${SHEET_BLOCK}\n\`\`\`\n`);
      },
    });

    this.addCommand({
      id: "insert-character-overview-block",
      name: "Charakterübersicht-Codeblock einfügen",
      editorCallback: (editor) => {
        editor.replaceSelection(`\`\`\`${OVERVIEW_BLOCK}\n\`\`\`\n`);
      },
    });

    this.addCommand({
      id: "create-character",
      name: "Neuen Charakter erstellen",
      callback: () => this.openNewCharacterModal(),
    });

    this.addCommand({
      id: "open-character-hub",
      name: "Charakterübersicht öffnen",
      callback: () => {
        void this.openHub();
      },
    });

    this.addCommand({
      id: "export-character-json",
      name: "Charakter als JSON exportieren",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const available = !!file && !!readCharacter(this.app, file);
        if (checking) return available;
        if (file) void this.exportActiveCharacter(file);
        return true;
      },
    });

    this.addCommand({
      id: "import-character-json",
      name: "Charakter aus JSON importieren",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (checking) return !!file;
        if (file) this.importIntoActive(file);
        return true;
      },
    });

    // Spieldaten neu laden, wenn sich Dateien im Override-Ordner aendern.
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        const folder = this.settings.dataFolder;
        if (
          this.settings.useVaultData &&
          folder &&
          file.path.startsWith(`${folder}/`)
        ) {
          void this.loader.reload();
        }
      }),
    );
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async refreshData(): Promise<void> {
    await this.loader.reload();
  }

  private renderSheetBlock(
    el: HTMLElement,
    context: MarkdownPostProcessorContext,
  ): void {
    const file = this.app.vault.getAbstractFileByPath(context.sourcePath);
    if (!(file instanceof TFile)) {
      el.createDiv({
        cls: "dh-sheet dh-sheet--error",
        text: "Der Charakterbogen kann nur in einer Notiz innerhalb des Vaults verwendet werden.",
      });
      return;
    }

    const host = el.createDiv({ cls: "dh-sheet-host" });
    const render = () => this.renderInto(host, file);
    render();

    const unsubscribe = watchCharacter(this.app, file, render);
    context.addChild(new SheetRenderChild(el, unsubscribe));
  }

  private renderInto(host: HTMLElement, file: TFile): void {
    const char = readCharacter(this.app, file);
    if (!char) {
      this.renderEmptyState(host, file);
      return;
    }

    const ctx: SheetContext = {
      app: this.app,
      file,
      char,
      game: this.loader.getData(),
      index: this.loader.getIndex(),
      settings: this.settings,
      update: (mutate) => {
        void updateCharacter(this.app, file, mutate);
      },
      requestRerender: () => this.renderInto(host, file),
    };

    renderSheet(ctx, host);
  }

  private renderEmptyState(host: HTMLElement, file: TFile): void {
    host.empty();
    const wrap = host.createDiv({ cls: "dh-sheet dh-sheet--empty" });
    wrap.createDiv({
      cls: "dh-sheet__title",
      text: "Noch kein Charakterbogen",
    });
    wrap.createEl("p", {
      text: "In dieser Notiz wurden noch keine Charakterdaten im Frontmatter gefunden.",
    });

    const button = wrap.createEl("button", {
      cls: "mod-cta",
      text: "Charakterbogen anlegen",
    });
    button.addEventListener("click", () => {
      void initCharacter(this.app, file)
        .then((created) => {
          if (!created) {
            new Notice("Es existiert bereits ein Charakterbogen in dieser Notiz.");
          }
        })
        .catch((error) => {
          console.error(error);
          new Notice("Charakterbogen konnte nicht angelegt werden.");
        });
    });
  }

  openNewCharacterModal(): void {
    const klassen = this.loader.getData().klassen;
    new NewCharacterModal(
      this.app,
      klassen,
      this.settings.characterFolder,
      (path) => {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
          void this.app.workspace.getLeaf(true).openFile(file);
        }
      },
    ).open();
  }

  /** Oeffnet die Charakteruebersicht als eigene Ansicht. */
  private async openHub(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(HUB_VIEW_TYPE);
    if (existing.length > 0) {
      void this.app.workspace.revealLeaf(existing[0]);
      return;
    }

    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: HUB_VIEW_TYPE, active: true });
    void this.app.workspace.revealLeaf(leaf);
  }

  /** Fuegt den Bogen-Codeblock in die aktuelle Markdown-Notiz ein. */
  insertSheetBlockIntoActiveNote(): void {
    const view = this.getMarkdownView();
    if (!view) {
      new Notice("Keine Markdown-Notiz geöffnet.");
      return;
    }
    view.editor.replaceSelection(`\`\`\`${SHEET_BLOCK}\n\`\`\`\n`);
  }

  private getMarkdownView(): MarkdownView | null {
    const active = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (active) return active;
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      if (leaf.view instanceof MarkdownView) {
        return leaf.view;
      }
    }
    return null;
  }

  private async exportActiveCharacter(file: TFile): Promise<void> {
    const data = readCharacter(this.app, file);
    if (!data) {
      new Notice("In dieser Notiz wurde kein Charakterbogen gefunden.");
      return;
    }
    try {
      const path = await exportCharacterJson(this.app, file, data);
      new Notice(`Exportiert nach ${path}`);
    } catch (error) {
      console.error(error);
      new Notice("Export fehlgeschlagen.");
    }
  }

  private importIntoActive(target: TFile): void {
    new JsonFileSuggestModal(this.app, (jsonFile) => {
      void importCharacterFromFile(this.app, target, jsonFile)
        .then(() => new Notice("Charakter importiert."))
        .catch((error) => {
          console.error(error);
          new Notice("Import fehlgeschlagen: ungültige JSON-Datei.");
        });
    }).open();
  }
}

/** Haelt das Abonnement eines gerenderten Code-Blocks und raeumt es beim Entladen auf. */
class SheetRenderChild extends MarkdownRenderChild {
  constructor(
    containerEl: HTMLElement,
    private readonly unsubscribe: () => void,
  ) {
    super(containerEl);
  }

  onunload(): void {
    this.unsubscribe();
  }
}
