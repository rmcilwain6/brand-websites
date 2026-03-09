'use client';

import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export const ContactForm = () => {
  const [state, setState] = useState<FormState>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitting');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general', name, email, message })
      });

      if (res.ok) {
        setState('success');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="rounded-card border border-border bg-canvas px-8 py-12 text-center">
        <p className="mb-2 text-lg font-semibold text-ink">Message received.</p>
        <p className="text-base leading-relaxed text-ink-muted">
          I&apos;ll get back to you within a day or two. Thanks for reaching out.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={state === 'submitting'}
          className="w-full rounded-card border border-border bg-canvas px-4 py-3 text-base text-ink placeholder-ink-faint transition-colors duration-fast focus:border-ink focus:outline-none disabled:opacity-50"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'submitting'}
          className="w-full rounded-card border border-border bg-canvas px-4 py-3 text-base text-ink placeholder-ink-faint transition-colors duration-fast focus:border-ink focus:outline-none disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={state === 'submitting'}
          className="w-full resize-none rounded-card border border-border bg-canvas px-4 py-3 text-base text-ink placeholder-ink-faint transition-colors duration-fast focus:border-ink focus:outline-none disabled:opacity-50"
          placeholder="Tell me what's on your mind — no formal brief needed."
        />
      </div>

      {state === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong. Try again or email me directly.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="rounded-card bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
      >
        {state === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
};
