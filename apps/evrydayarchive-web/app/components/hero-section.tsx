import { MobileHero } from './mobile-hero';
import { RollingHeroFixedText } from './rolling-hero-fixed-text';

export const HeroSection = () => (
  <>
    {/* Desktop (lg+): fixed-text rolling hero */}
    <div className="hidden lg:block">
      <RollingHeroFixedText />
    </div>

    {/* Mobile / tablet: stacked hero with cycling text */}
    <div className="lg:hidden">
      <MobileHero />
    </div>
  </>
);
