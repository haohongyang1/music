## ADDED Requirements

### Requirement: Song library grouping and ordering
The system MUST present all available songs in a library view, grouped and sorted by the first letter of each song's pinyin title.

#### Scenario: Library shows sorted groups
- **WHEN** the library view loads
- **THEN** the system SHALL render songs in ascending alphabetical groups by pinyin first letter
- **AND THEN** each song SHALL appear under the correct letter group

### Requirement: Parsed score summary
The system MUST show a parsed summary for each song based on the local score images before the user opens the playback page.

#### Scenario: Summary is visible in the library
- **WHEN** the library view renders a song card
- **THEN** the system SHALL display the song title, source summary, page count, and key metadata derived from the image set

### Requirement: Scannable song cards
The system MUST present each song with a visually clear card that emphasizes the score cover, song identity, key metadata, and a primary open action.

#### Scenario: Song card is easy to scan
- **WHEN** the library view renders song cards
- **THEN** each card SHALL show a score cover preview, title, artist, arranger, metadata chips, tags, and an explicit open affordance
- **AND THEN** the card layout SHALL remain readable on desktop and mobile widths

### Requirement: Local score image source
The system MUST use the score images stored locally in `src/assets/imgs` as the source for all library entries.

#### Scenario: Library uses local image assets
- **WHEN** the app builds the song list
- **THEN** each song SHALL reference one or more imported local image assets
- **AND THEN** no remote score image source SHALL be required
