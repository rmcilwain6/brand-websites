export type HeroTextVariant = {
  /** Small uppercase label above the heading */
  eyebrow: string;
  /** Main heading — use \n for intentional line breaks */
  heading: string;
  /** Supporting body copy */
  body: string;
};

export const HERO_TEXT_VARIANTS: HeroTextVariant[] = [
  {
    eyebrow: 'Kamloops & British Columbia · Photography',
    heading: 'Quiet days,\ncarefully\ndocumented.',
    body: 'A studio practice rooted in intention — capturing everyday life with honesty and care.'
  },
  {
    eyebrow: 'The Archive · Est. 2024',
    heading: 'Every day\nworthwhile.',
    body: 'Honest photography for real people — no big productions, no forced smiles.'
  },
  {
    eyebrow: 'Real Moments · Real Life',
    heading: 'Made for\nyour\neveryday.',
    body: "No big productions, no forced smiles — just honest images of the life you're actually living."
  }
];
