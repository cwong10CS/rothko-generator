import { useEffect, useRef } from "react";
import { getBrightnessFromWeather } from "@/app/lib/time-of-day";

function formatWeatherDisplay(weather, brightness) {
  if (!weather) return "No weather data";

  try {
    return `brightness_factor: ${brightness.toFixed(2)}\n\n${JSON.stringify(weather, null, 2)}`;
  } catch {
    return String(weather);
  }
}

export default function Canvas({ weather }) {
  const canvasRef = useRef(null);
  const brightness = getBrightnessFromWeather(weather);
  const displayText = formatWeatherDisplay(weather, brightness);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1f2937";
    ctx.font = "16px monospace";
    ctx.textBaseline = "top";

    const lines = displayText.split("\n");
    let y = 20;
    const lineHeight = 22;
    const maxY = canvas.height - 20;

    for (const line of lines) {
      if (y > maxY) break;
      ctx.fillText(line, 16, y);
      y += lineHeight;
    }
  }, [weather, displayText]);

  return (
    <div className="border-2 border-stone-300 rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">Canvas</h2>
      <canvas
        ref={canvasRef}
        id="rothko-canvas"
        width={800}
        height={600}
        className="block w-full max-w-full h-auto border border-stone-200"
      />
      <p className="text-sm text-stone-600 mt-4">{displayText}</p>
    </div>
  );
}
