/**
 * Plugin-Einstellungen.
 */
export interface DaggerheartSettings {
  /** Vault-Ordner mit den JSON-Spieldaten (Override der gebuendelten Daten). */
  dataFolder: string;
  /** Vault-Ordner, in dem neue Charakter-Notizen angelegt werden. */
  characterFolder: string;
  /** Ob der Vault-Ordner als Datenquelle verwendet werden soll. */
  useVaultData: boolean;
  /** Optionale Regel fuer massiven Schaden aktivieren. */
  useMassiveDamage: boolean;
  /** Rang-Errungenschaften beim Stufenaufstieg automatisch anwenden. */
  autoApplyRankRewards: boolean;
}

export const DEFAULT_SETTINGS: DaggerheartSettings = {
  dataFolder: "data",
  characterFolder: "Charaktere",
  useVaultData: true,
  useMassiveDamage: false,
  autoApplyRankRewards: true,
};
