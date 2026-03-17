/**
 * Hardcoded questionnaire question definitions.
 *
 * Decision (March 2026): Questions and options are hardcoded in the app and its
 * business logic. If the question set needs to change, the website will be
 * redeployed. CMS-configurable questions were explicitly ruled out for this
 * project.
 */

export type QuestionId = 'q1' | 'q1b' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7';

export type Answers = Partial<Record<QuestionId, string>> & {
  /** Free-text note captured when user selects "specific-budget" on Q6. */
  q6Budget?: string;
};

export type QuestionOption = {
  value: string;
  label: string;
  sublabel?: string;
};

export type Question = {
  id: QuestionId;
  label: string;
  sublabel?: string;
  options: QuestionOption[];
  /** Whether the user can skip this question without selecting an option. */
  skippable: boolean;
  /**
   * When set to 'number', the question renders a numeric input field instead of
   * option buttons. `inputPlaceholder` and `inputMin` configure the input.
   */
  inputType?: 'number';
  inputPlaceholder?: string;
  inputMin?: number;
};

// ── Phase 1: Fast Triage (Q1–Q3, Q1b conditional) ────────────────────────────

/**
 * Returns the ordered list of question IDs for Phase 1.
 * Q1b (group size) is inserted after Q1 when the user selects "group".
 */
export function getPhase1Ids(answers: Answers): QuestionId[] {
  const ids: QuestionId[] = ['q1'];
  if (answers.q1 === 'group') ids.push('q1b');
  ids.push('q2', 'q3');
  return ids;
}

// ── Phase 2: Refinement (Q4–Q7, Q5 conditional) ──────────────────────────────

/**
 * Returns the ordered list of question IDs for Phase 2, accounting for the
 * conditional Q5 (only shown when Q4 = "multiple-locations").
 */
export function getPhase2Ids(answers: Answers): QuestionId[] {
  const ids: QuestionId[] = ['q4'];
  if (answers.q4 === 'multiple-locations') ids.push('q5');
  ids.push('q6', 'q7');
  return ids;
}

// ── Question definitions ──────────────────────────────────────────────────────

export const QUESTIONS: Record<QuestionId, Question> = {
  q1: {
    id: 'q1',
    label: "Who's this session for?",
    skippable: false,
    options: [
      { value: 'just-me', label: 'Just me' },
      { value: 'me-and-someone', label: 'Me and someone else' },
      { value: 'group', label: 'A group of us', sublabel: '3+ people' },
      { value: 'business', label: 'A business or team' },
      { value: 'event', label: 'An event or gathering' }
    ]
  },

  q1b: {
    id: 'q1b',
    label: 'How many people in your group?',
    sublabel: 'This helps plan the right session length and image count.',
    skippable: true,
    inputType: 'number',
    inputPlaceholder: 'e.g. 4, 8, 12…',
    inputMin: 3,
    options: []
  },

  q2: {
    id: 'q2',
    label: 'What are you hoping to capture?',
    skippable: true,
    options: [
      {
        value: 'everyday-life',
        label: 'Everyday life',
        sublabel: 'portraits, lifestyle, just being myself'
      },
      {
        value: 'milestone',
        label: 'A specific milestone',
        sublabel: 'graduation, engagement, etc.'
      },
      {
        value: 'work-creative',
        label: 'Work or creative practice',
        sublabel: 'headshots, workspace, process'
      },
      { value: 'product-project', label: 'A product, project, or space' },
      { value: 'not-sure', label: 'Not sure yet — just exploring' }
    ]
  },

  q3: {
    id: 'q3',
    label: 'How many photos are you hoping to get?',
    skippable: true,
    options: [
      { value: 'few-favorites', label: 'Just a few favorites', sublabel: '5–7 images' },
      { value: 'solid-set', label: 'A solid set', sublabel: '10–15 images' },
      { value: 'full-collection', label: 'A full collection', sublabel: '20+ images' },
      { value: 'not-sure', label: 'Not sure yet' }
    ]
  },

  q4: {
    id: 'q4',
    label: "How much time do you think you'll need?",
    skippable: true,
    options: [
      { value: 'short', label: 'Short and sweet', sublabel: '~30–45 min' },
      { value: 'standard', label: 'Standard', sublabel: '~60 min' },
      { value: 'extended', label: 'Extended', sublabel: '~90 min' },
      {
        value: 'multiple-locations',
        label: 'Multiple locations or a longer session',
        sublabel: '2+ hours'
      },
      { value: 'not-sure', label: 'Not sure' }
    ]
  },

  q5: {
    id: 'q5',
    label: 'How many locations?',
    sublabel: "We'll factor in travel and setup time between spots.",
    skippable: true,
    options: [
      { value: '2-locations', label: '2 locations' },
      { value: '3-plus-locations', label: '3 or more locations' },
      { value: 'not-sure', label: 'Not sure yet' }
    ]
  },

  q6: {
    id: 'q6',
    label: 'Any budget considerations?',
    skippable: true,
    options: [
      { value: 'student', label: "I'm a student" },
      {
        value: 'nonprofit',
        label: 'Student group, nonprofit, or community project'
      },
      {
        value: 'specific-budget',
        label: "I'm working within a specific budget",
        sublabel: "We'll talk through what's possible"
      },
      { value: 'no-constraints', label: 'No specific constraints' }
    ]
  },

  q7: {
    id: 'q7',
    label: 'What editing approach works for you?',
    skippable: true,
    options: [
      { value: 'light', label: 'Light edits', sublabel: 'quick, clean, natural' },
      { value: 'full', label: 'Full edits', sublabel: 'stylized, refined, polished' },
      { value: 'not-sure', label: 'Whatever you recommend' }
    ]
  }
};
