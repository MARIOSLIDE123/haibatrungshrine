// Web Audio API Synthesizer and TTS Manager

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hbt_sound_enabled');
      this.soundEnabled = stored !== null ? stored === 'true' : true;
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hbt_sound_enabled', String(enabled));
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.soundEnabled);
    return this.soundEnabled;
  }

  private initContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Pleasant double-chime for correct answer
  public playCorrect(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      
      // Tone 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // ramp to E5
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Tone 2: 783.99 Hz (G5) harmonic bell
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Gentle low tone for incorrect attempt
  public playIncorrect(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // Chord for revealing answer after 2 failed attempts
  public playReveal(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [349.23, 440.0, 523.25].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch {
      // ignore
    }
  }

  // Celebratory fanfare for completing the game
  public playCelebration(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.12;
        const duration = idx === notes.length - 1 ? 0.6 : 0.2;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('Celebration audio error', e);
    }
  }

  // Subtle tap click
  public playClick(): void {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundManager();

// Browser Text-To-Speech Controller
export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  rate: number;
  currentText: string | null;
}

class SpeechController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentRate: number = 0.85; // friendly speed for young learners
  private currentPitch: number = 1.15; // sweet, cheerful, expressive female pitch
  private selectedVoiceURI: string = '';
  private onStateChange: ((state: TTSState) => void) | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.selectedVoiceURI = localStorage.getItem('hbt_preferred_voice') || '';
    }
  }

  public setRate(rate: number): void {
    this.currentRate = rate;
  }

  public getRate(): number {
    return this.currentRate;
  }

  public setPitch(pitch: number): void {
    this.currentPitch = pitch;
  }

  public getPitch(): number {
    return this.currentPitch;
  }

  public getSelectedVoiceURI(): string {
    return this.selectedVoiceURI;
  }

  public setSelectedVoiceURI(uri: string): void {
    this.selectedVoiceURI = uri;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hbt_preferred_voice', uri);
    }
  }

  // Get English voices with female voices prioritized at the top
  public getEnglishVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const all = window.speechSynthesis.getVoices();
    const enVoices = all.filter((v) => v.lang.toLowerCase().startsWith('en'));

    // Sort to place expressive female voices first
    return enVoices.sort((a, b) => {
      const femaleKeywords = ['jenny', 'aria', 'samantha', 'zira', 'karen', 'victoria', 'female', 'natural'];
      const aIsFemale = femaleKeywords.some((k) => a.name.toLowerCase().includes(k));
      const bIsFemale = femaleKeywords.some((k) => b.name.toLowerCase().includes(k));
      if (aIsFemale && !bIsFemale) return -1;
      if (!aIsFemale && bIsFemale) return 1;
      return 0;
    });
  }

  public getBestFemaleVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for natural, expressive female storytelling voices
    const preferredNames = [
      'Microsoft Jenny Online (Natural)',
      'Microsoft Jenny (Natural)',
      'Microsoft Aria Online (Natural)',
      'Microsoft Aria (Natural)',
      'Google US English',
      'Samantha',
      'Karen',
      'Victoria',
      'Microsoft Zira - English (United States)',
      'Microsoft Zira',
    ];

    for (const name of preferredNames) {
      const match = voices.find((v) => v.name.includes(name) || v.name.toLowerCase().includes(name.toLowerCase()));
      if (match) return match;
    }

    // Fallback: any voice with 'female' or en-US
    const femaleMatch = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
    );
    if (femaleMatch) return femaleMatch;

    return voices.find((v) => v.lang === 'en-US') || voices.find((v) => v.lang.startsWith('en')) || null;
  }

  public subscribe(callback: (state: TTSState) => void): () => void {
    this.onStateChange = callback;
    return () => {
      this.onStateChange = null;
    };
  }

  private notify(isPlaying: boolean, isPaused: boolean, currentText: string | null = null) {
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying,
        isPaused,
        rate: this.currentRate,
        currentText,
      });
    }
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      voiceURI?: string;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): void {
    this.stop();

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (options?.onError) {
        options.onError(new Error('Speech synthesis not supported in this browser.'));
      }
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || this.currentRate;
      // Expressive female pitch (1.15 is sweet and lively for children)
      utterance.pitch = options?.pitch || this.currentPitch;
      utterance.lang = 'en-US';

      // Pick selected voice or automatic best expressive female voice
      const voices = window.speechSynthesis.getVoices();
      const targetURI = options?.voiceURI || this.selectedVoiceURI;

      let chosenVoice: SpeechSynthesisVoice | undefined;
      if (targetURI) {
        chosenVoice = voices.find((v) => v.voiceURI === targetURI);
      }

      if (!chosenVoice) {
        chosenVoice = this.getBestFemaleVoice() || undefined;
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      }

      utterance.onstart = () => {
        this.notify(true, false, text);
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.notify(false, false, null);
        if (options?.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        this.currentUtterance = null;
        this.notify(false, false, null);
        if (options?.onError) options.onError(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis exception:', e);
      if (options?.onError) options.onError(e);
    }
  }

  public pause(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.notify(true, true);
      }
    }
    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
      this.notify(true, true);
    }
  }

  public resume(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.notify(true, false);
      }
    }
    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement.play();
      this.notify(true, false);
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    this.currentUtterance = null;
    this.notify(false, false, null);
  }

  // Play base64 WAV returned by Gemini TTS
  public playBase64Audio(
    base64Data: string,
    mimeType = 'audio/wav',
    onEnd?: () => void
  ): HTMLAudioElement {
    this.stop();
    const audio = new Audio(`data:${mimeType};base64,${base64Data}`);
    this.currentAudioElement = audio;

    this.notify(true, false, 'Playing Gemini Audio');

    audio.onended = () => {
      this.currentAudioElement = null;
      this.notify(false, false, null);
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.error('Audio element playback error:', e);
      this.currentAudioElement = null;
      this.notify(false, false, null);
    };

    audio.play().catch((err) => {
      console.warn('Audio play was prevented or failed:', err);
    });

    return audio;
  }
}

export const speechController = new SpeechController();
