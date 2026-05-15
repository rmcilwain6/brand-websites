import type { ModifierLineItem } from './email';

type SliderCfg = { defaultValue: number; step: number; pricePerStep: number; unit: string };
type IncrementerCfg = { defaultValue: number; pricePerUnit: number; unit?: string };
type ToggleCfg = { defaultLabel: string; altLabel: string };

export type DbModifier = {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
  priceDeltaCents: number | null;
  config: unknown;
};

export const buildModifierLineItems = (
  modifiers: DbModifier[],
  selectedIds: string[],
  values: Record<string, number>
): ModifierLineItem[] => {
  const items: ModifierLineItem[] = [];

  for (const m of modifiers) {
    const selected = m.isRequired || selectedIds.includes(m.id);
    if (!selected) continue;

    const cfg = m.config as Record<string, unknown> | null;

    if (m.type === 'SLIDER') {
      const c = cfg as SliderCfg | null;
      if (!c) continue;
      const value = values[m.id] ?? c.defaultValue;
      const steps = Math.round((value - c.defaultValue) / c.step);
      const delta = steps * c.pricePerStep;
      items.push({
        name: m.name,
        displayValue: `${value}${c.unit}`,
        priceDeltaCents: delta || null
      });
    } else if (m.type === 'INCREMENTER') {
      const c = cfg as IncrementerCfg | null;
      if (!c) continue;
      const count = values[m.id] ?? c.defaultValue;
      const delta = (count - c.defaultValue) * c.pricePerUnit;
      items.push({
        name: m.name,
        displayValue: `${count}${c.unit ? ` ${c.unit}` : ''}`,
        priceDeltaCents: delta || null
      });
    } else if (m.type === 'TOGGLE') {
      const c = cfg as ToggleCfg | null;
      const altActive = selectedIds.includes(m.id);
      items.push({
        name: m.name,
        displayValue: c ? (altActive ? c.altLabel : c.defaultLabel) : undefined,
        priceDeltaCents: altActive ? (m.priceDeltaCents ?? null) : null
      });
    } else {
      items.push({ name: m.name, priceDeltaCents: m.priceDeltaCents ?? null });
    }
  }

  return items;
};
