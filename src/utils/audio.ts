// handles all the sounds - synth beeps for guesses and mp3s for everything else

import Fabulous1xURL from '../data/Sound Effects/Fabulous1x.mp3';
import Fabulous3xURL from '../data/Sound Effects/Fabulous3x.mp3';
import Fabulous5pURL from '../data/Sound Effects/Fabulous5p.mp3';
import Fabulous5xURL from '../data/Sound Effects/Fabulous5x.mp3';
import GameLostURL from '../data/Sound Effects/GameLost.mp3';
import HangmanIntroURL from '../data/Sound Effects/HangmanIntro.mp3';
import HeartLostDefaultModeURL from '../data/Sound Effects/HeartLostDefaultMode.mp3';
import HighScroreCrossURL from '../data/Sound Effects/HighScroreCross.mp3';
import HintURL from '../data/Sound Effects/Hint.mp3';
import LevelUpURL from '../data/Sound Effects/LevelUp.mp3';
import RoundLostCasualModeURL from '../data/Sound Effects/RoundLostCasualMode.mp3';
import RoundWinURL from '../data/Sound Effects/RoundWin.mp3';

const AUDIO_FILES: Record<string, string> = {
  'Fabulous1x': Fabulous1xURL,
  'Fabulous3x': Fabulous3xURL,
  'Fabulous5p': Fabulous5pURL,
  'Fabulous5x': Fabulous5xURL,
  'GameLost': GameLostURL,
  'HeartLostDefaultMode': HeartLostDefaultModeURL,
  'HighScroreCross': HighScroreCrossURL,
  'Hint': HintURL,
  'LevelUp': LevelUpURL,
  'RoundLostCasualMode': RoundLostCasualModeURL,
  'RoundWin': RoundWinURL,
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private buffers: Map<string, AudioBuffer> = new Map();
  private currentLongSFX: AudioBufferSourceNode | null = null;
  private introAudio: HTMLAudioElement | null = null;
  private decoded = false;

  constructor() {
    // browsers won't let you play audio until the user clicks/types something, so we wait for that
    const unlock = () => {
      this.initCtx();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
  }

  private async initCtx() {
    if (this.ctx) return;
    this.ctx = new window.AudioContext();
    await this.ctx.resume();
    await this.decodeAll();
  }

  private ensureCtx(): AudioContext | null {
    if (!this.isEnabled) return null;
    if (!this.ctx) {
      this.ctx = new window.AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // decode the sound files if we haven't already
    if (!this.decoded) {
      this.decoded = true;
      this.decodeAll();
    }
    return this.ctx;
  }

  public toggle(state: boolean) {
    this.isEnabled = state;
  }

  private async decodeAll() {
    const ctx = this.ctx;
    if (!ctx) return;
    const entries = Object.entries(AUDIO_FILES);
    const decodePromises = entries.map(async ([name, url]) => {
      if (this.buffers.has(name)) return;
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(name, audioBuffer);
      } catch (err) {
        console.error(`Failed to load audio: ${name}`, err);
      }
    });
    await Promise.all(decodePromises);
  }

  // intro music uses a regular <audio> element cause AudioContext is picky about autoplay
  public playIntro() {
    if (!this.isEnabled) return;
    try {
      this.introAudio = new Audio(HangmanIntroURL);
      this.introAudio.volume = 1;
      const playPromise = this.introAudio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // autoplay got blocked, try again when they click
          const retryPlay = () => {
            this.introAudio?.play().catch(() => {});
            window.removeEventListener('click', retryPlay);
            window.removeEventListener('keydown', retryPlay);
          };
          window.addEventListener('click', retryPlay);
          window.addEventListener('keydown', retryPlay);
        });
      }
    } catch (e) {
      // ignore
    }
  }

  // little bleep when you guess right
  public playCorrect() {
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // buzzy sound when you guess wrong
  public playWrong() {
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playMP3(name: string, options?: { loop?: boolean; startOffset?: number; loopStart?: number }) {
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const buffer = this.buffers.get(name);
    if (!buffer) {
      // sound isn't loaded yet, try again in a sec
      setTimeout(() => this.playMP3(name, options), 200);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    if (options?.loop) {
      source.loop = true;
      if (options.loopStart !== undefined) {
        source.loopStart = options.loopStart;
        source.loopEnd = buffer.duration;
      }
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(1, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    const offset = options?.startOffset ?? 0;
    source.start(0, offset);

    // keep track of long sounds so we can stop them if something else plays
    if (options?.loop || ['GameLost', 'HighScroreCross'].includes(name)) {
      this.stopCurrent();
      this.currentLongSFX = source;
      source.onended = () => {
        if (this.currentLongSFX === source) {
          this.currentLongSFX = null;
        }
      };
    }
  }

  public stopCurrent() {
    // Stop Web Audio source
    if (this.currentLongSFX) {
      try {
        this.currentLongSFX.stop();
        this.currentLongSFX.disconnect();
      } catch (e) { /* ignore */ }
      this.currentLongSFX = null;
    }
    // Stop HTML Audio (intro)
    if (this.introAudio) {
      try {
        this.introAudio.pause();
        this.introAudio.currentTime = 0;
      } catch (e) { /* ignore */ }
      this.introAudio = null;
    }
  }

  public playRoundWin() { this.playMP3('RoundWin'); }
  public playFabulous1x() { this.playMP3('Fabulous1x'); }
  public playFabulous3x() { this.playMP3('Fabulous3x', { loop: true, loopStart: 0 }); }
  public playFabulous5x() { this.playMP3('Fabulous5x', { loop: true, loopStart: 0 }); }
  public playFabulous5p() { this.playMP3('Fabulous5p', { loop: true, loopStart: 0, startOffset: 1.35 }); }
  public playLevelUp() { this.playMP3('LevelUp'); }
  public playGameLost() { this.playMP3('GameLost'); }
  public playHeartLost() { this.playMP3('HeartLostDefaultMode'); }
  public playRoundLostCasual() { this.playMP3('RoundLostCasualMode'); }
  public playHint() { this.playMP3('Hint'); }
  public playHighScoreCross() { this.playMP3('HighScroreCross'); }
}

export const sfx = new AudioEngine();
