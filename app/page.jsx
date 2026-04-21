"use client";

import { useEffect, useState, useRef } from "react";
import Canvas from "./components/Canvas";
import FaqOverlay from "./components/FaqOverlay";
import LocationInput from "./components/LocationInput";
import ShareModal from "./components/ShareModal";
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
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

  const handleShare = () => {
    const loc = encodeURIComponent(locationRef.current);
    const at = encodeURIComponent(new Date().toISOString());
    setShareUrl(`${window.location.origin}/?loc=${loc}&at=${at}`);
    setShareModalOpen(true);
  };

  const getImageBase64 = () =>
    new Promise((resolve) => {
      const canvas = document.getElementById("rothko-canvas");
      if (!canvas) return resolve(null);
      resolve(canvas.toDataURL("image/png"));
    });

  const handleDownload = () => {
    const sourceCanvas = document.getElementById("rothko-canvas");
    if (!sourceCanvas) return;

    // Portrait postcard: 4"×6" at 300dpi
    const W = 1200;
    const H = 1800;
    const PAD_X = 48; // narrower left/right than top/bottom
    const PAD_TOP = 80; // tight top margin, slightly less than left/right
    const CAPTION_H = 240;
    const ART_H = H - CAPTION_H;

    const pc = document.createElement("canvas");
    pc.width = W;
    pc.height = H;
    const ctx = pc.getContext("2d");

    // Background
    ctx.fillStyle = getBackgroundColor(weather);
    ctx.fillRect(0, 0, W, H);

    // Draw Rothko art scaled to fill the art zone width, anchored to top pad
    const srcW = sourceCanvas.width;
    const srcH = sourceCanvas.height;
    const artW = W - PAD_X * 2;
    const artMaxH = ART_H - PAD_TOP;
    const scale = Math.min(artW / srcW, artMaxH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    ctx.drawImage(
      sourceCanvas,
      PAD_X + (artW - drawW) / 2,
      PAD_TOP,
      drawW,
      drawH,
    );

    // Caption strip — starts just below the art rendering
    const artBottom = PAD_TOP + drawH;
    const captionTop = artBottom + 20; // tight gap below canvas

    // Hairline separator
    ctx.strokeStyle = "#d6d3d1"; // stone-300
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_X, captionTop);
    ctx.lineTo(W - PAD_X, captionTop);
    ctx.stroke();

    ctx.fillStyle = "#57534e"; // stone-600
    ctx.textBaseline = "alphabetic";

    const LINE_H = 64;
    const FONT_SIZE = 52;

    // Line 1 — location
    const locLine = `${locationData?.city || location}${
      locationData?.region
        ? ", " + locationData.region
        : locationData?.country
          ? ", " + locationData.country
          : ""
    }`;
    ctx.font = `bold ${FONT_SIZE}px Georgia, 'Times New Roman', serif`;
    ctx.fillText(locLine, PAD_X, captionTop + LINE_H);

    // Line 2 — time / weather
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: weather?.timezone || undefined,
    });
    const temp =
      weather?.temperatureC !== undefined
        ? Math.round(weather.temperatureC)
        : "--";
    const condition = weather?.condition || "--";
    const aqiLabel = weather?.airQuality?.category || "--";
    ctx.font = `34px Georgia, 'Times New Roman', serif`;
    ctx.fillText(
      `${timeStr}  ·  ${temp}°C  ·  ${condition}  ·  AQI: ${aqiLabel}`,
      PAD_X,
      captionTop + LINE_H + 50,
    );

    // Line 3 — title
    ctx.font = `bold ${FONT_SIZE}px Georgia, 'Times New Roman', serif`;
    ctx.fillText("Rothko Art Generator", PAD_X, captionTop + LINE_H * 2 + 50);

    // Download
    const link = document.createElement("a");
    link.href = pc.toDataURL("image/png");
    const citySlug = (locationData?.city || location)
      .toLowerCase()
      .replace(/\s+/g, "-");
    link.download = `rothko-${citySlug}-${new Date().toISOString().split("T")[0]}.png`;
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
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        locationLabel={`${locationData?.city || location}${locationData?.region ? ", " + locationData.region : ""}${locationData?.country ? ", " + locationData.country : ""}`}
        shareUrl={shareUrl}
        getImageBase64={getImageBase64}
      />
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
                onClick={handleShare}
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
