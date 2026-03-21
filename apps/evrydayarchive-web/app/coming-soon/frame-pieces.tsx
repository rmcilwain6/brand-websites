// Shared pieces used by both the mobile layout (page.tsx) and the responsive
// desktop gallery row (gallery-row.tsx).

export const FrameInterior = ({
  number: _,
  catalogRef
}: {
  number: string;
  catalogRef?: string;
}) => (
  <div className="relative h-full w-full overflow-hidden bg-sun">
    {catalogRef && (
      <span aria-hidden className="absolute bottom-1.5 left-1.5 opacity-[0.18]">
        <span className="block whitespace-nowrap font-mono text-[6px] font-bold uppercase tracking-[0.2em] text-ink-muted">
          {catalogRef}
        </span>
      </span>
    )}
  </div>
);

export const FrameLabel = ({ number, title }: { number: string; title: string }) => (
  <div className="border-l-2 border-accent pl-3">
    <span className="mb-[3px] block text-[9px] uppercase tracking-[0.1em] text-ink-faint">
      No. {number} — Coming Soon
    </span>
    <span className="block text-[10px] lowercase tracking-[0.06em] text-ink-muted">{title}</span>
  </div>
);
