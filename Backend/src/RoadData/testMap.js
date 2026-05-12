const { createOSMStream } = require("osm-pbf-parser-node");
const path = require("path");
const fs = require("fs");
const { type } = require("os");
const TinyQueue = require("tinyqueue").default || require("tinyqueue");
const pothole = require ('../models/Sensosr.model')
// 1. Setup paths and data storage
const PBF_FILE = path.join(__dirname, "Sodepur_DumDum.pbf");
const nodes = new Map();
const graph = new Map();

// Example coords (New Delhi: Connaught Place to India Gate)
// const startCoords = { lat: 28.6315, lon: 77.2167 };
// const endCoords = { lat: 28.6129, lon: 77.2295 };
// const startCoords = { lat: 28.5778, lon: 77.1968 }; // Hauz Khas Village
// const endCoords = { lat: 28.6475, lon: 77.2228 }; // Qutub Minar

// Delhi Boundry check
function checkBengalBoundary(lat, lon) {
  const Bengal_Bounds = {
    north: 22.80, // Khardah / Titagarh side (Thoda aur upar kar diya)
    south: 22.60, // Dum Dum / Airport side
    west: 88.35,  // Hooghly River / BT Road stretch
    east: 88.45,  // Jessore Road / Madhyamgram stretch
  };
  return (
  lat >= Bengal_Bounds.south &&
    lat <= Bengal_Bounds.north &&
    lon >= Bengal_Bounds.west &&
    lon <= Bengal_Bounds.east
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
        
        const roadTypes = item.tags.highway || "unclassified";
        if (uCoord && vCoord) {
          const d = haversine(uCoord, vCoord);

          if (!graph.has(u)) graph.set(u, []);
          graph.get(u).push({ to: v, weight: d, type : roadTypes });

          if (item.tags.oneway === "-1") {
            if (!graph.has(v)) graph.set(v, []);
            graph.get(v).push({ to: u, weight: d, type : roadTypes });
          } else if (item.tags.oneway !== "yes") {
            if (!graph.has(v)) graph.set(v, []);
            graph.get(v).push({ to: u, weight: d, type : roadTypes });
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
function dijkstra(startId, endId, mode, roadDamage) {
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
    for (const edge of neighbors) {
      const smartWeight = calculateSmartWeight(mode, edge, roadDamage);
      if(smartWeight === Infinity) continue // Skip non-traversable edges for the mode
      const alt = d + smartWeight;
      if (alt < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, alt);
        prev.set(edge.to, u);
        pq.push([edge.to, alt]);
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

function savePathToGeoJSON(pathIds, distanceKM, totalMinutes, filename = "route.geojson") {
  const coords = pathIds
    .map((id) => nodes.get(id))
    .filter((c) => c)
    .map((c) => [c.lat, c.lon]);

  // WRAPPER: This makes it a valid FeatureCollection
  const geojson = {
    type: "FeatureCollection",
    pathArray: pathIds, // Original path of node IDs
    metaData: {
      distance: distanceKM, // 12.55 KM
        duration: Math.round(totalMinutes), // 25 mins
        unit: "KM"
    },
    features: [
      {
        type: "Feature",
        properties: { name: "Bengal Route" },
        distance: distanceKM, 
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

async function getRoute(startLat, startLon, endLat, endLon, mode = "car") {
  
  // 1. Boundary Check Call karein
  if (!checkBengalBoundary(startLat, startLon) || !checkBengalBoundary(endLat, endLon)) {
      console.log("Error: Coordinates are outside the allowed North 24 Pgs area!");
      throw new Error("Coordinates outside allowed region");
  }
  console.log("Boundary check passed!");
  //console.log("Boundary check skipped (debug mode)");
  console.log("ROUTE INPUT COORDS:");
  console.log("START:", startLat, startLon);
  console.log("END:", endLat, endLon);
  await initGraph();
  let start = findNearestNode(startLat, startLon);
  let end = findNearestNode(endLat, endLon);

  console.log("NEAREST GRAPH NODE:");
  console.log("START NODE ID:", start);
  console.log("END NODE ID:", end);

  if (!start || !end) {
    throw new Error("Invalid coordinates");
  }

  // MONGO DB CONNECT FIRST MAKE A CLUSTER FIRST 
  const roadDamageFromDB = await pothole.find({})
  const pathIds = dijkstra(start, end, mode, roadDamageFromDB);

let distanceMeter = 0;
for(let i = 0; i < pathIds.length - 1; i++) {
    const u = pathIds[i];
    const v = pathIds[i+1];
    const edge = graph.get(u)?.find(e => e.to === v);
    if(edge) distanceMeter += edge.weight;
}


const distanceKM = (distanceMeter / 1000).toFixed(2);

// Sahi Speed Logic
const modeSpeeds = {
    car: 40,   // Car thoda tez
    bike: 25,  // Bike traffic ke sath
    bus: 20,   // Bus slow stopping ke sath
    foot: 5    // Walking speed
};

const currentSpeed = modeSpeeds[mode] || 30; // Agar mode missing ho to 30
const totalMinutes = (distanceKM * 60) / currentSpeed;

console.log(`Mode: ${mode}, Speed: ${currentSpeed} km/h`);
console.log(`Total Distance: ${distanceKM} km, Duration: ${Math.round(totalMinutes)} mins`);
  if (!pathIds || pathIds.length <= 1) {
    throw new Error("No path found between those coordinates");
  }
  const coords = pathIds
    .map((id) => nodes.get(id))
    .filter((c) => c)
    .map((c) => [c.lon, c.lat]);
  console.log("TOTAL COORDINATES IN ROUTE:", coords.length);
  savePathToGeoJSON(pathIds, distanceKM, totalMinutes, filename = "route.geojson");
  console.log("Save Result in GEOJSON", pathIds, distanceKM, totalMinutes);
  return {
    type: "FeatureCollection",
    pathArray: pathIds, // Original path of node IDs
    metaData: {
      distance : distanceKM,
      duration: Math.round(totalMinutes),
      unit: "KM"
    },
    features: [
      {
        type: "Feature",
        properties: { name: "Bengal Route" },
        distance: distanceKM,
        duration: Math.round(totalMinutes),
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      },
    ],
  };
}



 function calculateSmartWeight(mode, edge, roadDamage = []) {
let type = edge.type;
let distance  = edge.weight; // Original distance in meters
let penalty = 0;

// Pothole Detection on this edge 
// The logic of targetValue is edge.to is very near to any kind of potholes(within 20 - 30 meters) update the road weight
const targetNode = nodes.get(edge.to)
if (targetNode && roadDamage.length > 0) {
const potholeNearMe = roadDamage.find(p => {
  const d =haversine({
  lat : targetNode.lat,
  lon : targetNode.lon
}, {
  lat : p.lat,
  lon : p.lon
} 
);
return d < 30
}) // 30 meters radius


if(potholeNearMe){
if (potholeNearMe.level === 'High') penalty = 1000;
if(potholeNearMe.level === 'Medium') penalty = 400;
}
}

let finalWeight = distance + penalty


  if(mode === "car"){
    // For Car, we can add traffic data or road conditions here
    if(type === "footpath" || type === "cycleway" || type === "pedestrian" || type === "path") return Infinity;
    if(type === "residential" || type === "service") return distance*3;
 return finalWeight;
  }
  if(mode === "bike") {
    // For Bike, we can prefer bike lanes and avoid highways
    if(type === "residential" || type === "service") return distance*0.7;
return finalWeight;
  }
  if(mode === "bus"){
    // For Bus, we can prefer main roads and avoid narrow streets
    if(type === "primary" || type === "secondary") return distance*0.8;
    if(type === "residential" || type === "service") return distance*2;
    if(type !== "primary" && type !== "motorway") return distance*20; // Avoid non-main roads for buses
  return finalWeight;
  }
  if(mode === "foot"){
    if(type === "footpath" || type === "pedestrian" || type === "path") return distance*0.5; // Prefer footpaths
    if(type === "residential" || type === "service") return distance*1.5; // Slightly less preferred
    if(type === "primary" || type === "motorway") return distance*10; // Avoid highways for pedestrians
  return finalWeight;
  }
  return finalWeight; // Default weight is the original distance
}
module.exports = {
  dijkstra,
  buildGraph,
  findNearestNode,
  getRoute,
};
