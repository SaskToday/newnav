# Why GitHub Pages Worked But jsDelivr Didn't

## The Key Difference

When loading directly from GitHub Pages, the script likely worked because:
1. **No aggressive caching** - GitHub Pages serves fresh content more reliably
2. **Script execution timing** - The script executed at the right time for SPA navigation

When switching to jsDelivr (with `@staging` branch name), it failed because:
1. **jsDelivr cached the old version** - Served stale code
2. **The old version didn't handle SPA navigation** - Only used `DOMContentLoaded`

## But Wait - The Fallback Could Be a Factor

### Potential Issue with Fallback Mechanism

The fallback script uses `onerror` to load from GitHub Pages if jsDelivr fails:

```javascript
script.onerror = function(e) {
    // Fallback to GitHub Pages
    const fallbackScript = document.createElement('script');
    fallbackScript.src = 'https://neilmorrharvard.github.io/newnav/new_nav.js' + cacheBuster;
    fallbackScript.defer = true;
    document.head.appendChild(fallbackScript);
};
```

### Why This Could Cause Issues

1. **Timing Problem**: If jsDelivr loads but serves old version, `onerror` doesn't fire
   - Script loads (200 status) ✅
   - But it's old version ❌
   - Fallback never triggers ❌
   - Old version runs and fails on subsequent pages ❌

2. **Double Loading**: If jsDelivr actually fails, fallback loads
   - First script fails → `onerror` fires
   - Fallback script loads
   - But if first script already started executing, you might get conflicts

3. **Cache-Busting**: The fallback uses `cacheBuster` but GitHub Pages might cache differently
   - jsDelivr: Aggressive caching by branch name
   - GitHub Pages: Less aggressive, but still caches

## Why GitHub Pages Worked

When loading directly from GitHub Pages:
- No jsDelivr caching layer
- Script was always fresh (or at least more recent)
- If you were using a direct URL without branch name, it might have been serving the latest version

## The Real Fix

The commit hash approach fixes it because:
1. **Bypasses jsDelivr branch caching** - Gets exact version immediately
2. **No need for fallback** - Primary source works reliably
3. **Consistent behavior** - Same version every time

## Could the Fallback Be Improved?

### Current Fallback Logic
```javascript
script.onerror = function(e) {
    // Only triggers if script fails to load (network error, 404, etc.)
    // Does NOT trigger if script loads but is wrong version
};
```

### Better Fallback Strategy

We could add version verification:

```javascript
script.onload = function() {
    // Wait a bit for script to execute
    setTimeout(() => {
        if (!window.navVersion) {
            console.warn('Script loaded but navVersion not set, trying fallback');
            // Load fallback
        }
    }, 100);
};
```

But this is probably overkill now that we're using commit hashes.

## Conclusion

**The fallback wasn't the problem** - it's actually a good safety net. The issue was:
1. jsDelivr serving cached old version (commit hash fixes this)
2. Old version didn't handle SPA navigation (new version fixes this)

The fallback would only trigger if jsDelivr completely failed to load, not if it served a cached version.

