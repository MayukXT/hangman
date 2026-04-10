# Changelog

All notable changes to HANGMAN will be documented in this file.

---

## Versioning & Release Rules

### Version Format: `vX.Y.Z`
- **X**: Major version — Breaking changes, major redesigns, architectural shifts.
- **Y**: Minor version — New features, gameplay additions, UI changes.
- **Z**: Patch version — Bug fixes, small tweaks, dependency updates.
- Example: `v1.0.0` → `v1.0.1` (bug fix) → `v1.1.0` (new feature) → `v2.0.0` (major redesign).

### Developer Checklist (Before Every Release)
- **[ ] Update `APP_VERSION`** in `src/utils/gameConstants.ts` to match the new tag.
- **[ ] Update `version.json`** (if OTA Update feature is active) with the new version string and release notes.
- **[ ] Update this CHANGELOG.md** with a new version section listing all changes.
- **[ ] Update `README.md`** if features, setup, or user-facing behavior changed.
- **[ ] Update `docs/Notes.md`** if dev patterns, architecture, or gotchas were discovered.
- **[ ] Create a git tag** (e.g., `git tag v2.2.0`) and push.
- **[ ] Build release artifacts**: Run the full build pipeline and generate `.exe` (Windows), `.msi` (Windows installer), and `.apk` (Android — when ready).
- **[ ] Upload builds** to GitHub Releases or your distribution channel.

---

## [v2.3.0] - 2026-04-10

### Fixed
- **Executable Links**: Fixed an issue in the desktop build where external links to GitHub profiles and repositories were unresponsive. Implemented Tauri's shell plugin to securely open URLs in the native OS browser.
- **Title Animation**: Adjusted the pacing of the "Hangman" intro zoom-out effect by extending the static phase readability and introducing a steady, firm vibration lock effect.
- **Documentation**: Scrubbed auto-generated development references from project metadata.

### Changed
- **Versioning**: Switched to semantic versioning (`vX.Y.Z` — major.features.fixes).
- **Signed Releases**: Added GitHub Actions workflow for automated builds and code signing.

---

## [v2.2.0] - 2026-04-10

### Added
- **Automatic OTA Updates**: In-app update checker using Tauri Updater Plugin. App silently checks GitHub Releases on launch, shows an update card in the menu and About screen, and installs updates with a progress bar — no manual download needed.
- **ErrorBoundary**: Top-level crash recovery wrapper. If something explodes at runtime, the app shows a friendly error screen instead of a blank white crash.
- **Updater Signature Verification**: All update artifacts are cryptographically signed. The app verifies the signature before installing — prevents tampered updates.
- **version.json**: Fallback version endpoint for browser/dev mode update checks when Tauri API isn't available.

### Changed
- **App Icon**: All icons (exe, installer, taskbar, tray) regenerated from the new `Hangman Icon.png` source across all required sizes and formats (ICO, ICNS, PNG, Android, iOS).
- **Version Sync**: `tauri.conf.json` version bumped to `2.2.0` to match `APP_VERSION`.
- **Sound File Rename**: `Hangman Intro.mp3` → `HangmanIntro.mp3` (removed space for consistency).
- **Tech Stack**: Upgraded to React 19, Vite 7, Framer Motion 12, Tailwind CSS 4.

### Fixed
- **Unused Imports**: Removed unused `Settings`, `Volume2`, `VolumeX`, `Trash2`, `Palette`, `AccentColorId`, `useOnClickOutside` imports from `GameScreen.tsx`.
- **GithubIcon Style Prop**: Added missing `style` prop type to inline SVG component in `GlobalSettings.tsx`.
- **tsconfig BaseUrl**: Removed deprecated `baseUrl` and unused `paths` alias from `tsconfig.json`.

### Removed
- `src/App.tsx.backup` — stale backup file removed from repo and disk.
- Docs files (`GAME_RULES.md`, `Notes.md`, `new-plans.md`) moved out of git tracking (gitignored under `docs/`).

---

## [v2.1.0] - 2026-04-09

### Fixed
- **Wave Accent Keyboard Borders**: Fixed bug where keyboard key borders remained permanently glowing after being typed. Animation cleanup now properly removes `.animate-wave-bump` class after each wave cascade completes.
- **Wave Timing Synchronization**: Wave delay calculations now sync directly with `wave.durationMs` engine, ensuring keyboard keys light up in perfect cascade timing relative to the radial wave speed setting.

### Improved
- **Flawless UI Visual Feedback**: Enhanced the perfect-play detection (0 mistakes) with golden amber glow animations. Word tiles now receive `animate-flawless` pulsing border effect, and the entire Hangman container gets an amber shadow border when a flawless victory is triggered.
- **HUD Button Alignment**: Settings, Restart, and Menu buttons now perfectly height-matched at `52px` with consistent flex-stretch layout. All buttons align on `top-6` with `gap-4` spacing for pixel-perfect symmetry.
- **Lives Display Redesign**: Moved hearts indicator from inside the Score box to top-right of screen as full-size `Press_Start_2P` retro pixel hearts (`♥`) with heavy drop shadow for authentic arcade feel.

### Changed
- **Wave Speed Slider Visibility**: In LIGHT graphics mode, the Wave Speed slider is now hidden to reduce UI clutter. Only visible in FANCY mode where animations are enabled.
- **Intro Screen Scale**: Redesigned IntroScreen to fill entire viewport for maximum cinematic impact. "HANGMAN" now flies past camera at much larger initial scale, and "VISUAL MASTERPIECE" sequence uses full screen width.

---

## [v2.0.0] - 2026-04-08

### Added
- **Cinematic Intro Sequence**: New 10-second unskippable "A VISUAL MASTERPIECE" intro with framer-motion animations. Text flies in from off-screen, scales dynamically, and features a glitchy "BY MAYUK" broadcast banner.
- **Radial Wave Accent System**: Click any color palette button to trigger a cinematic radial wave that cascades across all keyboard keys with color-matched glow effect.
- **Dual Graphics Modes**: New FANCY vs LIGHT modes. FANCY includes CRT scanlines, blur effects, floating particles, and wave animations. LIGHT mode strips all GPU work for minimal performance impact.
- **Flawless Win Detection**: Detects when a word is solved with 0 mistakes and triggers special visual reward.

### Improved
- **UI Polish**: Added scanline overlays, improved animations, refined color theming across all screens.

---

## [v1.0.0] - 2026-04-01

### Added
- **Core Hangman Gameplay**: Basic word-guessing loop with keyboard input.
- **Three Difficulty Levels**: EASY (2-4 letters), NORMAL (5-7 letters), HARD (8-12+ letters).
- **Game Modes**: DEFAULT (progression-based) and CASUAL (endless).
- **Themed Word Pools**: 5 themed dictionaries (Space, Astronomy, Movies, History, Colors).
- **Hints & Clues**: Each word includes cryptic clues to guide players.
- **Hearts System**: 5 lives in DEFAULT mode with progressive difficulty scaling.
- **Data Persistence**: localStorage auto-save for game state, high scores, username, and accent preferences.
- **Retro Aesthetics**: Pixel-perfect typography using Press Start 2P, Orbitron, VT323, and JetBrains Mono.
- **Web Audio SFX**: Procedurally generated 8-bit sound effects (correct, wrong, level-up, game-over).
- **Tauri Desktop App**: Optional desktop build with native window and installer.
