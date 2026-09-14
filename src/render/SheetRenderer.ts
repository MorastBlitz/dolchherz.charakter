/**
 * Setzt den kompletten Charakterbogen aus seinen Sektionen zusammen.
 */
import { Notice } from "obsidian";

import { deleteCharacter } from "../frontmatter/characterIO";
import type { SheetContext } from "./context";
import { renderAbilities } from "./sections/abilities";
import { renderAttributes } from "./sections/attributes";
import { renderDomainCards } from "./sections/domainCards";
import { renderEquipment } from "./sections/equipment";
import { renderHeader } from "./sections/header";
import { renderInventory } from "./sections/inventory";
import { renderLevelUp } from "./sections/levelUp";
import { renderSeelentier } from "./sections/seelentier";
import { renderTracks } from "./sections/tracks";
import { actionButton } from "./controls";

export function renderSheet(ctx: SheetContext, container: HTMLElement): void {
  container.empty();
  container.addClass("dh-sheet");

  renderHeader(ctx, container);
  renderTracks(ctx, container);
  renderAttributes(ctx, container);
  renderEquipment(ctx, container);
  renderAbilities(ctx, container);
  renderSeelentier(ctx, container);
  renderDomainCards(ctx, container);
  renderInventory(ctx, container);
  renderLevelUp(ctx, container);
  renderDelete(ctx, container);
}

/** Schaltflaeche zum Entfernen der Charakterdaten dieser Notiz. */
function renderDelete(ctx: SheetContext, container: HTMLElement): void {
  const section = container.createDiv({ cls: "dh-section dh-section--actions" });
  actionButton(
    section,
    "Charakterdaten löschen",
    () => {
      const bestaetigt = window.confirm(
        "Charakterdaten dieser Notiz wirklich löschen? Die Notiz selbst bleibt erhalten.",
      );
      if (!bestaetigt) return;
      void deleteCharacter(ctx.app, ctx.file).catch((error) => {
        console.error(error);
        new Notice("Charakterdaten konnten nicht gelöscht werden.");
      });
    },
    "dh-button dh-button--danger",
  );
}
