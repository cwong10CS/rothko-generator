import { useEffect, useRef } from "react";
import { mapWeathertoHSB } from "@/app/lib/colorEngine";
import { getLocalHour, getBrightnessFromWeather } from "@/app/lib/time-of-day";
import { generatePalette } from "@/app/lib/harmonyEngine";
import { generateComposition } from "@/app/lib/compositionEngine";
import { hsbToHex, hsbToRgba, buildBlockRects } from "@/app/lib/renderEngine";

function formatWeatherDisplay(weather) {
  if (!weather) return "No weather data";
  try {
    const loc = weather.location || {};
    const mapped = mapWeathertoHSB(weather);
    const palette = generatePalette(weather);
    const comp = generateComposition(weather);
    const layout = comp.layout;
    const fmtColor = ({ h, s, b }) =>
      `h:${h.toFixed(0)} s:${s.toFixed(1)} b:${b.toFixed(3)}`;
    const factors = mapped.factors || {};

    const lines = [
      `${loc.name || "unknown"}, ${loc.country || ""}`,
      `lat: ${loc.latitude?.toFixed(4) ?? "N/A"} long: ${loc.longitude?.toFixed(4) ?? "N/A"}`,
      `isDay: ${weather.isDay}  timezone: ${weather.timezone ?? "N/A"}`,
      `localHour: ${(() => {
        const h = getLocalHour(weather.timestamp, weather.utcOffsetSeconds);
        if (h === null) return "N/A";
        const hh = String(Math.floor(h)).padStart(2, "0");
        const mm = String(Math.floor((h % 1) * 60)).padStart(2, "0");
        return `${hh}:${mm}`;
      })()}  dayBrightness: ${getBrightnessFromWeather(weather).toFixed(3)}`,
      `condition: ${weather.condition ?? "N/A"}  temp: ${weather.temperatureC ?? "N/A"}C  wind: ${weather.windSpeedKph ?? "N/A"}kph`,
      "",
      "----colorEngine HSB----",
      `hue: ${mapped.hue.toFixed(2)}`,
      `saturation: ${mapped.saturation.toFixed(2)}`,
      `brightness: ${mapped.brightness.toFixed(2)}`,
      `stability: ${mapped.atmosphericStability.toFixed(2)}`,
      `condition: ${mapped.condition}`,
      `factors: temp:${factors.temperatureNorm?.toFixed(3)} hum:${factors.humidityNorm?.toFixed(3)} cloud:${factors.cloudNorm?.toFixed(3)} wind:${factors.windNorm?.toFixed(3)} aqi:${factors.airQualityNorm?.toFixed(3)}`,
      "",
      "----harmonyEngine palette----",
      `background: ${fmtColor(palette.background)}`,
      ...palette.blocks.map((blk, i) => `block[${i}]: ${fmtColor(blk)}`),
      `glow: ${fmtColor(palette.glow)}`,
      `stability: ${palette.meta.atmosphericStability.toFixed(3)}`,
      "",
      "----compositionEngine layout----",
      `proportions: [${layout.proportions.map((p) => p.toFixed(3)).join(", ")}]`,
      `gap: ${layout.gap.toFixed(4)}`,
      `verticalDrift: [${layout.verticalDrift.map((d) => d.toFixed(4)).join(", ")}]`,
      `softness: ${layout.softness.toFixed(4)}`,
      `blockCount: ${layout.blockCount}`,
      "",
    ];

    return lines.join("\n");
  } catch (e) {
    return `error: ${e.message}\n`;
  }
}

export default function Canvas({ weather }) {
  const canvasRef = useRef(null);
  const displayText = formatWeatherDisplay(weather);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;

    // Paint the Rothko composition
    const comp = generateComposition(weather);
    const bgColor = hsbToHex(comp.background);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const rects = buildBlockRects(comp, width, height);

    // Draw glow behind blocks
    const glowColor = hsbToRgba(comp.glow, 0.15);
    for (const block of rects) {
      ctx.save();
      ctx.filter = `blur(${(block.blur + 8).toFixed(1)}px)`;
      ctx.fillStyle = glowColor;
      ctx.fillRect(block.x - 4, block.y - 4, block.w + 8, block.h + 8);
      ctx.restore();
    }

    // Draw blocks
    for (const block of rects) {
      ctx.save();
      ctx.filter = block.blur > 0 ? `blur(${block.blur.toFixed(1)}px)` : "none";
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.restore();
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
      <p className="text-sm text-stone-600 mt-4 whitespace-pre-wrap font-mono">
        {displayText}
      </p>
    </div>
  );
}
