/**
 * carRenderer.js
 * Handles drawing the selected Mustang image onto the canvas.
 * Preloads images to avoid creating new Image objects every frame.
 */

// Cache to store pre-loaded Image objects keyed by src URL
const imageCache = new Map();

/**
 * Pre-load a car image into the cache.
 * Call this when a car is selected so the image is ready by the time
 * the first frame needs to draw it.
 * @param {string} src - The image URL
 * @returns {Promise<HTMLImageElement>}
 */
export function preloadCarImage(src) {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw the car image on the canvas, centered and respecting aspect ratio.
 * A slight vertical bounce is applied based on speed for life.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} src - The image URL to draw
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 * @param {number} speed - normalized speed 0-1
 * @param {number} timestamp - performance.now() for oscillation
 */
export function drawCar(ctx, src, width, height, speed, timestamp) {
  const img = imageCache.get(src);
  if (!img) return;

  // Dimensions: car occupies ~70% of the canvas width, centered
  const maxCarWidth = width * 0.70;
  const maxCarHeight = height * 0.38;
  const ratio = Math.min(maxCarWidth / img.naturalWidth, maxCarHeight / img.naturalHeight);
  const drawW = img.naturalWidth * ratio;
  const drawH = img.naturalHeight * ratio;

  // Position: horizontally centered, sitting on the "road" at ~60% height
  const cx = width * 0.5;
  const groundY = height * 0.60;

  // Subtle vertical oscillation at speed (feels alive)
  const bounceAmp = speed * 1.2;
  const bounceFreq = 8 + speed * 6; // Hz
  const bounce = Math.sin((timestamp / 1000) * bounceFreq * Math.PI * 2) * bounceAmp;

  const drawX = cx - drawW / 2;
  const drawY = groundY - drawH + bounce;

  // At high speed, add a subtle forward lean (horizontal offset)
  const leanOffset = speed * 4;

  // Motion blur shadow at high speed
  if (speed > 0.5) {
    const blurAlpha = (speed - 0.5) * 0.08;
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = blurAlpha / i;
      ctx.drawImage(img, drawX - i * 4 * speed + leanOffset, drawY, drawW, drawH);
    }
    ctx.globalAlpha = 1;
  }

  ctx.drawImage(img, drawX + leanOffset, drawY, drawW, drawH);

  // Reflection on the road surface
  drawReflection(ctx, img, drawX + leanOffset, drawY, drawW, drawH, groundY, speed);
}

function drawReflection(ctx, img, x, y, w, h, groundY, speed) {
  const reflectionAlpha = 0.06 + speed * 0.04;
  ctx.save();
  ctx.translate(x + w / 2, groundY);
  ctx.scale(1, -0.18);
  ctx.globalAlpha = reflectionAlpha;
  const reflGrad = ctx.createLinearGradient(0, 0, 0, h * 0.3);
  reflGrad.addColorStop(0, 'rgba(0,0,0,0)');
  reflGrad.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.drawImage(img, -w / 2, 0, w, h);
  ctx.fillStyle = reflGrad;
  ctx.fillRect(-w / 2, 0, w, h * 0.3);
  ctx.restore();
  ctx.globalAlpha = 1;
}
