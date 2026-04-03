import { getBrightnessFromWeather } from "./time-of-day";

/* Using a 360-degree color wheel, map weather condition
to a base/anchor hue angle that is shifted by other factors. */

const HUE_CONDITION = {
  clear: 48, //golden yellow
  cloudy: 210, //steel blue
  rain: 215, //slightly deeper blue
  snow: 205, //Lighter cyan-blues
  storm: 260, //violet-blue
  mixed: 150, //Green-cyans
};

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

/* Derive atmospheric stability as a normalized value
based on humidity, cloudCover, windSpeedKph, and airQuality.usAqi. */
export function atmosphericStability(weather) {
  const windNorm = normalize(weather?.windSpeedKph, 0, 60);
  const humidityNorm = normalize(weather?.humidity, 0, 100);
  const cloudNorm = normalize(weather?.cloudCover, 0, 100);
  const aqiNorm = normalize(weather?.airQuality?.usAqi, 0, 200);

  /* Variance from typical calm conditions:
  55% humidity and 45% cloud cover. */
  const humidityVariance = Math.abs(humidityNorm - 0.55);
  const cloudVariance = Math.abs(cloudNorm - 0.45);

  //Weighted sum of instability factors
  const instability =
    0.45 * windNorm + //wind as the main driver for instability
    0.2 * humidityVariance +
    0.2 * cloudVariance +
    0.15 * aqiNorm;

  //Returns inversed stability value by subtraction
  // 1 = calm/stable, 0 = turbulent/unstable
  return clamp(1 - instability, 0, 1);
}

/* Hue (degrees): base(condition) + thermal shift
+ stability shift + cloud shift */
export function mapHue(weather, stability) {
  const condition = weather?.condition || "mixed";
  const baseHue = HUE_CONDITION[condition] ?? HUE_CONDITION.mixed;

  const tempNorm = normalize(weather?.temperatureC, -15, 40); // Tuned for a broad moderate-climate outdoor range.
  const cloudNorm = normalize(weather?.cloudCover, 0, 100);

  const thermalShift = (tempNorm - 0.5) * 80; // +/- 40 deg; higher temp -> warmer tones.
  const stabilityShift = (0.5 - stability) * 36; // +/- 18 deg; higher stability -> calmer tones.
  const cloudShift = (0.5 - cloudNorm) * 22; // +/- 11 deg; clearer skies -> warmer tones.

  return wheelHue(baseHue + thermalShift + stabilityShift + cloudShift);
}

/* Color richness based on weighted weather factors
and previously derived stability value. */
export function mapSaturation(weather, stability) {
  const humidityNorm = normalize(weather?.humidity, 0, 100);
  const windNorm = normalize(weather?.windSpeedKph, 0, 60);
  const cloudNorm = normalize(weather?.cloudCover, 0, 100);
  const aqiNorm = normalize(weather?.airQuality?.usAqi, 0, 200);

  const saturation =
    36 + // midpoint/baseline
    24 * humidityNorm +
    18 * windNorm +
    12 * (1 - cloudNorm) +
    10 * stability -
    12 * aqiNorm;

  // 18-92 range to prevent gray washout or oversaturation.
  return clamp(saturation, 18, 92);
}

/* Brightness based on weighted factors:
time of day, cloud cover, atmospheric stability, and AQI. */
export function mapBrightness(weather, stability) {
  const daytime = getBrightnessFromWeather(weather);
  const cloudNorm = normalize(weather?.cloudCover, 0, 100);
  const aqiNorm = normalize(weather?.airQuality?.usAqi, 0, 200);

  const brightness =
    0.68 * daytime + 0.2 * (1 - cloudNorm) + 0.1 * stability - 0.1 * aqiNorm;

  // 0.08-0.98 range to prevent fully black/white output.
  return clamp(brightness, 0.08, 0.98);
}

/* Compute hue, saturation, and brightness from weather.
Returns values, condition label, and normalized factors for harmonyEngine. */
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
