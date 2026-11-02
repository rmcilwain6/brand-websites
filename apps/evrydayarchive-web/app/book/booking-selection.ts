import type { PublicPackage } from '@repo/core';
// Subpath import keeps the core package's Zod schemas out of the client bundle.
import { activeModifiers, estimateTotalCents, type ModifierSelection } from '@repo/core/pricing';

import type { BookingSelection } from './selection-summary';

/**
 * What the booking form needs for a package and the choices made in the builder. /book builds it
 * from the URL and the builder from its live controls, so both show the same lines and total.
 */
export const toBookingSelection = (
  pkg: PublicPackage,
  selection: ModifierSelection
): BookingSelection => ({
  pkg,
  modifiers: activeModifiers(pkg.modifiers, selection),
  modifierValues: selection.values,
  estimatedTotalCents: estimateTotalCents(pkg.basePriceCents, pkg.modifiers, selection)
});
