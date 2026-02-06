const express = require("express");
const router = express.Router();
const { getShortestRoute } = require("../Controller/MapController");

module.exports = (graph) => {
  const router = express.Router();

  router.post("/route", (req, res) => getShortestRoute(req, res, graph));

  return router;
};
