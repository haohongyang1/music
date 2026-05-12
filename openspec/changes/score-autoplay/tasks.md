## 1. Data and navigation

- [x] 1.1 Create a local score metadata module that imports the score images, adds parsed song titles, summaries, pinyin sort keys, page groups, and stable song IDs
- [x] 1.2 Replace the starter app shell with hash-based navigation between the score library and song playback pages

## 2. Library view

- [x] 2.1 Build the library view with alphabetical grouping, song cards, and parsed summary fields
- [x] 2.2 Add library interactions for opening a song and showing page count, key, and source info

## 3. Playback view

- [x] 3.1 Build the song playback page with ordered score pages, previous/next controls, and progress feedback
- [x] 3.2 Implement autoplay scrolling, pause/resume/restart controls, and manual position scrubbing
- [x] 3.3 Persist per-song speed in local storage and restore it on revisit

## 4. Polish and verification

- [x] 4.1 Refine layout and responsive styling for desktop and mobile
- [x] 4.2 Run lint and build verification, then fix any regressions

## 5. Presentation and fullscreen refinement

- [x] 5.1 Improve library song cards with stronger cover treatment, metadata hierarchy, and a clear open action
- [x] 5.2 Add fullscreen score-only mode to the playback page and hide all non-score UI in fullscreen
- [x] 5.3 Re-run lint and build verification after the refinement

## 6. Fullscreen quick controls

- [x] 6.1 Add a fullscreen click/tap handler that reveals a minimal overlay without disrupting scrolling
- [x] 6.2 Add fullscreen play/pause and speed controls with auto-hide behavior
- [x] 6.3 Re-run lint and build verification after fullscreen control changes

## 7. Tablet fullscreen exit and layout

- [x] 7.1 Add an explicit exit fullscreen control inside the fullscreen overlay for tablet use
- [x] 7.2 Add tablet-specific library and playback layout rules for 641px-1100px viewports
- [x] 7.3 Re-run lint and build verification after tablet refinements
