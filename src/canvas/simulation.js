/**
 * simulation.js — Enhanced with acceleration AND deceleration phases.
 * Phase 1: ACCELERATE  0 → 100 km/h (using real or demo duration)
 * Phase 2: HOLD        stays at ~100 for 1.5s
 * Phase 3: DECELERATE  100 → 0  (2.5x longer than accel — realistic braking)
 *
 * Reports: speed, normalizedSpeed, rpm, gear, gForce, phase
 */

export const DEMO_DURATION_MS = 6000;

// Gear shift points as fractions of max speed (0-1)
const GEAR_SHIFTS = [0, 0.16, 0.30, 0.50, 0.70, 0.85, 1.0];

function getGear(normalizedSpeed) {
  for (let g = GEAR_SHIFTS.length - 1; g >= 0; g--) {
    if (normalizedSpeed >= GEAR_SHIFTS[g]) return g + 1;
  }
  return 1;
}

// RPM within current gear (0-1), peaks before each shift then drops
function getRpm(normalizedSpeed) {
  const gear = getGear(normalizedSpeed);
  const gearFloor = GEAR_SHIFTS[gear - 1];
  const gearCeil  = GEAR_SHIFTS[gear] ?? 1;
  const within = (normalizedSpeed - gearFloor) / (gearCeil - gearFloor);
  // RPM starts at ~0.4 after each shift, climbs to 1.0 at redline
  return 0.4 + within * 0.6;
}

export function createSimulation(car, onFrame, onComplete) {
  let rafId        = null;
  let startTime    = null;
  let phase        = 'idle';  // 'accel' | 'hold' | 'decel'
  let phaseStart   = null;
  let currentSpeed = 0;
  let running      = false;

  const hasVerified  = car.performance?.zeroTo100Kph != null;
  const accelMs      = hasVerified ? car.performance.zeroTo100Kph * 1000 : DEMO_DURATION_MS;
  const holdMs       = 1500;
  const decelMs      = accelMs * 2.5;  // braking takes longer than flooring it
  const isDemo       = !hasVerified;
  const TARGET_SPEED = 100;

  function tick(timestamp) {
    if (!running) return;
    if (!startTime) { startTime = timestamp; phaseStart = timestamp; }

    const elapsed = timestamp - phaseStart;

    if (phase === 'accel') {
      const p     = Math.min(elapsed / accelMs, 1);
      // Cubic ease-out — rapid initial thrust, eases into top speed
      const eased = 1 - Math.pow(1 - p, 3);
      currentSpeed = eased * TARGET_SPEED;

      const rpm   = getRpm(eased);
      const gear  = getGear(eased);
      // G-force peaks mid-acceleration (highest rate-of-change)
      const gForce = Math.sin(p * Math.PI) * 1.0;

      onFrame({ speed: currentSpeed, normalizedSpeed: eased, rpm, gear, gForce, phase: 'accel', isDemo });

      if (p >= 1) { phase = 'hold'; phaseStart = timestamp; }

    } else if (phase === 'hold') {
      onFrame({ speed: TARGET_SPEED, normalizedSpeed: 1, rpm: 0.75, gear: 6, gForce: 0, phase: 'hold', isDemo });
      if (elapsed >= holdMs) { phase = 'decel'; phaseStart = timestamp; }

    } else if (phase === 'decel') {
      const p     = Math.min(elapsed / decelMs, 1);
      // Ease-in on deceleration — braking builds as ABS bites
      const eased = Math.pow(1 - p, 2);
      currentSpeed = eased * TARGET_SPEED;

      const normalizedSpeed = eased;
      const rpm   = getRpm(normalizedSpeed);
      const gear  = getGear(normalizedSpeed);
      const gForce = -Math.min(p * 1.2, 1.2);  // negative = braking force

      onFrame({ speed: currentSpeed, normalizedSpeed, rpm, gear, gForce, phase: 'decel', isDemo });

      if (p >= 1) {
        running = false;
        onFrame({ speed: 0, normalizedSpeed: 0, rpm: 0.1, gear: 1, gForce: 0, phase: 'complete', isDemo });
        onComplete({ isDemo });
        return;
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (running) return;
      running = true;
      phase = 'accel';
      startTime = null;
      phaseStart = null;
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
      startTime = null; phaseStart = null; currentSpeed = 0; phase = 'idle';
    },
    isRunning: () => running,
    get accelMs()  { return accelMs; },
    get isDemo()   { return isDemo; }
  };
}
