const fs = require("fs");
const path = require("path");
const { Graph } = require("../Graphs/GraphFinal");
// console.log("LoaderRoadGraph.js started");

// LatLng ko string key banane ke liye
function coordKey(lat, lng) {
  return `${lat},${lng}`;
}

function loadRoadGraph(filename) {
  // Use filename dynamically
  const filePath = path.join(__dirname, "../RoadData", filename);

  console.log("Loading roads from:", filePath);

  const roads = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log("Roads loaded:", roads.length);

  const graph = new Graph();

  for (const r of roads) {
    const from = coordKey(r.from[0], r.from[1]);
    const to = coordKey(r.to[0], r.to[1]);

    const weight = r.score;

    // Two-way road
    graph.addEdge(from, to, weight);
    graph.addEdge(to, from, weight);
  }

  console.log("Graph nodes:", graph.getNode().length);

  return graph;
}

// LOAD GRAPH
const graph = loadRoadGraph("roads_10k.json");  // change here to 1k or 100k

module.exports = { loadRoadGraph,
    graph,
    coordKey
 };
