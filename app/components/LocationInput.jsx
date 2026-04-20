import { useState, useRef, useEffect } from "react";

export default function LocationInput({ onChange, defaultValue }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef(null);
  const placeholderTimer = useRef(null);

  // Show placeholder only when input is empty
  useEffect(() => {
    if (input.length === 0) {
      setShowPlaceholder(true);
    } else {
      setShowPlaceholder(false);
    }
  }, [input]);

  // Show placeholder again after 10 seconds of inactivity
  useEffect(() => {
    clearTimeout(placeholderTimer.current);
    if (input.length === 0) {
      placeholderTimer.current = setTimeout(() => {
        setShowPlaceholder(true);
      }, 20000);
    }

    return () => clearTimeout(placeholderTimer.current);
  }, [input]);

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
    setInput(location.name);
    setSuggestions([]);
    onChange(location.name);
  };

  return (
    <div className="relative w-full">
      {showPlaceholder && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-700 ${
            isFocused ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="text-4xl font-bold text-stone-600">
            Rothko Art Generator
          </span>
        </div>
      )}
      <input
        type="text"
        placeholder={
          showPlaceholder && !isFocused
            ? ""
            : "Enter location by country, state, city or zip code..."
        }
        value={input}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(input);
            setSuggestions([]);
          }
        }}
        className="border border-stone-300 focus:border-stone-200 focus:ring-1 focus:ring-stone-300 p-2 rounded w-full relative z-10 bg-white"
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
