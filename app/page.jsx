"use client";

import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";

const DEFAULT_LOCATION = "Reykjavik";

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
      setWeather(data);
      setLocation(nextLocation);
    } catch (error) {
      console.error("Error loading weather:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <h1 className="text-4xl font-bold">Rothko Art Generator</h1>

      <input
        type="text"
        placeholder="Enter location..."
        defaultValue={location}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            loadWeather(e.target.value);
          }
        }}
        className="border p-2 rounded"
      />

      {loading && <p>Loading...</p>}
      {weather && <Canvas weather={weather} />}
    </main>
  );
}
