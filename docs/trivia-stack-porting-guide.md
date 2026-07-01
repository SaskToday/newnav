# Trivia Stack Porting Guide

This guide explains how to reuse the **Next Read Stack variant** from this repo in another project that shows **trivia questions** instead of news articles.

The stack is a mobile bottom sheet that:

- Slides up from the viewport bottom after a scroll (or completion) threshold
- Supports **peek → collapsed → expanded** states via drag and tap
- Shows up to **3 numbered items**, an optional **presenter message**, and an optional **newsletter signup**
- Uses GPU-composited `translateY` for smooth drag animation

---

## Source of truth

| Item | Location |
|---|---|
| Implementation | `new_nav.js` on the **`staging` branch** |
| Reference commit | `239415f` (or latest `staging`) |
| CSS class (nav) | `.next-read-stack-experiment` on `#bottom-trending-story-bar` |
| Loader example | `nav_script_loader_STAGING.html` on `staging` |

**Not in production:** The stack variant does **not** exist on `main`. Production only has the classic single-link Next Read bar.

---

## Nav articles vs trivia questions

| Nav (articles) | Trivia project |
|---|---|
| `getNextReadRecommendation()` | `getTriviaQuestions()` |
| `{ title, link }` | `{ id, question, ... }` |
| "New in {Category}" | "Today's {Category} Trivia" |
| `.stack-links` / `.stack-link` | `.stack-questions` / `.stack-question` |
| Click → navigate to article | Tap → open quiz, reveal answer, or navigate |
| Visited article paths | Already-answered question IDs |
| RSS / `.details-related` DOM | Trivia API or KV store |
| Editor message | Presenter / host message |

The **gesture, layout, and animation code** can be copied with minimal changes. Replace the **data layer** and **user-facing copy**.

---

## Recommended module structure (other project)

```
your-project/
├── trivia-stack/
│   ├── trivia-stack.css       # Extracted from staging new_nav.js
│   ├── trivia-stack.js        # Core module (IIFE or ES module)
│   └── trivia-stack.config.js # Optional defaults
```

Alternatively, ship one bundled file that injects CSS via a `<style>` tag (same pattern as `new_nav.js` today).

---

## Public API

Design the ported module around a small surface. Your app supplies questions; the module handles the sheet UI.

```javascript
TriviaStack.init({
  // Required
  getQuestions: async () => [
    {
      id: '2026-06-19-q1',
      question: 'What year did Saskatchewan become a province?',
      category: 'History'
    },
    {
      id: '2026-06-19-q2',
      question: 'Which team won the 2024 Grey Cup?',
      category: 'Sports'
    },
    {
      id: '2026-06-19-q3',
      question: 'Who wrote "The Stone Angel"?',
      category: 'Literature'
    }
  ],

  // When to show the sheet
  shouldShow: () => window.scrollY >= 400,

  // Optional display
  titleFormat: (category) =>
    category ? `Today's ${category} Trivia` : "Today's Trivia",
  maxItems: 3,
  mobileOnly: true,

  // Optional: hide questions the user already answered
  getAnsweredIds: () => ['2026-06-19-q1'],
  markAnswered: (id) => { /* persist to localStorage / API */ },

  // Tap handler (replace article navigation)
  onQuestionClick: (question, index) => {
    // e.g. open inline answer, start quiz flow, or:
    // window.location.href = question.link;
  },

  // Optional blocks (same UX as nav stack)
  presenterMessage: {
    image: 'https://example.com/host.jpg',
    name: 'Alex',
    title: 'Trivia Host',
    html: 'Today\'s theme is Saskatchewan history. <a href="/about">Learn more</a>.'
  },
  newsletter: {
    text: 'Get daily trivia in your inbox.',
    placeholder: 'Your email',
    buttonText: 'Subscribe',
    onSubmit: (email) => {
      fetch('/api/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    }
  },
  theme: 'yellow',   // '', 'dark', or 'yellow'
  frosted: true,
  showAdSlot: false, // true to show separate 50px ad at viewport bottom
  onTrack: (event, props) => {
    if (window.posthog) posthog.capture(event, props);
  }
});

