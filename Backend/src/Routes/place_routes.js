const express = require("express");
const axios = require("axios");
const router = express.Router();
const getHostRoute = require("../RoadData/hostedValhalla")
const getTraffic = require("../RoadData/trafficRoute");

router.post("/route", async (req,res) => {
  const {start, destination, mode="car"} = req.body;

  if (
    typeof start !== "string" || typeof  destination !== "string" || !start.trim() || !destination.trim()
  ) {
    return res.status(400).json({
      error: "Start and Destination is required"
    })
  };

  try {
    async function geocode(location) {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params : {
            q : location ,
            format : "jsonv2",
            limit : 1,
            countrycodes : "in"
          },
          headers : {
            "User-Agent" : "RoadDamageProject/1.0"
          },
          timeout : 10000
        }
      );

      if(!response.data.length){
        throw new Error(`Location not found ${location}`);
      }
      return {
        lat : Number(response.data[0].lat),
        lng : Number(response.data[0].lon)
      }
    }
    const [origin , target] = await Promise.all([
      geocode(start),
      geocode(destination)
    ]);
    const route = await getHostRoute(
      origin.lat,
      origin.lng,
      target.lat,
      target.lng,
      mode
    );
    
    const coordinates = route.features[0].geometry.coordinates;
    const sampleCount = Math.min(10, coordinates.length);
    const trafficSamples = []

    for (let i = 0; i< sampleCount; i++){
        const index = Math.round (
          i * (coordinates.length - 1) / Math.max(1, sampleCount - 1)
        )
        const [lng, lat ] = coordinates[index];

        trafficSamples.push(
          getTraffic(lat, lng).then(traffic => {
            return {
              lat ,
              lng ,
              ...traffic
            }
          })
        )
    }
    const traffic = await Promise.all(trafficSamples);

    res.json({
      start : {name : start , ...origin},
      destination : {name : destination, ...target},
      route,
      traffic
    })
  } catch (error) {
      console.error("Route API error:", {
    message: error.message,
    status: error.response?.status,
    url: error.config?.url,
    response: error.response?.data,
});

    res.status(502).json({
      error: error.message || "Failed to calculate route"
    });
  }
})

module.exports = router