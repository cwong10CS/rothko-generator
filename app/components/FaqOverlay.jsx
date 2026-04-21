"use client";

const FAQ_ITEMS = [
  {
    q: "Rothko Art Generator: What is it?",
    a: "A generative art tool that creates Rothko-inspired, color-field imagery driven by real-time environmental data fetched from your location. Rendering refreshes automatically every 30 minutes to reflect updated weather conditions. ",
  },
  {
    q: "Data-Driven Aesthetics",
    a: [
      {
        label: "Weather condition → base hue",
        desc: "clear = golden, cloudy = cyan, rain = blue, snow = light cyan, storm = violet",
      },
      {
        label: "Temperature → hue shift",
        desc: "warm air = warmer tones, cold air = cooler tones",
      },
      {
        label: "Cloud cover + wind + humidity + AQI → atmospheric stability",
        desc: "drives palette spread, block count, and gap width",
      },
      {
        label: "Stability → palette spread",
        desc: "stable = tight analogous, turbulent = wide contrasting + 3rd block",
      },
      {
        label: "Wind speed → vertical drift",
        desc: "top block drifts up, bottom block drifts down",
      },
      {
        label: "Cloud cover → mid block sag",
        desc: "overcast pushes the mid block lower on canvas",
      },
      {
        label: "Humidity → edge softness",
        desc: "high humidity = blurrier block edges",
      },
      {
        label: "Time of day → brightness",
        desc: "primary curve refined by cloud cover, stability, and AQI",
      },
    ],
  },
  {
    q: "Changing Location",
    a: "Type any city, region, or zip code into the location input at the bottom to generate a painting for that place.",
  },
  {
    q: "Saving the Artwork",
    a: "Hover over the page to reveal the Download button, then click it to save a PNG of the current painting.",
  },
];

export default function FaqOverlay({ open, onClose }) {
  return (
    <>
      {/* FAQ overlay */}
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* tinted backdrop */}
        <div
          className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* panel */}
        <div className="relative z-10 max-w-3xl w-full mx-6 bg-white bg-opacity-80 rounded-xl shadow-lg p-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-lg leading-none"
            aria-label="Close FAQ"
          >
            ✕
          </button>
          <h2 className="text-2xl font-semibold text-stone-800 mb-8">FAQ</h2>
          <dl className="space-y-7">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q}>
                <dt className="text-base font-semibold text-stone-700">{q}</dt>
                <dd className="mt-1.5 text-base text-stone-600 leading-relaxed">
                  {Array.isArray(a) ? (
                    <ul className="space-y-3 mt-2">
                      {a.map(({ label, desc }) => (
                        <li key={label}>
                          <span className="font-medium text-stone-700">
                            {label}
                          </span>
                          <span className="block text-stone-500 text-sm mt-0.5">
                            {desc}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    a
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}
