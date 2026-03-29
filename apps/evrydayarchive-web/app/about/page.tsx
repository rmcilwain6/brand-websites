import Image from 'next/image';
import Link from 'next/link';

import { Frame } from '../components/frame';
import { AboutDivider } from './about-divider';
import { ArchiveCarousel } from './archive-carousel';
import { HowItWorks } from './how-it-works';
import { PhotoCredit } from './photo-credit';

export default function AboutPage() {
  return (
    <main className="bg-canvas">
      <h1 className="sr-only">About Reed — Evryday Archive Co</h1>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE LAYOUT — hidden on md and above
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* ── Opening ────────────────────────────────────────────────── */}
        <section className="px-6 py-9">
          <p className="mb-5 text-[10px] uppercase tracking-[0.14em] text-[#a09a8e] dark:text-ink-faint">
            About
          </p>
          <p className="text-[22px] leading-[1.45] text-[#2b2b2b] dark:text-ink">
            Most people book a photographer a handful of days in their whole life. A wedding. A
            graduation. Maybe an engagement. That&apos;s{' '}
            <span className="text-accent">a lot of life left undocumented.</span>
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-[#5a5450] dark:text-ink-muted">
            I started Evryday Archive Co because I think the everyday is worth just as much.
          </p>
        </section>

        {/* ── Reed — full-bleed portrait ─────────────────────────────── */}
        <div className="relative aspect-[3/4] w-full">
          <Image
            src="/images/about/about-page-17.webp"
            alt="Reed in the field, Kamloops BC"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-3 left-3">
            <PhotoCredit credit="Photo taken by Carolyn Dahl" />
          </div>
          <div className="absolute bottom-3 right-3 text-right">
            <p className="font-mono text-[9px] text-[#b0a898]">Kamloops, BC</p>
            <p className="font-mono text-[9px] text-[#b0a898]">Jan 2026</p>
          </div>
        </div>

        <AboutDivider />

        {/* ── Photographer ───────────────────────────────────────────── */}
        <section className="px-6">
          <p className="mb-5 text-[10px] uppercase tracking-[0.14em] text-[#a09a8e] dark:text-ink-faint">
            The Photographer: Reed McIlwain
          </p>
          <div className="space-y-4 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <p>
              I love taking photos, regardless of the subject. On any given day you might find me
              shooting street photography, landscapes, portraits of friends and family, macro
              photography, sports, events — you name it, I&apos;m thrilled at the idea of capturing
              it.
            </p>
            <p>
              Since I was young I&apos;ve always had a camera within reach, with an instinct to
              document my surroundings. Over time that&apos;s meant I&apos;ve built up a collection
              of images that truly tell the story of my life, one frame at a time. I call it the
              archive and it&apos;s my most prized possession. Photography isn&apos;t just a hobby
              or a skill — it&apos;s the lens I see the world with, and I&apos;m excited to share
              that.
            </p>
            <p>
              I left a full time career in software development in 2025 and found something worth
              building in the space that opened up. A mission of helping others build a catalog of
              what their real life actually looks like. Not just the big moments, but the little
              bits that truly fill out what it means to live a rich life.
            </p>
          </div>
        </section>

        {/* ── Second Reed image — full-bleed, flows directly from text ── */}
        <div className="relative mt-7 aspect-[3/2] w-full">
          <Image
            src="/images/about/about-page-10.webp"
            alt="Reed, Kamloops BC"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-3 left-3">
            <PhotoCredit
              credit="Photo by Angus Tsang"
              href="https://www.instagram.com/beef_angus/"
            />
          </div>
          <div className="absolute bottom-3 right-3 text-right">
            <p className="font-mono text-[9px] text-[#b0a898]">Big White Winter Rally</p>
            <p className="font-mono text-[9px] text-[#b0a898]">Dec 2025</p>
          </div>
        </div>

        {/* ── Where I'm from ─────────────────────────────────────────── */}
        <section className="px-6 py-7">
          <div className="space-y-4 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <p>
              I grew up in Kamloops, left for Victoria at 18 and spent almost a decade falling in
              love with the beauty of the city and Vancouver Island. I&apos;ve recently returned to
              Kamloops, but I&apos;ve picked up a love for the nomadic lifestyle along the way.
            </p>
            <p>
              Now I split my time between Kamloops and the Island and the camera comes with me
              everywhere I go. This means that no matter where you are, I&apos;d love an excuse to
              come visit.
            </p>
          </div>
        </section>

        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/images/about/about-page-15.webp"
            alt="Victoria, BC, Sep 2023"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute bottom-3 left-3">
            <PhotoCredit credit="Photo taken by Emma Tarasoff" />
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <p className="font-mono text-[9px] text-[#2b2b2b]">Victoria, BC · Sep 2023</p>
          </div>
        </div>

        <AboutDivider />

        {/* ── Archive ────────────────────────────────────────────────── */}
        <section className="">
          <p className="mb-7 px-6 text-[10px] uppercase tracking-[0.14em] text-[#a09a8e] dark:text-ink-faint">
            A glimpse into my Archive
          </p>

          {/* 1 — full-bleed */}
          <div className="relative aspect-[3/2] w-full">
            <Image
              src="/images/about/about-page-1.webp"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-3 left-3">
              <PhotoCredit credit="Photo by Arnav Verma" />
            </div>
            <div className="absolute bottom-3 right-3 text-right">
              <p className="font-mono text-[9px] text-[#2b2b2b]">Victoria Pride Parade</p>
              <p className="font-mono text-[9px] text-[#2b2b2b]">Jul 2024</p>
            </div>
          </div>
          <p className="mt-3 px-6 font-mono text-[11px] italic text-[#9a9088] dark:text-ink-faint">
            Capturing Pride 2024 for my company.
          </p>

          {/* 2 — two-col, right offset +32px */}
          <div className="mt-7 grid grid-cols-2 gap-[10px] px-6">
            <div>
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src="/images/about/about-page-2.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute bottom-3 left-3">
                  <PhotoCredit credit="Photo by Lena Mutafov" />
                </div>
                <div className="absolute bottom-3 right-3 text-right">
                  <p className="font-mono text-[9px] text-[#b0a898]">East Sooke Park</p>
                  <p className="font-mono text-[9px] text-[#b0a898]">Oct 2019</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-[10px] italic text-[#9a9088] dark:text-ink-faint">
                A photo hike to one of the best spots on the Island.
              </p>
            </div>
            <div className="mt-8">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src="/images/about/about-page-4.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute bottom-3 left-3">
                  <PhotoCredit credit="Photo by Annika Kiss" />
                </div>
                <div className="absolute bottom-3 right-3 text-right">
                  <p className="font-mono text-[9px] text-[#b0a898]">Montréal, QC</p>
                  <p className="font-mono text-[9px] text-[#b0a898]">Nov 2024</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-[10px] italic text-[#9a9088] dark:text-ink-faint">
                A Montréal trip amidst some very big changes.
              </p>
            </div>
          </div>

          {/* 3 — full-bleed */}
          <div className="relative mt-7 aspect-[3/2] w-full">
            <Image
              src="/images/about/about-page-5.webp"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-3 left-3">
              <PhotoCredit credit="Photo taken by Paige McIlwain" />
            </div>
            <div className="absolute bottom-3 right-3 text-right">
              <p className="font-mono text-[9px] text-[#2b2b2b]">Cox Bay, Tofino</p>
              <p className="font-mono text-[9px] text-[#2b2b2b]">Oct 2019</p>
            </div>
          </div>
          <p className="mt-3 px-6 font-mono text-[11px] italic text-[#9a9088] dark:text-ink-faint">
            A family trip to Tofino: magical, nostalgic, and where I fell in love with yellow rain
            jackets.
          </p>

          {/* 4 — landscape full-bleed */}
          <div className="relative mt-7 aspect-[3/2] w-full">
            <Image
              src="/images/about/about-page-3.webp"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-3 left-3">
              <PhotoCredit credit="Photo taken by Rylie Ferguson" />
            </div>
            <div className="absolute bottom-3 right-3 text-right">
              <p className="font-mono text-[9px] text-[#b0a898]">Waimea Valley, O&apos;ahu</p>
              <p className="font-mono text-[9px] text-[#b0a898]">Aug 2022</p>
            </div>
          </div>
          <p className="mt-3 px-6 font-mono text-[11px] italic text-[#9a9088] dark:text-ink-faint">
            The trip to Hawaii where I photographed my first wedding (along with every plant, bird,
            lizard, etc.)
          </p>

          {/* 5 — two-col, left offset -16px */}
          <div className="mt-7 grid grid-cols-2 gap-[10px] px-6">
            <div className="-mt-4">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src="/images/about/about-page-19.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute bottom-3 left-3">
                  <PhotoCredit credit="Photo taken by Carolyn Dahl" />
                </div>
                <div className="absolute top-3 right-3 text-right">
                  <p className="font-mono text-[9px] text-[#b0a898]">Kamloops, BC</p>
                  <p className="font-mono text-[9px] text-[#b0a898]">Jan 2026</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-[10px] italic text-[#9a9088] dark:text-ink-faint">
                The place I grew up.
              </p>
            </div>
            <div>
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src="/images/about/about-page-16.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute bottom-3 left-3">
                  <PhotoCredit credit="Photo taken by Carolyn Dahl" />
                </div>
                <div className="absolute bottom-3 right-3 text-right">
                  <p className="font-mono text-[9px] text-[#b0a898]">Québec, QC</p>
                  <p className="font-mono text-[9px] text-[#b0a898]">Aug 2025</p>
                </div>
              </div>
              <p className="mt-2 font-mono text-[10px] italic text-[#9a9088] dark:text-ink-faint">
                Backpacking the Maritimes, starting in Québec.
              </p>
            </div>
          </div>
          {/* 6 — landscape full-bleed */}
          <div className="relative mt-7 aspect-[3/2] w-full">
            <Image
              src="/images/about/about-page-14.webp"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-3 left-3">
              <PhotoCredit credit="Photo taken by Lena Mutafov" />
            </div>
            <div className="absolute bottom-3 right-3 text-right">
                  <p className="font-mono text-[9px] text-[#b0a898]">Victoria, BC</p>
                  <p className="font-mono text-[9px] text-[#b0a898]">Oct 2020</p>
                </div>
          </div>
          <p className="mt-3 px-6 font-mono text-[11px] italic text-[#9a9088] dark:text-ink-faint">Learning how to use a new flash mount with a friend in Fernwood.</p>
        </section>

        <AboutDivider />

        {/* ── Why this exists ────────────────────────────────────────── */}
        <section className="px-6">
          <p className="mb-5 text-[10px] uppercase tracking-[0.14em] text-[#a09a8e] dark:text-ink-faint">
            Why this exists
          </p>
          <div className="space-y-4 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <p>
              Two things kept coming up when I started asking why people only book photographers for the big occasions.
            </p>
            <p>
              The first is that everyday moments don&apos;t feel significant while you&apos;re in them. The
              people you saw every week, the places you passed through, the version of yourself you
              were before things shifted — none of it announces its own importance. You only find
              out what it was worth when you can&apos;t get it back.
            </p>
            <p>
              The other is price. Photography feels expensive, and expensive things get saved for
              special days. Which just confirms the first problem.
            </p>
            <p>
              Evryday Archive Co exists to do something about both of those things. Accessible
              pricing so that booking a session can always feel within reach. And a genuine belief
              that the ordinary parts of your life are worth just as much attention as the
              extraordinary ones.
            </p>
          </div>
          <div className="relative -mx-6 mt-7 aspect-[3/2] w-[calc(100%+3rem)]">
            <Image
              src="/images/about/about-page-18.webp"
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-3 left-3">
              <PhotoCredit credit="Photo taken by Carolyn Dahl" />
            </div>
            <div className="absolute bottom-3 right-3 text-right">
              <p className="font-mono text-[9px] text-[#2b2b2b]">Kamloops, BC</p>
              <p className="font-mono text-[9px] text-[#2b2b2b]">Jan 2026</p>
            </div>
          </div>
        </section>

        <AboutDivider />

        {/* ── Close ──────────────────────────────────────────────────── */}
        <section className="px-6 text-center">
          <div className="space-y-6 text-sm leading-[1.75] text-[#4a4540] dark:text-ink-muted">
            <p>
              Sessions are built around what matters to you. Your job, your hobby, your people, your
              pet, the thing you do every weekend that nobody has ever thought to photograph. If it
              lights you up, I want to shoot it.
            </p>
            <p>
              I&apos;m always up for something creative, and I&apos;d rather make something
              genuinely good together than tick a box.
            </p>
          </div>
          <p className="mt-4 text-[12px] text-[#8a8078] dark:text-ink-faint">
            If you&apos;ve been thinking about it, reach out. No commitment in asking.
          </p>
          <div className="mt-6">
            <Link
              href="/inquire"
              className="block w-full rounded bg-accent py-3 text-[13px] font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Get in touch
            </Link>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT — hidden below md
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* ── Section 1: The Observation ───────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="mb-10 text-xs font-medium uppercase tracking-widest text-ink-faint">
              About
            </p>
            <div className="space-y-6">
              <p className="text-xl leading-relaxed text-ink sm:text-2xl">
                Most people book a photographer for a handful of days in their whole life. A
                wedding. A graduation. Maybe an engagement. That&apos;s{' '}
                <span className="text-accent">a lot of life left undocumented.</span>
              </p>
              <p className="text-xl leading-relaxed text-ink sm:text-2xl">
                I started Evryday Archive Co because I think the everyday is worth just as much.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 2: Who I Am as a Photographer ────────────────────── */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
              <div className="space-y-5">
                <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
                  The photographer
                </p>
                <div className="space-y-4">
                  <p className="text-base leading-relaxed text-ink-muted">
                    I shoot portraits and I shoot sports. I shoot events and street and animals and
                    the inside of a room when the light is doing something interesting. I&apos;ve
                    been the party photographer and the travel photographer and the guy who just
                    always has something nearby to capture with.
                  </p>
                  <p className="text-base leading-relaxed text-ink-muted">
                    The throughline has never been a subject. It&apos;s the instinct to document. To
                    say: this is what now looks like. A photo is a gift you leave for your future
                    self, with no idea yet of where you&apos;ll be when you find it.
                  </p>
                  <p className="text-base leading-relaxed text-ink-muted">
                    I left a career in software development because I wanted to spend more of my
                    life doing things that actually light me up. Photography has always been one of
                    those things. This is me taking that seriously.
                  </p>
                </div>
              </div>

              <div className="lg:sticky lg:top-24">
                <Frame variant="gallery" mat="md" matStyle="linen">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/images/about/about-page-17.webp"
                      alt="Reed in the field, Kamloops BC"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 40vw, 50vw"
                    />
                    <div className="absolute bottom-2 left-2">
                      <PhotoCredit credit="Photo taken by Carolyn Dahl" />
                    </div>
                    <div className="absolute bottom-2 right-2 text-right">
                      <p className="font-mono text-[9px] text-ink-faint">Kamloops, BC</p>
                      <p className="font-mono text-[9px] text-ink-faint">Jan 2026</p>
                    </div>
                  </div>
                </Frame>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2b: Where I'm from ───────────────────────────────── */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
              <div className="space-y-4">
                <p className="text-base leading-relaxed text-ink-muted">
                  I grew up in Kamloops. Left for Victoria at eighteen and spent nine years there.
                  Came back recently, but not to stay put.
                </p>
                <p className="text-base leading-relaxed text-ink-muted">
                  I split my time between Kamloops and the island, and I travel whenever I get the
                  chance. The camera comes on all of it. If you&apos;re in either place — or
                  somewhere else entirely — there&apos;s a good chance I&apos;m nearby or passing
                  through.
                </p>
              </div>

              <div className="lg:sticky lg:top-24">
                <Frame variant="gallery" mat="md" matStyle="linen">
                  <div className="relative aspect-[4/3] w-full bg-mat-linen">
                    <div className="flex h-full items-center justify-center">
                      <span className="font-mono text-xs text-ink-faint">Kamloops, BC</span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-canvas/70 px-1.5 py-0.5 font-mono text-[9px] text-ink-faint backdrop-blur-sm">
                        Kamloops, BC · 2024
                      </span>
                    </div>
                  </div>
                </Frame>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: The Archive ────────────────────────────────────── */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="mb-10 text-xs font-medium uppercase tracking-widest text-ink-faint">
              The personal archive
            </p>
            <ArchiveCarousel />
          </div>
        </section>

        {/* ── Section 4: Why This Exists + Section 5: How It Works ──────── */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-ink-muted">
                When I started looking at why people only book photographers for the big occasions,
                two things kept coming up.
              </p>
              <p className="text-base leading-relaxed text-ink-muted">
                One is that nobody&apos;s told them their everyday life deserves it. Milestones feel
                justified. The rest of it doesn&apos;t. That&apos;s something worth pushing back on.
              </p>
              <p className="text-base leading-relaxed text-ink-muted">
                The other is price. Photography feels expensive, and expensive things get saved for
                special days. Which just confirms the first problem.
              </p>
              <p className="text-base leading-relaxed text-ink-muted">
                Evryday Archive Co exists to do something about both of those things. Accessible
                pricing so that booking a session can always feel within reach. And a genuine belief
                that the ordinary parts of your life are worth just as much attention as the
                extraordinary ones.
              </p>
            </div>
            <HowItWorks />
          </div>
        </section>

        {/* ── Section 7: The Invitation ─────────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-ink-muted">
                Sessions are built around what matters to you. Your job, your hobby, your people,
                your pet, the thing you do every weekend that nobody has ever thought to photograph.
                If it lights you up, I want to shoot it.
              </p>
              <p className="text-base leading-relaxed text-ink-muted">
                I&apos;m always up for something creative, and I&apos;d rather make something
                genuinely good together than tick a box.
              </p>
              <p className="text-base leading-relaxed text-ink-muted">
                If you&apos;ve been thinking about it, reach out. No commitment in asking.
              </p>
            </div>
            <div className="mt-10">
              <Link
                href="/inquire"
                className="inline-block rounded-card bg-accent px-7 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
