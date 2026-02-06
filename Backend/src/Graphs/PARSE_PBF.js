// var fs = require("fs");
// var through = require("through2");
// var parseOSM = require("osm-pbf-parser");

// function parsePBF(filePath, done) {
//   const nodes = new Map();
//   const ways = [];
//   var osm = parseOSM();
//   fs.createReadStream(filePath)
//     .pipe(osm)
//     .pipe(
//       through.obj(function (items, encoding, next) {
//         for (const item of items) {
//           // console.log("item=", item);
//           if (item.type === "node") {
//             nodes.set(item.id, { lat: item.lat, lon: item.lon });
//           }
//           if (item.type === "way" && item.tags?.highway) {
//             ways.push(item);
//           }
//         }
//         next();
//       }),
//     )
//     .on("finish", () => {
//       console.log("nodes", nodes, nodes.size);
//       console.log("ways", ways, ways.length);
//       done(nodes, ways);
//     });
// }

// module.exports = { parsePBF };
// Backend/src/Graphs/parsePBF.js
// Backend/src/Graphs/parsePBF.js
// Backend/src/Graphs/parsePBF.js
// parsePBF-stream.js
// Backend/src/Graphs/showEasternHighways.js
// Backend/src/Graphs/parsePBF_Debug.js

const fs = require("fs");
const through = require("through2");
const parseOSM = require("osm-pbf-parser");

// ✅ Allowed highway/path types
const allowedHighways = new Set([
  "primary",
  "secondary",
  "tertiary",
  "residential",
  "service",
  "footway",
  "steps",
  "path",
  "pedestrian",
]);

/**
 * Parse a PBF file and extract highways + nodes
 * Two-pass approach to avoid missing nodes
 * @param {string} filePath - Path to the .osm.pbf file
 * @param {(nodes: Map, ways: Array) => void} done - Callback
 */
function parsePBF(filePath, done) {
  const usedNodeIds = new Set(); // IDs of nodes used in ways
  const ways = []; // All allowed ways
  const nodes = new Map(); // Node id -> {lat, lon}
  const allNodes = []; // Temporarily store all nodes

  const osm = parseOSM({ keepNodeRefs: true });

  console.log("🔹 Parsing highways/paths from:", filePath);

  fs.createReadStream(filePath)
    .pipe(osm)
    .pipe(
      through.obj(function (items, enc, next) {
        for (const item of items) {
          // ✅ Debug log for every item
          console.log(
            "[DEBUG]",
            "type=",
            item.type,
            "id=",
            item.id,
            "highway=",
            item.tags?.highway,
            "nodes=",
            Array.isArray(item.nodes) ? item.nodes.length : 0,
          );

          // ✅ Allowed way: push to ways + mark nodes
          if (
            item.type === "way" &&
            item.tags?.highway &&
            allowedHighways.has(item.tags.highway) &&
            Array.isArray(item.nodes)
          ) {
            ways.push(item);
            for (const nodeId of item.nodes) usedNodeIds.add(String(nodeId));
          }
          // ✅ Node: store temporarily for second pass
          else if (item.type === "node") {
            allNodes.push(item);
          }
        }
        next();
      }),
    )
    .on("finish", () => {
      // ✅ Second pass: keep only nodes used in allowed ways
      for (const node of allNodes) {
        if (usedNodeIds.has(String(node.id))) {
          nodes.set(node.id, { lat: node.lat, lon: node.lon });
        }
      }

      console.log("✅ Ways collected:", ways.length);
      console.log("✅ Filtered nodes (used in roads/paths):", nodes.size);
      done(nodes, ways);
    })
    .on("error", (err) => {
      console.error("❌ Error parsing PBF:", err);
      done(nodes, ways);
    });
}

// ✅ Export function
module.exports = { parsePBF };