TriviaStack.refresh();  // re-fetch questions and update DOM
TriviaStack.destroy();  // remove sheet + listeners (SPA route changes)
```

### Minimum required fields per question

| Field | Required | Purpose |
|---|---|---|
| `id` | Yes | Stable ID for answered/seen tracking |
| `question` | Yes | Primary display text (replaces article title) |
| `category` | No | Used in sheet title if no global category |
| `link` | No | Only if tap should navigate away |
| `meta` | No | Optional subtitle (e.g. "3 of 5 correct today") |

---

## DOM structure (trivia naming)

When porting, rename nav classes for clarity. Internal nav names work if you want a faster copy-paste.

```html
<div id="trivia-stack-sheet" class="trivia-stack-experiment stack-yellow stack-frosted visible">
  <div class="stack-backdrop" aria-hidden="true"></div>
  <div class="pull-handle" aria-hidden="true"></div>
  <div class="stack-header"></div>
  <div class="stack-preview-shell" style="height: …px">
    <div class="presenter-msg">…</div>
    <div class="stack-title">Today's History Trivia</div>
    <div class="stack-questions">
      <button type="button" class="stack-question" data-id="q1">
        <span class="stack-question-index">1</span>
        What year did Saskatchewan become a province?
      </button>
      <!-- … -->
    </div>
    <div class="stack-newsletter">
      <p class="stack-newsletter-text">Get daily trivia in your inbox.</p>
      <div class="stack-newsletter-row">
        <input class="stack-newsletter-input" type="email" placeholder="Your email">
        <button class="stack-newsletter-btn" type="button">Subscribe</button>
      </div>
    </div>
  </div>
</div>
<div id="trivia-stack-ad-slot">…</div>
```

Use `<button type="button">` when taps trigger in-app logic; use `<a href="…">` when taps navigate.

---

## What to copy from `staging` `new_nav.js`

Line numbers refer to commit **`239415f`** on `staging`. If `staging` has moved on, search for the function/class names below.

### 1. CSS (~lines 637–710)

Copy everything under:

- `#bottom-trending-story-bar.next-read-stack-experiment`
- Theme variants: `.stack-dark`, `.stack-yellow`, `.stack-frosted`
- `#next-read-stack-ad-slot` (optional ad unit)

Rename selectors to `#trivia-stack-sheet` / `.trivia-stack-experiment` when cleaning up.

### 2. Config constants (~lines 49–57)

| Constant | Default | Trivia use |
|---|---|---|
| `NEXT_READ_STACK_MAX_ITEMS` | 3 | Max questions in sheet |
| `NEXT_READ_STACK_COLLAPSED_HEIGHT` | 83 | Collapsed preview height (px) |
| `NEXT_READ_STACK_EXPAND_SNAP_RATIO` | 0.25 | Pull-up distance to snap expanded |
| `NEXT_READ_STACK_COLLAPSE_SNAP_RATIO` | 0.75 | Pull-down distance to snap collapsed |
| `NEXT_READ_STACK_PREVIEW_VISIBLE_COUNT` | 2 | Secondary items shown faded in preview |

### 3. State variables (~lines 99–118)

All `nextReadStack*` variables — drag state, expanded/peeked flags, cached heights.

### 4. State and geometry (~lines 1503–1583)

| Function | Purpose |
|---|---|
| `setNextReadStackState()` | Snap to peek / collapsed / expanded |
| `syncNextReadStackExperimentCard()` | Re-sync on resize without full re-render |
| `getNextReadStackExpandedShellHeightPx()` | Content-driven expanded height |
| `getNextReadStackTranslateY()` | Map state → pixel offset |
| `getNextReadStackCurrentTranslateY()` | Read current drag position |
| `applyNextReadStackDragVisual()` | 1:1 finger tracking during drag |

### 5. Gesture handlers (~lines 1857–1989)

`bindNextReadStackGestureHandlers()` — full touchstart / touchmove / touchend / tap logic.

Also copy `getTrackedTouch()` (~line 1722).

### 6. DOM builder (~lines 2036–2152)

The entire stack branch inside `renderBottomTrendingStoryBar()`:

- Pull handle
- Optional editor/presenter message
- Title
- Numbered links → **replace with numbered questions**
- Newsletter row

