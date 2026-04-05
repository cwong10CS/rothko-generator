/* renderEngine: converts compositionEngine output into canvas-ready
   drawing instructions. HSB → CSS colors + pixel-space block rects. */

/* HSB to RGB. h: 0-360, s: 0-100, b: 0-1 */
function hsbToRgb(h, s, b) {
  const sat = s / 100;
  const c = b * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = b - c;

  let r, g, bl;
  if (h < 60) {
    r = c;
    g = x;
    bl = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    bl = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    bl = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    bl = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    bl = c;
  } else {
    r = c;
    g = 0;
    bl = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((bl + m) * 255),
  ];
}

export function hsbToHex({ h, s, b }) {
  const [r, g, bl] = hsbToRgb(h, s, b);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

export function hsbToRgba({ h, s, b }, alpha = 1) {
  const [r, g, bl] = hsbToRgb(h, s, b);
  return `rgba(${r}, ${g}, ${bl}, ${alpha})`;
}

/* Convert compositionEngine output into pixel-space block rects.
   Returns array of { x, y, w, h, color, hex, blur } ready for ctx.fillRect. */
export function buildBlockRects(composition, canvasWidth, canvasHeight) {
  const { blocks, layout } = composition;
  const { proportions, gap, verticalDrift, softness } = layout;

  const totalGapFraction = gap * (blocks.length - 1);
  const usableHeight = canvasHeight * (1 - totalGapFraction - 0.18);
  const gapPx = gap * canvasHeight;
  const blockWidth = canvasWidth * 0.82;
  const xOffset = (canvasWidth - blockWidth) / 2;

  const rects = [];
  let currentY = canvasHeight * 0.09;

  for (let i = 0; i < blocks.length; i++) {
    const blockHeight = usableHeight * proportions[i];
    const drift = (verticalDrift[i] || 0) * canvasHeight;
    const blur = softness * blockHeight;

    rects.push({
      x: xOffset,
      y: currentY + drift,
      w: blockWidth,
      h: blockHeight,
      color: hsbToRgba(blocks[i]),
      hex: hsbToHex(blocks[i]),
      blur,
    });

    currentY += blockHeight + gapPx;
  }

  return rects;
}
