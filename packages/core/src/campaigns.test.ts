import { describe, expect, it } from 'vitest';

import { CAMPAIGN, campaignLabel, isCampaignEligible } from './campaigns';

describe('campaignLabel', () => {
  it('names the current round', () => {
    expect(campaignLabel(CAMPAIGN.id)).toBe('Passion Projects Winter 2026');
  });

  it('shows the id of a round it has no name for', () => {
    expect(campaignLabel('passion-projects-spring-2027')).toBe('passion-projects-spring-2027');
  });
});

describe('isCampaignEligible', () => {
  it.each(['evryday-package', 'together', 'in-practice'])('accepts %s', (slug) => {
    expect(isCampaignEligible(slug)).toBe(true);
  });

  it.each(['as-it-unfolds', 'evryday', '', null, undefined])('rejects %s', (slug) => {
    expect(isCampaignEligible(slug)).toBe(false);
  });
});
