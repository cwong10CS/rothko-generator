import { useEffect, useRef } from "react";
import { mapWeathertoHSB } from "@/app/lib/colorEngine";
import { generatePalette } from "@/app/lib/harmonyEngine";
import { generateComposition } from "@/app/lib/compositionEngine";

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
