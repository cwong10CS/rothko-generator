function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getLocalHour(timestamp, utcOffsetSeconds) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime()) || !Number.isFinite(utcOffsetSeconds)) {
    return null;
  }
  const utcHour = date.getUTCHours() + date.getUTCMinutes() / 60;
  return (utcHour + utcOffsetSeconds / 3600 + 24) % 24;
}

export function getBrightnessFromWeather(weather) {
  const hour = getLocalHour(weather?.timestamp, weather?.utcOffsetSeconds);
  if (hour === null) {
    return weather?.isDay ? 0.7 : 0.3;
  }
  const curve = 0.5 + 0.5 * Math.cos(((hour - 12) * Math.PI) / 12);
  const boost = weather?.isDay ? 0.08 : -0.08;
  return clamp(curve + boost, 0, 1);
}
