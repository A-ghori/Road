const axios = require("axios");

async function getTraffic(req,res) {
    try {
        const {lat, lng} = req.query;
        const api_key = process.env.TOMTOM_API_KEY;

        if(!api_key){
            return res.status(500).json({
                error : "TOMTOM_API_KEY ERROR"
            })
        }

        const latitude = Number(lat);
        const longitude = Number(lng);

         if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180
        ) {
            return res.status(400).json({
                error: "Valid lat and lng are required"
            });
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

    return res.json({
        currentSpeed,
        freeFlowSpeed,
        ratio,
        congestion,
        source: "TomTom"
    });

    } catch (error) {
           console.error(
        "TomTom traffic error:",
        error.response?.data || error.message
    );
     return res.status(502).json({
        error: "Unable to fetch traffic data"
    });
    }
}

module.exports = getTraffic