type GalleryReview = {
  id: string;
  clientName: string;
  quote: string;
  sessionType: string | null;
};

type GalleryReviewsProps = {
  reviews: GalleryReview[];
};

export const GalleryReviews = ({ reviews }: GalleryReviewsProps) => {
  if (!reviews.length) return null;

  return (
    <section className="mt-20 border-t border-border pt-16">
      <div className="mb-10">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-ink-faint">
          From this session
        </p>
        <h2 className="text-xl font-semibold text-ink">
          {reviews.length === 1 ? 'A word from the client' : 'Words from the clients'}
        </h2>
      </div>

      <div className="space-y-8">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-[4px] border border-border bg-sun p-6">
            <div
              aria-hidden
              className="mb-3 select-none font-serif text-4xl leading-none text-accent"
            >
              &ldquo;
            </div>
            <blockquote>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-muted">
                {review.quote}
              </p>
            </blockquote>
            <footer className="mt-4">
              <p className="text-sm font-semibold text-ink">{review.clientName}</p>
              {review.sessionType && <p className="text-xs text-ink-faint">{review.sessionType}</p>}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
};
