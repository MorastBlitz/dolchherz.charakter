/**
 * Kleine DOM-Bausteine fuer den interaktiven Bogen.
 *
 * Die HTMLElement-Erweiterungen (`createDiv`, `createEl`, `createSpan`)
 * stammen aus der Obsidian-API.
 */

export interface SelectOption {
  value: string;
  label: string;
}

export function textControl(
  parent: HTMLElement,
  value: string,
  placeholder: string,
  onCommit: (value: string) => void,
): HTMLInputElement {
  const input = parent.createEl("input", { cls: "dh-input" });
  input.setAttr("type", "text");
  input.value = value;
  input.placeholder = placeholder;
  input.addEventListener("change", () => onCommit(input.value.trim()));
  return input;
}

export function selectControl(
  parent: HTMLElement,
  options: SelectOption[],
  value: string,
  onChange: (value: string) => void,
): HTMLSelectElement {
  const select = parent.createEl("select", { cls: "dropdown dh-select" });
  const all: SelectOption[] = [{ value: "", label: "–" }, ...options];
  for (const option of all) {
    const node = select.createEl("option", { text: option.label });
    node.value = option.value;
    if (option.value === value) {
      node.selected = true;
    }
  }
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

export interface StepperOptions {
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function stepperControl(
  parent: HTMLElement,
  value: number,
  options: StepperOptions,
): HTMLElement {
  const min = options.min ?? 0;
  const max = options.max ?? 99;
  const wrap = parent.createDiv({ cls: "dh-stepper" });

  const minus = wrap.createEl("button", { cls: "dh-stepper__btn", text: "−" });
  minus.setAttr("type", "button");
  wrap.createSpan({ cls: "dh-stepper__value", text: String(value) });
  const plus = wrap.createEl("button", { cls: "dh-stepper__btn", text: "+" });
  plus.setAttr("type", "button");

  minus.disabled = value <= min;
  plus.disabled = value >= max;

  minus.addEventListener("click", () => {
    if (value > min) options.onChange(value - 1);
  });
  plus.addEventListener("click", () => {
    if (value < max) options.onChange(value + 1);
  });

  return wrap;
}

/** Ein einzelnes klickbares Feld. */
export function slotControl(
  parent: HTMLElement,
  marked: boolean,
  onToggle: (next: boolean) => void,
): HTMLElement {
  const slot = parent.createDiv({ cls: marked ? "dh-slot is-marked" : "dh-slot" });
  slot.addEventListener("click", () => onToggle(!marked));
  return slot;
}

/**
 * Eine nummerierte Reihe Felder, die einen Zaehler darstellen.
 * Klick auf ein Feld setzt den Zaehler bis einschliesslich dieses Feldes.
 */
export function numberedSlots(
  parent: HTMLElement,
  total: number,
  marked: number,
  onChange: (value: number) => void,
): void {
  const row = parent.createDiv({ cls: "dh-slots dh-slots--numbered" });
  for (let index = 0; index < total; index += 1) {
    const slot = row.createDiv({
      cls: index < marked ? "dh-slot is-marked" : "dh-slot",
      text: String(index + 1),
    });
    slot.addEventListener("click", () => {
      onChange(index + 1 === marked ? index : index + 1);
    });
  }
}

/** Container fuer ein beschriftetes Feld. */
export function field(
  parent: HTMLElement,
  label: string,
  build: (cell: HTMLElement) => void,
): HTMLElement {
  const cell = parent.createDiv({ cls: "dh-field" });
  cell.createDiv({ cls: "dh-field__label", text: label });
  build(cell);
  return cell;
}

/** Kleines Label mit Wert, fuer abgeleitete Kennzahlen. */
export function badge(
  parent: HTMLElement,
  label: string,
  value: string,
): HTMLElement {
  const node = parent.createDiv({ cls: "dh-badge" });
  node.createDiv({ cls: "dh-badge__label", text: label });
  node.createDiv({ cls: "dh-badge__value", text: value });
  return node;
}

/** Ueberschrift einer Sektion. */
export function sectionTitle(parent: HTMLElement, text: string): HTMLElement {
  return parent.createDiv({ cls: "dh-section__title", text });
}

/** Schaltflaeche mit optionaler CSS-Klasse. */
export function actionButton(
  parent: HTMLElement,
  label: string,
  onClick: () => void,
  cls = "dh-button",
): HTMLButtonElement {
  const button = parent.createEl("button", { cls, text: label });
  button.setAttr("type", "button");
  button.addEventListener("click", onClick);
  return button;
}

/** Kontrollkaestchen mit Beschriftung. */
export function toggleControl(
  parent: HTMLElement,
  checked: boolean,
  label: string,
  onChange: (checked: boolean) => void,
): HTMLElement {
  const wrapper = parent.createEl("label", { cls: "dh-checkbox" });
  const input = wrapper.createEl("input");
  input.setAttr("type", "checkbox");
  input.checked = checked;
  input.addEventListener("change", () => onChange(input.checked));
  wrapper.createSpan({ text: label });
  return wrapper;
}
