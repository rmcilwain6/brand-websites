import type { ReactNode } from 'react';

type Props = {
  /** The main ask, or a pull quote. */
  heading: ReactNode;
  /** `h2` for an ask. Use `blockquote` for a quote, so it isn't announced as a section. */
  headingAs?: 'h2' | 'blockquote';
  /** Supporting copy or a button, beside the heading on desktop and under it on phones. */
  children?: ReactNode;
  id?: string;
};

/**
 * The one "say something or do something" moment on a page: full width, brand orange and dark
 * Newsreader, in light and dark mode alike. Use one per page.
 */
export const OrangeBand = ({ heading, headingAs: Heading = 'h2', children, id }: Props) => (
  <section
    id={id}
    className="grid scroll-mt-24 gap-5 bg-accent px-6 py-10 text-[#1b1a19] lg:grid-cols-[1fr_380px] lg:items-center lg:gap-16 lg:px-20 lg:py-14"
  >
    <Heading className="font-campaign text-[28px] font-normal leading-[1.1] tracking-[-0.01em] lg:text-[40px]">
      {heading}
    </Heading>
    {children && <div className="flex flex-col gap-[18px]">{children}</div>}
  </section>
);
