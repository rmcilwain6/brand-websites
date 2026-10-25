import { describe, expect, it } from 'vitest';

import {
  activeModifierDeltaCents,
  activeModifiers,
  buildModifierLineItems,
  estimateTotalCents,
  isModifierActive,
  modifierDeltaCents,
  modifierDisplayValue,
  type ModifierSelection,
  type PricedModifier
} from './pricing';

// Mirrors the live Evryday package (base $150) as of Oct 2026.
const images: PricedModifier = {
  id: 'images',
  name: 'Number of images',
  type: 'SLIDER',
  isRequired: false,
  priceDeltaCents: null,
  config: { min: 3, max: 50, step: 1, unit: 'photos', defaultValue: 7, pricePerStep: 500 }
};
const sessionLength: PricedModifier = {
  id: 'length',
  name: 'Session length',
  type: 'SLIDER',
  isRequired: false,
  priceDeltaCents: null,
  config: { min: 30, max: 120, step: 15, unit: 'minutes', defaultValue: 45, pricePerStep: 2500 }
};
const extraLocation: PricedModifier = {
  id: 'location',
  name: 'Additional location',
  type: 'CHECKBOX',
  isRequired: false,
  priceDeltaCents: 4000,
  config: null
};
const editing: PricedModifier = {
  id: 'editing',
  name: 'Processing Effort',
  type: 'TOGGLE',
  isRequired: false,
  priceDeltaCents: -1500,
  config: { defaultLabel: 'Regular Editing', altLabel: 'Light Editing' }
};
const alignmentCall: PricedModifier = {
  id: 'call',
  name: 'Alignment Call',
  type: 'CHECKBOX',
  isRequired: true,
  priceDeltaCents: null,
  config: null
};
const guests: PricedModifier = {
  id: 'guests',
  name: 'Extra guests',
  type: 'INCREMENTER',
  isRequired: false,
  priceDeltaCents: null,
  config: { min: 0, max: 10, unit: 'guests', defaultValue: 1, pricePerUnit: 2000 }
};

const evryday = [images, sessionLength, extraLocation, editing];
const none: ModifierSelection = { selectedIds: [], values: {} };

describe('modifierDeltaCents', () => {
  it('prices sliders by whole steps from the default', () => {
    expect(modifierDeltaCents(images, {})).toBe(0);
    expect(modifierDeltaCents(images, { images: 10 })).toBe(1500);
    expect(modifierDeltaCents(images, { images: 5 })).toBe(-1000);
    expect(modifierDeltaCents(sessionLength, { length: 90 })).toBe(7500);
  });

  it('rounds partial slider steps', () => {
    expect(modifierDeltaCents(sessionLength, { length: 52 })).toBe(0);
    expect(modifierDeltaCents(sessionLength, { length: 53 })).toBe(2500);
  });

  it('prices incrementers per unit from the default', () => {
    expect(modifierDeltaCents(guests, {})).toBe(0);
    expect(modifierDeltaCents(guests, { guests: 3 })).toBe(4000);
  });

  it('uses the flat delta for checkboxes and toggles', () => {
    expect(modifierDeltaCents(extraLocation, {})).toBe(4000);
    expect(modifierDeltaCents(editing, {})).toBe(-1500);
    expect(modifierDeltaCents(alignmentCall, {})).toBe(0);
  });

  it('returns 0 for sliders/incrementers with no config', () => {
    expect(modifierDeltaCents({ ...images, config: null }, { images: 20 })).toBe(0);
    expect(modifierDeltaCents({ ...guests, config: null }, { guests: 5 })).toBe(0);
  });
});

