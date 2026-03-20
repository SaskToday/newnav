# Default nav fallback (when new nav doesn’t load)

**Status:** Pinned for later. Goal: no flash of default nav during load; show default nav on desktop only if the new nav script never loads.

---

## What’s already in place

**In `new_nav.js`:**
- When the new nav is successfully inserted and `initNavLogic()` has run, the script adds **`village-nav-loaded`** to `document.body`.
- If the script finds the nav already in the DOM (e.g. client-side navigation), it also adds `village-nav-loaded`.

So: **no class** = script didn’t run or failed before finishing. **Class present** = new nav is in place.

---

## What’s left to do (when you pick this up)

### 1. CSS

- Default nav should **start hidden** so there’s no flash during load.
- On **desktop only**, show the default nav **only** when we’ve decided the new nav didn’t load (using a second class).

```css
/* Always start hidden — no flash of default nav */
.mainnav {
  display: none;
}

/* Desktop: show default nav only when fallback is needed */
@media (min-width: 992px) {
  body.show-default-nav .mainnav {
    display: block !important; /* or flex, etc. */
  }
}
```

(Adjust `.mainnav` and breakpoint if yours differ.)

### 2. JS: when to show the default nav (fallback)

After giving the new nav script time to run, if `village-nav-loaded` is still not on `body`, add `show-default-nav` so the default nav appears.

Add this in the **same place you load the new nav script** (e.g. your loader, or a small inline script after the script tag):

```javascript
setTimeout(function() {
  if (!document.body.classList.contains('village-nav-loaded')) {
    document.body.classList.add('show-default-nav');
  }
}, 3000); // 3s; adjust if needed
```

Optional: in your loader’s **error** handler (when the nav script fails to load), call the same check or add `show-default-nav` there so the fallback appears sooner on load failure.

### 3. Resulting behavior

| Phase | Default nav | New nav |
|-------|-------------|--------|
| During load | Hidden (no flash) | Loading |
| New nav loads | Stays hidden (`village-nav-loaded`) | Visible |
| New nav doesn’t load | Shown after timeout (`show-default-nav`) | Not present |

---

## Quick reference: classes

| Class on `body` | Set by | Meaning |
|-----------------|--------|--------|
| `village-nav-loaded` | `new_nav.js` when new nav is in place | New nav is active; hide default nav. |
| `show-default-nav` | Your page/loader after timeout if new nav didn’t load | Show default nav as fallback (desktop). |

---

## Related

- Default nav is hidden with CSS (e.g. `.mainnav { display: none }`). Mobile hamburger open state overrides this to show the menu when needed.
- This flow only affects **desktop**; keep your existing mobile behavior as-is.
