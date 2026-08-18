/**
 * roadRenderer.js
 * Draws the dark cinematic road perspective on the canvas.
 * Speed (0-1) controls how fast the dashed road lines move.
 */

let roadOffset = 0;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 * @param {number} speed - normalized speed 0 to 1
 * @param {number} deltaMs - ms since last frame
 */
export function drawRoad(ctx, width, height, speed, deltaMs) {
  // Advance the road line offset based on speed
  const pixelsPerMs = speed * 0.6;
  roadOffset = (roadOffset + pixelsPerMs * deltaMs) % 80;

  // Sky / dark background gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.55);
  skyGrad.addColorStop(0, '#000000');
  skyGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.55);

  // Horizon glow — subtle warm red on the horizon
  const horizonGrad = ctx.createLinearGradient(0, height * 0.45, 0, height * 0.62);
  horizonGrad.addColorStop(0, 'rgba(0,0,0,0)');
  horizonGrad.addColorStop(0.4, `rgba(180, 10, 10, ${0.03 + speed * 0.12})`);
  horizonGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 0, width, height * 0.62);

  // ── Road surface ───────────────────────────────────────────────
  const vp = { x: width * 0.5, y: height * 0.52 }; // vanishing point
  const roadLeft = 0;
  const roadRight = width;

  const roadGrad = ctx.createLinearGradient(0, vp.y, 0, height);
  roadGrad.addColorStop(0, '#111111');
  roadGrad.addColorStop(1, '#1c1c1c');
  ctx.beginPath();
  ctx.moveTo(vp.x - 60, vp.y);
  ctx.lineTo(vp.x + 60, vp.y);
  ctx.lineTo(roadRight, height);
  ctx.lineTo(roadLeft, height);
  ctx.closePath();
  ctx.fillStyle = roadGrad;
  ctx.fill();

  // Road edge lines (subtle)
  drawRoadEdge(ctx, vp, roadLeft, roadRight, height, speed);

  // Center dashed divider
  drawCenterLine(ctx, vp, width, height, speed, roadOffset);

  // Speed motion streaks on the road shoulders at high speeds
  if (speed > 0.4) {
    drawSpeedStreaks(ctx, vp, width, height, speed, roadOffset);
  }
}

function drawRoadEdge(ctx, vp, left, right, height, speed) {
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 + speed * 0.04})`;
  ctx.lineWidth = 1;

  // left edge line
  ctx.beginPath();
  ctx.moveTo(vp.x - 40, vp.y);
  ctx.lineTo(left + 30, height);
  ctx.stroke();

  // right edge line
  ctx.beginPath();
  ctx.moveTo(vp.x + 40, vp.y);
  ctx.lineTo(right - 30, height);
  ctx.stroke();
}

function drawCenterLine(ctx, vp, width, height, speed, offset) {
  const dashCount = 12;
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + speed * 0.1})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  for (let i = 0; i < dashCount; i++) {
    // Calculate perspective position for each dash
    const t0 = (i * 80 + offset) / (height - vp.y);
    const t1 = ((i + 0.45) * 80 + offset) / (height - vp.y);
    if (t0 > 1) continue;

    const y0 = vp.y + t0 * (height - vp.y);
    const y1 = vp.y + Math.min(t1, 1) * (height - vp.y);

    // Perspective x: closer to center at horizon, spreading at bottom
    const spread0 = t0 * 6;
    const spread1 = t1 * 6;

    ctx.globalAlpha = Math.min(t0 * 1.5, 1);
    ctx.beginPath();
    ctx.moveTo(vp.x - spread0, y0);
    ctx.lineTo(vp.x + spread0, y0);
    ctx.lineTo(vp.x + spread1, y1);
    ctx.lineTo(vp.x - spread1, y1);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + speed * 0.1})`;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpeedStreaks(ctx, vp, width, height, speed, offset) {
  const streakCount = 8;
  const alpha = (speed - 0.4) * 0.25;

  for (let i = 0; i < streakCount; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const xFactor = 0.15 + (Math.floor(i / 2) * 0.08);
    
    const t = ((i * 60 + offset * 2) % (height - vp.y)) / (height - vp.y);
    const y = vp.y + t * (height - vp.y);
    const x = vp.x + side * xFactor * width * t;
    const streakLen = t * 40 * speed;

    ctx.globalAlpha = alpha * t;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(x - 0.5, y - streakLen, 1, streakLen);
  }
  ctx.globalAlpha = 1;
}

export function resetRoad() {
  roadOffset = 0;
}
