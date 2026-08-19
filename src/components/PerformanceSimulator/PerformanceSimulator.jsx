import { useRef, useEffect, useState, useCallback } from 'react';
import { drawRoad, resetRoad } from '../../canvas/roadRenderer';
import { drawGauge } from '../../canvas/gaugeRenderer';
import { createSimulation } from '../../canvas/simulation';
import './PerformanceSimulator.css';

const IDLE_STATE = { speed: 0, normalizedSpeed: 0, rpm: 0.1, gear: 1, gForce: 0, phase: 'idle' };

// ── car DOM-element updater (called every frame, no React) ──────
function updateCarImg(imgEl, W, H, normalizedSpeed, activeView) {
  if (!imgEl) return;
  const shakeX = normalizedSpeed > 0.05 ? (Math.random() - 0.5) * normalizedSpeed * 2.5 : 0;
  const shakeY = normalizedSpeed > 0.05 ? (Math.random() - 0.5) * normalizedSpeed * 1.5 : 0;
  const scale  = 1 + normalizedSpeed * 0.05;   // slightly more pronounced grow

  // Reduce max width to prevent blurry upscaling on low-res images
  const w   = Math.min(W * 0.70, 750);
  const bx  = (W - w) * 0.5 + shakeX;         // centered horizontally
  // Shift the image higher up the screen
  const by  = H * 0.06 + shakeY;

  imgEl.style.width     = `${w}px`;
  imgEl.style.left      = `${bx}px`;
  imgEl.style.top       = `${by}px`;
  
  const mirror = activeView === 'side' ? 'scaleX(-1) ' : '';
  imgEl.style.transform = `${mirror}scale(${scale})`;
}

export default function PerformanceSimulator({ car, activeView = 'hero', isMuted: externalMuted, externalMute = false }) {
  const roadCanvasRef   = useRef(null);
  const gaugeCanvasRef  = useRef(null);
  const carImgRef       = useRef(null);
  const simulationRef   = useRef(null);
  const simStateRef     = useRef(IDLE_STATE);
  const animFrameRef    = useRef(null);
  const lastFrameTs     = useRef(0);
  const isMountedRef    = useRef(true);

  const idleAudioRef    = useRef(null);
  const accelAudioRef   = useRef(null);

  const [status,       setStatus]       = useState('idle'); // 'idle' | 'running' | 'complete'
  const [internalMute, setInternalMute] = useState(false);
  const [runResult,    setRunResult]    = useState(null);

  // Honour external mute from parent OR internal button
  const isMuted = externalMute ? !!externalMuted : internalMute;

  // Active car image URL — changes with angle tab
  const carImgSrc = car.images[activeView] || car.images.hero || car.images.side;

  // ── Master draw loop ─────────────────────────────────────────
  const drawLoop = useCallback((timestamp) => {
    const roadCanvas = roadCanvasRef.current;
    const gaugeCanvas = gaugeCanvasRef.current;
    if (!roadCanvas || !gaugeCanvas || !isMountedRef.current) return;

    const deltaMs = Math.min(timestamp - lastFrameTs.current, 50);
    lastFrameTs.current = timestamp;

    const W = roadCanvas.width;
    const H = roadCanvas.height;
    const s = simStateRef.current;

    // Draw Road (Background Canvas)
    const roadCtx = roadCanvas.getContext('2d');
    roadCtx.clearRect(0, 0, W, H);
    drawRoad(roadCtx, W, H, s.normalizedSpeed, deltaMs, s.phase);

    // Draw Gauges (Foreground Canvas)
    const gaugeCtx = gaugeCanvas.getContext('2d');
    gaugeCtx.clearRect(0, 0, W, H);
    drawGauge(gaugeCtx, W, H, s);

    // update car DOM image position directly — no React re-render
    updateCarImg(carImgRef.current, W, H, s.normalizedSpeed, activeView);

    animFrameRef.current = requestAnimationFrame(drawLoop);
  }, [activeView]);

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
    const roadCanvas = roadCanvasRef.current;
    const gaugeCanvas = gaugeCanvasRef.current;
    if (!roadCanvas || !gaugeCanvas) return;
    
    const ro = new ResizeObserver(() => {
      const w = roadCanvas.parentElement.offsetWidth;
      const h = roadCanvas.parentElement.offsetHeight;
      
      roadCanvas.width = w;
      roadCanvas.height = h;
      gaugeCanvas.width = w;
      gaugeCanvas.height = h;
    });
    
    ro.observe(roadCanvas.parentElement);
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
      {/* Background Canvas (Road) - z-index 1 */}
      <canvas ref={roadCanvasRef} className="perf-canvas perf-canvas--bg" />

      {/* Car image — mask-image vignette hides studio bg edges - z-index 2 */}
      <img
        ref={carImgRef}
        src={carImgSrc}
        alt={`${car.name} ${activeView} view`}
        className="perf-car-img"
        draggable={false}
        style={{
          width: '70%', 
          maxWidth: '750px',
          left: '50%',
          transform: `translateX(-50%) ${activeView === 'side' ? 'scaleX(-1)' : ''}`,
          top: '6%',
        }}
      />

      {/* Foreground Canvas (Gauges) - z-index 3 */}
      <canvas ref={gaugeCanvasRef} className="perf-canvas perf-canvas--fg" />

      {/* Minimal controls overlay */}
      <div className="perf-controls-overlay">
        
        {/* READY STATE TEXT */}
        {status === 'idle' && (
          <div className="perf-status-text">READY</div>
        )}

        {status === 'complete' ? (
          <button className="perf-btn perf-btn--primary" onClick={handleReset} id="run-again-btn">
            ↺ RUN AGAIN
          </button>
        ) : (
          <button
            className={`perf-btn perf-btn--primary${status === 'running' ? ' perf-btn--running' : ''}`}
            onClick={handleAccelerate}
            disabled={status === 'running'}
            id="accelerate-btn"
          >
            {status === 'running' ? 'ACCELERATING...' : '▶ ACCELERATE'}
          </button>
        )}
        
        {/* Only show mute button when NOT controlled externally */}
        {!externalMute && (
          <button
            className="perf-btn perf-btn--ghost"
            onClick={() => setInternalMute(m => !m)}
            aria-label={isMuted ? 'Enable sound' : 'Mute sound'}
            id="mute-btn"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}
      </div>
    </div>
  );
}
