// Using built-in fetch (Node 18+)

/**
 * Fetches current weather using coordinates or city using wttr.in (Keyless)
 * Support for coordinates: https://wttr.in/lat,lon?format=j1
 */
const getCurrentWeather = async (city, coordinates = null) => {
  try {
    if (!city && !coordinates) return null;

    // Use coordinates if available for better accuracy
    let query = encodeURIComponent(city);
    if (coordinates && coordinates.lat && coordinates.lon) {
      query = `${coordinates.lat},${coordinates.lon}`;
    }

    const response = await fetch(`https://wttr.in/${query}?format=j1`);
    const data = await response.json();

    const current = data.current_condition[0];

    return {
      temp: current.temp_C,
      condition: current.weatherDesc[0].value,
      humidity: current.humidity,
      wind: current.windspeedKmph,
      city: city,
      isRainy: current.weatherDesc[0].value.toLowerCase().includes('rain') || 
               current.weatherDesc[0].value.toLowerCase().includes('drizzle')
    };
  } catch (error) {
    console.error('Weather Service Error:', error.message);
    return null;
  }
};

module.exports = { getCurrentWeather };
