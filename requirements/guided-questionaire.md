# Evryday Archive Co — Package Recommendation Questionnaire
**Version:** MVP 1.0  
**Last updated:** March 2026

---

## Overview

This document defines the requirements for the package recommendation questionnaire on the Evryday Archive Co website. The questionnaire guides users through a progressive series of questions to recommend a customized photography package based on their needs.

### Goals
- Get users to a recommended package in 3–7 questions
- Provide transparent pricing with clear modifiers
- Allow progressive refinement with checkpoints
- Empower users to customize or inquire at any point

### User Flow
1. User answers 3–4 fast triage questions
2. **Checkpoint 1:** See initial recommendation, choose to inquire/customize/refine
3. *(Optional)* Answer 2–4 refinement questions
4. **Checkpoint 2:** See final recommendation, choose to inquire/customize

---

## Base Packages

All recommendations start from one of these base packages:

| Package | Price | Duration | Images | Locations | Edit Level | Notes |
|---------|-------|----------|--------|-----------|------------|-------|
| **Evryday** | $150 | 45 min | 7 | 1 | Full | Individual sessions |
| **Together** | $195 | 60 min | 10 | 1 | Full | Couples/duos |
| **In Practice** | $225 | 60 min + alignment call | 10 | 1 | Full | Small business/makers |
| **As It Unfolds** | $200/hr | Flexible | Flexible | Flexible | Full | Events (hourly structure) |

---

## Modifiers & Pricing

These modifiers adjust the base package price and scope:

| Modifier | Price Impact | Rule/Logic |
|----------|--------------|------------|
| **Additional image** | +$7 per image | Applied when requested count > base package default |
| **+15 min time block** | +$25 | Incremental time extension |
| **+30 min time block** | +$50 | Larger time extension (90 min sessions) |
| **Additional location** | +$40 + time adjustment | Forces minimum 90 min session length |
| **Light edits** | -$15 | Discount for reduced post-processing |
| **Student discount** | -20% of total | Applied to final price OR scope reduction |
| **Nonprofit/community** | Custom/variable | Flagged for manual follow-up |

### Auto-Adjustment Rules

1. **If locations > 1** → `session_length` minimum = 90 min
2. **If session_length = 90 min** → Add $50 to base price
3. **If session_length ≥ 120 min** → Add $100 to base price
4. **If requested images > base + 15** → Recommend package builder (too custom for questionnaire)

---

## Questionnaire Structure

### Phase 1: Fast Triage (Questions 1–3)

#### **Question 1: Who's this session for?**

**Purpose:** Determines base package tier  
**Format:** Single-select (visual cards or buttons)

**Options:**
- Just me
- Me and someone else
- A group of us (3+ people)
- A business or team
- An event or gathering

**What this sets:**
- Base package: `Evryday` / `Together` / `Together` (with group modifier) / `In Practice` / `As It Unfolds`
- Default session length
- Default image count
- Default pricing tier

**Branching logic:**
- If **"An event or gathering"** → Route to `As It Unfolds` (event-specific hourly structure)
- If **"A business or team"** → Route to `In Practice` package
- Otherwise → Continue to Q2

---

#### **Question 2: What are you hoping to capture?**

**Purpose:** Understand intent and refine package type  
**Format:** Single-select

**Options:**
- Everyday life (portraits, lifestyle, just being myself/ourselves)
- A specific milestone or moment (graduation, engagement, etc.)
- Work or creative practice (headshots, workspace, process)
- A product, project, or space
- Not sure yet — just exploring

**What this affects:**
- Refinement of base package (e.g., confirms `In Practice` vs `Evryday` for solo)
- Tone of recommendation language
- Suggested modifiers in later questions

