const axios = require("axios");

async function geoCodePlace(place) {
  const url = `https://nominatim.openstreetmap.org/search?q=${place}&format=json&limit=5`;
    
    const response = await axios.get(url, {
        headers:{
          "User-Agent":"RoadAiApp"  
        } 
    })
    if(!response.data || response.data.length===0){
        throw new Error("Location Not Found");
    }
    return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
    }
}
module.exports = geoCodePlace;