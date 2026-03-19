const WEATHER_GROUPS = {
  clear: [0],
  cloudy: [1, 2, 3, 45, 48],
  rain: [51, 53, 55, 61, 63, 65, 80, 81, 82],
  snow: [71, 73, 75, 77, 85, 86],
  storm: [95, 96, 99]
};

function getCondition(weatherCode) {
  if (WEATHER_GROUPS.clear.includes(weatherCode)) return "clear";
  if (WEATHER_GROUPS.cloudy.includes(weatherCode)) return "cloudy";
  if (WEATHER_GROUPS.rain.includes(weatherCode)) return "rain";
  if (WEATHER_GROUPS.snow.includes(weatherCode)) return "snow";
  if (WEATHER_GROUPS.storm.includes(weatherCode)) return "storm";
  return "mixed";
}

function getNearestHourlyValue(hourly, targetTime, key) {
  const times = hourly?.time || [];
  const values = hourly?.[key] || [];
  if (!times.length || !values.length) return null;

  const exactIndex = times.indexOf(targetTime);
  if (exactIndex >= 0) return values[exactIndex];

  return values[0];
}

export function normalizeWeatherApi(weatherData, location) {
  const current = weatherData?.current || {};
  const condition = getCondition(current.weather_code);
  const humidity = getNearestHourlyValue(weatherData.hourly, current.time, "relative_humidity_2m");
  const cloudCover = getNearestHourlyValue(weatherData.hourly, current.time, "cloud_cover");

  return {
    location: {
      name: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    },
    timestamp: current.time,
    condition,
    temperatureC: current.temperature_2m ?? 15,
    windSpeedKph: current.wind_speed_10m ?? 0,
    humidity: humidity ?? 50,
    cloudCover: cloudCover ?? 50,
    isDay: Boolean(current.is_day)
  };
}
