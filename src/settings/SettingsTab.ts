/**
 * Einstellungen des Plugins.
 */
import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

import type { DaggerheartSettings } from "./settings";

export interface SettingsHost {
  settings: DaggerheartSettings;
  saveSettings(): Promise<void>;
  /** Laedt die Spieldaten neu, z. B. nach Aenderung des Datenordners. */
  refreshData(): Promise<void>;
}

export class DaggerheartSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly host: Plugin & SettingsHost,
  ) {
    super(app, host);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Dolchherz Charakterbogen" });

    new Setting(containerEl)
      .setName("Datenordner")
      .setDesc("Vault-Ordner mit den JSON-Spieldaten.")
      .addText((text) =>
        text.setValue(this.host.settings.dataFolder).onChange(async (value) => {
          this.host.settings.dataFolder = value.trim();
          await this.host.saveSettings();
          await this.host.refreshData();
        }),
      );

    new Setting(containerEl)
      .setName("Vault-Daten verwenden")
      .setDesc(
        "Überschreibt die gebündelten Standarddaten, wenn der Ordner gültige Dateien enthält.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.host.settings.useVaultData)
          .onChange(async (value) => {
            this.host.settings.useVaultData = value;
            await this.host.saveSettings();
            await this.host.refreshData();
          }),
      );

    new Setting(containerEl)
      .setName("Charakterordner")
      .setDesc("Vault-Ordner für neu erstellte Charakter-Notizen.")
      .addText((text) =>
        text
          .setValue(this.host.settings.characterFolder)
          .onChange(async (value) => {
            this.host.settings.characterFolder = value.trim();
            await this.host.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Massiver Schaden")
      .setDesc(
        "Optionale Regel: Erreicht der Schaden das Doppelte der Schweren Schwelle, werden 4 TP markiert.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.host.settings.useMassiveDamage)
          .onChange(async (value) => {
            this.host.settings.useMassiveDamage = value;
            await this.host.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Rang-Errungenschaften automatisch anwenden")
      .setDesc(
        "Wendet beim Stufenaufstieg Übung, neue Erfahrung und das Löschen der Attributmarkierungen automatisch an.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.host.settings.autoApplyRankRewards)
          .onChange(async (value) => {
            this.host.settings.autoApplyRankRewards = value;
            await this.host.saveSettings();
          }),
      );
  }
}
