const axios = require("axios");

async function getTraffic(lat, lng ) {
    try {
        const api_key = process.env.TOMTOM_API_KEY;

        if(!api_key){
            throw new Error("API IS MISSING")
        }

        const latitude = Number(lat);
        const longitude = Number(lng);

         if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180
        ) {
            throw new Error("Valid LAT LNG IS REQUIRED")
        }

        const response = await axios.get(
    "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json",
    {
        params: {
            point: `${latitude},${longitude}`,
            unit: "KMPH",
            key: api_key
        },
        timeout: 10000
    }
);
const flow = response.data.flowSegmentData;
const currentSpeed = flow.currentSpeed;
const freeFlowSpeed = flow.freeFlowSpeed;

let ratio = null;

if (freeFlowSpeed > 0 ){
    ratio = currentSpeed / freeFlowSpeed
}

let congestion = "UNKNOWN"; 
if (ratio !== null){
    if (ratio >= 0.7){
        congestion = "LOW";
    } else if (ratio >= 0.4){
        congestion = "MEDIUM"
    } else {
        congestion = "HIGH"
    }
}
    
    // TomTom geometry: latitude/longitude objects.
    // GeoJSON geometry: [longitude, latitude].

const coordinates = flow.coordinates?.coordinate?.map(point => [
    Number(point.longitude),
    Number(point.latitude)
]) || [];


    return {
        currentSpeed,
        freeFlowSpeed,
        ratio,
        congestion,
        coordinates
    };



    } catch (error) {
           console.error(
        "TomTom traffic error:",
        error.response?.data || error.message
    );
     throw new Error("Unable to fetch traffic data")
    }
}

module.exports = getTraffic