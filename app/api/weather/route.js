// app/api/weather/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("q");

  if (!location) {
    return new Response(JSON.stringify({ error: "Location required" }), {
      status: 400,
    });
  }

  try {
    // TODO: Implement weather API call (OpenWeatherMap or similar)
    // For now, return mock data

    const mockWeather = {
      name: location,
      main: {
        temp: Math.random() * 30,
        humidity: Math.random() * 100,
      },
      clouds: {
        all: Math.random() * 100,
      },
      weather: [
        {
          main: "Clouds",
          description: "Overcast clouds",
        },
      ],
    };

    return new Response(JSON.stringify(mockWeather), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch weather" }), {
      status: 500,
    });
  }
}
