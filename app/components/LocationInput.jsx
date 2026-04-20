import { useState, useRef } from "react";

export default function LocationInput({ onChange, defaultValue }) {
  const [input, setInput] = useState(defaultValue || "");
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimer = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

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
      <input
        type="text"
        placeholder="Enter location..."
        value={input}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(input);
            setSuggestions([]);
          }
        }}
        className="border border-stone-300 p-2 rounded w-full"
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
