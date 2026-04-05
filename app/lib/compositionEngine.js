/* compositionEngine: determines block proportions, vertical drift,
   and edge treatment based on weather. Sits between harmonyEngine & Canvas. */

import { generatePalette } from "./harmonyEngine";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value, min, max) {
  if (!Number.isFinite(value)) return 0.5;
  if (max <= min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

/* Block height ratios: how vertical space is divided among blocks.
   Warm temperatures bias toward a top-heavy composition,
   cold temperatures bias toward bottom-heavy. */
function blockProportions(blockCount, weather) {
  const tempNorm = normalize(weather?.temperatureC, -15, 40);

  if (blockCount === 2) {
    const topWeight = 0.4 + (tempNorm - 0.5) * 0.2;
    return [clamp(topWeight, 0.3, 0.55), clamp(1 - topWeight, 0.3, 0.55)];
  }

  if (blockCount === 3) {
    const topWeight = 0.3 + (tempNorm - 0.5) * 0.12;
    const midWeight = 0.34;
    const bottomWeight = 1 - topWeight - midWeight;
    return [
      clamp(topWeight, 0.22, 0.38),
      clamp(midWeight, 0.26, 0.4),
      clamp(bottomWeight, 0.22, 0.38),
    ];
  }

  return Array(blockCount).fill(1 / blockCount);
}

/* Gap between blocks as fraction of canvas height.
   Stable weather -> tight gaps; turbulent -> wider spacing. */
function blockGap(stability) {
  return 0.02 + (1 - stability) * 0.04;
}

/* Wind pushes the outer blocks (top/bottom) apart from the center.
   Stronger wind -> top block drifts up, bottom block drifts down.
   Returns per-block vertical offset as fraction of canvas height.
   Positive = downward, negative = upward. */
function verticalDrift(blockCount, weather) {
  const speedNorm = normalize(weather?.windSpeedKph, 0, 60);
  const maxDrift = 0.05;
  const drift = speedNorm * maxDrift;

  if (blockCount === 2) {
    return [-drift, drift];
  }

  if (blockCount === 3) {
    return [-drift, 0, drift];
  }

  return Array(blockCount).fill(0);
}

/* Overcast skies push the mid block lower on canvas.
   Returns additional downward shift for the mid block as fraction of height.
   Only applies when 3 blocks are present. */
function cloudSag(blockCount, weather) {
  if (blockCount !== 3) return 0;
  const cloudNorm = normalize(weather?.cloudCover, 0, 100);
  return cloudNorm * 0.04;
}

/* Edge softness: high humidity = softer, blurrier block edges.
   Returns blur radius as fraction of block height. */
function edgeSoftness(weather) {
  const humidityNorm = normalize(weather?.humidity, 0, 100);
  return 0.01 + humidityNorm * 0.04;
}

/* Main export: wraps harmonyEngine's palette with spatial layout data. */
export function generateComposition(weather) {
  const palette = generatePalette(weather);
  const stability = palette.meta.atmosphericStability;
  const blockCount = palette.blocks.length;

  const drift = verticalDrift(blockCount, weather);
  const midSag = cloudSag(blockCount, weather);

  // Apply cloud sag to mid block drift
  if (blockCount === 3) {
    drift[1] += midSag;
  }

  return {
    ...palette,
    layout: {
      proportions: blockProportions(blockCount, weather),
      gap: blockGap(stability),
      verticalDrift: drift,
      softness: edgeSoftness(weather),
      blockCount,
    },
  };
}
