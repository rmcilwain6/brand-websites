import Image from './img';

type GalleryReview = {
  id: string;
  clientName: string;
  quote: string;
  sessionType: string | null;
  image: { src: string; alt: string; width: number | null; height: number | null } | null;
};

type GalleryReviewsProps = {
  reviews: GalleryReview[];
};

/**
 * Reviews section shown at the bottom of a gallery detail page.
 * Desktop: side-by-side photo + quote cards.
 * Mobile: stacked cards (image as header, quote below).
 */
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
          <article
            key={review.id}
            className="grid grid-cols-1 gap-6 rounded-[4px] border border-border bg-sun p-6 sm:grid-cols-[160px_1fr]"
          >
            {/* Mobile: image spans full width above quote */}
            {/* Desktop: image is a fixed-width left column */}
            {review.image ? (
              review.image.width && review.image.height ? (
                <div className="w-full overflow-hidden rounded-[3px] border border-border/40 shadow-warm-sm sm:w-[160px]">
                  <Image
                    src={review.image.src}
                    alt={review.image.alt}
                    width={review.image.width}
                    height={review.image.height}
                    className="h-auto w-full"
                    sizes="(min-width: 640px) 160px, 100vw"
                  />
                </div>
              ) : (
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[3px] border border-border/40 shadow-warm-sm sm:aspect-[2/3] sm:w-[160px]">
                  <Image
                    src={review.image.src}
                    alt={review.image.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 160px, 100vw"
                  />
                </div>
              )
            ) : (
              /* Reserve the column even without an image so quotes align consistently */
              <div className="hidden sm:block" />
            )}

            <div className="flex flex-col justify-center">
              <div
                aria-hidden
                className="mb-3 select-none font-serif text-4xl leading-none text-ink-faint"
              >
                &ldquo;
              </div>
              <blockquote>
                <p className="text-base leading-relaxed text-ink-muted">{review.quote}</p>
              </blockquote>
              <footer className="mt-4">
                <p className="text-sm font-semibold text-ink">{review.clientName}</p>
                {review.sessionType && (
                  <p className="text-xs text-ink-faint">{review.sessionType}</p>
                )}
              </footer>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
