// LoaderRoadGraph.js
const { Graph } = require("../Graphs/GraphFinal");
const path = require("path");
const {
  buildGraphFromPBF,
} = require("../Loader_Graph.js/parsePBF_Converter_Graph");

let graph = null;

// LatLng ko string key banane ke liye
function coordKey(lat, lng) {
  return `${lat},${lng}`;
}

/**
 * Load graph from PBF file
 * (filename optional, default PBF use karega)
 */
async function loadRoadGraph(filename = "chunk1.osm.pbf") {
  try {
    const filePath = path.join(__dirname, "../RoadData", filename);

    console.log("Building graph from:", filePath);

    graph = await buildGraphFromPBF(filePath);

    console.log(" Graph Ready with", graph.getNode().length, "nodes");

    return graph;
  } catch (err) {
    console.error("❌ Graph build failed:", err);
    throw err;
  }
}

// IMPORTANT:
// graph initially null rahega
// loadRoadGraph() call hone ke baad set hoga

module.exports = {
  loadRoadGraph,
  graph,
  coordKey,
};
