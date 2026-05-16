// Mock Service for TravelSense
// Generates dummy data based on user coordinates for demonstration purposes.
// NOTE: Real Google Maps API logic is commented out at the very bottom of this file!

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(1));
}

function generateOffsetCoords(baseLat, baseLon, offsetKm) {
  const offsetDeg = offsetKm / 111;
  const latOffset = (Math.random() - 0.5) * 2 * offsetDeg;
  const lonOffset = (Math.random() - 0.5) * 2 * offsetDeg;
  return {
    lat: baseLat + latOffset,
    lon: baseLon + lonOffset
  };
}

async function fetchWithRadiusExpansion(lat, lon) {
  console.log(`Generating mock Tourist Attractions near ${lat}, ${lon}...`);
  
  const dummyPlaces = [
    { name: "Grand Historic Museum", type: "Museum" },
    { name: "City Botanical Gardens", type: "Park" },
    { name: "Ancient Temple Ruins", type: "Historical Landmark" },
    { name: "Riverside Viewpoint", type: "Scenic Point" },
    { name: "Royal Palace", type: "Historical Building" },
    { name: "Modern Art Gallery", type: "Art Gallery" },
    { name: "Grand City Square", type: "Landmark" },
    { name: "Wildlife Sanctuary Zoo", type: "Zoo" },
    { name: "Central Memorial", type: "Monument" }
  ];

  const results = dummyPlaces.map((place, index) => {
    const distanceKm = Math.random() * 14.5 + 0.5;
    const coords = generateOffsetCoords(lat, lon, distanceKm);
    
    return {
      id: 1000 + index,
      name: place.name,
      type: place.type,
      lat: coords.lat,
      lon: coords.lon,
      distance: Number(distanceKm.toFixed(1)),
      rating: (Math.random() * 1.5 + 3.5).toFixed(1)
    };
  });

  return results.sort((a, b) => a.distance - b.distance);
}

async function fetchWithRestaurantExpansion(lat, lon) {
  console.log(`Generating mock Restaurants near ${lat}, ${lon}...`);
  
  const dummyRestaurants = [
    { name: "Spice Route Kitchen", type: "Restaurant", cuisine: "Indian, Curry" },
    { name: "The Rustic Oven", type: "Pizzeria", cuisine: "Italian, Pizza" },
    { name: "Golden Pearl", type: "Restaurant", cuisine: "Chinese, Asian Fusion" },
    { name: "Sunset Cafe & Bakery", type: "Cafe", cuisine: "Coffee, Pastries" },
    { name: "Ocean Breeze Seafood", type: "Restaurant", cuisine: "Seafood, Grill" },
    { name: "Urban Burger Joint", type: "Fast Food", cuisine: "Burgers, American" },
    { name: "Green Leaf Vegetarian", type: "Restaurant", cuisine: "Vegan, Healthy" },
    { name: "Midnight Blues Pub", type: "Bar / Pub", cuisine: "Pub Grub, Drinks" },
    { name: "Saffron Fine Dining", type: "Restaurant", cuisine: "Indian, Mughlai" }
  ];

  const results = dummyRestaurants.map((place, index) => {
    const distanceKm = Math.random() * 7.8 + 0.2;
    const coords = generateOffsetCoords(lat, lon, distanceKm);
    
    return {
      id: 2000 + index,
      name: place.name,
      type: place.type,
      lat: coords.lat,
      lon: coords.lon,
      distance: Number(distanceKm.toFixed(1)),
      cuisine: place.cuisine,
      rating: (Math.random() * 1.0 + 4.0).toFixed(1) 
    };
  });

  return results.sort((a, b) => a.distance - b.distance);
}

module.exports = {
  fetchWithRadiusExpansion,
  fetchWithRestaurantExpansion,
};

/* =========================================================================
   FUTURE IMPLEMENTATION: GOOGLE MAPS PLACES API
   =========================================================================
   When you get a Google Maps API Key, uncomment the code below and delete 
   the dummy functions above!

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function fetchGooglePlaces(lat, lon, keyword, type) {
  if (!GOOGLE_MAPS_API_KEY) throw new Error("Missing GOOGLE_MAPS_API_KEY in .env");

  const radius = 10000;
  let url = \`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=\${lat},\${lon}&radius=\${radius}&key=\${GOOGLE_MAPS_API_KEY}\`;
  
  if (keyword) url += \`&keyword=\${encodeURIComponent(keyword)}\`;
  if (type) url += \`&type=\${encodeURIComponent(type)}\`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(\`API error: \${response.status}\`);

    const data = await response.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') return [];

    const places = [];
    let index = 0;
    for (const el of (data.results || [])) {
      if (index >= 15) break;
      const elementLat = el.geometry?.location?.lat;
      const elementLon = el.geometry?.location?.lng;
      if (!elementLat || !elementLon) continue;

      let formattedType = type === 'restaurant' ? 'Restaurant' : 'Tourist Attraction';
      let cuisine = type === 'restaurant' ? 'Local Cuisine' : undefined;

      places.push({
        id: el.place_id || index,
        name: el.name,
        type: formattedType,
        lat: elementLat,
        lon: elementLon,
        distance: calculateDistance(lat, lon, elementLat, elementLon),
        rating: el.rating ? el.rating.toFixed(1) : undefined,
        cuisine: cuisine,
      });
      index++;
    }
    return places.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching Google Places API:', error);
    return [];
  }
}

async function fetchWithRadiusExpansion(lat, lon) {
  return await fetchGooglePlaces(lat, lon, 'tourist attraction', 'tourist_attraction');
}

async function fetchWithRestaurantExpansion(lat, lon) {
  return await fetchGooglePlaces(lat, lon, '', 'restaurant');
}
========================================================================= */
