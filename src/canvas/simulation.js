/**
 * simulation.js
 * Manages the acceleration simulation state and requestAnimationFrame loop.
 * Uses local mutable variables (NOT React state) for per-frame values.
 */

// Default demo duration for cars without verified 0-100kph data
export const DEMO_DURATION_MS = 6000;

/**
 * Creates a simulation controller for a given car.
 * @param {object} car - mustangData car object
 * @param {function} onFrame - callback(state) called each frame
 * @param {function} onComplete - callback() called when simulation ends
 */
export function createSimulation(car, onFrame, onComplete) {
  let rafId = null;
  let startTime = null;
  let lastFrameTime = null;
  let currentSpeed = 0;
  let running = false;

  // Derive duration: use real 0-100 kph data if available, else DEMO
  const hasVerifiedData = car.performance?.zeroTo100Kph !== null && car.performance?.zeroTo100Kph !== undefined;
  const durationMs = hasVerifiedData
    ? car.performance.zeroTo100Kph * 1000
    : DEMO_DURATION_MS;
  const isDemo = !hasVerifiedData;

  // Target speed in the simulation (always 100 kph visually)
  const TARGET_SPEED = 100;

  function tick(timestamp) {
    if (!running) return;

    if (!startTime) startTime = timestamp;
    if (!lastFrameTime) lastFrameTime = timestamp;

    const elapsed = timestamp - startTime;
    const deltaMs = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    const progress = Math.min(elapsed / durationMs, 1);
    // Cubic ease-out: fast start, tapers to finish
    const eased = 1 - Math.pow(1 - progress, 3);

    currentSpeed = eased * TARGET_SPEED;
    const normalizedSpeed = eased; // 0 to 1

    onFrame({
      speed: currentSpeed,
      normalizedSpeed,
      elapsed,
      progress,
      isDemo,
      durationMs
    });

    if (progress >= 1) {
      running = false;
      onComplete({ isDemo });
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      running = true;
      startTime = null;
      lastFrameTime = null;
      currentSpeed = 0;
      rafId = requestAnimationFrame(tick);
    },

    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    },

    reset() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      startTime = null;
      lastFrameTime = null;
      currentSpeed = 0;
    },

    isRunning() {
      return running;
    },

    get durationMs() {
      return durationMs;
    },

    get isDemo() {
      return isDemo;
    }
  };
}
