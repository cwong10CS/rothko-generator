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

function getAirQualityLabel(aqi) {
  if (!Number.isFinite(aqi)) return "unknown";
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy for sensitive groups";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very unhealthy";
  return "hazardous";
}

export function normalizeWeatherApi(weatherData, airQualityData, location) {
  const current = weatherData?.current || {};
  const airCurrent = airQualityData?.current || {};
  const condition = getCondition(current.weather_code);
  const humidity = getNearestHourlyValue(weatherData.hourly, current.time, "relative_humidity_2m");
  const cloudCover = getNearestHourlyValue(weatherData.hourly, current.time, "cloud_cover");
  const aqi = Number.isFinite(airCurrent.us_aqi) ? airCurrent.us_aqi : null;

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
    isDay: Boolean(current.is_day),
    airQuality: {
      usAqi: aqi,
      category: getAirQualityLabel(aqi),
      pm25: Number.isFinite(airCurrent.pm2_5) ? airCurrent.pm2_5 : null,
      pm10: Number.isFinite(airCurrent.pm10) ? airCurrent.pm10 : null,
      ozone: Number.isFinite(airCurrent.ozone) ? airCurrent.ozone : null,
      nitrogenDioxide: Number.isFinite(airCurrent.nitrogen_dioxide)
        ? airCurrent.nitrogen_dioxide
        : null
    }
  };
}
