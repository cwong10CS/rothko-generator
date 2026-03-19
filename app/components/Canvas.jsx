export default function Canvas({ weather }) {
  // TODO: Create HTML5 canvas element
  // TODO: Generate Rothko rectangles based on weather data
  // TODO: Use weather data (temp, humidity, clouds) to influence colors

  return (
    <div className="border-2 border-stone-300 rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">Canvas</h2>
      <canvas
        id="rothko-canvas"
        width={800}
        height={600}
        className="border border-stone-200"
      />
      <p className="text-sm text-stone-600 mt-4">
        Temp: {weather?.main?.temp}°C | Humidity: {weather?.main?.humidity}%
      </p>
    </div>
  );
}
