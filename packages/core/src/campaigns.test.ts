import { describe, expect, it } from 'vitest';

import { isCampaignEligible } from './campaigns';

describe('isCampaignEligible', () => {
  it.each(['evryday-package', 'together', 'in-practice'])('accepts %s', (slug) => {
    expect(isCampaignEligible(slug)).toBe(true);
  });

  it.each(['as-it-unfolds', 'evryday', '', null, undefined])('rejects %s', (slug) => {
    expect(isCampaignEligible(slug)).toBe(false);
  });
});
