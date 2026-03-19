import { NextResponse } from "next/server";
import { normalizeWeatherApi } from "@/app/lib/weather";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "Florence").trim();

  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
      { cache: "no-store" }
    );

    if (!geoResponse.ok) {
      return NextResponse.json({ error: "Failed to geocode location" }, { status: 502 });
    }

    const geoData = await geoResponse.json();
    const location = geoData?.results?.[0];

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,wind_speed_10m,is_day&hourly=relative_humidity_2m,cloud_cover`,
      { cache: "no-store" }
    );

    if (!weatherResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch weather" }, { status: 502 });
    }

    const weatherData = await weatherResponse.json();
    const normalized = normalizeWeatherApi(weatherData, location);

    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
