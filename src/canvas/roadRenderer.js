/**
 * roadRenderer.js — Enhanced cinematic road.
 * - Darker, more dramatic atmosphere
 * - Speed-based motion streaks on shoulders
 * - Brake glow effect during deceleration
 * - Dynamic horizon line
 */

let roadOffset = 0;

export function drawRoad(ctx, W, H, normalizedSpeed, deltaMs, phase) {
  // Advance road lines (speed affects distance per ms)
  let roadSpeed = normalizedSpeed;
  // During braking, road still moves but decelerates
  roadOffset = (roadOffset + roadSpeed * 0.6 * deltaMs) % 80;

  const VP = { x: W * 0.5, y: H * 0.50 };

  // ── Sky ──────────────────────────────────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, VP.y);
  sky.addColorStop(0, '#000000');
  sky.addColorStop(1, '#050508');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, VP.y);

  // Atmospheric horizon glow
  const horizonAlpha = 0.04 + normalizedSpeed * 0.14;
  const horizonColor = phase === 'decel' ? `rgba(30,60,255,${horizonAlpha})` : `rgba(180,10,10,${horizonAlpha})`;
  const horizonGrad  = ctx.createLinearGradient(0, VP.y - 60, 0, VP.y + 60);
  horizonGrad.addColorStop(0, 'rgba(0,0,0,0)');
  horizonGrad.addColorStop(0.5, horizonColor);
  horizonGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, VP.y - 60, W, 120);

  // ── Road surface ─────────────────────────────────────────────
  const roadGrad = ctx.createLinearGradient(0, VP.y, 0, H);
  roadGrad.addColorStop(0, '#0e0e10');
  roadGrad.addColorStop(1, '#1a1a1e');
  ctx.beginPath();
  ctx.moveTo(VP.x - 55, VP.y);
  ctx.lineTo(VP.x + 55, VP.y);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = roadGrad;
  ctx.fill();

  // Brake light reflection on road (decel phase only)
  if (phase === 'decel') {
    const brakeGrad = ctx.createLinearGradient(0, VP.y, 0, H);
    const brakeAlpha = 0.05 + (1 - normalizedSpeed) * 0.12;
    brakeGrad.addColorStop(0, `rgba(60,60,255,0)`);
    brakeGrad.addColorStop(0.4, `rgba(30,30,200,${brakeAlpha})`);
    brakeGrad.addColorStop(1, `rgba(0,0,150,${brakeAlpha * 0.5})`);
    ctx.beginPath();
    ctx.moveTo(VP.x - 55, VP.y);
    ctx.lineTo(VP.x + 55, VP.y);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = brakeGrad;
    ctx.fill();
  }

  // ── Edge lines ────────────────────────────────────────────────
  ctx.strokeStyle = `rgba(255,255,255,${0.06 + normalizedSpeed * 0.04})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(VP.x - 40, VP.y); ctx.lineTo(30, H); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(VP.x + 40, VP.y); ctx.lineTo(W - 30, H); ctx.stroke();

  // ── Center dashed line (perspective) ─────────────────────────
  drawCenterLine(ctx, VP, H, normalizedSpeed);

  // ── Shoulder speed streaks ────────────────────────────────────
  if (normalizedSpeed > 0.3) {
    drawSpeedStreaks(ctx, VP, W, H, normalizedSpeed);
  }
}

function drawCenterLine(ctx, VP, H, speed) {
  const dashCount = 14;
  for (let i = 0; i < dashCount; i++) {
    const t0 = Math.min(((i * 80 + roadOffset) / (H - VP.y)), 1);
    const t1 = Math.min((((i + 0.45) * 80 + roadOffset) / (H - VP.y)), 1);
    if (t0 >= 1) continue;

    const y0 = VP.y + t0 * (H - VP.y);
    const y1 = VP.y + t1 * (H - VP.y);
    const hw0 = t0 * 6;
    const hw1 = t1 * 6;

    ctx.globalAlpha = Math.min(t0 * 1.5, 1);
    ctx.beginPath();
    ctx.moveTo(VP.x - hw0, y0);
    ctx.lineTo(VP.x + hw0, y0);
    ctx.lineTo(VP.x + hw1, y1);
    ctx.lineTo(VP.x - hw1, y1);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,255,255,${0.22 + speed * 0.08})`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpeedStreaks(ctx, VP, W, H, speed) {
  const alpha = (speed - 0.3) * 0.18;
  const streakCount = 10;
  for (let i = 0; i < streakCount; i++) {
    const side     = i % 2 === 0 ? -1 : 1;
    const xFactor  = 0.1 + (Math.floor(i / 2) * 0.07);
    const t        = ((i * 55 + roadOffset * 2) % Math.max(H - VP.y, 1)) / Math.max(H - VP.y, 1);
    const y        = VP.y + t * (H - VP.y);
    const x        = VP.x + side * xFactor * W * t;
    const streakLen = t * 50 * speed;

    ctx.globalAlpha = alpha * t;
    ctx.fillStyle   = 'rgba(255,255,255,0.9)';
    ctx.fillRect(x - 0.5, y - streakLen, 1, streakLen);
  }
  ctx.globalAlpha = 1;
}

export function resetRoad() {
  roadOffset = 0;
}