**Branching logic:**
- If **"Work or creative practice"** OR **"A product, project, or space"** → Confirm `In Practice` package
- If **"A specific milestone"** → Note for copy tone (doesn't change package structure)
- If **"Not sure yet"** → Flag for exploration mode (lighter recommendation)

---

#### **Question 3: How many photos are you hoping to get?**

**Purpose:** Set expected image count  
**Format:** Single-select (buttons or slider)

**Options:**
- Just a few favorites (5–7 images)
- A solid set (10–15 images)
- A full collection (20+ images)
- Not sure yet

**What this affects:**
- Base included image count
- Price adjustment if significantly above base package default
- Sets expectation for add-on pricing display

**Default if skipped:** Base package default (7 for `Evryday`, 10 for `Together`, etc.)

---

### CHECKPOINT 1: Initial Recommendation

**Display elements:**
- Package name (e.g., "Together — customized for you")
- Total estimated price
- Key specs in brief format (time • images • locations)

**Example display:**
```
Together — customized for you
$230

60 minutes  •  10 photos  •  1 location

[Inquire about this package]  [Customize this]  [Keep refining →]
```

**Available actions:**
1. **Inquire about this package** → Navigate to booking form with package config
2. **Customize this package** → Navigate to package builder with config pre-loaded
3. **Keep refining** → Continue to Phase 2 (Q4–Q7)

**Fallback:** If user selected "Not sure yet" to multiple questions, show exploration mode instead:
```
Still figuring things out? No problem.

[Browse base packages ↓]  [Chat with Reed]
```

---

### Phase 2: Refinement (Questions 4–7)

*Only shown if user selects "Keep refining" at Checkpoint 1*

#### **Question 4: How much time do you think you'll need?**

**Purpose:** Adjust session length  
**Format:** Single-select

**Options:**
- Short and sweet (~30–45 min)
- Standard (~60 min)
- Extended (~90 min)
- Multiple locations or a longer session (2+ hours)
- Not sure

**What this affects:**
- Session length modifier
- Price adjustment if above base package default
- Triggers Q5 if multiple locations selected

**Default if skipped:** Base package session length

**Branching logic:**
- If **"Multiple locations or longer session"** → Show Q5 (location count)
- Otherwise → Skip Q5, continue to Q6

---

#### **Question 5: How many locations? (Conditional)**

**Visibility:** Only shown if Q4 = "Multiple locations or longer session"

**Purpose:** Set location count and adjust time/price accordingly  
**Format:** Single-select or number input

**Options:**
- 2 locations
- 3+ locations
- Not sure yet

**What this affects:**
- Session length auto-adjusts upward (2 locations = minimum 90 min, 3+ = 2+ hours)
- Price adjustment for extended time (+$40 per additional location + time block pricing)
- Note in package summary about travel/setup time between locations

**Default if skipped:** 1 location (no modifier applied)

---

#### **Question 6: Any budget considerations?**

**Purpose:** Flag student/accessibility pricing or set expectations  
**Format:** Single-select with optional text field

**Options:**
- I'm a student
- This is for a student group, nonprofit, or community project
- I'm working within a specific budget *(opens text field)*
- No specific constraints

**What this affects:**
- Student discount flag (applies -20% OR scales down scope)
- If "specific budget" text entered → Captured as note for follow-up
- If nonprofit/community → Flagged for accessibility pricing discussion

**Default if skipped:** Standard pricing (no discount)

---

#### **Question 7: Edit level preference**

**Purpose:** Set edit intensity and adjust price/timeline expectations  
**Format:** Single-select

**Options:**
- Light edits (quick, clean, natural)
- Full edits (stylized, refined, polished)
- Not sure — whatever you recommend

**What this affects:**
- Price modifier (light edits = -$15, full edits = base price)
- Turnaround time expectation
- Note in package summary about editing approach

**Default if skipped:** Full edits (standard offering)

---

### CHECKPOINT 2: Final Recommendation

**Display elements:**
- Package name + customization summary
- Price breakdown showing base + all modifiers line by line
- Total price
- Clear next steps

**Example display:**
```
Together — customized for you
$320

Base session: $195
+ 5 additional images: $35
+ Extended time (90 min): $50
+ Second location: $40

[Inquire about this package]  [Customize this]
```

**Available actions:**
1. **Inquire about this package** → Navigate to booking form with full package config
2. **Customize this package** → Navigate to package builder with config pre-loaded

---

## Data Structure

### Package Configuration Object

When user completes questionnaire or reaches a checkpoint, the following data structure should be generated:
```javascript
{
  "package_base": "Together",           // Base package identifier
  "session_length": 90,                 // Minutes
  "location_count": 2,                  // Number of locations
  "image_count": 15,                    // Total images included
  "edit_level": "full",                 // "light" or "full"
  "modifiers_applied": [                // Array of modifier objects
    {
      "type": "additional_images",
      "quantity": 5,
      "unit_price": 7,
      "total": 35
    },
    {
      "type": "extended_time",
      "quantity": 30,                   // Additional minutes
      "total": 50
    },
    {
      "type": "additional_location",
      "quantity": 1,
      "total": 40
    }
  ],
  "base_price": 195,
  "modifiers_total": 125,
  "discount_flags": {
    "student": false,
    "nonprofit": false,
    "custom_budget": null              // Text from Q6 if provided
  },
  "discount_amount": 0,
  "total_price": 320,
  "user_notes": "",                    // Any additional notes from text fields
  "questionnaire_path": [1, 2, 3, 4, 5, 6, 7]  // Questions answered
}
```

---

## CMS Schema Requirements

To make this system flexible without code changes, the following should be configurable via CMS:

### Base Packages Table
- `package_id` (string, unique)
- `package_name` (string)
- `base_price` (number)
- `default_session_length` (number, minutes)
- `default_image_count` (number)
- `default_location_count` (number)
- `default_edit_level` (string: "light" or "full")
- `description` (text)
- `active` (boolean)

### Modifiers Table
- `modifier_id` (string, unique)
- `modifier_name` (string)
- `modifier_type` (string: "additional_images", "time_extension", "location", "edit_level", "discount")
- `unit_price` (number, can be negative for discounts)
- `rules` (JSON, for auto-adjustment logic)
- `active` (boolean)

### Pricing Rules Table
- `rule_id` (string, unique)
- `condition` (string, e.g., "locations > 1")
- `action` (string, e.g., "session_length = 90")
- `price_impact` (number, if applicable)
- `active` (boolean)

---

## Integration Points

### 1. Booking Form Handoff
**What gets passed:**
- Complete package configuration object (see Data Structure above)
- User progresses to contact form with pre-populated package details

**Booking form should display:**
- Package summary (name, price, specs)
- Allow user to review before submitting contact info

---

### 2. Package Builder Handoff
**What gets passed:**
- Complete package configuration object
- Package builder loads with all selections pre-populated

**Package builder should allow:**
- Addition/removal of individual modifiers
- Real-time price recalculation
- Save and return to booking when ready

---

## UI/UX Guidelines

### Question Display
- One question visible at a time
- Progress indicator showing position (e.g., "Question 2 of 7")
- Previous/back button available except on Q1
- Skip button available for optional questions

### Checkpoint Display
- Clear visual separation from questions
- Prominent pricing display
- All three action buttons equally weighted (no dark patterns)
- Minimal copy—let the numbers and buttons speak

### Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- High contrast for pricing information
- Mobile-responsive (questionnaire works on all screen sizes)

---

## Edge Cases & Fallbacks

### User skips multiple questions
- Use base package defaults for all skipped values
- Still show recommendation at Checkpoint 1
- Recommendation copy adjusts to acknowledge uncertainty ("Based on what you've shared so far...")

### User requests > 20 images
- At Checkpoint, show message: "For collections this size, let's customize directly"
- Provide direct link to package builder
- Skip Checkpoint 2

### User selects "event" but answers non-event questions
- Auto-route to `As It Unfolds` package after Q1
- Adjust remaining questions to be event-specific (time-based instead of session-based)

### Calculation results in negative price
- Should not be possible with current modifier structure
- If occurs, fall back to base package price
- Log error for review

---

## Testing Scenarios

### Happy Path 1: Simple Individual Session
- Q1: Just me
- Q2: Everyday life
- Q3: A solid set (10–15)
- **Expected:** Checkpoint 1 shows `Evryday` + image modifier, ~$175–$200

### Happy Path 2: Couple with Multiple Locations
- Q1: Me and someone else
- Q2: A specific milestone
- Q3: A solid set (10–15)
- *(Refine)*
- Q4: Multiple locations or longer session
- Q5: 2 locations
- Q6: No constraints
- Q7: Full edits
- **Expected:** Checkpoint 2 shows `Together` + time + location modifiers, ~$285–$320

### Edge Case 1: Student Group Session
- Q1: A group of us
- Q2: Everyday life
- Q3: A full collection (20+)
- Q6: This is for a student group
- **Expected:** Student discount applied, final price reflects -20%

### Edge Case 2: Exploration Mode
- Q1: Just me
- Q2: Not sure yet
- Q3: Not sure yet
- **Expected:** Fallback to exploration mode, no Checkpoint 1, show base packages

---

## Future Enhancements (Post-MVP)

- A/B test question order and phrasing
- Add "Save for later" option that emails package summary
- Track completion rates at each question to identify drop-off points
- Allow returning users to see previously recommended packages
- Add seasonal/promotional modifier support
- Multi-language support for questionnaire

---

## Developer Notes

### Performance
- Calculation should be client-side (no server round-trip per question)
- Package config object updates in real-time as user progresses
- Checkpoint displays render instantly from calculated state

### Analytics
Track the following events:
- Questionnaire started
- Each question answered (including selected option)
- Checkpoint 1 reached
- Checkpoint 1 action taken (inquire/customize/refine)
- Checkpoint 2 reached
- Checkpoint 2 action taken
- Drop-off points (which question user abandoned on)

### Error Handling
- If pricing calculation fails, show base package with note to contact directly
- If CMS data fails to load, fall back to hardcoded base packages
- Validate all numeric inputs to prevent calculation errors

---

## Appendix: Question Copy Templates

These are starting points—adjust tone as needed for Evryday Archive Co voice.

### Q1: Who's this session for?
**Header:** "Who's this session for?"

### Q2: What are you hoping to capture?
**Header:** "What are you hoping to capture?"

### Q3: How many photos are you hoping to get?
**Header:** "How many photos are you hoping to get?"

### Q4: How much time do you think you'll need?
**Header:** "How much time do you think you'll need?"

### Q5: How many locations?
**Header:** "How many locations?"

### Q6: Any budget considerations?
**Header:** "Any budget considerations?"

### Q7: Edit level preference
**Header:** "What editing approach works for you?"

---

**End of specification document**
