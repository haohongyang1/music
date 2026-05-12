## Context

The project is a Vite + React single-page app with score images stored locally under `src/assets/imgs`. There is no backend, router, OCR pipeline, or music playback engine. The initial implementation needs to make those static score images useful for browsing and practice while staying dependency-free.

## Goals / Non-Goals

**Goals:**
- Convert the default starter screen into a score practice app.
- Represent parsed score information in a local data module with stable song IDs, image page imports, summaries, key information, source metadata, and pinyin sort keys.
- Provide a list view sorted by song title pinyin and a playback view for each song.
- Support automatic vertical scrolling through score pages with per-song speed preferences stored in local storage.
- Keep the UI responsive and usable on desktop and mobile.

**Non-Goals:**
- Full OCR or computer-vision parsing at runtime.
- Audio synthesis, metronome, or MIDI playback.
- Editing score metadata from the browser.
- Multi-user sync or remote persistence.

## Decisions

- Store parsed metadata in code rather than generating it at runtime.
  - Rationale: the images are known local assets, and runtime OCR would add weight, latency, and a new dependency without improving the initial user flow.
  - Alternative considered: derive metadata from filenames. Rejected because filenames do not include titles, artists, keys, or page grouping.

- Use hash-based in-app navigation instead of adding a router dependency.
  - Rationale: the app only needs a library view and score playback view, so hash routes provide shareable URLs and browser back support with no dependency cost.
  - Alternative considered: React Router. Rejected as unnecessary for the current surface area.

- Implement autoplay as controlled window scrolling with `requestAnimationFrame`.
  - Rationale: the primary practice behavior is visual score advancement, not audio timing. Frame-based scrolling is smooth, easy to pause, and works with normal document layout.
  - Alternative considered: page-by-page timers. Rejected because continuous scroll better matches long image scores and allows manual progress feedback.

- Persist speed by song ID in local storage.
  - Rationale: different songs and page densities need different speeds, and users expect their practice speed to remain stable per song.
  - Alternative considered: one global speed. Rejected because it does not match the requirement to bind speed to each song.

## Risks / Trade-offs

- Parsed metadata may become stale when images are replaced or added. → Keep score metadata centralized in one data module so updates are obvious.
- Continuous scrolling may feel too fast or slow on unusually tall displays. → Use a bounded speed range and a live progress slider so users can correct position quickly.
- Local storage can be unavailable or cleared. → Treat saved speed as a convenience and fall back to a default speed.
