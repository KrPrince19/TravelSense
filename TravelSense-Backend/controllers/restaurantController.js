const { fetchWithRestaurantExpansion } = require('../services/googlePlacesService');

exports.getRestaurants = async (req, res) => {
  const latParam = req.query.lat || req.query.latitude;
  const lngParam = req.query.lng || req.query.longitude;

  if (!latParam || !lngParam) {
    return res.status(400).json({ error: 'Missing latitude or longitude parameters' });
  }

  const lat = parseFloat(latParam);
  const lng = parseFloat(lngParam);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude format' });
  }

  try {
    const restaurants = await fetchWithRestaurantExpansion(lat, lng);
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error('Error in restaurants controller:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};
