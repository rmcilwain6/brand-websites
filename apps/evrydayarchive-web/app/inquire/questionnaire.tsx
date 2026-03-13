'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { PublicPackage } from '@repo/core';

import { QUESTIONS, getPhase1Ids, getPhase2Ids, type Answers, type QuestionId } from './questions';
import { computeRecommendation, isExplorationMode, type PackageConfig } from './recommendation';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'phase1' | 'checkpoint1' | 'phase2' | 'checkpoint2' | 'exploration';
type AnimDir = 'forward' | 'backward';

interface State {
  phase: Phase;
  questionIndex: number;
  answers: Answers;
  config: PackageConfig | null;
  animDir: AnimDir;
  animKey: number;
}

const EVRYDAY_FALLBACK = {
  id: 'fallback',
  slug: 'evryday',
  name: 'Evryday',
  summaryLine: 'Individual portrait sessions — natural, candid, you.',
  description: null,
  basePriceCents: 15000,
  durationMinutes: 45,
  deliverables: ['7 edited images'],
  notes: null,
  sortOrder: 0,
  modifiers: []
} satisfies PublicPackage;

// ── Main component ────────────────────────────────────────────────────────────

export function Questionnaire({ packages }: { packages: PublicPackage[] }) {
  const router = useRouter();

  const [state, setState] = useState<State>({
    phase: 'phase1',
    questionIndex: 0,
    answers: {},
    config: null,
    animDir: 'forward',
    animKey: 0
  });

  // ── Derived values ──────────────────────────────────────────────────────────

  const phase1Ids = getPhase1Ids(state.answers);
  const phase2Ids = getPhase2Ids(state.answers);
  const currentPhaseIds = state.phase === 'phase1' ? phase1Ids : phase2Ids;
  const currentId =
    state.phase === 'phase1' || state.phase === 'phase2'
      ? (currentPhaseIds[state.questionIndex] as QuestionId | undefined)
      : undefined;
  const currentQuestion = currentId ? QUESTIONS[currentId] : null;

  const globalQuestionNumber =
    state.phase === 'phase1' ? state.questionIndex + 1 : phase1Ids.length + state.questionIndex + 1;
  const globalTotal = phase1Ids.length + phase2Ids.length;

  const isQuestionPhase = state.phase === 'phase1' || state.phase === 'phase2';
  const isVeryFirstQuestion = state.phase === 'phase1' && state.questionIndex === 0;

  // ── Package resolution ──────────────────────────────────────────────────────

  function resolvePackage(slug: string): PublicPackage {
    if (packages.length === 0) return EVRYDAY_FALLBACK;
    return packages.find((p) => p.slug === slug) ?? packages[0] ?? EVRYDAY_FALLBACK;
  }

  const resolvedPkg = state.config ? resolvePackage(state.config.packageSlug) : null;

  // ── Navigation helpers ──────────────────────────────────────────────────────

  const transition = useCallback((updates: Partial<State>, dir: AnimDir) => {
    setState((prev) => ({
      ...prev,
      ...updates,
      animDir: dir,
      animKey: prev.animKey + 1
    }));
  }, []);

  const handleAnswer = useCallback(
    (value: string, extraData?: Partial<Answers>) => {
      setState((prev) => {
        const newAnswers: Answers = {
          ...prev.answers,
          ...(currentId ? { [currentId]: value } : {}),
          ...extraData
        };

        const p1Ids = getPhase1Ids(newAnswers);
        const p2Ids = getPhase2Ids(newAnswers);
        let nextPhase: Phase = prev.phase;
        let nextIndex = prev.questionIndex + 1;

        if (prev.phase === 'phase1' && prev.questionIndex >= p1Ids.length - 1) {
          nextPhase = isExplorationMode(newAnswers) ? 'exploration' : 'checkpoint1';
          nextIndex = 0;
        } else if (prev.phase === 'phase2' && prev.questionIndex >= p2Ids.length - 1) {
          nextPhase = 'checkpoint2';
          nextIndex = 0;
        }

        const config =
          nextPhase === 'checkpoint1' || nextPhase === 'checkpoint2'
            ? computeRecommendation(newAnswers)
            : prev.config;

        return {
          ...prev,
          phase: nextPhase,
          questionIndex: nextIndex,
          answers: newAnswers,
          config,
          animDir: 'forward',
          animKey: prev.animKey + 1
        };
      });
    },
    [currentId]
  );

  const handleSkip = useCallback(() => handleAnswer(''), [handleAnswer]);

  const handleBack = useCallback(() => {
    setState((prev) => {
      let nextPhase: Phase = prev.phase;
      let nextIndex = prev.questionIndex - 1;

      if (prev.phase === 'checkpoint1') {
        nextPhase = 'phase1';
        nextIndex = getPhase1Ids(prev.answers).length - 1;
      } else if (prev.phase === 'exploration') {
        nextPhase = 'phase1';
        nextIndex = getPhase1Ids(prev.answers).length - 1;
      } else if (prev.phase === 'phase2' && prev.questionIndex === 0) {
        nextPhase = 'checkpoint1';
        nextIndex = 0;
      } else if (prev.phase === 'checkpoint2') {
        nextPhase = 'phase2';
        nextIndex = getPhase2Ids(prev.answers).length - 1;
      }

      return {
        ...prev,
        phase: nextPhase,
        questionIndex: Math.max(0, nextIndex),
        animDir: 'backward',
        animKey: prev.animKey + 1
      };
    });
  }, []);

  const handleKeepRefining = useCallback(
    () => transition({ phase: 'phase2', questionIndex: 0 }, 'forward'),
    [transition]
  );

  const handleInquire = useCallback(
    (slug: string) => router.push(`/book?package=${slug}`),
    [router]
  );

  const handleCustomize = useCallback(
    (slug: string) => router.push(`/package-builder?package=${slug}`),
    [router]
  );

  // ── Animation classes ────────────────────────────────────────────────────────
  // Checkpoints get a slow-fade entrance; questions slide directionally.
  const questionAnimClass =
    state.animDir === 'forward' ? 'animate-slide-from-right' : 'animate-slide-from-left';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-[560px] overflow-hidden rounded-card border border-border bg-canvas">
      <div className="flex h-full flex-col">
        {/* ── Persistent header ────────────────────────────────────────────────
            Always rendered at the same height regardless of phase, so the
            content area below it never shifts. Progress dots and counter are
            never remounted — only the content changes — which lets their CSS
            transitions run naturally.
        */}
        <div className="flex shrink-0 items-center gap-4 px-6 pb-6 pt-8 sm:px-8 sm:pt-10">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={isVeryFirstQuestion}
            aria-label="Go back"
            className="flex items-center gap-1.5 text-xs font-medium text-ink-faint transition-colors duration-fast hover:text-ink-muted disabled:pointer-events-none disabled:opacity-0"
          >
            <BackArrow />
            Back
          </button>

          {/* Progress dots — CSS transition animates the active dot expanding;
              never remounted so the animation always plays */}
          <div
            className={[
              'flex flex-1 justify-center transition-opacity duration-standard',
              isQuestionPhase ? 'opacity-100' : 'pointer-events-none opacity-0'
            ].join(' ')}
          >
            <ProgressDots current={globalQuestionNumber} total={globalTotal} />
          </div>

          {/* Counter — keyed on animKey so it re-enters with a pop on every
              navigation; wrapper fades out when not in a question phase */}
          <div
            className={[
              'w-8 text-right transition-opacity duration-standard',
              isQuestionPhase ? 'opacity-100' : 'pointer-events-none opacity-0'
            ].join(' ')}
          >
            <span
              key={state.animKey}
              className="animate-counter-tick inline-block text-xs tabular-nums text-ink-faint"
            >
              {globalQuestionNumber}/{globalTotal}
            </span>
          </div>
        </div>

        {/* ── Animated content area ────────────────────────────────────────────
            overflow-x-hidden clips the translateX slide; overflow-y-auto is a
            safety valve for any edge-case overflow.
        */}
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto scrollbar-none">
          {/* Question view */}
          {isQuestionPhase && currentQuestion && (
            <QuestionView
              key={state.animKey}
              animClass={questionAnimClass}
              question={currentQuestion}
              selectedValue={state.answers[currentQuestion.id]}
              onAnswer={handleAnswer}
              onSkip={handleSkip}
            />
          )}

          {/* Checkpoint 1 */}
          {state.phase === 'checkpoint1' && state.config && resolvedPkg && (
            <CheckpointView
              key={state.animKey}
              pkg={resolvedPkg}
              config={state.config}
              checkpoint={1}
              onInquire={() => handleInquire(resolvedPkg.slug)}
              onCustomize={() => handleCustomize(resolvedPkg.slug)}
              onRefine={handleKeepRefining}
            />
          )}

          {/* Exploration mode */}
          {state.phase === 'exploration' && <ExplorationView key={state.animKey} />}

          {/* Checkpoint 2 */}
          {state.phase === 'checkpoint2' && state.config && resolvedPkg && (
            <CheckpointView
              key={state.animKey}
              pkg={resolvedPkg}
              config={state.config}
              checkpoint={2}
              onInquire={() => handleInquire(resolvedPkg.slug)}
              onCustomize={() => handleCustomize(resolvedPkg.slug)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── QuestionView ──────────────────────────────────────────────────────────────
// Contains only the question label, options, and skip — no header elements.
// The persistent header in Questionnaire owns back/dots/counter.

interface QuestionViewProps {
  animClass: string;
  question: (typeof QUESTIONS)[QuestionId];
  selectedValue: string | undefined;
  onAnswer: (value: string, extra?: Partial<Answers>) => void;
  onSkip: () => void;
}

function QuestionView({ animClass, question, selectedValue, onAnswer, onSkip }: QuestionViewProps) {
  const [numericValue, setNumericValue] = useState('');
  const [budgetText, setBudgetText] = useState('');
  const [pendingBudget, setPendingBudget] = useState(false);
  const budgetRef = useRef<HTMLInputElement>(null);

  const isNumericInput = question.inputType === 'number';
  const hasOddCount = question.options.length % 2 !== 0;

  const handleOptionClick = (value: string) => {
    if (value === 'specific-budget') {
      setPendingBudget(true);
      setTimeout(() => budgetRef.current?.focus(), 50);
      return;
    }
    onAnswer(value);
  };

  // ── Numeric input question (e.g. q1b) ──────────────────────────────────────

  if (isNumericInput) {
    return (
      <div className={`${animClass} flex h-full flex-col px-6 pb-8 sm:px-8 sm:pb-10`}>
        <div className="mb-7">
          <h2 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
            {question.label}
          </h2>
          {question.sublabel && (
            <p className="mt-1.5 text-sm leading-relaxed text-ink-faint">{question.sublabel}</p>
          )}
        </div>

        <div className="flex max-w-xs flex-col gap-3">
          <input
            type="number"
            min={question.inputMin}
            value={numericValue}
            onChange={(e) => setNumericValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && numericValue.trim() && onAnswer(numericValue.trim())
            }
            placeholder={question.inputPlaceholder}
            autoFocus
            className="rounded-card border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            onClick={() => numericValue.trim() && onAnswer(numericValue.trim())}
            disabled={!numericValue.trim()}
            className="rounded-card bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Continue
          </button>
        </div>

        {question.skippable && (
          <div className="mt-auto pt-6 text-right">
            <button
              onClick={onSkip}
              className="text-xs text-ink-faint underline-offset-2 transition-colors duration-fast hover:text-ink-muted hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Skip this question →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Option-grid question ────────────────────────────────────────────────────

  return (
    <div className={`${animClass} flex h-full flex-col px-6 pb-8 sm:px-8 sm:pb-10`}>
      <div className="mb-7">
        <h2 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
          {question.label}
        </h2>
        {question.sublabel && (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-faint">{question.sublabel}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="list">
        {question.options.map((opt, i) => {
          const isSelected = selectedValue === opt.value;
          const isPendingBudget = opt.value === 'specific-budget' && pendingBudget;
          const isLastOdd = hasOddCount && i === question.options.length - 1;

          return (
            <div
              key={opt.value}
              role="listitem"
              className={
                isLastOdd || isPendingBudget
                  ? 'sm:col-span-2 sm:mx-auto sm:w-[calc(50%-5px)]'
                  : undefined
              }
            >
              <button
                onClick={() => handleOptionClick(opt.value)}
                className={[
                  'w-full rounded-card border transition-all duration-standard',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                  'flex flex-col px-5 py-3.5 text-left',
                  'sm:min-h-[84px] sm:items-center sm:justify-center sm:px-4 sm:py-4 sm:text-center',
                  isSelected || isPendingBudget
                    ? 'border-accent bg-accent/[0.07] text-ink'
                    : 'border-border bg-surface text-ink hover:border-ink-muted'
                ].join(' ')}
              >
                <span className="block text-sm font-medium leading-snug">{opt.label}</span>
                {opt.sublabel && (
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">
                    {opt.sublabel}
                  </span>
                )}
              </button>

              {isPendingBudget && (
                <div className="mt-2 animate-fade-up px-1">
                  <input
                    ref={budgetRef}
                    type="text"
                    value={budgetText}
                    onChange={(e) => setBudgetText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      onAnswer('specific-budget', { q6Budget: budgetText.trim() || undefined })
                    }
                    placeholder="e.g. around $150, flexible up to $250…"
                    className="w-full rounded-card border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    onClick={() =>
                      onAnswer('specific-budget', { q6Budget: budgetText.trim() || undefined })
                    }
                    className="mt-2.5 rounded-card bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {question.skippable && !pendingBudget && (
        <div className="mt-auto pt-6 text-right">
          <button
            onClick={onSkip}
            className="text-xs text-ink-faint underline-offset-2 transition-colors duration-fast hover:text-ink-muted hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Skip this question →
          </button>
        </div>
      )}
    </div>
  );
}

// ── CheckpointView ────────────────────────────────────────────────────────────
// No back button — the persistent header owns that.

interface CheckpointViewProps {
  pkg: PublicPackage;
  config: PackageConfig;
  checkpoint: 1 | 2;
  onInquire: () => void;
  onCustomize: () => void;
  onRefine?: () => void;
}

function CheckpointView({
  pkg,
  config,
  checkpoint,
  onInquire,
  onCustomize,
  onRefine
}: CheckpointViewProps) {
  const basePrice = pkg.basePriceCents ?? 0;
  const total = Math.max(basePrice + config.modifiersTotalCents - config.discountCents, basePrice);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(cents / 100);

  return (
    <div className="animate-checkpoint-enter flex h-full flex-col px-6 pb-8 sm:px-8 sm:pb-10">
      <p
        className="mb-4 animate-reveal-up text-xs font-medium uppercase tracking-widest text-ink-faint"
        style={{ animationDelay: '80ms' }}
      >
        {checkpoint === 1 ? 'Here\u2019s what I\u2019m seeing' : 'Your custom package'}
      </p>

      <div
        className="animate-reveal-up mb-6 rounded-card border border-border bg-surface px-6 py-5"
        style={{ animationDelay: '180ms' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-snug text-ink">{pkg.name}</h3>
            <p className="mt-0.5 text-sm text-ink-faint">customized for you</p>
          </div>
          {pkg.basePriceCents != null && (
            <p
              className="animate-reveal-up shrink-0 text-2xl font-semibold tabular-nums text-ink"
              style={{ animationDelay: '320ms' }}
            >
              {formatPrice(total)}
            </p>
          )}
        </div>

        {(pkg.durationMinutes != null || pkg.deliverables.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint">
            {pkg.durationMinutes != null && <span>{pkg.durationMinutes} min</span>}
            {pkg.deliverables.slice(0, 2).map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        )}

        {checkpoint === 2 && config.appliedModifiers.length > 0 && (
          <div className="mt-4 space-y-1 border-t border-border pt-4">
            <div className="flex justify-between text-xs text-ink-faint">
              <span>Base session</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
            {config.appliedModifiers.map((mod, i) => (
              <div key={i} className="flex justify-between text-xs text-ink-faint">
                <span>{mod.label}</span>
                <span>
                  {mod.priceDeltaCents >= 0 ? '+' : ''}
                  {formatPrice(mod.priceDeltaCents)}
                </span>
              </div>
            ))}
            {config.discountCents > 0 && (
              <div className="flex justify-between text-xs text-ink-faint">
                <span>Discount</span>
                <span>−{formatPrice(config.discountCents)}</span>
              </div>
            )}
          </div>
        )}

        {config.nonprofitFlag && (
          <p className="mt-3 text-xs text-ink-faint">
            Nonprofit/community pricing — we&apos;ll work out the details together.
          </p>
        )}
        {config.customBudgetNote && (
          <p className="mt-3 text-xs text-ink-faint">
            Budget noted: <em>{config.customBudgetNote}</em>
          </p>
        )}
      </div>

      <div className="mt-auto animate-reveal-up" style={{ animationDelay: '380ms' }}>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={onInquire}
            className="flex-1 rounded-card bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Inquire about this package
          </button>
          <button
            onClick={onCustomize}
            className="flex-1 rounded-card border border-border px-5 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Customize this
          </button>
          {checkpoint === 1 && onRefine && (
            <button
              onClick={onRefine}
              className="flex-1 rounded-card border border-border px-5 py-3 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Keep refining →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ExplorationView ───────────────────────────────────────────────────────────
// No back button — the persistent header owns that.

function ExplorationView() {
  return (
    <div className="animate-checkpoint-enter flex h-full flex-col px-6 pb-12 sm:px-8 sm:pb-16">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p
          className="mb-2 animate-reveal-up text-xs font-medium uppercase tracking-widest text-ink-faint"
          style={{ animationDelay: '80ms' }}
        >
          Still figuring things out?
        </p>
        <h2
          className="mb-3 animate-reveal-up text-xl font-semibold text-ink"
          style={{ animationDelay: '160ms' }}
        >
          No problem at all.
        </h2>
        <p
          className="mx-auto mb-8 max-w-sm animate-reveal-up text-sm leading-relaxed text-ink-muted"
          style={{ animationDelay: '240ms' }}
        >
          Browse the base packages below to get a feel for what&apos;s available, or reach out and
          we can figure it out together.
        </p>
        <div
          className="flex animate-reveal-up flex-wrap justify-center gap-3"
          style={{ animationDelay: '340ms' }}
        >
          <a
            href="#packages-at-a-glance"
            className="rounded-card bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Browse packages ↓
          </a>
          <Link
            href="/contact"
            className="rounded-card border border-border px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-fast hover:border-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Reach out directly
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── ProgressDots ──────────────────────────────────────────────────────────────
// Not keyed anywhere — stays mounted across all navigations so the CSS
// transition on each dot's width and colour always plays.

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <span
            key={i}
            className={[
              'rounded-full transition-all duration-standard',
              isActive
                ? 'h-2 w-5 bg-ink'
                : isDone
                  ? 'h-1.5 w-1.5 bg-ink/40'
                  : 'h-1.5 w-1.5 bg-border'
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

// ── BackArrow ─────────────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M8.5 2.5L4 7l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
