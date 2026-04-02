import { getBrightnessFromWeather } from "./lib/time-of-day";

/* Using a 360-degree color wheel, mapping 'condition' from 
'weather.js' to a base/archor hue angle to be adjusted or 
shifted by other factors/formulas later */

const HUE_CONDITION = {};

//Caps number between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

//Given range, convert value into 0-1 scale
//return to midpoint/range of 0.5 if data is missing
function normalize(value, min, max) {
  if (!Number.isFinite(value)) return 0.5;
  if (max <= min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

//Ensure hue angle/value is within 0-359
function wheelHue(hue) {
  const wrapped = hue % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/* Derive atmosphereic stability as a normalized value
based on humidity, cloudCover, windSpeedKph, and usAqi
from weather.js*/
// 1 = calm/stable, 0 = turbulent/unstable
export function atmosphericStability(weather) {
  return clamp(1 - instability, 0, 1);
}

/* Hue/Degree: base(condition) + thermal shift
 + stability shift + cloud shift */
export function mapHue(weather, stability) {
  return wheelHue(baseHue + thermalShift + stabilityShift + cloudShift);
}

/* Color Richness based on weighted weather factors 
& previously derived stability value*/
// 18-92 Range to prevent gray washout or oversaturation
export function mapSaturation(weather, stability) {
  return clamp(saturation, 18, 92); //
}

/* Brightness based on weighted factors: brightness from 
time-of-day.js & cloudCover from weather.js */
// 0.08-0.98 range to prevent fully black/white image
export function mapBrightness(weather, stability) {
  return clamp(brightness, 0.08, 0.98);
}

/*  Computes stability value to derive Humidity, Saturation,
Brightness; returns values, condition label, normalized factors 
for harmonyEngine*/
export function mapWeathertoHSB(weather) {
  const stability = atmosphericStability(weather);
  const hue = mapHue(weather, stability);
  const saturation = mapSaturation(weather, stability);
  const brightness = mapBrightness(weather, stability);

  return {
    hue,
    saturation,
    brightness,
    atmosphericStability: stability,
    condition: weather?.condition || "mixed",
    factors: {
      temperatureNorm: normalize(weather?.temperatureC, -15, 40),
      humidityNorm: normalize(weather?.humidity, 0, 100),
      cloudNorm: normalize(weather?.cloudCover, 0, 100),
      windNorm: normalize(weather?.windSpeedKph, 0, 60),
      airQualityNorm: normalize(weather?.airQuality?.usAqi, 0, 200),
    },
  };
}
