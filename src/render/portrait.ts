/**
 * Portrait eines Charakters oder Seelentiers.
 *
 * Das Bild wird als Vault-Pfad im Frontmatter gespeichert. Klein dargestellt
 * laesst es sich per Klick gross anzeigen; das Seitenverhaeltnis der Miniatur
 * ist waehlbar.
 */
import { App, TFile } from "obsidian";

import type { PortraitFormat } from "../model/character";
import { ImageModal } from "../ui/ImageModal";
import { ImageSuggestModal } from "../ui/ImageSuggestModal";
import type { SheetContext } from "./context";
import { actionButton, selectControl } from "./controls";

export interface PortraitDaten {
  pfad: string;
  format: PortraitFormat;
}

const FORMAT_OPTIONEN: Array<{ value: PortraitFormat; label: string }> = [
  { value: "auto", label: "Automatisch" },
  { value: "1:1", label: "1:1" },
  { value: "3:2", label: "3:2" },
  { value: "2:3", label: "2:3" },
];

/** Loest einen Vault-Pfad zu einer Bilddatei auf. */
function loeseBild(app: App, pfad: string): TFile | null {
  if (!pfad) return null;
  const direkt = app.vault.getAbstractFileByPath(pfad);
  if (direkt instanceof TFile) return direkt;
  const perLink = app.metadataCache.getFirstLinkpathDest(pfad, "");
  return perLink instanceof TFile ? perLink : null;
}

/** Setzt Breite/Hoehe der Miniatur anhand des gewaehlten Formats. */
function formatiereMiniatur(
  img: HTMLImageElement,
  format: PortraitFormat,
): void {
  img.style.width = "84px";
  img.style.height = "auto";
  if (format === "auto") {
    img.style.aspectRatio = "";
    img.style.objectFit = "";
    return;
  }
  img.style.aspectRatio = format.replace(":", " / ");
  img.style.objectFit = "cover";
}

export function renderPortrait(
  ctx: SheetContext,
  parent: HTMLElement,
  label: string,
  daten: PortraitDaten,
  onChange: (next: PortraitDaten) => void,
): void {
  const wrap = parent.createDiv({ cls: "dh-portrait" });
  const datei = loeseBild(ctx.app, daten.pfad);

  if (datei) {
    const src = ctx.app.vault.getResourcePath(datei);
    const img = wrap.createEl("img", { cls: "dh-portrait__image is-clickable" });
    img.src = src;
    img.alt = label;
    formatiereMiniatur(img, daten.format);
    img.addEventListener("click", () => {
      new ImageModal(ctx.app, src, datei.basename).open();
    });
  } else {
    wrap.createDiv({ cls: "dh-portrait__placeholder", text: label });
  }

  const info = wrap.createDiv({ cls: "dh-portrait__info" });
  const actions = info.createDiv({ cls: "dh-inline dh-inline--wrap" });
  actionButton(actions, datei ? "Bild ändern" : "Bild wählen", () => {
    new ImageSuggestModal(ctx.app, (gewaehlt) =>
      onChange({ ...daten, pfad: gewaehlt.path }),
    ).open();
  });
  if (daten.pfad) {
    actionButton(actions, "Entfernen", () => onChange({ ...daten, pfad: "" }));
  }

  const formatRow = info.createDiv({ cls: "dh-inline" });
  formatRow.createSpan({ cls: "dh-field__hint", text: "Format" });
  selectControl(
    formatRow,
    FORMAT_OPTIONEN.map((option) => ({
      value: option.value,
      label: option.label,
    })),
    daten.format,
    (value) => onChange({ ...daten, format: value as PortraitFormat }),
  );

  if (daten.pfad && !datei) {
    info.createDiv({ cls: "dh-warning", text: "Bild nicht gefunden." });
  }
}
