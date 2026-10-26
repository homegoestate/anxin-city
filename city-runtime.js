// The scheduler owns the only RAF chain. Sleeping scenes do not poll or render.
export function createCityRuntime({ onFrame, onError = () => {}, requestFrame = callback => requestAnimationFrame(callback), cancelFrame = id => cancelAnimationFrame(id) }) {
  let frame = null, generation = 0, executing = false, dirty = false, disposed = false, faulted = false;
  let paused = false, reducedMotion = false, hidden = false, obscured = false, contextLost = false, interacting = false;
  let lastFrame = null, frameInterval = 0, renders = 0;
  const blocked = () => disposed || faulted || hidden || obscured || contextLost;
  const ambient = () => !paused && !reducedMotion;
  function cancel() {
    generation += 1;
    if (frame !== null) cancelFrame(frame);
    frame = null; lastFrame = null;
  }
  function schedule() {
    if (blocked() || frame !== null || executing) return;
    const token = generation;
    frame = requestFrame(now => tick(now, token));
  }
  function tick(now, token) {
    if (token !== generation || blocked()) return;
    frame = null;
    if (!dirty && lastFrame !== null && now - lastFrame + 0.5 < frameInterval) { schedule(); return; }
    const elapsed = lastFrame === null ? 0 : Math.max(0, now - lastFrame);
    lastFrame = now; dirty = false; executing = true;
    let continuing = false;
    try { continuing = onFrame(now, { elapsed, ambient: ambient(), interacting }) === true; renders += 1; }
    catch (error) { faulted = true; onError(error); }
    finally { executing = false; }
    if (blocked()) { cancel(); return; }
    if (dirty || continuing || ambient() || interacting) schedule();
    else lastFrame = null;
  }
  function invalidate() { dirty = true; schedule(); }
  function setBlock(field, value) {
    if (field === 'hidden') hidden = Boolean(value);
    if (field === 'obscured') obscured = Boolean(value);
    if (field === 'contextLost') { contextLost = Boolean(value); if (!value) faulted = false; }
    if (blocked()) cancel(); else invalidate();
  }
  return {
    invalidate,
    setPaused(value) { if (paused === Boolean(value)) return; paused = Boolean(value); invalidate(); },
    setReducedMotion(value) { if (reducedMotion === Boolean(value)) return; reducedMotion = Boolean(value); invalidate(); },
    setHidden(value) { if (hidden !== Boolean(value)) setBlock('hidden', value); },
    setObscured(value) { if (obscured !== Boolean(value)) setBlock('obscured', value); },
    setContextLost(value) { setBlock('contextLost', value); },
    setInteracting(value) { interacting = Boolean(value); invalidate(); },
    setFrameInterval(value) { frameInterval = Number.isFinite(value) ? Math.max(0, value) : 0; invalidate(); },
    getState() { return { paused, reducedMotion, hidden, obscured, contextLost, faulted, disposed, interacting, pending: frame !== null, renders, frameInterval, sleeping: frame === null && !executing }; },
    dispose() { disposed = true; cancel(); },
  };
}

const QUALITY = Object.freeze({
  high: { cap: 2, shadows: true, shadowSize: 2048, maxFps: 60 },
  standard: { cap: 1.5, shadows: true, shadowSize: 1024, maxFps: 60 },
  economy: { cap: 1.25, shadows: false, shadowSize: 512, maxFps: 30 },
});
export function cityQualitySettings(mode = 'auto', devicePixelRatio = 1, tier = 'standard') {
  const safeMode = mode === 'auto' || Object.hasOwn(QUALITY, mode) ? mode : 'auto';
  const effective = safeMode === 'auto' ? (Object.hasOwn(QUALITY, tier) ? tier : 'standard') : safeMode;
  const profile = QUALITY[effective], ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Object.freeze({ mode: safeMode, tier: effective, pixelRatio: Math.min(Math.max(1, ratio), profile.cap), shadows: profile.shadows, shadowSize: profile.shadowSize, maxFps: profile.maxFps });
}

// Auto adapts only downward within a selection. A long slow window is required,
// and isolated stalls/resumes are ignored, so a scene never oscillates in quality.
export function createCityQuality({ mode = 'auto', devicePixelRatio = 1 } = {}) {
  let state = cityQualitySettings(mode, devicePixelRatio), frames = 0, total = 0;
  return {
    getState: () => state,
    setMode(next, ratio = devicePixelRatio) { devicePixelRatio = ratio; state = cityQualitySettings(next, ratio); frames = 0; total = 0; return state; },
    sample(elapsed, eligible = true) {
      if (state.mode !== 'auto' || state.tier === 'economy' || !eligible || !Number.isFinite(elapsed) || elapsed < 4 || elapsed > 120) { frames = 0; total = 0; return null; }
      frames += 1; total += elapsed;
      if (frames < 120) return null;
      const slow = total / frames > 28; frames = 0; total = 0;
      if (!slow) return null;
      state = cityQualitySettings('auto', devicePixelRatio, 'economy');
      return state;
    },
  };
}
