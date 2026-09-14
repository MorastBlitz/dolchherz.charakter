/** Formatiert eine Zahl mit Vorzeichen, z. B. +2 oder -1. */
export function signed(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}
