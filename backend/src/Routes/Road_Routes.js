const express = require("express");
const router = express.Router();
const { getShortestRoute } = require("../Controller/MapController");

// GET /api/route?fromLat=..&fromLng=..&toLat=..&toLng=..
router.post("/route", getShortestRoute);

module.exports = router;
