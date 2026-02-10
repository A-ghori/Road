const express = require("express");
const router = express.Router();
const { getRoute } = require("../RoadData/testMap");
const geoCodePlace = require("../storage/geocode")
// POST route (for frontend sending JSON body)
router.post("/route", async (req, res) => {
  try {
    console.log("Route POST API hit");
    console.log("Body:", req.body);

    const { start, end} = req.body;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing coordinates" });
    }
const startCoords = await geoCodePlace(start);
const endCoords = await geoCodePlace(end);

    const geojson = await getRoute(
      
      startCoords.lat, 
      startCoords.lon, 
      endCoords.lat, 
      endCoords.lon
    
    );

    console.log("Route calculated successfully (POST)");
    res.json(geojson);

  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET route (for direct browser testing)
router.get("/route", async (req, res) => {
  try {
    console.log("Route GET API hit");

    const { start , end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Missing query parameters" });
    }
const geoStart = await geoCodePlace(start);
const geoEnd = await geoCodePlace(end);


    const geojson = await getRoute(
      geoStart.lat,
       geoStart.lon,
        geoEnd.lat,
         geoEnd.lon
    );

    console.log("Route calculated successfully (GET)");
    res.json(geojson);

  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
