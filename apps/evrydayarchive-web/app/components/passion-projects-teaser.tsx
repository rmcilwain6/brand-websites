import { Newsreader } from 'next/font/google';
import Link from 'next/link';

import { cn } from '../lib/cn';
import { TeaserArch } from '../passion-projects/_components/teaser-arch';
import { TEASERS } from '../passion-projects/teasers';

// The campaign face. The rest of the site doesn't use it, so it's loaded for this block only.
const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap'
});

/** The home block shows three of the coming-soon arches (photos and questions in `teasers.ts`). */
const HOME_TEASERS = TEASERS.slice(0, 3);

const tabCls =
  'flex items-center rounded-t-[12px] px-3.5 font-mono text-[10px] uppercase tracking-[0.16em] sm:rounded-t-[14px] sm:px-5 sm:text-[11px]';

/**
 * The home page's way in to Passion Projects, set in a file folder: a "Winter 2026" tab on a cream
 * folder, with the next season's tab behind it. Inside, the invitation and three frosted arches
 * for the features that haven't been unveiled yet. The hover effects live in globals.css
 * (`.pp-folder`, `.pp-teaser`).
 *
 * Stacked as intro → arches → question until `xl`, where the text moves into a column beside the
 * arches (any earlier and the arches get too narrow). Phones scroll the arches sideways; from `md`
 * all three fit in a row.
 */
export const PassionProjectsTeaser = () => (
  <section
    aria-labelledby="passion-projects-teaser-heading"
    className={cn(newsreader.variable, 'px-3 py-20 sm:px-6 lg:px-8')}
  >
    <div className="pp-folder mx-auto max-w-7xl">
      {/* Tabs. Only the current season is announced; the others are decoration. */}
      <div className="flex items-end">
        <p
          className={cn(
            tabCls,
            'relative z-10 h-[34px] gap-2 bg-sun font-bold text-accent-text sm:h-10 sm:gap-2.5'
          )}
        >
          <span
            aria-hidden="true"
            className="h-[7px] w-[7px] rounded-full bg-accent sm:h-2 sm:w-2"
          />
          Winter 2026
          {/* Curves the tab's foot into the folder, like the filing cabinet's tabs. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3 rounded-bl-[12px] sm:-right-3.5 sm:h-3.5 sm:w-3.5 sm:rounded-bl-[14px]"
            style={{ boxShadow: '-7px 7px 0 0 var(--color-sun)' }}
          />
        </p>
        <span
          aria-hidden="true"
          className={cn(tabCls, 'h-7 bg-mat-deep font-medium text-ink-faint sm:h-[34px]')}
        >
          Spring 2027
        </span>
      </div>

      <div className="rounded-b-2xl rounded-tr-2xl bg-sun px-5 py-10 sm:px-10 lg:py-[72px] xl:px-14">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-y-4 [grid-template-areas:'intro'_'arches'_'ask'] lg:gap-y-[18px] xl:max-w-none xl:grid-cols-[400px_minmax(0,1fr)] xl:grid-rows-[1fr_auto_auto_1fr] xl:gap-x-14 xl:[grid-template-areas:'._arches'_'intro_arches'_'ask_arches'_'._arches'] 2xl:gap-x-[72px]">
          <div className="flex max-w-xl flex-col gap-4 [grid-area:intro] lg:gap-[18px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-text">
              Introducing Passion Projects
            </p>
            <h2
              id="passion-projects-teaser-heading"
              className="font-campaign text-4xl font-normal leading-none tracking-[-0.02em] text-ink min-[360px]:text-[40px] lg:text-5xl lg:leading-none"
            >
              I need your help.
            </h2>
            <p className="text-base leading-[1.65] text-ink-muted">
              Somewhere close by, someone is putting years into a craft, a project, or a business
              they love. They deserve to have their story told.
            </p>
          </div>

          <ul
            aria-label="Features coming this winter"
            className="-mr-5 my-2 flex snap-x snap-mandatory gap-3.5 overflow-x-auto pr-5 pt-1 scrollbar-none [grid-area:arches] sm:-mr-10 sm:pr-10 md:mr-0 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:pr-0 lg:my-4 xl:my-0 xl:self-center"
          >
            {HOME_TEASERS.map((teaser, i) => (
              <li
                key={teaser.name}
                className="pp-teaser flex w-[200px] flex-none snap-start flex-col md:w-auto"
              >
                <TeaserArch
                  teaser={teaser}
                  number={i + 1}
                  sizes="(min-width: 768px) 240px, 200px"
                />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 [grid-area:ask] md:items-start">
            <p className="font-campaign text-2xl leading-[1.2] text-ink">
              Who would you put in the spotlight?
            </p>
            <Link
              href="/passion-projects"
              className="mt-1 rounded-card bg-accent px-6 py-3.5 text-center text-[15px] font-semibold text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:py-3 lg:text-sm lg:font-medium"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