describe('isModifierActive', () => {
  it('treats required modifiers as always active', () => {
    expect(isModifierActive(alignmentCall, none)).toBe(true);
  });

  it('activates checkboxes and toggles only when selected', () => {
    expect(isModifierActive(extraLocation, none)).toBe(false);
    expect(isModifierActive(extraLocation, { selectedIds: ['location'], values: {} })).toBe(true);
    expect(isModifierActive(editing, none)).toBe(false);
    expect(isModifierActive(editing, { selectedIds: ['editing'], values: {} })).toBe(true);
  });

  it('activates sliders only when moved to a price-changing value', () => {
    expect(isModifierActive(images, { selectedIds: [], values: { images: 7 } })).toBe(false);
    expect(isModifierActive(images, { selectedIds: [], values: { images: 8 } })).toBe(true);
  });
});

describe('activeModifierDeltaCents', () => {
  it('is 0 for inactive modifiers', () => {
    expect(activeModifierDeltaCents(extraLocation, none)).toBe(0);
    expect(activeModifierDeltaCents(editing, none)).toBe(0);
  });

  it('is the modifier delta for active modifiers', () => {
    expect(activeModifierDeltaCents(editing, { selectedIds: ['editing'], values: {} })).toBe(-1500);
  });
});

describe('activeModifiers', () => {
  it('keeps required, selected, and moved modifiers in their original order', () => {
    const selection = { selectedIds: ['location'], values: { images: 10, length: 45 } };
    expect(activeModifiers([alignmentCall, ...evryday], selection).map((m) => m.id)).toEqual([
      'call',
      'images',
      'location'
    ]);
  });
});

describe('estimateTotalCents', () => {
  it('returns the base price with nothing changed', () => {
    expect(estimateTotalCents(15000, evryday, none)).toBe(15000);
  });

  it('adds every active modifier to the base price', () => {
    // 15000 + 3 photos (1500) + 60 min (2500) + location (4000) + light editing (−1500)
    const selection = {
      selectedIds: ['location', 'editing'],
      values: { images: 10, length: 60 }
    };
    expect(estimateTotalCents(15000, evryday, selection)).toBe(21500);
  });

  it('treats a missing base price as 0', () => {
    expect(
      estimateTotalCents(null, [extraLocation], { selectedIds: ['location'], values: {} })
    ).toBe(4000);
  });
});

describe('modifierDisplayValue', () => {
  it('formats sliders and incrementers', () => {
    expect(modifierDisplayValue(images, { images: 10 })).toBe('10photos');
    expect(modifierDisplayValue(images, {})).toBe('7photos');
    expect(modifierDisplayValue(guests, { guests: 3 })).toBe('3 guests');
  });

  it('returns null for other types or missing config', () => {
    expect(modifierDisplayValue(extraLocation, {})).toBeNull();
    expect(modifierDisplayValue({ ...images, config: null }, {})).toBeNull();
  });
});

describe('buildModifierLineItems', () => {
  it('builds one line per active modifier', () => {
    const selection = {
      selectedIds: ['location', 'editing'],
      values: { images: 10, length: 45 }
    };
    expect(buildModifierLineItems([alignmentCall, ...evryday], selection)).toEqual([
      { name: 'Alignment Call', priceDeltaCents: null },
      { name: 'Number of images', displayValue: '10photos', priceDeltaCents: 1500 },
      { name: 'Additional location', priceDeltaCents: 4000 },
      { name: 'Processing Effort', displayValue: 'Light Editing', priceDeltaCents: -1500 }
    ]);
  });

  it('shows a selected slider at no extra cost as included', () => {
    const selection = { selectedIds: ['images'], values: { images: 7 } };
    expect(buildModifierLineItems([images], selection)).toEqual([
      { name: 'Number of images', displayValue: '7photos', priceDeltaCents: null }
    ]);
  });

  it('skips sliders without config', () => {
    const selection = { selectedIds: ['images'], values: {} };
    expect(buildModifierLineItems([{ ...images, config: null }], selection)).toEqual([]);
  });

  it('returns no lines when nothing is active', () => {
    expect(buildModifierLineItems(evryday, none)).toEqual([]);
  });
});
