/**
 * Detect user's location via geolocation API and reverse geocoding
 * @returns {Promise<{name: string, city: string, region: string, country: string} | null>}
 */
export async function detectUserLocation() {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`,
          );

          if (!geoResponse.ok) {
            resolve(null);
            return;
          }

          const geoData = await geoResponse.json();
          const location = geoData?.results?.[0];

          if (location) {
            resolve({
              name: location.name,
              city: location.name,
              region: location.admin1,
              country: location.country,
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error detecting location:", error);
          resolve(null);
        }
      },
      (error) => {
        console.log("Geolocation unavailable:", error.message);
        resolve(null);
      },
    );
  });
}
