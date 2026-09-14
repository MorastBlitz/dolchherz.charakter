/**
 * Grossansicht eines Bildes.
 */
import { App, Modal } from "obsidian";

export class ImageModal extends Modal {
  constructor(
    app: App,
    private readonly src: string,
    private readonly titel: string,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("dh-image-modal");
    if (this.titel) {
      contentEl.createEl("h2", { text: this.titel });
    }
    const img = contentEl.createEl("img", { cls: "dh-image-modal__image" });
    img.src = this.src;
    img.alt = this.titel;
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
