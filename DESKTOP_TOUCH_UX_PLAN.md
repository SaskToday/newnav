# Desktop touch UX (parked – come back later)

**Goal:** On large tablets (e.g. iPad Pro) with desktop viewport, make the nav work well with touch: first tap on a parent opens the mega menu; second tap on the same parent goes to the link.

**Approach (agreed):** Use existing hover/open state instead of pointer detection.

- When user clicks a parent item, check: **Is that parent’s mega menu already visible?**
  - **Yes** → allow default (navigate to parent link).
  - **No** → prevent default and open that parent’s mega menu.
- Close mega menu on tap/click outside (reuse existing logic).
- No `pointerType` or “mouse vs touch” detection; hover naturally opens the menu for mouse users before they click.

**Edge case:** There is a 100ms (or 50ms when moving between parents) delay before the mega menu is shown on `mouseenter`. A mouse user who clicks within that window will get “first click opens menu” instead of navigating. Options: leave as-is, shorten/remove delay, or treat “click while showTimeout is pending” as “navigate” (extra logic).

**Relevant code:** Desktop hover and mega menu open/close in `new_nav.js` (e.g. `pill.addEventListener('mouseenter', ...)`, `showTimeout`, `show()`, `desktopHoverArmed`). Parent items are `.category-pill` and `#comm-container`; they are links or buttons that currently navigate on click. Need to add a click handler (desktop viewport only) that implements the rule above.

**Status:** Not implemented; revisit when ready.
