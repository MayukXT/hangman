// Web Audio API Retro Synth Engine

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  private ensureCtx(): AudioContext | null {
    if (!this.isEnabled) return null;
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  public toggle(state: boolean) {
    this.isEnabled = state;
  }

  // Sweet synth pop for correct letter
  public playCorrect() {
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // Jump to A5

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Grunt for wrong letter
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

  // 8-bit Fanfare for Game Win / Level Up
  public playLevelUp() {
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const notes = [
      { f: 523.25, d: 0.1 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.1 }, // G5
      { f: 1046.50, d: 0.3 } // C6
    ];

    let startTime = ctx.currentTime;
    
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(note.f, startTime);
      
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.setTargetAtTime(0, startTime + note.d - 0.02, 0.015);

      osc.start(startTime);
      osc.stop(startTime + note.d);
      
      startTime += note.d;
    });
  }

  // Heavy crash for Game Over
  public playGameOver() {
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.8);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.start(now);
    osc.stop(now + 0.8);
  }
}

export const sfx = new AudioEngine();
