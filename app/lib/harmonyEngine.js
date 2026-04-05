/*harmonyEngine: a separate layer between colorEngine & Canvas to determine
color relationships based on weather conditions and atmospheric stability */

import { mapWeathertoHSB } from "./colorEngine";

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

/*Background: complementary hue (+180° from base) with subtle spread nudge.
Dimmer and less saturated than blocks, but brightness is still 
primarily driven by mapBrightness (time of day, clouds, AQI). */
function deriveBackground(hue, saturation, brightness, spread) {
  return {
    h: wrapHue(hue + spread * 0.1),
    s: clamp(saturation * 0.7, 10, 75),
    b: clamp(brightness * 0.8, 0.12, 0.82),
  };
}

/*Top Block: base hue with spread-driven warm shift.
Full base brightness. */
function deriveTopBlock(hue, saturation, brightness, spread) {
  const comp = wrapHue(hue + 180);
  return {
    h: wrapHue(comp + spread * 0.3),
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

  const background = deriveBackground(hue, saturation, brightness, spread);
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
