/**
 * gaugeRenderer.js
 * Draws a premium arc-based instrument cluster on the canvas:
 *  - Circular arc speedometer with sweeping needle
 *  - Digital speed readout inside the arc
 *  - Tachometer arc (RPM)
 *  - Gear indicator
 *  - Phase label (ACCELERATING / HOLDING / BRAKING)
 *  - G-force horizontal bar
 */

const TWO_PI = Math.PI * 2;

// Arc geometry — 220° sweep, starting bottom-left
const ARC_START_DEG = 145;
const ARC_END_DEG   = 395;
const ARC_RANGE_DEG = ARC_END_DEG - ARC_START_DEG;
const toRad = (deg) => (deg * Math.PI) / 180;

// Speed range: 0 → 200 km/h displayed, pointer only goes to 100 during sim
const MAX_DISPLAY_SPEED = 220;

function speedToAngle(speed) {
  const fraction = Math.min(speed, MAX_DISPLAY_SPEED) / MAX_DISPLAY_SPEED;
  return toRad(ARC_START_DEG + fraction * ARC_RANGE_DEG);
}

/**
 * Draw the full instrument panel onto the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W   canvas width
 * @param {number} H   canvas height
 * @param {object} state  { speed, normalizedSpeed, rpm, gear, gForce, phase }
 */
export function drawGauge(ctx, W, H, state) {
  const { speed = 0, rpm = 0, gear = 1, gForce = 0, phase = 'idle' } = state;

  // ── Position the gauge cluster in the lower area ────────
  const spdR  = Math.min(W * 0.18, H * 0.30, 130);  // radius
  const spdCX = W * 0.5;
  const spdCY = H * 0.78;  // pushed lower so gauges don't overlap car

  // Tachometer — smaller, to the left
  const tachR  = spdR * 0.62;
  const tachCX = spdCX - spdR * 1.7;
  const tachCY = spdCY + spdR * 0.15;

  // Gear indicator position
  const gearX = spdCX + spdR * 1.75;
  const gearY = spdCY;

  drawSpeedometer(ctx, spdCX, spdCY, spdR, speed);
  drawTachometer(ctx, tachCX, tachCY, tachR, rpm, phase);
  drawGearIndicator(ctx, gearX, gearY, tachR, gear, phase);
  drawGForceBar(ctx, W, H, gForce);
  drawPhaseLabel(ctx, W, H, phase);
}

/* ─── SPEEDOMETER ─────────────────────────────────────────────── */
function drawSpeedometer(ctx, cx, cy, r, speed) {
  // Background plate
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  bg.addColorStop(0, 'rgba(12,12,15,0.96)');
  bg.addColorStop(1, 'rgba(5,5,8,0.98)');
  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, TWO_PI);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TWO_PI);
  ctx.fillStyle = bg;
  ctx.fill();

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TWO_PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Speed track (full arc, dim)
  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, toRad(ARC_START_DEG), toRad(ARC_END_DEG));
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Speed fill arc — red-to-white gradient up to current speed
  const fillAngle = speedToAngle(speed);
  const fillGrad  = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  fillGrad.addColorStop(0, 'rgba(227, 0, 15, 0.9)');
  fillGrad.addColorStop(0.6, 'rgba(255, 80, 80, 0.9)');
  fillGrad.addColorStop(1, 'rgba(255, 200, 200, 0.95)');

  ctx.beginPath();
  ctx.arc(cx, cy, r - 8, toRad(ARC_START_DEG), fillAngle);
  ctx.strokeStyle = fillGrad;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Tick marks
  const tickCount = 22; // 0 to 220 in 10 km/h steps
  for (let i = 0; i <= tickCount; i++) {
    const spd     = (i / tickCount) * MAX_DISPLAY_SPEED;
    const angle   = speedToAngle(spd);
    const isMajor = i % 2 === 0;
    const len     = isMajor ? r * 0.14 : r * 0.08;
    const inner   = r - 16 - len;
    const outer   = r - 16;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = isMajor ? 1.5 : 1;
    ctx.stroke();

    if (isMajor && spd <= 180) {
      const labelR = inner - r * 0.08;
      ctx.font = `bold ${r * 0.11}px "Rajdhani", sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(spd)}`, cx + Math.cos(angle) * labelR, cy + Math.sin(angle) * labelR);
    }
  }

  // Needle
  const needleAngle = speedToAngle(speed);
  drawNeedle(ctx, cx, cy, r * 0.74, needleAngle, speed > 0);

  // Center hub
  const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.09);
  hubGrad.addColorStop(0, '#e3000f');
  hubGrad.addColorStop(1, '#700009');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.08, 0, TWO_PI);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.04, 0, TWO_PI);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fill();

  // Digital speed readout
  ctx.font = `bold ${r * 0.42}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  // Subtle glow
  ctx.shadowColor = 'rgba(255,80,80,0.5)';
  ctx.shadowBlur = speed > 10 ? 12 : 0;
  ctx.fillText(Math.round(speed).toString().padStart(3, '0'), cx, cy + r * 0.25);
  ctx.shadowBlur = 0;

  // Unit label
  ctx.font = `${r * 0.14}px "Rajdhani", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('KM/H', cx, cy + r * 0.45);
}

