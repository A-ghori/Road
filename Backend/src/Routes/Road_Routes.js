const express = require("express");
const router = express.Router();
const { getRoute } = require("../RoadData/testMap");

router.post("/route", async (req, res) => {
  console.log("Route API hit");
  console.log("Body:", req.body);

  try {
    const { startLat, startLon, endLat, endLon } = req.body;

    const geojson = await getRoute(
      Number(startLat),
      Number(startLon),
      Number(endLat),
      Number(endLon),
    );

    console.log("Route calculated successfully from RoadRoutes");

    res.json(geojson);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
