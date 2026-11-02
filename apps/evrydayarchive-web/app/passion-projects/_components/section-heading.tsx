import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** A sentence or two under the heading. */
  description?: ReactNode;
  as?: 'h2' | 'h3';
  id?: string;
};

/** A campaign section's heading, in Newsreader. */
export const SectionHeading = ({ children, description, as: Tag = 'h2', id }: Props) => (
  <div className="flex flex-col gap-3.5">
    <Tag
      id={id}
      className="font-campaign text-[34px] font-normal leading-[1.05] text-ink lg:text-[42px]"
    >
      {children}
    </Tag>
    {description && <p className="text-[15px] leading-relaxed text-ink-soft">{description}</p>}
  </div>
);
