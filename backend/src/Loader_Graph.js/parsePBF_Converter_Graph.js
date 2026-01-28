// parsePBF_Converter_Graph.js
const { Graph } = require("../Graphs/GraphFinal");
const { parsePBF } = require("../Graphs/PARSE_PBF");
const { haversine } = require("../utils/Geo_Haversine");

function buildGraphFromPBF(filePath) {
  return new Promise((resolve, reject) => {
    const graph = new Graph();

    parsePBF(filePath, (nodesMap, ways) => {
      try {
        for (const way of ways) {
          for (let i = 0; i < way.nodes.length - 1; i++) {
            const n1 = nodesMap.get(way.nodes[i]);
            const n2 = nodesMap.get(way.nodes[i + 1]);
            if (!n1 || !n2) continue;

            const from = `${n1.lat},${n1.lon}`;
            const to = `${n2.lat},${n2.lon}`;
            const dist = haversine(n1.lat, n1.lon, n2.lat, n2.lon);
            graph.addTwoWayEdge(from, to, dist);
          }
        }

        console.log("Graph built:", graph.getNode().length, "nodes");
        resolve(graph);
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = { buildGraphFromPBF };
