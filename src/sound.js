// Web Audio API sound synthesizer
// Rules: Zero audio files. Created inside user gesture. Off by default.
// Persists in localStorage ('sound.ambient', 'sound.ui'). Forced off under prefers-reduced-motion.

let audioCtx = null;
let ambientGain = null;
let osc1 = null;
let osc2 = null;
let lfo = null;
let lfoGain = null;

function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isAmbientEnabled() {
  if (isReducedMotion()) return false;
  return localStorage.getItem('sound.ambient') === 'true';
}

export function isUiSoundEnabled() {
  if (isReducedMotion()) return false;
  return localStorage.getItem('sound.ui') === 'true';
}

function initAudioContext() {
  if (audioCtx) return audioCtx;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioCtx = new AudioContextClass();
  return audioCtx;
}

export function toggleAmbientSound() {
  if (isReducedMotion()) return false;
  const current = isAmbientEnabled();
  const next = !current;
  localStorage.setItem('sound.ambient', String(next));
  if (next) {
    startAmbient();
  } else {
    stopAmbient();
  }
  updateSoundNavUi();
  return next;
}

export function toggleUiSound() {
  if (isReducedMotion()) return false;
  const current = isUiSoundEnabled();
  const next = !current;
  localStorage.setItem('sound.ui', String(next));
  if (next) {
    playUiTick();
  }
  updateSoundNavUi();
  return next;
}

export function startAmbient() {
  if (isReducedMotion() || !isAmbientEnabled()) return;
  const ctx = initAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  if (osc1) return; // already playing

  try {
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.015, ctx.currentTime + 2.0); // gain <= 0.02
    ambientGain.connect(ctx.destination);

    // Two detuned sine oscillators near 55 Hz and 82 Hz
    osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, ctx.currentTime);

    osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(82.4, ctx.currentTime);

    // Very slow LFO (~0.08 Hz)
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);

    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.8, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    osc1.connect(ambientGain);
    osc2.connect(ambientGain);

    osc1.start();
    osc2.start();
    lfo.start();
  } catch (err) {
    console.warn('[sound] Failed to start ambient audio:', err);
  }
}

export function stopAmbient() {
  if (!audioCtx || !ambientGain) return;
  try {
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, audioCtx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (osc1) {
        osc1.stop();
        osc1.disconnect();
        osc1 = null;
      }
      if (osc2) {
        osc2.stop();
        osc2.disconnect();
        osc2 = null;
      }
      if (lfo) {
        lfo.stop();
        lfo.disconnect();
        lfo = null;
      }
    }, 500);
  } catch (e) {
    // ignore clean up error
  }
}

// ~20ms filtered-noise tick on hover and click
export function playUiTick() {
  if (isReducedMotion() || !isUiSoundEnabled()) return;
  const ctx = initAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.02); // 20 ms buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(3.0, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.035, ctx.currentTime); // gain <= 0.04
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start();
  } catch (err) {
    // Ignore audio glitches
  }
}

// Shift pitch slightly with camera / scroll progress
export function shiftAmbientPitch(ratio) {
  if (!osc1 || !osc2 || !audioCtx) return;
  const base1 = 55;
  const base2 = 82.4;
  const shift = ratio * 3; // few cents shift
  osc1.frequency.setValueAtTime(base1 + shift, audioCtx.currentTime);
  osc2.frequency.setValueAtTime(base2 + shift * 1.5, audioCtx.currentTime);
}

export function updateSoundNavUi() {
  const soundBtn = document.getElementById('sound-toggle');
  const ambientBtn = document.getElementById('sound-ambient-btn');
  const uiBtn = document.getElementById('sound-ui-btn');

  const ambientOn = isAmbientEnabled();
  const uiOn = isUiSoundEnabled();
  const anyOn = ambientOn || uiOn;

  if (soundBtn) {
    soundBtn.setAttribute('aria-pressed', anyOn ? 'true' : 'false');
    const label = soundBtn.querySelector('.toggle-label');
    if (label) {
      label.textContent = anyOn ? 'Sound: ON' : 'Sound: OFF';
    }
  }

  if (ambientBtn) {
    ambientBtn.setAttribute('aria-pressed', ambientOn ? 'true' : 'false');
    ambientBtn.textContent = `Ambient ${ambientOn ? '[ON]' : '[OFF]'}`;
  }

  if (uiBtn) {
    uiBtn.setAttribute('aria-pressed', uiOn ? 'true' : 'false');
    uiBtn.textContent = `UI Tick ${uiOn ? '[ON]' : '[OFF]'}`;
  }
}

export function initSound() {
  // CRITICAL REQUIREMENT: Do NOT create AudioContext at load time!
  // Only register listeners to user gestures.
  updateSoundNavUi();

  const soundBtn = document.getElementById('sound-toggle');
  const soundMenu = document.getElementById('sound-menu-popup');

  if (soundBtn && soundMenu) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = soundBtn.getAttribute('aria-expanded') === 'true';
      soundBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
      soundMenu.hidden = isExpanded;
    });

    document.addEventListener('click', (e) => {
      if (!soundMenu.contains(e.target) && e.target !== soundBtn) {
        soundMenu.hidden = true;
        soundBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const ambientBtn = document.getElementById('sound-ambient-btn');
  if (ambientBtn) {
    ambientBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAmbientSound();
    });
  }

  const uiBtn = document.getElementById('sound-ui-btn');
  if (uiBtn) {
    uiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleUiSound();
    });
  }

  // Attach UI tick to interactive elements
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, [role="button"], .diag-part')) {
      playUiTick();
    }
  });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [role="button"], .diag-part')) {
      playUiTick();
    }
  });

  // Watch for reduced-motion changes
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', () => {
    if (media.matches) {
      stopAmbient();
      updateSoundNavUi();
    }
  });
}
