import type { IncrementerConfig, SliderConfig, ToggleConfig } from './schemas/admin-packages';

/**
 * Package pricing — the single source for how modifiers change a package's price.
 *
 * Used by the package builder (live price), /book (estimated total + summary lines),
 * and the admin (booking receipt, emails, resend). Pure functions only, so the same
 * rules run on the server and the client.
 */

/** The fields pricing needs. Satisfied by public API modifiers and Prisma rows alike. */
export type PricedModifier = {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  priceDeltaCents: number | null;
  config: unknown;
};

/** What the client picked in the builder. */
export type ModifierSelection = {
  /** CHECKBOX ids that are checked and TOGGLE ids set to their alternate option. */
  selectedIds: readonly string[];
  /** SLIDER / INCREMENTER values keyed by modifier id. Missing ids use the config default. */
  values: Record<string, number>;
};

export type ModifierLineItem = {
  name: string;
  displayValue?: string;
  priceDeltaCents: number | null;
};

const isRanged = (m: PricedModifier): boolean => m.type === 'SLIDER' || m.type === 'INCREMENTER';

/**
 * Price change for a modifier assuming it is active.
 * SLIDER: whole steps away from the default × price per step.
 * INCREMENTER: units away from the default × price per unit.
 * CHECKBOX / TOGGLE: the flat `priceDeltaCents`.
 */
export const modifierDeltaCents = (m: PricedModifier, values: Record<string, number>): number => {
  if (m.type === 'SLIDER') {
    const cfg = m.config as SliderConfig | null;
    if (!cfg) return 0;
    const value = values[m.id] ?? cfg.defaultValue;
    const steps = Math.round((value - cfg.defaultValue) / cfg.step);
    return steps * cfg.pricePerStep;
  }
  if (m.type === 'INCREMENTER') {
    const cfg = m.config as IncrementerConfig | null;
    if (!cfg) return 0;
    const count = values[m.id] ?? cfg.defaultValue;
    return (count - cfg.defaultValue) * cfg.pricePerUnit;
  }
  return m.priceDeltaCents ?? 0;
};

/**
 * A modifier counts toward the price when it is required, selected, or is a
 * slider/incrementer moved to a value that changes the price.
 */
export const isModifierActive = (m: PricedModifier, selection: ModifierSelection): boolean =>
  m.isRequired ||
  selection.selectedIds.includes(m.id) ||
  (isRanged(m) && modifierDeltaCents(m, selection.values) !== 0);

/** Price change a modifier contributes to the total right now (0 when inactive). */
export const activeModifierDeltaCents = (
  m: PricedModifier,
  selection: ModifierSelection
): number => (isModifierActive(m, selection) ? modifierDeltaCents(m, selection.values) : 0);

export const activeModifiers = <T extends PricedModifier>(
  modifiers: readonly T[],
  selection: ModifierSelection
): T[] => modifiers.filter((m) => isModifierActive(m, selection));

export const estimateTotalCents = (
  basePriceCents: number | null,
  modifiers: readonly PricedModifier[],
  selection: ModifierSelection
): number =>
  (basePriceCents ?? 0) +
  modifiers.reduce((sum, m) => sum + activeModifierDeltaCents(m, selection), 0);

/** Human-readable value for sliders/incrementers, e.g. "10photos" or "2 hours". */
export const modifierDisplayValue = (
  m: PricedModifier,
  values: Record<string, number>
): string | null => {
  if (m.type === 'SLIDER') {
    const cfg = m.config as SliderConfig | null;
    if (!cfg) return null;
    return `${values[m.id] ?? cfg.defaultValue}${cfg.unit}`;
  }
  if (m.type === 'INCREMENTER') {
    const cfg = m.config as IncrementerConfig | null;
    if (!cfg) return null;
    const count = values[m.id] ?? cfg.defaultValue;
    return `${count}${cfg.unit ? ` ${cfg.unit}` : ''}`;
  }
  return null;
};

/**
 * Receipt lines for a booking (admin booking page, emails). One line per active
 * modifier; sliders/incrementers with no config are skipped. A null
 * `priceDeltaCents` renders as "Included".
 */
export const buildModifierLineItems = (
  modifiers: readonly PricedModifier[],
  selection: ModifierSelection
): ModifierLineItem[] => {
  const items: ModifierLineItem[] = [];

  for (const m of activeModifiers(modifiers, selection)) {
    if (isRanged(m)) {
      const displayValue = modifierDisplayValue(m, selection.values);
      if (displayValue === null) continue;
      items.push({
        name: m.name,
        displayValue,
        priceDeltaCents: modifierDeltaCents(m, selection.values) || null
      });
    } else if (m.type === 'TOGGLE') {
      const cfg = m.config as ToggleConfig | null;
      const altActive = selection.selectedIds.includes(m.id);
      items.push({
        name: m.name,
        displayValue: cfg ? (altActive ? cfg.altLabel : cfg.defaultLabel) : undefined,
        priceDeltaCents: altActive ? (m.priceDeltaCents ?? null) : null
      });
    } else {
      items.push({ name: m.name, priceDeltaCents: m.priceDeltaCents ?? null });
    }
  }

  return items;
};
