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
    eyebrow: 'Kamloops · Victoria · Vancouver',
    heading: 'Your everyday life\nis worth documenting.',
    body: "Most people wait for a milestone. You don't have to. Sessions shaped around who you actually are, right now."
  },
  {
    eyebrow: 'Accessible · Transparent',
    heading: 'Build a session\naround your budget',
    body: 'Start with a package and make it yours. Adjust the session length, image count, and more — pricing updates as you go'
  },
  {
    eyebrow: 'No experience needed',
    heading: 'Made for first timers\nand the curious.',
    body: "Sessions are relaxed and there's no wrong way to show up. Just bring yourself."
  }
];
