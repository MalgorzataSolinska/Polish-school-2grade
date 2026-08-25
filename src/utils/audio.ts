// Web Audio API sound synthesizer & SpeechSynthesis with global mute controls for kid interaction

let audioCtx: AudioContext | null = null;
let globalMuted = false;

// Check local storage on load if sound preference was saved
if (typeof window !== 'undefined') {
  try {
    const savedMute = localStorage.getItem('szkolka_audio_muted');
    if (savedMute === 'true') {
      globalMuted = true;
    }
  } catch (e) {
    // Ignore localStorage access errors
  }
}

export function isAudioMuted(): boolean {
  return globalMuted;
}

export function setAudioMuted(muted: boolean) {
  globalMuted = muted;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('szkolka_audio_muted', muted ? 'true' : 'false');
      if (muted && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      // Ignore errors
    }
  }
}

export function toggleAudioMuted(): boolean {
  const nextState = !globalMuted;
  setAudioMuted(nextState);
  return nextState;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {
    return null;
  }
  return audioCtx;
}

export function playSuccessSound() {
  if (globalMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (e) {
    // Ignore audio errors
  }
}

export function playErrorSound() {
  if (globalMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.setValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    // Ignore
  }
}

export function playClickSound() {
  if (globalMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // Ignore
  }
}

export function speakText(_text: string, _lang: string = 'pl-PL') {
  // Voice reading disabled per user preference
  return;
}

