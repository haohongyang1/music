## ADDED Requirements

### Requirement: Song playback page
The system MUST provide a playback page for each song that displays all score pages in order.

#### Scenario: Open a song for playback
- **WHEN** the user selects a song from the library
- **THEN** the system SHALL open a playback view for that song
- **AND THEN** the song's score pages SHALL be shown in sequence

### Requirement: Per-song speed persistence
The system MUST store playback speed independently for each song in browser local storage.

#### Scenario: Restore a saved speed
- **WHEN** the user revisits a song playback page
- **AND WHEN** a speed was previously saved for that song
- **THEN** the system SHALL restore the saved speed for that song

### Requirement: Automatic scrolling playback
The system MUST support automatic scrolling playback with pause, resume, restart, and manual progress control.

#### Scenario: Start and control autoplay
- **WHEN** the user starts playback
- **THEN** the system SHALL scroll the score automatically according to the selected speed
- **AND WHEN** the user pauses playback
- **THEN** the scrolling SHALL stop
- **AND WHEN** the user restarts playback
- **THEN** the song SHALL return to the beginning and begin again

### Requirement: Song navigation
The system MUST allow moving to the previous or next song from the playback page.

#### Scenario: Navigate between songs
- **WHEN** the user activates the previous or next song control
- **THEN** the system SHALL open the adjacent song in the library order

### Requirement: Fullscreen score-only mode
The system MUST allow entering fullscreen mode from the playback page, and fullscreen mode MUST show only the score pages.

#### Scenario: Enter fullscreen score reading
- **WHEN** the user activates the fullscreen control on the playback page
- **THEN** the score reading area SHALL enter fullscreen when the browser supports fullscreen
- **AND THEN** all playback headers, side controls, page toolbars, and navigation controls SHALL be hidden from the fullscreen presentation
- **AND THEN** automatic scrolling SHALL continue to operate against the fullscreen score container

### Requirement: Fullscreen quick controls
The system MUST reveal a minimal control overlay when the user clicks or taps the fullscreen score area.

#### Scenario: Reveal fullscreen controls
- **WHEN** the user is in fullscreen score reading mode
- **AND WHEN** the user clicks or taps the score area
- **THEN** the system SHALL reveal a minimal overlay with play/pause, speed, and exit fullscreen controls
- **AND THEN** the overlay SHALL hide again after a short idle period
- **AND THEN** interacting with the overlay SHALL NOT exit fullscreen mode

### Requirement: Tablet playback layout
The system MUST provide a tablet-friendly playback layout with reachable controls and readable score sizing.

#### Scenario: Use playback page on tablet width
- **WHEN** the playback page is rendered on a tablet-sized viewport
- **THEN** the system SHALL arrange controls above the score as a compact toolbar
- **AND THEN** the score image SHALL use the available width without horizontal overflow
- **AND THEN** fullscreen controls SHALL remain large enough for touch input
