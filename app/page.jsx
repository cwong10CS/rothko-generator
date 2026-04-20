"use client";

import { useEffect, useState, useRef } from "react";
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
  const [showButton, setShowButton] = useState(false);
  const hideButtonTimer = useRef(null);

  useEffect(() => {
    loadWeather(DEFAULT_LOCATION);
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowButton(true);
      clearTimeout(hideButtonTimer.current);
      hideButtonTimer.current = setTimeout(() => {
        setShowButton(false);
      }, 2000); // Hide after 2 seconds of inactivity
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(hideButtonTimer.current);
    };
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

  const handleDownload = () => {
    const canvas = document.getElementById("rothko-canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `rothko-${new Date().toISOString().split("T")[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(weather),
        opacity: weather ? 1 : 0,
        transition: "background-color 1000ms, opacity 2000ms",
      }}
      className="relative min-h-screen"
    >
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        {loading && <p>Loading...</p>}
        {weather && <Canvas weather={weather} />}

        <div className="flex gap-4 items-center">
          <LocationInput
            onChange={loadWeather}
            defaultValue={location}
            backgroundColor={getBackgroundColor(weather)}
            location={`${locationData?.city || location}${locationData?.region ? ", " + locationData.region : locationData?.country ? ", " + locationData.country : ""}`}
            weather={weather}
          />

          <button
            onClick={handleDownload}
            className={`px-4 py-2 bg-stone-600 text-white rounded hover:bg-stone-700 transition-opacity whitespace-nowrap ${
              showButton ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            Download
          </button>
        </div>
      </main>
    </div>
  );
}
