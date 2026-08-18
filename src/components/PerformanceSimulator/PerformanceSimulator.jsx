import { useRef, useEffect, useState, useCallback } from 'react';
import { drawRoad, resetRoad } from '../../canvas/roadRenderer';
import { drawCar, preloadCarImage } from '../../canvas/carRenderer';
import { createSimulation } from '../../canvas/simulation';
import './PerformanceSimulator.css';

export default function PerformanceSimulator({ car }) {
  const canvasRef = useRef(null);
  const simulationRef = useRef(null);
  const stateRef = useRef({ speed: 0, normalizedSpeed: 0, progress: 0 });
  const animFrameRef = useRef(null);
  const isMountedRef = useRef(true);

  // Audio refs - create once, reuse
  const idleAudioRef = useRef(null);
  const accelAudioRef = useRef(null);

  const lastDisplayedSpeedRef = useRef(0);

  // React state only for UI changes, not per-frame updates
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'complete'
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const [rpmProgress, setRpmProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // ── Canvas draw loop (runs independently of React renders) ──────
  const drawLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isMountedRef.current) return;

    const ctx = canvas.getContext('2d');
    const { speed, normalizedSpeed } = stateRef.current;
    const now = performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const deltaMs = 16; // ~60fps estimate; real delta is tracked in simulation.js

    drawRoad(ctx, canvas.width, canvas.height, normalizedSpeed, deltaMs);
    drawCar(ctx, car.images.side, canvas.width, canvas.height, normalizedSpeed, now);

    animFrameRef.current = requestAnimationFrame(drawLoop);
  }, [car]);

  // ── Start/restart the draw loop whenever car changes ────────────
  useEffect(() => {
    isMountedRef.current = true;
    preloadCarImage(car.images.side);

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    resetRoad();
    animFrameRef.current = requestAnimationFrame(drawLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [car, drawLoop]);

  // ── Canvas resize observer ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });

    observer.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    return () => observer.disconnect();
  }, []);

  // ── Audio setup ──────────────────────────────────────────────────
  useEffect(() => {
    // Clean up previous audio
    if (idleAudioRef.current) {
      idleAudioRef.current.pause();
      idleAudioRef.current.src = '';
    }
    if (accelAudioRef.current) {
      accelAudioRef.current.pause();
      accelAudioRef.current.src = '';
    }

    const idle = new Audio(car.sound.idle);
    idle.loop = true;
    idle.volume = 0;
    idleAudioRef.current = idle;

    const accel = new Audio(car.sound.acceleration);
    accel.loop = false;
    accel.volume = 0;
    accelAudioRef.current = accel;
  }, [car]);

  // ── Mute control ─────────────────────────────────────────────────
  useEffect(() => {
    if (idleAudioRef.current) idleAudioRef.current.muted = isMuted;
    if (accelAudioRef.current) accelAudioRef.current.muted = isMuted;
  }, [isMuted]);

  // ── Cleanup on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (simulationRef.current) simulationRef.current.stop();
      if (idleAudioRef.current) idleAudioRef.current.pause();
      if (accelAudioRef.current) accelAudioRef.current.pause();
    };
  }, []);

  // ── Acceleration handler ─────────────────────────────────────────
  const handleAccelerate = useCallback(() => {
    if (!userInteracted) setUserInteracted(true);

    // Stop any previous simulation
    if (simulationRef.current) simulationRef.current.stop();
    resetRoad();
    setStatus('running');
    setDisplaySpeed(0);
    setRpmProgress(0);
    lastDisplayedSpeedRef.current = 0;

    // Start idle sound then crossfade to acceleration
    const idleAudio = idleAudioRef.current;
    const accelAudio = accelAudioRef.current;

    if (idleAudio && !isMuted) {
      idleAudio.currentTime = 0;
      idleAudio.volume = 0.3;
      idleAudio.play().catch(() => {});
    }

    if (accelAudio && !isMuted) {
      accelAudio.currentTime = 0;
      accelAudio.volume = 0;
      accelAudio.play().catch(() => {});
    }

    const sim = createSimulation(
      car,
      // onFrame: update refs (NOT React state for every frame)
      ({ speed, normalizedSpeed, progress }) => {
        stateRef.current = { speed, normalizedSpeed, progress };

        // Update audio volumes based on progress
        if (idleAudio) {
          idleAudio.volume = Math.max(0, 0.3 - normalizedSpeed * 0.3);
        }
        if (accelAudio) {
          accelAudio.volume = Math.min(0.8, normalizedSpeed * 0.9);
          // Pitch up via playback rate
          accelAudio.playbackRate = Math.min(2.5, 0.8 + normalizedSpeed * 1.7);
        }

        // Throttle React state updates to ~15fps using modulo trick
        const roundedSpeed = Math.round(speed);
        if (Math.abs(roundedSpeed - lastDisplayedSpeedRef.current) >= 1) {
          lastDisplayedSpeedRef.current = roundedSpeed;
          setDisplaySpeed(roundedSpeed);
          setRpmProgress(normalizedSpeed);
        }
      },
      // onComplete
      ({ isDemo: demo }) => {
        if (!isMountedRef.current) return;
        stateRef.current = { speed: 100, normalizedSpeed: 1, progress: 1 };
        setDisplaySpeed(100);
        setRpmProgress(1);
        setStatus('complete');
        setIsDemo(demo);

        // Fade out audio
        if (accelAudio) {
          const fadeOut = setInterval(() => {
            if (accelAudio.volume > 0.05) {
              accelAudio.volume -= 0.05;
            } else {
              accelAudio.volume = 0;
              accelAudio.pause();
              clearInterval(fadeOut);
            }
          }, 80);
        }
        if (idleAudio) idleAudio.pause();
      }
    );

    simulationRef.current = sim;
    sim.start();
  }, [car, isMuted, userInteracted]);

  const handleReset = useCallback(() => {
    if (simulationRef.current) simulationRef.current.reset();
    stateRef.current = { speed: 0, normalizedSpeed: 0, progress: 0 };
    setStatus('idle');
    setDisplaySpeed(0);
    setRpmProgress(0);
    resetRoad();
    if (idleAudioRef.current) idleAudioRef.current.pause();
    if (accelAudioRef.current) {
      accelAudioRef.current.pause();
      accelAudioRef.current.currentTime = 0;
    }
  }, []);

  const rpmBars = 12;

  return (
    <div className="perf-simulator">
      {/* ── Canvas fills the background ────────────────────── */}
      <canvas ref={canvasRef} className="perf-canvas" />

      {/* ── HUD overlay ────────────────────────────────────── */}
      <div className="perf-hud">

        {/* ── Speedometer ─────────────────────────────────── */}
        <div className="perf-speedometer" aria-live="polite" aria-label={`Current speed: ${displaySpeed} kilometers per hour`}>
          <span className="perf-speed-number">
            {String(displaySpeed).padStart(3, '0')}
          </span>
          <span className="perf-speed-unit">KM/H</span>
        </div>

        {/* ── RPM Bar ─────────────────────────────────────── */}
        <div className="perf-rpm-wrapper" aria-label={`RPM at ${Math.round(rpmProgress * 100)}%`}>
          <span className="perf-rpm-label">RPM</span>
          <div className="perf-rpm-bar">
            {Array.from({ length: rpmBars }).map((_, i) => {
              const filled = (i / rpmBars) < rpmProgress;
              const redZone = i >= rpmBars - 3;
              return (
                <div
                  key={i}
                  className={`perf-rpm-segment ${filled ? 'perf-rpm-segment--filled' : ''} ${filled && redZone ? 'perf-rpm-segment--red' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* ── Complete state ───────────────────────────────── */}
        {status === 'complete' && (
          <div className="perf-complete">
            <span className="perf-complete-label">RUN COMPLETE</span>
            {isDemo && (
              <span className="perf-demo-badge">DEMO SIMULATION</span>
            )}
          </div>
        )}

        {/* ── Controls ─────────────────────────────────────── */}
        <div className="perf-controls">
          {status === 'complete' ? (
            <button className="perf-btn perf-btn--primary" onClick={handleReset} id="run-again-btn">
              RUN AGAIN
            </button>
          ) : (
            <button
              className={`perf-btn perf-btn--primary ${status === 'running' ? 'perf-btn--disabled' : ''}`}
              onClick={handleAccelerate}
              disabled={status === 'running'}
              id="accelerate-btn"
            >
              {status === 'running' ? 'ACCELERATING...' : '▶ ACCELERATE'}
            </button>
          )}

          <button
            className="perf-btn perf-btn--ghost"
            onClick={() => setIsMuted(m => !m)}
            aria-label={isMuted ? 'Enable sound' : 'Mute sound'}
            id="mute-btn"
          >
            {isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON'}
          </button>
        </div>
      </div>
    </div>
  );
}
