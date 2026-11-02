/** A feature's catalogue number: 1 → "Feature 01". */
export const featureLabel = (number: number): string =>
  `Feature ${String(number).padStart(2, '0')}`;
