// TODO: Create HTML5 canvas element
// TODO: Generate Rothko rectangles based on weather data
// TODO: Use weather data (temp, humidity, clouds) to influence colors

import { useEffect, useRef } from "react";

function normalizeWeatherText(weather) {
  if (!weather) return "No weather data";

  try {
    return JSON.stringify(weather, null, 2);
  } catch {
    return String(weather);
  }
}

export default function Canvas({ weather }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const text = normalizeWeatherText(weather);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1f2937";
    ctx.font = "16px monospace";
    ctx.textBaseline = "top";

    const lines = text.split("\n");
    let y = 20;
    const lineHeight = 22;
    const maxY = canvas.height - 20;

    for (const line of lines) {
      if (y > maxY) break;
      ctx.fillText(line, 16, y);
      y += lineHeight;
    }
  }, [weather]);

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
      <p className="text-sm text-stone-600 mt-4">
        {normalizeWeatherText(weather)}
      </p>
    </div>
  );
}
