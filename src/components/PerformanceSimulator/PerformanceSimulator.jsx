import { useRef, useEffect, useState, useCallback } from 'react';
import { drawRoad, resetRoad } from '../../canvas/roadRenderer';
import { drawGauge } from '../../canvas/gaugeRenderer';
import { createSimulation } from '../../canvas/simulation';
import './PerformanceSimulator.css';

const IDLE_STATE = { speed: 0, normalizedSpeed: 0, rpm: 0.1, gear: 1, gForce: 0, phase: 'idle' };

// ── car DOM-element updater (called every frame, no React) ──────
function updateCarImg(imgEl, W, H, normalizedSpeed) {
  if (!imgEl) return;
  // Car sits at ~55% height, shifts left slightly at speed
  const baseX  = W * 0.42;
  const baseY  = H * 0.52;
  const shakeX = normalizedSpeed > 0.05 ? (Math.random() - 0.5) * normalizedSpeed * 1.5 : 0;
  const shakeY = normalizedSpeed > 0.05 ? (Math.random() - 0.5) * normalizedSpeed * 0.8 : 0;
  const scale  = 0.78 + normalizedSpeed * 0.04; // very subtle grow at speed
  const w      = Math.min(W * 0.48, 520);

  imgEl.style.width     = `${w}px`;
  imgEl.style.left      = `${baseX - w * 0.5 + shakeX}px`;
  imgEl.style.top       = `${baseY - w * 0.22 + shakeY}px`;
  imgEl.style.transform = `scaleX(-1) scale(${scale})`;     // mirror so car faces left (driving)
}

export default function PerformanceSimulator({ car }) {
  const canvasRef     = useRef(null);
  const carImgRef     = useRef(null);        // ← DOM ref, not canvas
  const simulationRef = useRef(null);
  const simStateRef   = useRef(IDLE_STATE);
  const animFrameRef  = useRef(null);
  const lastFrameTs   = useRef(0);
  const isMountedRef  = useRef(true);

  const idleAudioRef  = useRef(null);
  const accelAudioRef = useRef(null);

  const [status,    setStatus]    = useState('idle');
  const [isMuted,   setIsMuted]   = useState(false);
  const [runResult, setRunResult] = useState(null);

  // ── Master draw loop ─────────────────────────────────────────
  const drawLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas || !isMountedRef.current) return;

    const deltaMs = Math.min(timestamp - lastFrameTs.current, 50);
    lastFrameTs.current = timestamp;

    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    const s   = simStateRef.current;

    ctx.clearRect(0, 0, W, H);
    drawRoad(ctx, W, H, s.normalizedSpeed, deltaMs, s.phase);
    drawGauge(ctx, W, H, s);

    // update car DOM image position directly — no React re-render
    updateCarImg(carImgRef.current, W, H, s.normalizedSpeed);

    animFrameRef.current = requestAnimationFrame(drawLoop);
  }, []);

  // ── Boot / car change ────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    resetRoad();
    lastFrameTs.current = 0;
    animFrameRef.current = requestAnimationFrame(drawLoop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [car, drawLoop]);

  // ── Canvas resize ────────────────────────────────────────────
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

  // ── Audio setup ──────────────────────────────────────────────
  useEffect(() => {
    if (idleAudioRef.current)  { idleAudioRef.current.pause();  idleAudioRef.current.src  = ''; }
    if (accelAudioRef.current) { accelAudioRef.current.pause(); accelAudioRef.current.src = ''; }
    const idle  = new Audio(car.sound?.idle || '');  idle.loop = true;  idle.volume = 0;
    const accel = new Audio(car.sound?.acceleration || ''); accel.loop = false; accel.volume = 0;
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
      idleAudioRef.current?.pause();
      accelAudioRef.current?.pause();
    };
  }, []);

  // ── Accelerate ───────────────────────────────────────────────
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
      (state) => {
        simStateRef.current = state;
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
      ({ isDemo: demo }) => {
        if (!isMountedRef.current) return;
        simStateRef.current = { ...IDLE_STATE, phase: 'complete' };
        setStatus('complete');
        setRunResult({ isDemo: demo });
        idleAudioRef.current?.pause();
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
    simulationRef.current?.reset();
    simStateRef.current = IDLE_STATE;
    setStatus('idle');
    setRunResult(null);
    resetRoad();
    idleAudioRef.current?.pause();
    if (accelAudioRef.current) {
      accelAudioRef.current.pause();
      accelAudioRef.current.currentTime = 0;
    }
  }, []);

  return (
    <div className="perf-simulator">
      {/* Road + gauge canvas */}
      <canvas ref={canvasRef} className="perf-canvas" />

      {/* Car as DOM image — mix-blend-mode:multiply kills the studio BG */}
      <img
        ref={carImgRef}
        src={car.images.side}
        alt={car.name}
        className="perf-car-img"
        draggable={false}
      />

      {/* Minimal controls overlay */}
      <div className="perf-controls-overlay">
        {status === 'complete' ? (
          <div className="perf-complete-ui">
            <span className="perf-complete-label">RUN COMPLETE</span>
            {runResult?.isDemo && (
              <span className="perf-demo-badge">DEMO — no verified 0–100 data</span>
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
