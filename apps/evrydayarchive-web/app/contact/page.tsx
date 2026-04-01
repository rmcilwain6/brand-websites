import { ContactForm } from './contact-form';

const ContactPage = () => {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Page header */}
        <header className="mb-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
            Get in touch
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Say hello.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
            No pressure, no formal brief. Just tell me what&apos;s on your mind and I&apos;ll get
            back to you when I can.
          </p>
        </header>

        {/* Two-column on desktop: form left, note right */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* What happens next */}
          <aside className="mt-12 lg:col-span-2 lg:mt-0">
            <div className="rounded-card border border-border bg-canvas p-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-faint">
                What happens next
              </p>
              <ul className="space-y-3 text-sm leading-relaxed text-ink-muted">
                <li>I read every message personally.</li>
                <li>I&apos;ll reply as soon as I can to discuss your idea.</li>
                <li>
                  No commitment needed — if it feels like a good fit, we&apos;ll take it from there.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
