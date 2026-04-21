"use client";

import { useEffect, useState, useRef } from "react";
import Canvas from "./components/Canvas";
import FaqOverlay from "./components/FaqOverlay";
import LocationInput from "./components/LocationInput";
import { getBrightnessFromWeather } from "./lib/time-of-day";
import { detectUserLocation } from "./lib/geolocation";

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
  const [faqOpen, setFaqOpen] = useState(false);
  const hideButtonTimer = useRef(null);

  const locationRef = useRef(DEFAULT_LOCATION);
  const locationDataRef = useRef({
    city: "Florence",
    region: "Tuscany",
    country: "Italy",
  });

  useEffect(() => {
    // Load default location first
    loadWeather(DEFAULT_LOCATION);
  }, []);

  useEffect(() => {
    // Then detect user location asynchronously
    const detectLocation = async () => {
      const detectedLoc = await detectUserLocation();
      if (detectedLoc) {
        loadWeather(detectedLoc.name, detectedLoc);
      }
    };
    detectLocation();
  }, []);

  // Auto-refresh weather every 30 minutes using latest location
  useEffect(() => {
    const interval = setInterval(
      () => {
        loadWeather(locationRef.current, locationDataRef.current);
      },
      30 * 60 * 1000,
    );
    return () => clearInterval(interval);
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
      locationRef.current = nextLocation;
      if (locData) {
        setLocationData(locData);
        locationDataRef.current = locData;
      }
    } catch (error) {
      console.error("Error loading weather:", error);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  const handleShare = async () => {
    const canvas = document.getElementById("rothko-canvas");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      const file = new File(
        [blob],
        `rothko-${new Date().toISOString().split("T")[0]}.png`,
        { type: "image/png" },
      );
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Rothko Generator" });
      } else {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
        alert("Link copied to clipboard!");
      }
    });
  };

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
      <FaqOverlay open={faqOpen} onClose={() => setFaqOpen(false)} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-12 pb-6">
        {loading && <p>Loading...</p>}
        {weather && <Canvas weather={weather} />}

        <div className="flex gap-4 items-stretch">
          <LocationInput
            onChange={loadWeather}
            defaultValue={location}
            backgroundColor={getBackgroundColor(weather)}
            location={`${locationData?.city || location}${locationData?.region ? ", " + locationData.region : locationData?.country ? ", " + locationData.country : ""}`}
            weather={weather}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setFaqOpen((o) => !o)}
              style={{
                backgroundImage: "url('/orange-and-yellow(1).jpg')",
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
              }}
              className={`flex items-center justify-center px-2 py-2 rounded text-sm font-bold uppercase tracking-wide text-transparent hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] hover:brightness-110 duration-700 transition-[filter,color,opacity] ${
                showButton ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              FAQ
            </button>

            <div className="flex flex-col gap-2 w-20">
              <button
                onClick={handleDownload}
                style={{
                  backgroundImage: "url('/Rust and Blue.jpg')",
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                }}
                className={`flex items-center justify-center px-2 py-2 rounded text-sm font-bold uppercase tracking-wide text-transparent hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] hover:brightness-110 duration-700 transition-[filter,color,opacity] ${
                  showButton ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                Download
              </button>
              <button
                onClick={undefined}
                style={{
                  backgroundImage: "url('/Violet,_Green_and_Red.jpg')",
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                }}
                className={`flex items-center justify-center px-2 py-2 rounded text-sm font-bold uppercase tracking-wide text-transparent hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] hover:brightness-110 duration-700 transition-[filter,color,opacity] ${
                  showButton ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
