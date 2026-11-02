/**
 * The salon wall: past work only. Each slot has a shape from the wall plan on the Notion landing
 * page task, and the photos are the home page's until the real picks are exported. Portrait slots
 * need portrait photos and landscape slots need landscape ones.
 *
 * Spans are columns × rows: 12 columns on desktop and 6 on phones. `phone: null` is desktop only.
 */

export type WallSlot = {
  /** The number on the frame. */
  number: string;
  src: string;
  alt: string;
  title: string;
  /** "Place · Mon YYYY". Left off when it isn't known. */
  subtitle?: string;
  desktop: [columns: number, rows: number];
  phone: [columns: number, rows: number] | null;
};

const IMAGES = '/images/top-brand-images';

export const WALL: WallSlot[] = [
  {
    number: '01',
    src: `${IMAGES}/jess&the-yota-10.webp`,
    alt: 'A teal 4Runner on a hillside with the driver waving out of the window',
    title: 'Jess & The Yota',
    subtitle: 'Kamloops · Jan 2026',
    desktop: [3, 9],
    phone: [3, 7]
  },
  {
    number: '02',
    src: `${IMAGES}/julia-08.webp`,
    alt: 'Someone holding a tabby cat close on a couch',
    title: 'Julia & Benjamin',
    subtitle: 'Nanaimo · Jan 2026',
    desktop: [2, 7],
    phone: [2, 6]
  },
  {
    number: '03',
    src: `${IMAGES}/science-of-wine-2026-22.webp`,
    alt: 'Sparkling wine being poured into a glass',
    title: 'Science of Wine',
    subtitle: 'Kamloops · Mar 2026',
    desktop: [2, 5],
    phone: [2, 5]
  },
  {
    number: '04',
    src: `${IMAGES}/drews-pokemon-camp-06.webp`,
    alt: 'A man and a boy playing a card game at a table in a shop',
    title: 'Pokémon Camp',
    subtitle: 'Victoria · Mar 2026',
    desktop: [4, 6],
    phone: [6, 6]
  },
  {
    number: '05',
    src: `${IMAGES}/vv-2025-alumni-game-26.webp`,
    alt: 'Two basketball players jumping for the tip-off in a gym',
    title: 'Valleyview Alumni Game',
    subtitle: 'Kamloops · Dec 2025',
    desktop: [2, 6],
    phone: [2, 5]
  },
  {
    number: '06',
    src: `${IMAGES}/nikki&nicole-jan15-03.webp`,
    alt: 'Someone smiling in front of a brick wall',
    title: 'Nicole',
    subtitle: 'Victoria · Jan 2026',
    desktop: [3, 4],
    phone: [4, 4]
  },
  {
    number: '07',
    src: `${IMAGES}/urec-finishedimages-14.webp`,
    alt: 'Someone smiling outdoors with their arms crossed',
    title: 'Josue',
    subtitle: 'UVic · Feb 2026',
    desktop: [2, 6],
    phone: [2, 6]
  },
  {
    number: '08',
    src: `${IMAGES}/angus-1.webp`,
    alt: 'A blue rally car kicking up snow on a forest road as two people watch',
    title: 'Big White Winter Rally',
    desktop: [3, 4],
    phone: [4, 4]
  },
  {
    number: '09',
    src: `${IMAGES}/pinot.webp`,
    alt: 'A tabby cat peeking out of a knit blanket',
    title: 'Pinot',
    subtitle: 'Victoria · Feb 2026',
    desktop: [2, 4],
    phone: [3, 5]
  },
  {
    number: '10',
    src: `${IMAGES}/nikki&nicole-jan15-08.webp`,
    alt: 'Someone in a black coat standing in a laneway',
    title: 'Nikki',
    subtitle: 'Victoria · Jan 2026',
    desktop: [2, 6],
    phone: [3, 7]
  },
  {
    number: '11',
    src: `${IMAGES}/science-of-wine-2026-35.webp`,
    alt: 'A presenter speaking to guests seated around wine glasses',
    title: 'Science of Wine',
    subtitle: 'Kamloops · Mar 2026',
    desktop: [3, 4],
    phone: [3, 3]
  },
  {
    number: '12',
    src: `${IMAGES}/urec-finishedimages-20.webp`,
    alt: 'A portrait of someone with curly hair in a pink shirt',
    title: 'Ruben',
    subtitle: 'UVic · Feb 2026',
    desktop: [2, 5],
    phone: [2, 5]
  },
  {
    number: '13',
    src: `${IMAGES}/kate&carter-wildlights-20.webp`,
    alt: 'Two people sitting on a bench under holiday lights',
    title: 'Kate & Carter',
    subtitle: 'Kamloops · Dec 2025',
    desktop: [3, 4],
    phone: [4, 4]
  },
  {
    number: '14',
    src: `${IMAGES}/vv-2025-alumni-game-07.webp`,
    alt: 'Basketball players under a gym scoreboard',
    title: 'Valleyview Alumni Game',
    subtitle: 'Kamloops · Dec 2025',
    desktop: [2, 6],
    phone: null
  },
  {
    number: '15',
    src: `${IMAGES}/drews-pokemon-camp-02.webp`,
    alt: 'A kid in a pink cap holding a hand of Pokémon cards',
    title: 'Pokémon Camp',
    subtitle: 'Victoria · Mar 2026',
    desktop: [2, 5],
    phone: null
  },
  {
    number: '16',
    src: `${IMAGES}/jess&the-yota-12.webp`,
    alt: 'A 4Runner kicking up dust on a dry hillside',
    title: 'Jess & The Yota',
    subtitle: 'Kamloops · Jan 2026',
    desktop: [4, 4],
    phone: null
  },
  {
    number: '17',
    src: `${IMAGES}/science-of-wine-2026-9.webp`,
    alt: 'Two people tasting rosé',
    title: 'Science of Wine',
    subtitle: 'Kamloops · Mar 2026',
    desktop: [3, 4],
    phone: null
  }
];
