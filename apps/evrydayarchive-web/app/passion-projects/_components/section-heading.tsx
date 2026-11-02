import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** A short mono label above the heading, e.g. "Apply". */
  eyebrow?: string;
  /** A sentence or two under the heading. */
  description?: ReactNode;
  as?: 'h2' | 'h3';
  id?: string;
};

/** A campaign section's heading, in Newsreader. */
export const SectionHeading = ({ children, eyebrow, description, as: Tag = 'h2', id }: Props) => (
  <div className="flex flex-col gap-3.5">
    {eyebrow && (
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-text">{eyebrow}</p>
    )}
    <Tag
      id={id}
      className="font-campaign text-[34px] font-normal leading-[1.05] text-ink lg:text-[42px]"
    >
      {children}
    </Tag>
    {description && <p className="text-[15px] leading-relaxed text-ink-soft">{description}</p>}
  </div>
);
