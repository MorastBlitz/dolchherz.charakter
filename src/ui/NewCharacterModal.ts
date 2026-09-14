/**
 * Dialog zum Anlegen eines neuen Charakters.
 */
import { App, Modal, Notice, Setting } from "obsidian";

import { createCharacterFile } from "../character/createCharacter";
import { parseInventar } from "../logic/inventar";
import type { CharakterDaten } from "../model/character";
import type { Klasse } from "../model/gameData";

/** Standard-Startinventar laut Charakterboegen (kommagetrennt). */
const STANDARD_INVENTAR = "Fackel, Seil (15 m), Einfacher Proviant";

export class NewCharacterModal extends Modal {
  private name = "";
  private klasse = "";
  private empfehlungen = false;
  private inventarText = STANDARD_INVENTAR;
  private optionEl!: HTMLElement;
  private readonly wahlen: Record<string, string> = {};

  constructor(
    app: App,
    private readonly klassen: Klasse[],
    private readonly folder: string,
    private readonly onCreated: (path: string) => void,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Neuen Charakter erstellen" });

    new Setting(contentEl)
      .setName("Name")
      .setDesc("Name des Charakters und der Notiz.")
      .addText((text) =>
        text.setPlaceholder("Name").onChange((value) => {
          this.name = value;
        }),
      );

    new Setting(contentEl)
      .setName("Klasse")
      .setDesc("Bestimmt Ausweichen, Trefferpunkte und Domänen.")
      .addDropdown((dropdown) => {
        dropdown.addOption("", "–");
        for (const klasse of this.klassen) {
          dropdown.addOption(klasse.name, klasse.name);
        }
        dropdown.onChange((value) => {
          this.klasse = value;
          this.renderStartOptionen();
        });
      });

    this.optionEl = contentEl.createDiv();

    new Setting(contentEl)
      .setName("Empfohlene Werte übernehmen")
      .setDesc(
        "Übernimmt die auf dem Charakterbogen empfohlenen Attribute, Startwaffen und die Rüstung.",
      )
      .addToggle((toggle) =>
        toggle.setValue(this.empfehlungen).onChange((value) => {
          this.empfehlungen = value;
        }),
      );

    new Setting(contentEl)
      .setName("Startinventar")
      .setDesc(
        "Gegenstände durch Komma getrennt. Eine führende Zahl gilt als Anzahl, z. B. „3 Fackel“.",
      )
      .addText((text) => {
        text.setValue(this.inventarText).onChange((value) => {
          this.inventarText = value;
        });
        text.inputEl.style.width = "100%";
      });

    new Setting(contentEl).addButton((button) =>
      button
        .setButtonText("Erstellen")
        .setCta()
        .onClick(async () => {
          try {
            const file = await createCharacterFile(
              this.app,
              this.folder,
              this.name,
              this.klasse,
              this.uebernehmeOptionen(),
            );
            this.onCreated(file.path);
            this.close();
          } catch (error) {
            console.error(error);
            new Notice("Charakter konnte nicht erstellt werden.");
          }
        }),
    );
  }

  /** Baut die klassenabhaengigen "WÄHLE 1 OPTION"-Auswahlen auf. */
  private renderStartOptionen(): void {
    if (!this.optionEl) return;
    this.optionEl.empty();

    const eintrag = this.klassen.find((klasse) => klasse.name === this.klasse);
    const gruppen = eintrag?.empfehlungen?.startOptionen ?? [];
    if (gruppen.length === 0) return;

    this.optionEl.createEl("h3", { text: "Startoptionen" });
    for (const gruppe of gruppen) {
      new Setting(this.optionEl)
        .setName(gruppe.label)
        .setDesc("Wähle 1 Option.")
        .addDropdown((dropdown) => {
          dropdown.addOption("", "–");
          for (const option of gruppe.optionen) {
            dropdown.addOption(option, option);
          }
          dropdown.setValue(this.wahlen[gruppe.label] ?? "");
          dropdown.onChange((value) => {
            this.wahlen[gruppe.label] = value;
          });
        });
    }
  }

  private uebernehmeOptionen(): Partial<CharakterDaten> {
    const overrides: Partial<CharakterDaten> = {};
    const eintrag = this.klassen.find((klasse) => klasse.name === this.klasse);

    if (this.empfehlungen && eintrag?.empfehlungen) {
      const empfehlung = eintrag.empfehlungen;
      overrides.attribute = { ...empfehlung.attribute };
      overrides.waffen = {
        primaer: empfehlung.primaerwaffe,
        sekundaer: empfehlung.sekundaerwaffe ?? "",
        inventar: [],
      };
      overrides.ruestung = { name: empfehlung.ruestung, markierteFelder: 0 };
      overrides.gold = { handvoll: 1, beutel: 0, truhe: 0 };
    }

    const inventar = parseInventar(this.inventarText);
    for (const wahl of Object.values(this.wahlen)) {
      if (wahl) inventar.push({ name: wahl, anzahl: 1 });
    }
    if (inventar.length > 0) {
      overrides.inventar = inventar;
    }

    return overrides;
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
