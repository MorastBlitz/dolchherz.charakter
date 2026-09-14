/**
 * Auswahldialog fuer JSON-Dateien im Vault.
 */
import { App, SuggestModal, TFile } from "obsidian";

export class JsonFileSuggestModal extends SuggestModal<TFile> {
  constructor(
    app: App,
    private readonly onChoose: (file: TFile) => void,
  ) {
    super(app);
    this.setPlaceholder("JSON-Datei wählen");
  }

  getSuggestions(query: string): TFile[] {
    const lower = query.toLowerCase();
    return this.app.vault
      .getFiles()
      .filter(
        (file) =>
          file.extension === "json" && file.path.toLowerCase().includes(lower),
      );
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.createDiv({ text: file.path });
  }

  onChooseSuggestion(file: TFile): void {
    this.onChoose(file);
  }
}