### 7. Ad slot (~lines 2009–2027, optional)

`ensureNextReadStackAdSlot()` / `removeNextReadStackAdSlot()` for a fixed 50px unit at viewport bottom.

### 8. Frame sync (~lines 2477–2496)

Simplified version of `scheduleBottomTrendingFrameUpdate()` — call `shouldShow()` and `syncStackCard()` on scroll/resize via `requestAnimationFrame`.

---

## What to stub (do not copy nav-specific logic)

| Nav function | Trivia replacement |
|---|---|
| `getNextReadRecommendation()` | `config.getQuestions()` |
| `fetchRssFeedData()` / feed cache | Your trivia API or KV fetch |
| `getNextReadRelatedArticlesFromDom()` | Not needed |
| `waitForNextReadRelatedSection()` | Not needed |
| `isArticlePath()` | `config.shouldRunOnPage()` |
| `addNextReadVisitedPath()` | `config.markAnswered(id)` |
| `getNextReadVisitedPaths()` | `config.getAnsweredIds()` |
| `triggerPostHogRecording()` | `config.onTrack()` or no-op |
| `applyBottomTrendingBarLayout()` | Skip — stack is full-width on mobile |
| `isNextReadStackExperimentActive()` | Always true when module loaded (or gate on `mobileOnly`) |

---

## What to skip entirely

Do **not** copy these — they are other experiment modes or unrelated nav code:

- `.next-read-experiment` CSS and `bindNextReadExperimentScrollHandlers()` (scroll-through swipe bar)
- `#next-read-swipe-preview` and `bindNextReadSwipeGestureHandlers()` (pull-to-preview card)
- Nav pills, mega menus, communities dropdown
- `initNavigationScript()` entry point

---

## Rename map (nav → trivia)

| Nav | Trivia module |
|---|---|
| `#bottom-trending-story-bar` | `#trivia-stack-sheet` |
| `.next-read-stack-experiment` | `.trivia-stack-experiment` |
| `.stack-links` | `.stack-questions` |
| `.stack-link` | `.stack-question` |
| `.stack-link-index` | `.stack-question-index` |
| `.stack-editor-msg` | `.presenter-msg` |
| `getNextReadStackTitle()` | `getTriviaStackTitle()` |
| `nextReadRecommendationItems` | `triviaQuestions` |
| `nav_next_read_click` | `trivia_stack_question_click` |
| `NAV_NEXT_READ_STACK_EDITOR_MESSAGE` | `presenterMessage` |

You can keep nav class names internally for a faster first port; rename when polishing.

---

## Config mapping (nav loader flags → trivia module)

| Nav loader flag | Trivia module option |
|---|---|
| `NAV_NEXT_READ_SWIPE_ENABLED = true` | Implicit (module is loaded) |
| `NAV_NEXT_READ_EXPERIMENT_VARIANT = 'stack'` | Implicit |
| `NAV_NEXT_READ_STACK_THEME` | `theme: 'dark' \| 'yellow' \| ''` |
| `NAV_NEXT_READ_STACK_FROSTED` | `frosted: true` |
| `NAV_NEXT_READ_STACK_EDITOR_MESSAGE` | `presenterMessage: { … }` |
| `NAV_NEXT_READ_MIN_SHOW_SCROLL_PX` | `shouldShow()` or `showAfterScrollPx` |

### Enabling stack on staging (nav reference)

```javascript
window.NAV_NEXT_READ_SWIPE_ENABLED = true;
window.NAV_NEXT_READ_EXPERIMENT_VARIANT = 'stack';
window.NAV_NEXT_READ_STACK_THEME = 'yellow';
window.NAV_NEXT_READ_STACK_FROSTED = true;
```

Load `new_nav.js` from the **`staging`** branch after setting these flags.

---

## Trivia backend integration

Typical flow when questions come from an API or KV store:

```
1. Page loads (main trivia question already visible)
2. TriviaStack.init({ getQuestions: () => fetch('/api/trivia/related?count=3') })
3. User scrolls or completes main question → shouldShow() returns true
4. Sheet peeks up with up to 3 more questions
5. User pulls up → expanded view shows all questions + newsletter
6. User taps a question → onQuestionClick → your quiz/answer flow
7. markAnswered(id) → question excluded on next refresh
```

