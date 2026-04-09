# Hangman: Retro Arcade Challenge Rules

Welcome to the ultimate test of lexical survival! Here are the core rules algorithms governing your run:

## 1. Game Modes
* **DEFAULT (Endless):** The marquee mode. You begin at `EASY` difficulty. Every time you cross a win threshold, you automatically level up to a harder difficulty. Lose once, and your run is completely wiped.
* **CASUAL (Easy, Normal, Hard):** Choose a specific difficulty limit. The game will not scale, but you can see how many words you can gather at that static difficulty rate.

## 2. Default Level-Up Algorithm
* **Level 1 (EASY):** Win 3 words to rank up. (Max mistakes per word: 8)
* **Level 2 (NORMAL):** Win 5 words to rank up. (Max mistakes per word: 6)
* **Level 3 (HARD):** Win 7 words to rank up. (Max mistakes per word: 4)
* **Level 4 (INSANE):** The final endurance mode! You have just 3 mistakes allowed per word, and the themes of the words are randomized! You stay here until you die.

## 3. The Scoring Economy
Score is only logged to your Highscore if you out-score your previous best. Remember, if you make too many mistakes on a single word and the Hangman is fully drawn, **your current run's score resets to 0!**
* **Easy Win:** +1 Point
* **Normal Win:** +3 Points
* **Hard Win:** +7 Points
* **Insane Win:** +15 Points
* **Flawless Victory:** If you guess a word with 0 mistakes, your reward points are Multiplied by 2x!

## 4. The Unfolding Hint System
At any given moment, you know the **Theme** of the current word. However, if you are truly stuck, you can deploy the Hint Strip.
* Every hint costs **2 Points** directly deducted from your active score.
* The hint strip will unfold across the screen with a specific trivia clue about the exact word you are guessing. 
* *Warning:* If you have less than 2 points, you cannot afford a hint! Think strategically.

Good luck, you wanna-be-PRO!
