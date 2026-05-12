## Why

The app currently shows the default Vite starter screen instead of helping users browse and practice the score images already stored in `src/assets/imgs`. Users need a focused score library and a playback mode that can automatically advance through a score at a comfortable practice speed.

## What Changes

- Add a score library page that groups score images into songs and shows parsed song summaries from the existing images.
- Sort songs by the first letter of their title pinyin, with visible letter grouping for scanning.
- Add a song playback page that displays the score pages, supports play/pause auto-scrolling, restart, page jumping, progress feedback, and previous/next song navigation.
- Improve song presentation so each card has stronger cover treatment, clearer metadata, and obvious primary action affordances.
- Add a fullscreen score-reading mode that hides all non-score UI and keeps only the score pages visible.
- Add per-song playback speed settings saved in browser local storage.
- Replace the starter Vite UI with a responsive, practice-oriented score experience.

## Capabilities

### New Capabilities
- `score-library`: Browsing parsed score image metadata, summaries, and sorted song groups.
- `score-autoplay`: Viewing a song's score pages with automatic playback/scrolling and per-song speed persistence.

### Modified Capabilities

## Impact

- Affected React files: `src/App.jsx`, `src/App.css`, `src/index.css`.
- New local data module for parsed score metadata and image imports.
- Browser local storage used for per-song speed preferences.
- No new runtime dependencies or backend services.
