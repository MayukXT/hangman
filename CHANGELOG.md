# Changelog

All notable changes to HANGMAN will be documented in this file.

## [v2.1] - 2026-04-09

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

## [v2.0] - 2026-04-08

### Added
- **Cinematic Intro Sequence**: New 10-second unskippable "A VISUAL MASTERPIECE" intro with framer-motion animations. Text flies in from off-screen, scales dynamically, and features a glitchy "BY MAYUK" broadcast banner.
- **Radial Wave Accent System**: Click any color palette button to trigger a cinematic radial wave that cascades across all keyboard keys with color-matched glow effect.
- **Dual Graphics Modes**: New FANCY vs LIGHT modes. FANCY includes CRT scanlines, blur effects, floating particles, and wave animations. LIGHT mode strips all GPU work for minimal performance impact.
- **Flawless Win Detection**: Detects when a word is solved with 0 mistakes and triggers special visual reward.

### Improved
- **UI Polish**: Added scanline overlays, improved animations, refined color theming across all screens.

---

## [v1.0] - 2026-04-01

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
