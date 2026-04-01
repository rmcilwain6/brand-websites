export type ArchiveItem = {
  src: string;
  alt: string;
  aspect: '3/2' | '3/4';
  caption: string;
  credit: string;
  creditHref?: string;
  meta: [string, string];
  metaPosition?: 'top-right';
  metaDark?: boolean;
};

export const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    src: '/images/about/about-page-1.webp',
    alt: '',
    aspect: '3/2',
    caption: 'Capturing Pride 2024 for my company.',
    credit: 'Photo by Arnav Verma',
    meta: ['Victoria Pride Parade', 'Jul 2024'],
    metaDark: true
  },
  {
    src: '/images/about/about-page-2.webp',
    alt: '',
    aspect: '3/4',
    caption: 'A photo hike to one of the best spots on the Island.',
    credit: 'Photo by Lena Mutafov',
    meta: ['East Sooke Park', 'Oct 2019']
  },
  {
    src: '/images/about/about-page-4.webp',
    alt: '',
    aspect: '3/4',
    caption: 'A Montréal trip amidst some very big changes.',
    credit: 'Photo by Annika Kiss',
    meta: ['Montréal, QC', 'Nov 2024']
  },
  {
    src: '/images/about/about-page-5.webp',
    alt: '',
    aspect: '3/2',
    caption:
      'A family trip to Tofino: magical, nostalgic, and where I fell in love with yellow rain jackets.',
    credit: 'Photo taken by Paige McIlwain',
    meta: ['Cox Bay, Tofino', 'Oct 2019'],
    metaDark: true
  },
  {
    src: '/images/about/about-page-3.webp',
    alt: '',
    aspect: '3/2',
    caption:
      'The trip to Hawaii where I photographed my first wedding (along with every plant, bird, lizard, etc.)',
    credit: 'Photo taken by Rylie Ferguson',
    meta: ["Waimea Valley, O'ahu", 'Aug 2022']
  },
  {
    src: '/images/about/about-page-19.webp',
    alt: '',
    aspect: '3/4',
    caption: 'The place I grew up.',
    credit: 'Photo taken by Carolyn Dahl',
    meta: ['Kamloops, BC', 'Jan 2026'],
    metaPosition: 'top-right'
  },
  {
    src: '/images/about/about-page-16.webp',
    alt: '',
    aspect: '3/4',
    caption: 'Backpacking the Maritimes, starting in Québec.',
    credit: 'Photo taken by Carolyn Dahl',
    meta: ['Québec, QC', 'Aug 2025']
  },
  {
    src: '/images/about/about-page-14.webp',
    alt: '',
    aspect: '3/2',
    caption: 'Learning how to use a new flash mount with a friend in Fernwood.',
    credit: 'Photo taken by Lena Mutafov',
    meta: ['Victoria, BC', 'Oct 2020']
  }
];
