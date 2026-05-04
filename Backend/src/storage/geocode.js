const axios = require("axios");

async function geoCodePlace(place) {
  // Use the base URL only; let axios.params handle the rest
  const url = `https://nominatim.openstreetmap.org/search`;
    
  try {
    const response = await axios.get(url, {
      params: { 
        q: place,        // Fixed: changed 'query' to 'place'
        format: 'json', 
        limit: 1 
      },
      headers: { 
        'User-Agent': 'RoadAPI (shubhayubarua44@gmail.com)' 
      },
      timeout: 10000 // 10 seconds
    });

    // 1. Check if we actually got data back
    if (!response.data || response.data.length === 0) {
      console.log(`Location not found for: ${place}`);
      return null; 
    }

    // 2. Return the formatted object
    return {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon),
      display_name: response.data[0].display_name // Useful for debugging
    };

  } catch (error) {
    // This catches timeouts (ETIMEDOUT), 404s, 500s, etc.
    console.error("GEOCODE ERROR:", error.message);
    return null; 
  }
}

module.exports = geoCodePlace;