const express = require("express");
const router = express.Router();
const { getRoute } = require("../RoadData/testMap");
const geoCodePlace = require("../storage/geocode")
// POST route (for frontend sending JSON body)
router.post("/route", async (req, res) => {
  try {
    console.log("Route POST API hit");
    console.log("Body:", req.body);

    const { start, end, mode} = req.body;

    if (!start || !end || !mode) {
      return res.status(400).json({ error: "Missing coordinates or mode" });
    }
const startCoords = await geoCodePlace(start);
const endCoords = await geoCodePlace(end);

    const geojson = await getRoute(
      parseFloat(startCoords.lat),
      parseFloat(startCoords.lon),
      parseFloat(endCoords.lat),
      parseFloat(endCoords.lon),
      mode
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

    const { start , end, mode } = req.query;

    if (!start || !end || !mode) {
      return res.status(400).json({ error: "Missing query parameters" });
    }
const geoStart = await geoCodePlace(start);
const geoEnd = await geoCodePlace(end);
console.log("START GEOCODE:", geoStart);
console.log("END GEOCODE:", geoEnd);


    const geojson = await getRoute(
      parseFloat(geoStart.lat),
      parseFloat(geoStart.lon),
      parseFloat(geoEnd.lat),
      parseFloat(geoEnd.lon),
      mode

    );

    console.log("Route calculated successfully (GET)");
    res.json(geojson);

  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
