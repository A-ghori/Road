const express = require("express");
const router = express.Router();
const { getRoute } = require("../RoadData/testMap");

router.post("/route", async (req, res) => {
  console.log("Route API hit");
  console.log("Body:", req.body);
  const { startLat, startLon, endLat, endLon } = req.body;

  const geojson = await getRoute(startLat, startLon, endLat, endLon);

  console.log("Route calculated successfully from RoadRoutes");

  res.json(geojson);
});

module.exports = router;
