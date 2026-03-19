export default function LocationInput({ onChange, defaultValue }) {
  // TODO: Create location input with autocomplete
  // TODO: Call onChange callback on submit

  return (
    <input
      type="text"
      placeholder="Enter location..."
      defaultValue={defaultValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange(e.target.value);
        }
      }}
      className="border border-stone-300 p-2 rounded w-full"
    />
  );
}
