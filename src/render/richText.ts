/**
 * Minimaler Renderer fuer die Kartentexte aus den Spieldaten.
 *
 * Unterstuetzt Absaetze, Aufzaehlungen und fett gesetzte Stichworte
 * (`**fett**`), ohne die asynchrone Obsidian-Markdown-API zu benoetigen.
 */
export function renderRichText(parent: HTMLElement, text: string): void {
  const blocks = text.split(/\n{2,}/);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length === 0) continue;

    const allBullets = lines.every((line) => line.startsWith("•"));
    if (allBullets) {
      const list = parent.createEl("ul", { cls: "dh-rich-list" });
      for (const line of lines) {
        const item = list.createEl("li");
        renderInline(item, line.replace(/^•\s*/, ""));
      }
      continue;
    }

    const paragraph = parent.createEl("p", { cls: "dh-rich" });
    renderInline(paragraph, lines.join(" "));
  }
}

function renderInline(parent: HTMLElement, text: string): void {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (part.length === 0) continue;
    if (part.startsWith("**") && part.endsWith("**")) {
      parent.createEl("strong", { text: part.slice(2, -2) });
    } else {
      parent.appendText(part);
    }
  }
}
