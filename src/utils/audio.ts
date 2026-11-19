/**
 * Web Audio API Sound Synthesizer & Haptic Engine
 * Provides sleek, hardware-accelerated micro-interaction and haptic feedback sound effects
 * without external audio assets.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private listeners: Set<(enabled: boolean) => void> = new Set();

  constructor() {
    const saved = localStorage.getItem('annapurna_erp_sound_enabled');
    this.enabled = saved !== null ? saved === 'true' : true;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('annapurna_erp_sound_enabled', String(this.enabled));
    this.listeners.forEach((fn) => fn(this.enabled));
    if (this.enabled) {
      this.play('haptic');
    }
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    localStorage.setItem('annapurna_erp_sound_enabled', String(val));
    this.listeners.forEach((fn) => fn(this.enabled));
  }

  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Synthesize interactive sound / haptic effect
   */
  public play(type: 'click' | 'tab' | 'haptic' | 'success' | 'alert' | 'approve' | 'toggle' | 'pop'): void {
    if (!this.enabled) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (type) {
        case 'haptic': {
          // Tactile low-frequency haptic punch (30ms) mimicking trackpad/phone haptic motor
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.035);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'click': {
          // Sleek high-frequency micro pop (40ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.045);
          break;
        }

        case 'tab': {
          // Delicate tactile frequency glide for navigation (65ms)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        case 'pop': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(550, now);
          osc.frequency.exponentialRampToValueAtTime(850, now + 0.045);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'toggle': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(750, now);
          osc.frequency.setValueAtTime(950, now + 0.03);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.075);
          break;
        }

        case 'success': {
          // Harmonic C5 -> E5 -> G5 chord progression
          const notes = [523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.035, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.22);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 0.25);
          });
          break;
        }

        case 'approve': {
          // Triumphant multi-tone chord for official marksheet approval
          const chord = [440, 554.37, 659.25, 880];
          chord.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const startTime = now + idx * 0.05;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.04, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
          });
          break;
        }

        case 'alert': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.13);
          break;
        }
      }
    } catch (e) {
      console.warn('Audio synthesis deferred:', e);
    }
  }
}

export const soundFx = new SoundSynthesizer();
