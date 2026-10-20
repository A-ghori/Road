
const express = require("express");
const router = express.Router();

const getTraffic  = require("../Controller/traffic.controller");

router.get("/flow", getTraffic);

module.exports = router;
