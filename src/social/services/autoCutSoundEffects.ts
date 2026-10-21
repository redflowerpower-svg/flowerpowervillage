/**
 * 🔊 AutoCut Studio Sound Engine
 * Effetti sonori di impatto e transizione sincronizzati al millisecondo tramite Web Audio API.
 * Volume potenziato con Dynamics Compressor ad alto impatto sonoro per sovrastare nitidamente la colonna sonora.
 * 
 * - Pizzeria (P1, P2, P3, DS): Cinematic Air Whoosh + Deep Sub-Bass Punch & Thud ad alto volume (sul rimbalzo del logo)
 * - Villaggio (V1, V2, V3, R1, LM1): Soft Tropical Breeze + Crystal Zen Chime squillante (riverbero cristallino C-Major)
 */

class AutoCutSoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Master bus con Dynamics Compressor per prevenire clipping e massimizzare il volume e l'impatto sonoro
   */
  private getMasterBus(ctx: AudioContext): AudioNode {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-6, ctx.currentTime);
    comp.knee.setValueAtTime(8, ctx.currentTime);
    comp.ratio.setValueAtTime(3.5, ctx.currentTime);
    comp.attack.setValueAtTime(0.002, ctx.currentTime);
    comp.release.setValueAtTime(0.20, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.45, ctx.currentTime); // +45% di boost master per staccare sulla musica

    comp.connect(masterGain);
    masterGain.connect(ctx.destination);
    return comp;
  }

  /**
   * 🍕 PIZZERIA OUTRO SFX (Volume Potenziato):
   * 1. Cinematic Whoosh d'aria (filtro passa-banda su rumore bianco in sweep potente) da 0.0s a 0.46s
   * 2. Deep Sub-Bass Punch & Thud a 0.46s (impatto profondo 150Hz -> 42Hz + snap secco)
   */
  playPizzaOutroImpact(isMuted: boolean = false) {
    if (isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = this.getMasterBus(ctx);

      // --- FASE 1: POTENTE WHOOSH D'ARIA (da now a now + 0.46s) ---
      const bufferSize = Math.floor(ctx.sampleRate * 0.50);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.5, now);
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(2600, now + 0.32);
      filter.frequency.exponentialRampToValueAtTime(550, now + 0.46);

      const whooshGain = ctx.createGain();
      whooshGain.gain.setValueAtTime(0.001, now);
      whooshGain.gain.linearRampToValueAtTime(0.75, now + 0.28); // Boost volume da 0.30 a 0.75
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

      whiteNoise.connect(filter);
      filter.connect(whooshGain);
      whooshGain.connect(master);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.48);

      // --- FASE 2: DEEP SUB-BASS IMPACT POTENTE (a now + 0.46s sul rimbalzo del logo) ---
      const impactTime = now + 0.46;

      // Oscillatore Sub-Bass potente (bassi profondi da club)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(155, impactTime);
      subOsc.frequency.exponentialRampToValueAtTime(40, impactTime + 0.38);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.001, impactTime);
      subGain.gain.linearRampToValueAtTime(1.20, impactTime + 0.015); // Boost volume da 0.65 a 1.20 (punch marcato)
      subGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.65); // coda calda profonda

      subOsc.connect(subGain);
      subGain.connect(master);

      // Click / Pop transiente ad altissima definizione per il contatto fisico dell'impatto
      const clickOsc = ctx.createOscillator();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(320, impactTime);
      clickOsc.frequency.exponentialRampToValueAtTime(55, impactTime + 0.04);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.70, impactTime); // Boost snap da 0.35 a 0.70
      clickGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.06);

      clickOsc.connect(clickGain);
      clickGain.connect(master);

      subOsc.start(impactTime);
      subOsc.stop(impactTime + 0.70);

      clickOsc.start(impactTime);
      clickOsc.stop(impactTime + 0.07);
    } catch (e) {
      console.warn('[AutoCutSoundEngine] Pizza SFX warning:', e);
    }
  }

  /**
   * 🌴 VILLAGGIO OUTRO SFX (Volume Potenziato):
   * 1. Gentle Air Breeze (soffio ricco e avvolgente)
   * 2. Crystal Zen Chime (armonici cristallini squillanti C-Major con lungo decadimento armonico)
   */
  playVillageOutroImpact(isMuted: boolean = false) {
    if (isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = this.getMasterBus(ctx);

      // --- FASE 1: BREZZA TROPICALE (Whoosh soffice presente) ---
      const bufferSize = Math.floor(ctx.sampleRate * 0.50);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(1600, now + 0.35);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.48);

      const breezeGain = ctx.createGain();
      breezeGain.gain.setValueAtTime(0.001, now);
      breezeGain.gain.linearRampToValueAtTime(0.55, now + 0.25); // Boost da 0.20 a 0.55
      breezeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      noise.connect(filter);
      filter.connect(breezeGain);
      breezeGain.connect(master);

      noise.start(now);
      noise.stop(now + 0.50);

      // --- FASE 2: CRYSTAL ZEN CHIME (a now + 0.46s, armonici squillanti) ---
      const impactTime = now + 0.46;
      const frequencies = [1046.50, 1318.51, 1567.98, 2093.00]; // Accordo C-Major aperto etereo

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, impactTime + (idx * 0.025));

        const gain = ctx.createGain();
        const delay = idx * 0.025;
        gain.gain.setValueAtTime(0.001, impactTime + delay);
        gain.gain.linearRampToValueAtTime(0.70 / (idx * 0.7 + 1), impactTime + delay + 0.012); // Boost da 0.22 a 0.70
        gain.gain.exponentialRampToValueAtTime(0.0001, impactTime + delay + 1.40); // riverbero cristallino ancora più lungo

        osc.connect(gain);
        gain.connect(master);

        osc.start(impactTime + delay);
        osc.stop(impactTime + delay + 1.45);
      });
    } catch (e) {
      console.warn('[AutoCutSoundEngine] Village SFX warning:', e);
    }
  }

  /**
   * Riproduce l'effetto sonoro di impatto corretto in base al brand
   */
  playOutroImpact(brand: 'pizza' | 'village', isMuted: boolean = false) {
    if (brand === 'pizza') {
      this.playPizzaOutroImpact(isMuted);
    } else {
      this.playVillageOutroImpact(isMuted);
    }
  }
}

export const autoCutSoundEngine = new AutoCutSoundEngine();
