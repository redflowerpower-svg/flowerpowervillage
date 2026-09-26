/**
 * Utilità per la gestione dell'allarme sonoro persistente e dello Screen Wake Lock
 * studiato specificamente per tablet Android (es. Samsung Tab A 8.0) e smartphone in cucina.
 */

let wakeLockSentinel: any = null;
let audioCtx: AudioContext | null = null;
let alarmIntervalId: any = null;
let isAlarmCurrentlyPlaying = false;

/**
 * Richiede al browser di tenere lo schermo del tablet perennemente acceso
 */
export async function requestScreenWakeLock(): Promise<boolean> {
  if ('wakeLock' in navigator) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('[WakeLock] Impossibile acquisire il blocco schermo:', err);
      return false;
    }
  }
  return false;
}

export function releaseScreenWakeLock() {
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
}

/**
 * Inizializza o riattiva l'AudioContext al primo tocco dell'utente (bypass policy autoplay di Chrome)
 */
export function initKitchenAudio(): AudioContext | null {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Emette un singolo impulso sonoro bitonale ad alta penetrazione acustica (2400 Hz / 1200 Hz)
 * ottimizzato per tagliare il rumore di fondo dei forni e degli altoparlanti del tablet.
 */
function playDualTonePulse() {
  const ctx = initKitchenAudio();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Tono 1: Frequenza acuta squillante (2400 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2400, now);
  osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.18);
  gain1.gain.setValueAtTime(0.8, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.23);

  // Tono 2: Armonica di supporto calda (1200 Hz)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1200, now + 0.05);
  osc2.frequency.exponentialRampToValueAtTime(900, now + 0.22);
  gain2.gain.setValueAtTime(0.7, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.05);
  osc2.stop(now + 0.3);

  // Terzo impulso rapido per effetto campana ristorante
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(2800, now + 0.16);
  gain3.gain.setValueAtTime(0.75, now + 0.16);
  gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  osc3.connect(gain3);
  gain3.connect(ctx.destination);
  osc3.start(now + 0.16);
  osc3.stop(now + 0.36);
}

/**
 * Avvia la suoneria a martello: continua a suonare ogni 1.2 secondi finché non viene stoppata
 */
export function startContinuousAlarm() {
  if (isAlarmCurrentlyPlaying) return;
  isAlarmCurrentlyPlaying = true;
  initKitchenAudio();

  // Primo suono immediato
  playDualTonePulse();

  // Ripetizione in loop
  if (alarmIntervalId) clearInterval(alarmIntervalId);
  alarmIntervalId = setInterval(() => {
    playDualTonePulse();
  }, 1250);
}

/**
 * Ferma l'allarme sonoro (chiamato quando il pizzaiolo tocca "Accetta Ordine")
 */
export function stopContinuousAlarm() {
  isAlarmCurrentlyPlaying = false;
  if (alarmIntervalId) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
}

/**
 * Test rapido di suoneria (1 ciclo singolo di prova)
 */
export function testKitchenAlarm() {
  initKitchenAudio();
  playDualTonePulse();
  setTimeout(() => playDualTonePulse(), 350);
}

let reminderIntervalId: any = null;
let isReminderCurrentlyPlaying = false;

/**
 * Emette un doppio bip elettronico ad alta frequenza (2700 Hz -> 3400 Hz),
 * penetrante e nitido, studiato per tagliare il rumore di fondo della cucina
 * (cappe di aspirazione, forni e conversazioni) senza l'ansia dell'allarme a martello.
 */
export function playHighPitchReminderChime() {
  const ctx = initKitchenAudio();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Primo impulso acuto penetrante (2700 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2700, now);
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.72, now + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.11);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.12);

  // Secondo impulso ancora più acuto (3400 Hz) a 140ms di distanza
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(3400, now + 0.14);
  gain2.gain.setValueAtTime(0.001, now + 0.14);
  gain2.gain.linearRampToValueAtTime(0.78, now + 0.155);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.27);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.14);
  osc2.stop(now + 0.28);
}

// Alias per compatibilità con codice esistente
export const playGentleReminderChime = playHighPitchReminderChime;

/**
 * Avvia la suoneria di promemoria: un doppio bip acuto ogni 4.5 secondi
 * per ricordare con decisione all'operatore che sono trascorsi 15 minuti
 * e il rider deve essere inviato o notificato.
 */
export function startDispatchReminderAlarm() {
  if (isReminderCurrentlyPlaying) return;
  isReminderCurrentlyPlaying = true;
  initKitchenAudio();

  // Primo segnale immediato
  playHighPitchReminderChime();

  if (reminderIntervalId) clearInterval(reminderIntervalId);
  reminderIntervalId = setInterval(() => {
    playHighPitchReminderChime();
  }, 4500);
}

/**
 * Ferma la suoneria di promemoria
 */
export function stopDispatchReminderAlarm() {
  isReminderCurrentlyPlaying = false;
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
}

export function isDispatchReminderPlaying(): boolean {
  return isReminderCurrentlyPlaying;
}

export function isAlarmPlaying(): boolean {
  return isAlarmCurrentlyPlaying;
}
