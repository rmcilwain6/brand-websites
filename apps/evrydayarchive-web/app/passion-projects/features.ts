/** The published features. Until the first one, the features row shows coming-soon arches (`teasers.ts`). */
export type Feature = {
  number: number;
  name: string;
  oneLiner: string;
  href: string;
  image: { src: string; alt: string };
};

export const FEATURES: Feature[] = [];

/** The masthead's right-hand label. */
export const featureCountLabel = (count: number): string => {
  if (count === 0) return 'First features this winter';
  return count === 1 ? '1 feature' : `${count} features`;
};

/** How many feature cards the desktop row shows at once. */
export const RAIL_PAGE = 4;

/** The furthest the row can slide, so the last page is still full. */
const maxStart = (count: number) => Math.max(0, count - RAIL_PAGE);

export const nextRailStart = (start: number, count: number) =>
  Math.min(start + RAIL_PAGE, maxStart(count));

export const prevRailStart = (start: number) => Math.max(0, start - RAIL_PAGE);

/** Where the row should be to show a card, e.g. one reached with the keyboard. */
export const railStartShowing = (index: number, start: number, count: number) => {
  if (index >= start && index < start + RAIL_PAGE) return start;
  return Math.min(Math.floor(index / RAIL_PAGE) * RAIL_PAGE, maxStart(count));
};

/** "1–4 of 9" */
export const railLabel = (start: number, count: number) =>
  `${start + 1}–${Math.min(start + RAIL_PAGE, count)} of ${count}`;
