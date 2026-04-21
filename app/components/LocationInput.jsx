import { useState, useRef, useEffect } from "react";

export default function LocationInput({
  onChange,
  defaultValue,
  backgroundColor,
  location,
  weather,
}) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [displayTitle, setDisplayTitle] = useState("Rothko Art Generator");
  const [displayMode, setDisplayMode] = useState("title"); // 'title', 'location', 'weather'
  const [titleOpacity, setTitleOpacity] = useState(1);
  const debounceTimer = useRef(null);
  const placeholderTimer = useRef(null);
  const cycleTimer = useRef(null);
  const inactivityTimer = useRef(null);

  // Show placeholder only when input is empty
  useEffect(() => {
    if (input.length === 0) {
      setShowPlaceholder(true);
    } else {
      setShowPlaceholder(false);
    }
  }, [input]);

  // Show placeholder again after 20 seconds of inactivity
  useEffect(() => {
    clearTimeout(placeholderTimer.current);
    if (input.length === 0) {
      placeholderTimer.current = setTimeout(() => {
        setShowPlaceholder(true);
      }, 20000);
    }

    return () => clearTimeout(placeholderTimer.current);
  }, [input]);

  // Cycle title between "Rothko Art Generator", location, and weather info separately
  useEffect(() => {
    if (isHovered || input.length > 0) {
      clearTimeout(cycleTimer.current);
      clearTimeout(inactivityTimer.current);
      setTitleOpacity(1);
      setDisplayMode("title");
      return;
    }

    // Start cycling through title, location, and weather
    let cycleStep = 0;
    const cycles = ["title", "location", "weather"];
    let isMounted = true;

    const cycleTitles = () => {
      if (!isMounted) return;

      // Fade out
      setTitleOpacity(0);

      // Change display after fade starts
      cycleTimer.current = setTimeout(() => {
        if (!isMounted) return;

        cycleStep = (cycleStep + 1) % cycles.length;
        const mode = cycles[cycleStep];
        setDisplayMode(mode);

        if (mode === "title") {
          setDisplayTitle("Rothko Art Generator");
        } else if (mode === "location") {
          setDisplayTitle(location);
        } else if (mode === "weather") {
          setDisplayTitle("--"); // Placeholder, actual content in JSX
        }
        // Fade in
        setTitleOpacity(1);

        // Schedule next cycle (5 seconds per display)
        cycleTimer.current = setTimeout(cycleTitles, 5000);
      }, 250);
    };

    cycleTitles();

    return () => {
      isMounted = false;
      clearTimeout(cycleTimer.current);
      clearTimeout(inactivityTimer.current);
    };
  }, [isHovered, input, location, weather]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setShowPlaceholder(false); // Hide placeholder when typing

    clearTimeout(debounceTimer.current);
    if (value.length > 2) {
      debounceTimer.current = setTimeout(async () => {
        const res = await fetch(
          `/api/locations?q=${encodeURIComponent(value)}`,
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  const selectLocation = (location) => {
    setSuggestions([]);
    // Pass location name for API, and full location data for display
    onChange(location.name, {
      city: location.name,
      region: location.admin1,
      country: location.country,
    });
    setInput(""); // Clear input to show cycling title
  };

  return (
    <div
      className="relative w-full"
      style={{ backgroundColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showPlaceholder && (
        <div
          className={`absolute inset-0 flex items-center pointer-events-none z-20 transition-opacity ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
          style={{ transitionDuration: "1500ms" }}
        >
          <div className="text-left pl-2">
            {displayMode === "title" && (
              <span
                className="text-4xl font-bold text-stone-600 transition-opacity block"
                style={{ opacity: titleOpacity, transitionDuration: "250ms" }}
              >
                {displayTitle}
              </span>
            )}
            {displayMode === "location" && (
              <span
                className="text-4xl font-bold text-stone-600 transition-opacity block"
                style={{ opacity: titleOpacity, transitionDuration: "250ms" }}
              >
                {location}
              </span>
            )}
            {displayMode === "weather" && weather && (
              <div
                className="text-2xl font-semibold text-stone-600 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ opacity: titleOpacity, transitionDuration: "250ms" }}
              >
                {(() => {
                  // Format current time in location using timezone from weather
                  const now = new Date();
                  const timeString = now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: weather.timezone || undefined,
                  });

                  const temp =
                    weather.temperatureC !== undefined
                      ? Math.round(weather.temperatureC)
                      : "--";
                  const condition = weather.condition || "--";
                  const aqiLabel = weather.airQuality?.category || "--";

                  return `${timeString} • ${temp}°C • ${condition} • AQI: ${aqiLabel}`;
                })()}
              </div>
            )}
          </div>
        </div>
      )}
      <input
        type="text"
        style={{ backgroundColor }}
        placeholder={
          showPlaceholder && !isHovered
            ? ""
            : "Enter location by country, state, city or zip code..."
        }
        value={input}
        onChange={handleInputChange}
        onKeyDown={async (e) => {
          if (e.key === "Enter" && input.trim()) {
            // Fetch location data from API to get proper formatting
            try {
              const res = await fetch(
                `/api/locations?q=${encodeURIComponent(input)}`,
              );
              const data = await res.json();
              const firstResult = data.results?.[0];

              if (firstResult) {
                // Use API data for proper capitalization and formatting
                onChange(firstResult.name, {
                  city: firstResult.name,
                  region: firstResult.admin1,
                  country: firstResult.country,
                });
              } else {
                // Fallback if no API results
                onChange(input, {
                  city: input,
                  region: null,
                  country: null,
                });
              }
            } catch (error) {
              console.error("Error fetching location:", error);
              onChange(input, {
                city: input,
                region: null,
                country: null,
              });
            }
            setSuggestions([]);
            setInput(""); // Clear input to show cycling title
          }
        }}
        className="outline-none p-2 rounded w-full relative z-10 bg-white"
      />
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-stone-300 mt-1 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
          {suggestions.map((loc, idx) => (
            <li
              key={idx}
              onClick={() => selectLocation(loc)}
              className="p-2 hover:bg-stone-100 cursor-pointer text-sm"
            >
              {loc.name}, {loc.admin1 || loc.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