function drawNeedle(ctx, cx, cy, length, angle, active) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Shadow for depth
  ctx.shadowColor = 'rgba(227, 0, 15, 0.6)';
  ctx.shadowBlur = active ? 8 : 0;

  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(length, 0);
  ctx.lineTo(length - 4, -2);
  ctx.lineTo(length - 4, 2);
  ctx.closePath();
  ctx.fillStyle = active ? '#e3000f' : 'rgba(255,255,255,0.3)';
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

/* ─── TACHOMETER ──────────────────────────────────────────────── */
function drawTachometer(ctx, cx, cy, r, rpm, phase) {
  // Background
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TWO_PI);
  ctx.fillStyle = 'rgba(8,8,12,0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // RPM track
  const rpmEndDeg = 390;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, toRad(ARC_START_DEG), toRad(rpmEndDeg));
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Redline zone (top 20% of arc)
  const redlineStart = toRad(ARC_START_DEG + ARC_RANGE_DEG * 0.8);
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, redlineStart, toRad(rpmEndDeg));
  ctx.strokeStyle = 'rgba(227, 0, 15, 0.25)';
  ctx.lineWidth = 5;
  ctx.stroke();

  // RPM fill
  const rpmColor = rpm > 0.8 ? 'rgba(227, 0, 15, 0.9)' : 'rgba(200,200,200,0.7)';
  const rpmAngle = toRad(ARC_START_DEG + rpm * ARC_RANGE_DEG);
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, toRad(ARC_START_DEG), rpmAngle);
  ctx.strokeStyle = rpmColor;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // RPM needle
  drawNeedle(ctx, cx, cy, r * 0.72, rpmAngle, true);

  // Hub
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.1, 0, TWO_PI);
  ctx.fillStyle = '#111';
  ctx.fill();

  // Label
  ctx.font = `bold ${r * 0.22}px "Rajdhani", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('RPM', cx, cy + r * 0.45);
}

/* ─── GEAR INDICATOR ─────────────────────────────────────── */
function drawGearIndicator(ctx, cx, cy, r, gear, phase) {
  const size = r * 1.1;

  // Background plate with rounded corners
  ctx.beginPath();
  ctx.roundRect(cx - size * 0.5, cy - size * 0.6, size, size * 1.2, size * 0.15);
  ctx.fillStyle = 'rgba(6,6,10,0.97)';
  ctx.fill();

  // Inner glow border — red tint when high gear
  const borderAlpha = gear >= 5 ? 0.5 : 0.1;
  ctx.strokeStyle = `rgba(227, 0, 15, ${borderAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Outer subtle rim
  ctx.beginPath();
  ctx.roundRect(cx - size * 0.5 - 1, cy - size * 0.6 - 1, size + 2, size * 1.2 + 2, size * 0.16);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // "GEAR" label
  ctx.font = `${r * 0.18}px "Rajdhani", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('GEAR', cx, cy - size * 0.5);

  // Gear number — larger
  ctx.font = `bold ${size * 0.82}px "Bebas Neue", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = phase === 'complete' ? 'rgba(255,255,255,0.2)' : '#fff';
  ctx.shadowColor = 'rgba(227,0,15,0.6)';
  ctx.shadowBlur = gear >= 5 ? 18 : 4;
  ctx.fillText(phase === 'complete' ? 'N' : gear.toString(), cx, cy + size * 0.05);
  ctx.shadowBlur = 0;
}

/* ─── G-FORCE BAR ────────────────────────────────────────────── */
function drawGForceBar(ctx, W, H, gForce) {
  const barW   = Math.min(W * 0.25, 180);
  const barH   = 6;
  const bx     = W * 0.5 - barW / 2;
  const by     = H - 28;
  const center = bx + barW / 2;

  // Label
  ctx.font = '10px "Rajdhani", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillText('G-FORCE', center, by - 4);

  // Track
  ctx.beginPath();
  ctx.roundRect(bx, by, barW, barH, barH / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();

  // Center line
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(center - 0.5, by - 2, 1, barH + 4);

  // Clamp gForce to -1 to 1
  const clamped = Math.max(-1, Math.min(1, gForce));
  const indicatorW = (Math.abs(clamped) * barW) / 2;
  const indicatorX = clamped >= 0 ? center : center - indicatorW;
  const color = clamped >= 0 ? '#e3000f' : '#4488ff';

  ctx.beginPath();
  ctx.roundRect(indicatorX, by, indicatorW, barH, barH / 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // +G / -G labels
  ctx.font = '9px "Rajdhani", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillText('BRAKE', bx, by - 4);
  ctx.textAlign = 'right';
  ctx.fillText('ACCEL', bx + barW, by - 4);
}

/* ─── PHASE LABEL ─────────────────────────────────────────────── */
function drawPhaseLabel(ctx, W, H, phase) {
  if (phase === 'idle' || phase === 'complete') return;

  const labels = { accel: 'ACCELERATING', hold: 'HOLDING', decel: 'BRAKING' };
  const colors = { accel: '#e3000f', hold: 'rgba(255,255,255,0.5)', decel: '#4488ff' };

  ctx.font = 'bold 11px "Rajdhani", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = colors[phase] || 'white';
  ctx.letterSpacing = '3px';
  ctx.fillText(labels[phase] || '', W * 0.5, H - 42);
  ctx.letterSpacing = '0px';
}
