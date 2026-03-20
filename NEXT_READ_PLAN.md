# Next Read Plan

## Goal
Upgrade the bottom "NEXT READ" story logic so it is context-aware and only appears on article pages.

## Scope
- Target file: `new_nav.js`
- Target function area: `initBottomTrendingStoryBar()` and related helper logic

## Desired Behavior
1. Show "NEXT READ" only on article pages.
2. Article page detection:
   - Last path segment should end in a numeric ID suffix, e.g. `...-10631149`.
3. On article pages, build RSS feed URL from the parent path:
   - Article: `/southeast/weyburn-review/semi-rollover...-10631149`
   - Feed: `/rss/southeast/weyburn-review/`
4. Parse feed newest-first and pick the first eligible item:
   - Exclude current article.
   - Exclude any article already visited this session.
5. If no eligible item in parent feed, fallback to top feed (`/rss`) and apply same exclusions.
6. If still no eligible item, do not render the bar.

## Session Tracking
Use session storage for visited pages:
- Key: `nav_next_read_visited_paths_v1`
- Value: JSON string array of normalized path strings.
- Add current article path to this list on page load.
- Optional cap: keep only last 100 entries.

## URL Normalization Rules
When comparing links:
- Use URL pathname only.
- Lowercase.
- Remove trailing slash.
- Ignore query/hash.

## Suggested Helpers
- `isArticlePath(pathname)`
- `getArticleParentPath(pathname)`
- `buildParentRssUrl(pathname)`
- `normalizePathForComparison(urlOrPath)`
- `getVisitedPathsFromSession()`
- `addVisitedPathToSession(path)`
- `pickNextEligibleItem(feedItems, currentPath, visitedSet)`

## Feed Selection Strategy
1. Parent feed from article parent path.
2. Global fallback feed (`/rss`).
3. Use first eligible item in order (do not hardcode "second newest").

## Error Handling
- If feed fetch fails, try fallback feed.
- If XML parse fails, try fallback feed.
- If no valid `<item><link>` values, fail gracefully.

## Acceptance Criteria
- Non-article pages: no "NEXT READ" bar.
- Article page + parent feed has eligible item: show it.
- Current article is newest in parent feed: show next eligible.
- Previously visited items are skipped within same session.
- No eligible item in parent feed: fallback to `/rss`.
- No eligible item anywhere: bar hidden.

## Nice-to-Have (Later)
- Session-level RSS cache with short TTL (2-5 minutes).
- Analytics events:
  - `next_read_shown`
  - `next_read_clicked`
  - `next_read_fallback_used`

