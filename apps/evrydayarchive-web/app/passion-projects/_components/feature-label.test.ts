import { describe, expect, it } from 'vitest';

import { featureLabel } from './feature-label';

describe('featureLabel', () => {
  it.each([
    [1, 'Feature 01'],
    [9, 'Feature 09'],
    [10, 'Feature 10'],
    [100, 'Feature 100']
  ])('labels %i as %s', (number, label) => {
    expect(featureLabel(number)).toBe(label);
  });
});
