"use client";

import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import LocationInput from "./components/LocationInput";
import { getBrightnessFromWeather } from "./lib/time-of-day";

const DEFAULT_LOCATION = "Florence";

function getBackgroundColor(weather) {
  if (!weather) return "#ffffff";

  const brightness = getBrightnessFromWeather(weather);
  const base = Math.round(200 + brightness * 15);
  return `rgb(${base}, ${base}, ${base})`;
}

export default function HomePage() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationData, setLocationData] = useState({
    city: "Florence",
    region: "Tuscany",
    country: "Italy",
  });
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWeather(DEFAULT_LOCATION);
  }, []);

  async function loadWeather(nextLocation, locData) {
    setWeather(null);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/weather?q=${encodeURIComponent(nextLocation)}`,
      );
      const data = await response.json();

      if (!response.ok || data?.error) {
        console.error("Weather API error:", data?.error || response.statusText);
        setWeather(null);
        return;
      }

      setWeather(data);
      setLocation(nextLocation);
      if (locData) {
        setLocationData(locData);
      }
    } catch (error) {
      console.error("Error loading weather:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(weather),
        opacity: weather ? 1 : 0,
        transition: "background-color 1000ms, opacity 2000ms",
      }}
    >
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        <LocationInput
          onChange={loadWeather}
          defaultValue={location}
          backgroundColor={getBackgroundColor(weather)}
          location={`${locationData?.city || location}${locationData?.region ? ", " + locationData.region : locationData?.country ? ", " + locationData.country : ""}`}
        />
        {loading && <p>Loading...</p>}
        {weather && <Canvas weather={weather} />}
      </main>
    </div>
  );
}
