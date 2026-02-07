const { createOSMStream } = require("osm-pbf-parser-node");
const path = require("path");
const fs = require("fs");
const TinyQueue = require("tinyqueue").default || require("tinyqueue");

// 1. Setup paths and data storage
const PBF_FILE = path.join(__dirname, "NewDelhi.osm.pbf");
const nodes = new Map();
const graph = new Map();

// Example coords (New Delhi: Connaught Place to India Gate)
// const startCoords = { lat: 28.6315, lon: 77.2167 };
// const endCoords = { lat: 28.6129, lon: 77.2295 };
// const startCoords = { lat: 28.5778, lon: 77.1968 }; // Hauz Khas Village
// const endCoords = { lat: 28.6475, lon: 77.2228 }; // Qutub Minar

// Delhi Boundry check
function checkDelhiBoundary(lat, lon) {
  const Delhi_Bounds = {
    north: 28.88,
    south: 28.4,
    west: 76.84,
    east: 77.35,
  };
  return (
    lat >= Delhi_Bounds.south &&
    lat <= Delhi_Bounds.north &&
    lon >= Delhi_Bounds.west &&
    lon <= Delhi_Bounds.east
  );
}

// 2. Haversine Distance Helper
function haversine(p1, p2) {
  if (!p1 || !p2) return Infinity;
  const R = 6371e3; // meters
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lon - p1.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 3. Build the Graph
async function buildGraph() {
  console.log(" Loading PBF data from:", PBF_FILE);
  const stream = createOSMStream(PBF_FILE);

  for await (const item of stream) {
    if (item.type === "node") {
      nodes.set(item.id, { lat: item.lat, lon: item.lon });
    } else if (item.type === "way" && item.tags && item.tags.highway) {
      for (let i = 0; i < item.refs.length - 1; i++) {
        const u = item.refs[i],
          v = item.refs[i + 1];
        const uCoord = nodes.get(u),
          vCoord = nodes.get(v);

        if (uCoord && vCoord) {
          const d = haversine(uCoord, vCoord);

          if (!graph.has(u)) graph.set(u, []);
          graph.get(u).push({ to: v, weight: d });

          if (item.tags.oneway === "-1") {
            if (!graph.has(v)) graph.set(v, []);
            graph.get(v).push({ to: u, weight: d });
          } else if (item.tags.oneway !== "yes") {
            if (!graph.has(v)) graph.set(v, []);
            graph.get(v).push({ to: u, weight: d });
          }
        }
      }
    }
  }
  console.log(` Graph ready: ${graph.size} road nodes mapped.`);
}

// 4. Find Nearest Node on Road
function findNearestNode(lat, lon) {
  let nearestId = null,
    minDist = Infinity;
  for (const [id, coord] of nodes) {
    if (!graph.has(id)) continue;
    const d = haversine({ lat, lon }, coord);
    if (d < minDist) {
      minDist = d;
      nearestId = id;
    }
  }
  return nearestId;
}

// 5. Dijkstra Algorithm (Using TinyQueue)
function dijkstra(startId, endId) {
  const distances = new Map();
  const prev = new Map();

  // Min-heap sorted by distance (index 1)
  const pq = new TinyQueue([[startId, 0]], (a, b) => a[1] - b[1]);
  distances.set(startId, 0);

  let iterations = 0;
  while (pq.length > 0) {
    const [u, d] = pq.pop();

    if (++iterations % 20000 === 0) {
      console.log(`Processed ${iterations} nodes...`);
    }

    if (u === endId) break;
    if (d > (distances.get(u) ?? Infinity)) continue;

    const neighbors = graph.get(u) || [];
    for (const { to: v, weight } of neighbors) {
      const alt = d + weight;
      if (alt < (distances.get(v) ?? Infinity)) {
        distances.set(v, alt);
        prev.set(v, u);
        pq.push([v, alt]);
      }
    }
  }

  let pathArr = [],
    curr = endId;
  while (curr) {
    pathArr.push(curr);
    curr = prev.get(curr);
  }
  return pathArr.reverse();
}

function savePathToGeoJSON(pathIds, filename = "route.geojson") {
  const coords = pathIds
    .map((id) => nodes.get(id))
    .filter((c) => c)
    .map((c) => [c.lon, c.lat]);

  // WRAPPER: This makes it a valid FeatureCollection
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "New Delhi Route" },
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      },
    ],
  };

  fs.writeFileSync(
    path.join(__dirname, filename),
    JSON.stringify(geojson, null, 2),
  );
  console.log(`GeoJSON saved correctly as FeatureCollection: ${filename}`);
}

// 7. Execution
// (async () => {
//   try {
//     await buildGraph();

//     const start = findNearestNode(startCoords.lat, startCoords.lon);
//     const end = findNearestNode(endCoords.lat, endCoords.lon);

//     console.log(` Starting Dijkstra: Node ${start} to ${end}`);
//     const resultPath = dijkstra(start, end);

//     if (resultPath.length <= 1) {
//       console.log(" No path found between those coordinates.");
//     } else {
//       console.log(" Path Found!");
//       console.log("Total Nodes in Route:", resultPath.length);
//       savePathToGeoJSON(resultPath);
//     }
//   } catch (e) {
//     console.error("Error:", e.message);
//   }
// })();
//
//                             NEW ROUTE FOR MAPPING
let graphReady = false;
async function initGraph() {
  if (!graphReady) {
    await buildGraph();
    graphReady = true;
    console.log("Graph Initialized Successfully");
  }
}

async function getRoute(startLat, startLon, endLat, endLon) {
  if (
    !checkDelhiBoundary(startLat, startLon) ||
    !checkDelhiBoundary(endLat, endLon)
  ) {
    throw new Error(
      "Coordinates are not within Delhi boundary Please Give Correct Boundary",
    );
  }
  await initGraph();
  let start = findNearestNode(startLat, startLon);
  let end = findNearestNode(endLat, endLon);

  if (!start || !end) {
    throw new Error("Invalid coordinates");
  }
  const pathIds = dijkstra(start, end);
  if (!pathIds || pathIds.length <= 1) {
    throw new Error("No path found between those coordinates");
  }
  const coords = pathIds.map((id) => nodes.get(id)).map((c) => [c.lat, c.lon]);
  savePathToGeoJSON(pathIds);
  console.log("Save Result in GEOJSON", pathIds);
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "New Delhi Route" },
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      },
    ],
  };
}
module.exports = {
  dijkstra,
  buildGraph,
  findNearestNode,
  getRoute,
};
