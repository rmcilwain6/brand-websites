import { ScrollLink } from './scroll-link';

const buttonCls =
  'flex h-[52px] items-center justify-center rounded-card px-[22px] text-[15px] transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-12';

/** The locked core statement from the campaign brief. Check any change against the brief. */
export const HeroText = () => (
  <div className="flex flex-col gap-[22px] lg:gap-5">
    <h1 className="font-campaign text-[42px] font-normal leading-none tracking-[-0.02em] text-ink lg:text-[clamp(48px,4.2vw,60px)]">
      I need your help.
    </h1>
    <p className="text-base leading-[1.65] text-ink-muted">
      Somewhere close by, someone is putting years into a craft, a project, or a business they love.
      They deserve to have their story told, in photographs and in their own words, even if
      they&apos;re too busy doing the thing to ask.
    </p>
    <p className="font-campaign text-[24px] leading-tight text-ink">
      Who would you put in the spotlight?
    </p>
    <div className="mt-1 flex flex-col gap-2.5 xl:flex-row xl:gap-3">
      <ScrollLink to="apply" className={`${buttonCls} bg-accent font-semibold text-white`}>
        Apply to be featured
      </ScrollLink>
      <ScrollLink
        to="refer"
        className={`${buttonCls} border border-border font-medium text-ink hover:border-ink-muted`}
      >
        Send someone my way
      </ScrollLink>
    </div>
  </div>
);
