const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

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

async function fetchTouristPlaces(lat, lon, radius) {
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](around:${radius},${lat},${lon});
      way["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](around:${radius},${lat},${lon});
      relation["tourism"~"attraction|museum|viewpoint|gallery|theme_park|zoo"](around:${radius},${lat},${lon});
      
      node["historic"~"monument|ruins|castle|archaeological_site"](around:${radius},${lat},${lon});
      way["historic"~"monument|ruins|castle|archaeological_site"](around:${radius},${lat},${lon});
      relation["historic"~"monument|ruins|castle|archaeological_site"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const elements = data.elements || [];
    const places = [];
    const seenNames = new Set();

    elements.forEach((el) => {
      const name = el.tags?.name || el.tags?.['name:en'];
      if (!name) return;
      
      if (seenNames.has(name)) return;
      seenNames.add(name);

      const elementLat = el.lat || el.center?.lat;
      const elementLon = el.lon || el.center?.lon;

      if (!elementLat || !elementLon) return;

      const type = el.tags?.tourism || el.tags?.historic || 'Tourist Attraction';
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');

      const distance = calculateDistance(lat, lon, elementLat, elementLon);

      places.push({
        id: el.id,
        name,
        type: formattedType,
        lat: elementLat,
        lon: elementLon,
        distance
      });
    });

    places.sort((a, b) => a.distance - b.distance);
    return places.slice(0, 15);
  } catch (error) {
    console.error(`Error fetching Overpass API for radius ${radius}:`, error);
    return [];
  }
}

async function fetchRestaurants(lat, lon, radius) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub"](around:${radius},${lat},${lon});
      way["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub"](around:${radius},${lat},${lon});
      relation["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const elements = data.elements || [];
    const restaurants = [];
    const seenNames = new Set();

    elements.forEach((el) => {
      const name = el.tags?.name || el.tags?.['name:en'];
      if (!name) return; // Skip unnamed places
      
      if (seenNames.has(name)) return;
      seenNames.add(name);

      const elementLat = el.lat || el.center?.lat;
      const elementLon = el.lon || el.center?.lon;

      if (!elementLat || !elementLon) return;

      const type = el.tags?.amenity || 'Restaurant';
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
      
      const cuisine = el.tags?.cuisine ? el.tags.cuisine.split(';').map((c) => c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')).join(', ') : undefined;
      const distance = calculateDistance(lat, lon, elementLat, elementLon);
      const rating = el.tags?.rating;

      restaurants.push({
        id: el.id,
        name,
        type: formattedType,
        lat: elementLat,
        lon: elementLon,
        distance,
        cuisine,
        rating
      });
    });

    restaurants.sort((a, b) => a.distance - b.distance);
    return restaurants.slice(0, 15);
  } catch (error) {
    console.error(`Error fetching Overpass API for restaurants at radius ${radius}:`, error);
    return [];
  }
}

async function fetchWithRadiusExpansion(lat, lon) {
  const radiuses = [2000, 5000, 10000, 20000];
  
  for (const radius of radiuses) {
    console.log(`Searching Overpass for places within ${radius}m...`);
    const places = await fetchTouristPlaces(lat, lon, radius);
    if (places.length > 0) {
      console.log(`Found ${places.length} places in ${radius}m radius.`);
      return places;
    }
  }
  
  console.log('No places found even at max radius.');
  return [];
}

async function fetchWithRestaurantExpansion(lat, lon) {
  const radiuses = [2000, 5000, 10000, 20000];
  
  for (const radius of radiuses) {
    console.log(`Searching Overpass for restaurants within ${radius}m...`);
    const places = await fetchRestaurants(lat, lon, radius);
    if (places.length > 0) {
      console.log(`Found ${places.length} restaurants in ${radius}m radius.`);
      return places;
    }
  }
  
  console.log('No restaurants found even at max radius.');
  return [];
}

module.exports = {
  fetchWithRadiusExpansion,
  fetchWithRestaurantExpansion,
};
