/*harmonyEngine: a separate layer between colorEngine & Canvas to determine
color relationships based on weather conditions and atmospheric stability */

import { mapWeathertoHSB } from "./colorEngine";
import { getBrightFromWeater } from "./time-of-day";

function wrapHue(value) {
  const h = value % 360;
  return h < 0 ? h + 360 : h;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/*Derive a multiplier for color blocks overlay on canvas. 
Hue spread widens with atmospheric instability */
//Stable weather -> tight, analogous palette
//Turbulent weather -> wider, contrasting palette
//Might fine-tune in order to find the right artistic balance
function hueSpread(stability) {
  return 15 + (1 - stability) * 30;
}

/* Blend block base hue from analogous to complementary based on stability.
High stability → tight analogous. Low stability → complementary contrast. */
function blockBaseHue(hue, stability) {
  const t = clamp((stability - 0.3) / 0.5, 0, 1);
  const offset = 180 - t * 150; // 180 deg at low stability -> 30 deg  at high
  return wrapHue(hue + offset);
}

/*Background: complementary hue (+180° from base) with subtle spread nudge.
Dimmer and less saturated than blocks, but brightness is still 
primarily driven by mapBrightness (time of day, clouds, AQI).
sunNorm lifts brightness and shifts hue warmer in sunny conditions. */
function deriveBackground(hue, saturation, brightness, spread, sunNorm = 0.5) {
  const warmBias = sunNorm * 15; // up to +15° warm shift at full sunshine
  return {
    h: wrapHue(hue + spread * 0.1 - warmBias),
    s: clamp(saturation * 0.75, 18, 78), // raised floor/multiplier to reduce dullness
    b: clamp(brightness * (0.85 + 0.1 * sunNorm), 0.12, 0.92), // sunshine lifts brightness up to *0.95
  };
}

/*Top Block: hue transitions from amber (day) to blue (night)
based on daytime brightness factor. Full base brightness. */
// daytime 1.0 -> amber, daytime 0.0 -> blue
function deriveTopBlock(hue, saturation, brightness, spread, daytime) {
  const amberHue = 35;
  const blueHue = 220;
  const topHue = amberHue + (1 - daytime) * (blueHue - amberHue);
  return {
    h: wrapHue(topHue),
    s: clamp(saturation, 18, 92),
    b: clamp(brightness, 0.08, 0.98),
  };
}

/*Middle block: base hue w/boosted saturation and brightness.
Appears under turbulent conditions only (stability < 0.5). */
function deriveMiddleBlock(hue, saturation, brightness, spread) {
  const comp = wrapHue(hue + 180);
  return {
    h: wrapHue(comp + spread * 0.5),
    s: clamp(saturation * 1.1, 18, 92),
    b: clamp(brightness * 1.1, 0.08, 0.98),
  };
}

/*Bottom block: base hue shifted in the opposite direction.
Slightly darker and less saturated than the top block. */
function deriveBottomBlock(hue, saturation, brightness, spread) {
  const comp = wrapHue(hue + 180);
  return {
    h: wrapHue(comp - spread),
    s: clamp(saturation * 0.85, 15, 85),
    b: clamp(brightness * 0.7, 0.08, 0.9),
  };
}

/*Glow: soft bleed/halo color around block edges.
Same hue family as background, low saturation, lifted brightness. */
function deriveGlow(hue, saturation, brightness) {
  return {
    h: hue,
    s: clamp(saturation * 0.5, 5, 60),
    b: clamp(brightness * 1.2, 0.1, 0.98),
  };
}

/* Imports base HSB from colorEngine's mapWeathertoHSB, then derives:
  - Background from complementary hue (+180°)
  - Blocks from base hue
  - Glow from base hue family
*/
export function generatePalette(weather) {
  const base = mapWeathertoHSB(weather);
  const { hue, saturation, brightness, atmosphericStability: stability } = base;
  const spread = hueSpread(stability);

  const sunNorm = base.factors?.sunNorm ?? 0.5;
  const background = deriveBackground(
    hue,
    saturation,
    brightness,
    spread,
    sunNorm,
  );
  const topBlock = deriveTopBlock(hue, saturation, brightness, spread);
  const bottomBlock = deriveBottomBlock(hue, saturation, brightness, spread);

  const blocks = [topBlock, bottomBlock];
  if (stability < 0.5) {
    blocks.splice(1, 0, deriveMiddleBlock(hue, saturation, brightness, spread));
  }

  const glow = deriveGlow(hue, saturation, brightness);

  /*Return colors of background, blocks, glow; colorEngine's output passthru */
  return { background, blocks, glow, meta: base };
}
