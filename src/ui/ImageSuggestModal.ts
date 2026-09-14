/**
 * Auswahldialog fuer Bilddateien im Vault.
 */
import { App, SuggestModal, TFile } from "obsidian";

const BILD_ENDUNGEN = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "avif",
  "bmp",
];

export class ImageSuggestModal extends SuggestModal<TFile> {
  constructor(
    app: App,
    private readonly onChoose: (file: TFile) => void,
  ) {
    super(app);
    this.setPlaceholder("Bild wählen");
  }

  getSuggestions(query: string): TFile[] {
    const lower = query.toLowerCase();
    return this.app.vault
      .getFiles()
      .filter(
        (file) =>
          BILD_ENDUNGEN.includes(file.extension.toLowerCase()) &&
          file.path.toLowerCase().includes(lower),
      )
      .sort((a, b) => a.path.localeCompare(b.path, "de"));
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.createDiv({ text: file.path });
  }

  onChooseSuggestion(file: TFile): void {
    this.onChoose(file);
  }
}
