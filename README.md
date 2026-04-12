# HANGMAN: A Visual Masterpiece

![HANGMAN](https://img.shields.io/badge/Made%20by-Mayuk-blueviolet?style=flat-square)
![Version](https://img.shields.io/badge/version-2.3.2-brightgreen?style=flat-square)
![Status](https://img.shields.io/badge/status-stable-blue?style=flat-square)
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-orange?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Windows-informational?style=flat-square)

**A retro-futuristic arcade Hangman experience built with React, TypeScript, Tailwind CSS, Tauri, and Vite.**

> **📚 Documentation** — [Changelog](CHANGELOG.md) • [License](LICENSE) • [GitHub](https://github.com/MayukXT/hangman)

---

## 🎮 Features

### Core Gameplay
- **Three Difficulty Levels**: EASY (2-4 letters), NORMAL (5-7 letters), HARD (8-12+ letters)
- **Multiple Game Modes**: DEFAULT (progression-based) and CASUAL (endless replay)
- **Themed Word Pools**: Space, Astronomy, Movies, History, Colors, and more
- **Dynamic Hints & Clues**: Each word comes with a cryptic clue to guide your guesses
- **Hearts System**: 5 lives in DEFAULT mode with progressive difficulty

### UI/UX Excellence
- **Cinematic Intro Sequence**: Unskippable 10-second "VISUAL MASTERPIECE" animated sequence on startup with retro typography
- **Flawless Win Highlight**: Perfect-play detection (0 mistakes) with ambient golden glow animations
- **Radial Wave Accent System**: Click any color palette button to trigger a cinematic radial wave across all UI elements (FANCY mode only)
- **Dynamic Theming**: 5 accent colors (Red, Yellow, Cyan, Purple, Green) with customizable wave speed (1-10)
- **Graphics Modes**: FANCY (full animations, scanlines, blur effects) vs LIGHT (minimal GPU usage)

### Retro Aesthetic
- **CRT Scanlines**: Authentic arcade monitor look with overlay effects
- **Pixel-Perfect Typography**: Mix of Press Start 2P, Orbitron, VT323, and JetBrains Mono fonts
- **8-bit Sound Design**: Procedurally generated sound effects using Web Audio API (correct, wrong, level-up, game-over)
- **Floating Particles**: Subtle retro rocket animations in the background (FANCY mode)

### Data Persistence
- **Auto-Save**: Game state cached to localStorage (debounced 300ms)
- **High Score Tracking**: Persistent high score across sessions
- **Username System**: Player identity with easy change/reset options
- **Accent Preference**: Your chosen accent color saved automatically

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org))
- **pnpm** or **npm** (npm comes with Node)

### Installation

```bash
# Clone the repository
git clone https://github.com/MayukXT/hangman.git
cd hangman

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

The game will open at **http://localhost:1420/**

---

## 📦 Build & Deployment

### Development
```bash
npm run dev       # Start Vite dev server with hot reload
npm run type-check # TypeScript validation
```

### Production
```bash
npm run build     # Compile to dist/
npm run preview   # Preview production build locally
```

### Desktop App (Tauri)
```bash
npm run tauri dev   # Launch local desktop app build
npm run tauri build # Create production installer
```

---

## 🎯 Difficulty Progression (DEFAULT Mode)

| Score Range | Difficulty | Letter Range | Hearts |
|-------------|-----------|--------------|--------|
| 0-2 | EASY | 2-4 | 5 |
| 3-17 | NORMAL | 5-7 | 4 |
| 18-66 | HARD | 8-12+ | 3 |
| 67+ | INSANE | Random | 0 (no safety net) |

**Perfect Guesses** (0 mistakes) earn **2x points** and trigger the golden "FLAWLESS" highlight!

---

## 🎨 Theme Words

Words are thematically organized:

- **SPACE**: astronomy, planets, space exploration
- **ASTRONOMY**: constellations, celestial mechanics
- **MOVIES**: cinema, filmmaking, famous films
- **HISTORY**: historical events, figures, eras
- **COLORS**: color theory, visual perception

New themes can easily be added to [src/data/words.ts](src/data/words.ts).

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript 5 |
| **Styling** | Tailwind CSS 4 + Custom Keyframes |
| **Bundler** | Vite 7 |
| **Animations** | Framer Motion 12 (intro), CSS Keyframes (UI) |
| **State** | React Hooks + localStorage |
| **Audio** | Web Audio API + MP3 (Web Audio synthesis + sound effects) |
| **Desktop** | Tauri 2 (Rust backend) |
| **Updates** | Tauri Updater Plugin (automatic OTA) |

---

## 📁 Project Structure

```
hangman/
├── src/
│   ├── components/           # React UI components
│   │   ├── GameScreen.tsx    # Main game interface
│   │   ├── IntroScreen.tsx   # 10-sec cinematic opening
│   │   ├── MenuScreen.tsx    # Main menu
│   │   ├── GlobalSettings.tsx # Settings panel
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useWaveAccent.tsx # Radial wave & accent system
│   │   ├── useGraphics.tsx   # Graphics mode toggle
│   │   └── useOnClickOutside.ts
│   ├── utils/
│   │   ├── audio.ts          # Web Audio synthesis
│   │   ├── gameConstants.ts  # Difficulty & points config
│   │   └── cn.ts             # Class name utility
│   ├── data/
│   │   ├── words.ts          # Word pools & themes
│   │   └── Sound Effects/    # (optional: for .mp3 assets)
│   ├── types.ts              # TypeScript interfaces
│   ├── App.tsx               # Root component + routing
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles & keyframes
├── src-tauri/                # Tauri desktop app config
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🎮 How to Play

1. **Name Entry**: Enter your name (or keep the default)
2. **Mode Select**: Choose DEFAULT (progression) or CASUAL (endless)
3. **Difficulty**: Start at EASY, progress through NORMAL → HARD → INSANE
4. **Guess Letters**: Click keyboard buttons or press keys on your physical keyboard
5. **Use Hints** (costs 2 points): Reveals the word's cryptic hint
6. **Win Condition**: Reveal all letters before mistakes = max
7. **Level Up**: Progressing difficulty unlocks new themes and increases the challenge

**Perfect Guess Bonus**: Solve with 0 mistakes to earn double points and trigger the FLAWLESS visual reward!

---

## ⚙️ Settings

### Graphics Mode
- **FANCY**: Full animations, CRT scanlines, wave effects, floating particles
- **LIGHT**: No animations, minimal GPU usage, instant UI responses

### Accent Color
- Click any color dot to trigger a radial wave across all keyboard keys
- Wave speed adjustable (1-10) in FANCY mode

### Audio
- Toggle SFX on/off in the settings menu
- All sounds procedurally generated (no external audio files required)

### Reset
- **Change Username**: Modify your player identity
- **Reset Application**: Wipe all data (high scores, progress, settings)

---

## 🐛 Known Limitations

- **Wave accent**: Only appears in FANCY graphics mode (LIGHT mode skips it for performance)
- **Browser Support**: Requires a modern browser with Web Audio API and View Transitions support
- **Mobile**: Touch-friendly keyboard, but best played on desktop/tablet

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and release notes.

---

## 📧 Support & Feedback

Found a bug? Have a feature request? Open an issue on [GitHub](https://github.com/MayukXT/hangman/issues).

---

## 👨‍💻 Author

**Mayuk** — Crafted with obsessive attention to retro-futuristic UX detail.

[![GitHub](https://img.shields.io/badge/GitHub-MayukXT-181717?style=flat-square&logo=github)](https://github.com/MayukXT)

🎮 *"A VISUAL MASTERPIECE"*

---

## � Documentation & Resources

| Document | Purpose |
|----------|---------|
| [**CHANGELOG.md**](CHANGELOG.md) | All version history, features, and bug fixes |
| [**LICENSE**](LICENSE) | CC BY-NC 4.0 license with attribution requirements |
| [**GitHub Issues**](https://github.com/MayukXT/hangman/issues) | Bug reports and feature requests |
| [**GitHub Releases**](https://github.com/MayukXT/hangman/releases) | Download installers and release notes |

---

## �📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit to the original developer **Mayuk** ([@MayukXT](https://github.com/MayukXT)), provide a link to the original project, and indicate if changes were made.
- **NonCommercial** — You may not use the material for commercial purposes.

See the full license in [LICENSE](LICENSE).
