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

var fs = require("fs");
var through = require("through2");
var parseOSM = require("osm-pbf-parser");

function parsePBF(filePath, done) {
  const nodes = new Map(); // final nodes Map
  const ways = [];
  const usedNodeIds = new Set(); // sirf road ways ke nodes

  var osm = parseOSM();
  const allNodes = []; // temporarily store nodes until we know which are needed

  fs.createReadStream(filePath)
    .pipe(osm)
    .pipe(
      through.obj(function (items, encoding, next) {
        for (const item of items) {
          if (item.type === "node") {
            // temporarily push all nodes, later filter
            allNodes.push(item);
          }
          if (item.type === "way" && item.tags?.highway) {
            ways.push(item);
            // mark nodes used in roads
            for (const nodeId of item.nodes) {
              usedNodeIds.add(nodeId);
            }
          }
        }
        next();
      }),
    )
    .on("finish", () => {
      // Ab sirf road nodes ko Map me dalte hain
      for (const node of allNodes) {
        if (usedNodeIds.has(node.id)) {
          nodes.set(node.id, { lat: node.lat, lon: node.lon });
        }
      }

      console.log("Filtered nodes (used in roads):", nodes.size);
      console.log("Ways (roads):", ways.length);
      done(nodes, ways);
    });
}

module.exports = { parsePBF };