### KV store example (pseudocode)

```javascript
getQuestions: async () => {
  const today = new Date().toISOString().slice(0, 10);
  const payload = await kv.get(`trivia:daily:${today}`);
  const answered = JSON.parse(localStorage.getItem('trivia_answered') || '[]');
  return (payload.questions || [])
    .filter(q => !answered.includes(q.id))
    .slice(0, 3);
},

markAnswered: (id) => {
  const answered = JSON.parse(localStorage.getItem('trivia_answered') || '[]');
  if (!answered.includes(id)) {
    answered.push(id);
    localStorage.setItem('trivia_answered', JSON.stringify(answered));
  }
}
```

Filter **before** rendering so the sheet hides entirely when no unanswered questions remain.

---

## Three sheet states

| State | User sees | TranslateY |
|---|---|---|
| **Peek** | Minimized — handle barely visible | Fully offset down |
| **Collapsed** | Title + first question preview | Partial offset |
| **Expanded** | All questions + newsletter | `0` (flush to bottom above ad slot) |

Controlled by `setNextReadStackState({ expanded, peeked })` and gesture snap thresholds.

**Tap behavior (nav):** tap cycles peek → collapsed → expanded → peek.

**Drag behavior:** 1:1 finger tracking; release snaps based on `EXPAND_SNAP_RATIO` (0.25) and `COLLAPSE_SNAP_RATIO` (0.75).

---

## Suggested extraction order

1. **CSS** — paste styles; mock static HTML with hardcoded `--stack-translate-y` values
2. **Render** — build DOM from a static question array; no gestures yet
3. **Visibility** — wire scroll listener + `shouldShow()`
4. **Gestures** — add drag/tap snap behavior
5. **Backend** — wire `getQuestions()` to API/KV; add answered filtering
6. **Newsletter** — wire `onSubmit` callback
7. **Polish** — themes, frosted glass, presenter message, analytics

---

## Analytics events (suggested trivia naming)

| Nav event | Trivia equivalent |
|---|---|
| `nav_next_read_click` | `trivia_stack_question_click` |
| — | `trivia_stack_shown` |
| — | `trivia_stack_expanded` |
| — | `trivia_stack_newsletter_submit` |

Pass `{ question_id, position, category }` where useful.

---

## Minimal HTML integration example

```html
<link rel="stylesheet" href="/trivia-stack/trivia-stack.css">
<script src="/trivia-stack/trivia-stack.js"></script>
<script>
  TriviaStack.init({
    getQuestions: async () => {
      const res = await fetch('/api/trivia/more?count=3');
      return res.json();
    },
    shouldShow: () => window.scrollY >= 400,
    titleFormat: (cat) => cat ? `Today's ${cat} Trivia` : "Today's Trivia",
    onQuestionClick: (q) => { window.location.href = `/trivia/${q.id}`; },
    onTrack: (event, props) => posthog?.capture(event, props)
  });
</script>
```

---

## Quick reference: staging line ranges

| Section | ~Lines in `staging` `new_nav.js` (`239415f`) |
|---|---|
| Config constants | 49–57 |
| State variables | 99–118 |
| Stack CSS | 637–710 |
| Activation check | 1464–1466 |
| State / geometry | 1503–1583 |
| Gesture handlers | 1857–1989 |
| Ad slot | 2009–2027 |
| DOM render (stack branch) | 2036–2152 |
| Init entry | 2249–2286 |
| Frame sync hook | 2477–2496 |

---

## Related files in this repo

| File | Purpose |
|---|---|
| `new_nav.js` (`staging`) | Full implementation |
| `nav_script_loader_STAGING.html` (`staging`) | Loader + experiment flags |
| `nav_script_loader_PRODUCTION.html` (`main`) | Production — **no stack** |
| `STAGING_PRODUCTION_WORKFLOW.md` | Branch workflow |

---

## Next steps

1. Check out `staging` and open `new_nav.js` at the line ranges above.
2. Extract CSS + JS into `trivia-stack/` in the other project.
3. Implement `getQuestions()` against your trivia API or KV store.
4. Test peek / collapsed / expanded on a real mobile device (gestures are touch-only).
