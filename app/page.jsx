"use client";

import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import LocationInput from "./components/LocationInput";

const DEFAULT_LOCATION = "Florence";

export default function HomePage() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWeather(DEFAULT_LOCATION);
  }, []);

  async function loadWeather(nextLocation) {
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
    } catch (error) {
      console.error("Error loading weather:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <LocationInput onChange={loadWeather} defaultValue={location} />

      {loading && <p>Loading...</p>}
      {weather && <Canvas weather={weather} />}
    </main>
  );
}
