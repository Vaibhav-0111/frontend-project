import { useRef, useEffect, useState, useCallback } from 'react';
import { drawRoad, resetRoad } from '../../canvas/roadRenderer';
import { drawCar, preloadCarImage } from '../../canvas/carRenderer';
import { drawGauge } from '../../canvas/gaugeRenderer';
import { createSimulation } from '../../canvas/simulation';
import './PerformanceSimulator.css';

// Default simulation state (idle)
const IDLE_STATE = { speed: 0, normalizedSpeed: 0, rpm: 0.1, gear: 1, gForce: 0, phase: 'idle' };

export default function PerformanceSimulator({ car }) {
  const canvasRef      = useRef(null);
  const simulationRef  = useRef(null);
  const simStateRef    = useRef(IDLE_STATE);    // per-frame, no React re-render
  const animFrameRef   = useRef(null);
  const lastFrameTs    = useRef(0);
  const isMountedRef   = useRef(true);

  const idleAudioRef   = useRef(null);
  const accelAudioRef  = useRef(null);

  // React state only for UI buttons — NOT updated every frame
  const [status,    setStatus]    = useState('idle');  // 'idle'|'running'|'complete'
  const [isMuted,   setIsMuted]   = useState(false);
  const [isDemo,    setIsDemo]    = useState(false);
  const [runResult, setRunResult] = useState(null);    // { speed, isDemo }

  // ── Master draw loop (60fps, reads refs not state) ─────────────
  const drawLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas || !isMountedRef.current) return;

    const deltaMs = Math.min(timestamp - lastFrameTs.current, 50); // cap delta at 50ms
    lastFrameTs.current = timestamp;

    const ctx  = canvas.getContext('2d');
    const W    = canvas.width;
    const H    = canvas.height;
    const s    = simStateRef.current;

    ctx.clearRect(0, 0, W, H);
    drawRoad(ctx, W, H, s.normalizedSpeed, deltaMs, s.phase);
    drawCar(ctx, car.images.side, W, H, s.normalizedSpeed, timestamp);
    drawGauge(ctx, W, H, s);

    animFrameRef.current = requestAnimationFrame(drawLoop);
  }, [car]);

  // ── Restart draw loop when car changes ─────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    preloadCarImage(car.images.side);

    // Also preload front for completeness
    preloadCarImage(car.images.front);

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    resetRoad();
    animFrameRef.current = requestAnimationFrame(drawLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [car, drawLoop]);

  // ── Canvas resize observer ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return () => ro.disconnect();
  }, []);

  // ── Audio ───────────────────────────────────────────────────────
  useEffect(() => {
    if (idleAudioRef.current) { idleAudioRef.current.pause(); idleAudioRef.current.src = ''; }
    if (accelAudioRef.current) { accelAudioRef.current.pause(); accelAudioRef.current.src = ''; }
    const idle  = new Audio(car.sound.idle);  idle.loop = true;  idle.volume  = 0;
    const accel = new Audio(car.sound.acceleration); accel.loop = false; accel.volume = 0;
    idleAudioRef.current  = idle;
    accelAudioRef.current = accel;
  }, [car]);

  useEffect(() => {
    if (idleAudioRef.current)  idleAudioRef.current.muted  = isMuted;
    if (accelAudioRef.current) accelAudioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animFrameRef.current)  cancelAnimationFrame(animFrameRef.current);
      if (simulationRef.current) simulationRef.current.stop();
      if (idleAudioRef.current)  idleAudioRef.current.pause();
      if (accelAudioRef.current) accelAudioRef.current.pause();
    };
  }, []);

  // ── Accelerate handler ──────────────────────────────────────────
  const handleAccelerate = useCallback(() => {
    if (simulationRef.current) simulationRef.current.stop();
    resetRoad();
    simStateRef.current = IDLE_STATE;
    setStatus('running');
    setRunResult(null);

    const idleAudio  = idleAudioRef.current;
    const accelAudio = accelAudioRef.current;

    if (idleAudio && !isMuted) {
      idleAudio.currentTime = 0; idleAudio.volume = 0.35;
      idleAudio.play().catch(() => {});
    }
    if (accelAudio && !isMuted) {
      accelAudio.currentTime = 0; accelAudio.volume = 0;
      accelAudio.play().catch(() => {});
    }

    const sim = createSimulation(
      car,
      // onFrame — hot path, NO React state, only ref updates
      (state) => {
        simStateRef.current = state;

        // Audio crossfade
        const sp = state.normalizedSpeed;
        if (idleAudio)  idleAudio.volume  = state.phase === 'decel' ? 0.1 + (1 - sp) * 0.25 : Math.max(0, 0.35 - sp * 0.35);
        if (accelAudio) {
          if (state.phase === 'decel') {
            accelAudio.volume       = Math.max(0, sp * 0.5);
            accelAudio.playbackRate = Math.max(0.5, 0.8 + sp * 0.8);
          } else {
            accelAudio.volume       = Math.min(0.85, sp * 0.95);
            accelAudio.playbackRate = Math.min(2.5, 0.8 + sp * 1.7);
          }
        }
      },
      // onComplete
      ({ isDemo: demo }) => {
        if (!isMountedRef.current) return;
        simStateRef.current = { ...IDLE_STATE, phase: 'complete' };
        setStatus('complete');
        setIsDemo(demo);
        setRunResult({ isDemo: demo });
        if (idleAudioRef.current)  idleAudioRef.current.pause();
        if (accelAudioRef.current) {
          const fade = setInterval(() => {
            const a = accelAudioRef.current;
            if (!a) return clearInterval(fade);
            if (a.volume > 0.06) a.volume -= 0.06;
            else { a.volume = 0; a.pause(); clearInterval(fade); }
          }, 80);
        }
      }
    );

    simulationRef.current = sim;
    sim.start();
  }, [car, isMuted]);

  const handleReset = useCallback(() => {
    if (simulationRef.current) simulationRef.current.reset();
    simStateRef.current = IDLE_STATE;
    setStatus('idle');
    setRunResult(null);
    resetRoad();
    if (idleAudioRef.current)  { idleAudioRef.current.pause(); }
    if (accelAudioRef.current) { accelAudioRef.current.pause(); accelAudioRef.current.currentTime = 0; }
  }, []);

  return (
    <div className="perf-simulator">
      <canvas ref={canvasRef} className="perf-canvas" />

      {/* ── Minimal DOM overlay — only action controls ─── */}
      <div className="perf-controls-overlay">
        {status === 'complete' ? (
          <div className="perf-complete-ui">
            <span className="perf-complete-label">RUN COMPLETE</span>
            {runResult?.isDemo && (
              <span className="perf-demo-badge">DEMO SIMULATION — no verified 0–100 data</span>
            )}
            <button className="perf-btn perf-btn--primary" onClick={handleReset} id="run-again-btn">
              ↺ RUN AGAIN
            </button>
          </div>
        ) : (
          <button
            className={`perf-btn perf-btn--primary${status === 'running' ? ' perf-btn--running' : ''}`}
            onClick={handleAccelerate}
            disabled={status === 'running'}
            id="accelerate-btn"
          >
            {status === 'running' ? '■ RUNNING' : '▶ ACCELERATE'}
          </button>
        )}

        <button
          className="perf-btn perf-btn--ghost"
          onClick={() => setIsMuted(m => !m)}
          aria-label={isMuted ? 'Enable sound' : 'Mute sound'}
          id="mute-btn"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}
