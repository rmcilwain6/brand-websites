import Link from 'next/link';

import { FaqAccordion } from './faq-accordion';

const FAQ_ITEMS = [
  {
    question: 'What kinds of sessions do you photograph?',
    answer:
      'Families, couples, individuals, and everyday life moments — the connective tissue of ordinary days. If it matters to you, it matters to the archive. I also take on select commercial work when the fit is right.'
  },
  {
    question: 'How far in advance should I book?',
    answer:
      'A few weeks is usually enough for most sessions. For busy seasons (spring and fall especially) or larger events, a month or two ahead gives us more flexibility with timing and light.'
  },
  {
    question: 'Do you travel for sessions?',
    answer:
      "Yes. I'm based in Ottawa–Gatineau and available for travel across Canada. Travel sessions are priced to include logistics — reach out with your location and we'll work out the details."
  },
  {
    question: 'What should we wear / how should we prepare?',
    answer:
      "Wear something you'd actually wear on a nice day out. Comfort matters more than coordinated outfits. I'll share a short prep note once we're confirmed — it covers everything from timing to what to bring."
  },
  {
    question: 'How long until we receive the photos?',
    answer:
      "Most sessions are delivered within 2–3 weeks. Larger sessions or busy periods may take a little longer. I'll give you a specific timeline when we confirm the booking."
  },
  {
    question: 'How many photos will we receive?',
    answer:
      'It depends on the session length and what unfolds — not a fixed number. Quality over quantity is the guiding principle. Every image in your gallery is there because it earned its place.'
  },
  {
    question: 'Can we request specific shots or poses?',
    answer:
      "Absolutely. A short list of moments or groups you want documented is always helpful. Beyond that, I'll work in the background and let things breathe. The best images usually come from both."
  },
  {
    question: "What if the weather doesn't cooperate?",
    answer:
      "We reschedule, no penalty. Overcast light is often beautiful — but rain, wind, or extreme heat isn't fun for anyone. I'll always be honest if I think we should move the date."
  },
  {
    question: "I don't see a package that fits my situation. Can I still reach out?",
    answer:
      "Always. The listed packages are starting points. If your situation is different — unusual hours, a specific location, a larger group, or something entirely different — send a message and we'll figure it out."
  }
];

const FaqPage = () => {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Page header */}
        <header className="mb-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Common questions
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            FAQ
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-muted">
            If your question isn&apos;t here,{' '}
            <Link
              href="/inquire"
              className="font-medium text-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded-sm"
            >
              just ask
            </Link>
            .
          </p>
        </header>

        {/* Accordion */}
        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </main>
  );
};

export default FaqPage;
