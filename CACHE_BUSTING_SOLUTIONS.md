# Cache-Busting Solutions for Staging/Production

## The Problem

jsDelivr caches files aggressively, which means updates pushed to GitHub may not appear immediately on your staging site. This makes testing difficult.

## Solutions

### Option 1: Timestamp Cache-Busting (Recommended for Staging)

**File:** `nav_script_loader_STAGING_WITH_CACHE_BUST.html`

**How it works:**
- Adds `?v=timestamp` to the URL on each page load
- Forces browser and CDN to fetch fresh version
- Perfect for staging/testing

**Pros:**
- ✅ Always sees latest updates immediately
- ✅ No manual updates needed
- ✅ Works automatically

**Cons:**
- ⚠️ Bypasses CDN caching (slower, but fine for staging)
- ⚠️ Not suitable for production (would hurt performance)

**Use this on:** Staging site only

### Option 2: Commit Hash in URL (Best for Both)

**File:** `nav_script_loader_STAGING_COMMIT_HASH.html`

**How it works:**
- Uses commit hash instead of branch name: `@8dde370` instead of `@staging`
- Each commit gets a unique URL, so no caching issues
- Update the hash when you push new changes

**Pros:**
- ✅ Immediate updates (new commit = new URL)
- ✅ Still uses CDN caching (fast)
- ✅ Works for both staging and production
- ✅ Versioned URLs (can rollback easily)

**Cons:**
- ⚠️ Need to update loader file with new commit hash (but can automate)

**Use this on:** Both staging and production

### Option 3: Manual Cache-Busting Parameter

Add a version parameter you update manually:

```javascript
const VERSION = '1.0.0'; // Update this when you push changes
script.src = 'https://cdn.jsdelivr.net/gh/neilmorrharvard/newnav@staging/new_nav.js?v=' + VERSION;
```

**Pros:**
- ✅ Simple
- ✅ You control when cache clears

**Cons:**
- ⚠️ Manual updates required
- ⚠️ Easy to forget

## Recommended Setup

### For Staging (Testing):
Use **Option 1** (Timestamp cache-busting):
- File: `nav_script_loader_STAGING_WITH_CACHE_BUST.html`
- Always sees latest updates
- Performance doesn't matter for testing

### For Production:
Use **Option 2** (Commit hash):
- File: `nav_script_loader_PRODUCTION.html` (update to use commit hash)
- Fast (uses CDN caching)
- Versioned (easy rollback)
- Update hash when deploying

## Implementation Guide

### Staging Setup (Timestamp Method)

1. Copy `nav_script_loader_STAGING_WITH_CACHE_BUST.html` to your staging site
2. That's it! Updates appear immediately on page refresh

### Production Setup (Commit Hash Method)

1. Get latest commit hash:
   ```bash
   git log main -1 --format="%H" --abbrev=7
   ```

2. Update production loader with commit hash:
   ```javascript
   const COMMIT_HASH = '8dde370'; // Update this
   script.src = 'https://cdn.jsdelivr.net/gh/neilmorrharvard/newnav@' + COMMIT_HASH + '/new_nav.js';
   ```

3. When you deploy new version, update the hash

### Automated Commit Hash (Advanced)

You could automate this with a build script:

```bash
#!/bin/bash
# update_nav_version.sh

COMMIT=$(git log main -1 --format="%H" --abbrev=7)
sed -i '' "s/const COMMIT_HASH = '.*'/const COMMIT_HASH = '$COMMIT'/" nav_script_loader_PRODUCTION.html
git add nav_script_loader_PRODUCTION.html
git commit -m "Update nav to commit $COMMIT"
```

## Quick Comparison

| Method | Staging | Production | Auto-Update | Performance |
|--------|---------|------------|-------------|-------------|
| Timestamp | ✅ Perfect | ❌ No | ✅ Yes | ⚠️ Slower |
| Commit Hash | ✅ Good | ✅ Perfect | ⚠️ Manual | ✅ Fast |
| Manual Version | ⚠️ OK | ⚠️ OK | ❌ No | ✅ Fast |

## My Recommendation

**Staging:** Use timestamp method (`nav_script_loader_STAGING_WITH_CACHE_BUST.html`)
- You want immediate updates for testing
- Performance doesn't matter

**Production:** Use commit hash method
- Fast (CDN caching)
- Versioned (easy rollback)
- Update hash when deploying (part of deployment process)

## Testing Cache-Busting

To verify it's working:

1. Make a change to navigation
2. Push to staging branch
3. Hard refresh staging site (Cmd+Shift+R / Ctrl+Shift+R)
4. Check console: `window.navVersion` should show new version
5. If using timestamp method, refresh again - should get new version

## Troubleshooting

**Still seeing old version?**
- Hard refresh browser (Cmd+Shift+R)
- Clear browser cache
- Check network tab - should see new request, not cached
- Verify you're using the right loader file

**Want to force clear jsDelivr cache?**
- Use commit hash method (new commit = new URL)
- Or wait ~5 minutes for jsDelivr cache to expire

