const { dijstra, getPath } = require("../Graphs/finalDjistrast");
const { graph, coordKey } = require("../Loader_Graph.js/LoaderRoadGraph");

// Find nearest node in graph for given lat/lng
// function findNearestNode(lat, lng, graphNodes) {
//   let nearest = null;
//   let minDist = Infinity;

//   for (const node of graphNodes) {
//     const [nLat, nLng] = node.split(",").map(Number);
//     const d = (lat - nLat) ** 2 + (lng - nLng) ** 2; // Euclidean distance squared
//     if (d < minDist) {
//       minDist = d;
//       nearest = node;
//     }
//   }

//   return nearest;
// }

// Haversine function (meters)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // radius in meters
    const toRad = (x) => (x * Math.PI) / 180;
    const φ1 = toRad(lat1), φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Find nearest node in graph using Haversine
function findNearestNode(lat, lng, graphNodes) {
    let nearest = null;
    let minDist = Infinity;

    for (const node of graphNodes) {
        const [nLat, nLng] = node.split(",").map(Number);
        const d = haversine(lat, lng, nLat, nLng);
        if (d < minDist) {
            minDist = d;
            nearest = node;
        }
    }
    return nearest;
}

async function getShortestRoute(req, res) {
    try {
        const { fromLat, fromLng, toLat, toLng } = req.body;

        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({
                message: "Provide fromLat, fromLng, toLat, toLng",
            });
        }

        const nodes = graph.getNode();
        const start = findNearestNode(fromLat, fromLng, nodes);
        const end = findNearestNode(toLat, toLng, nodes);

        console.log("From LatLng:", fromLat, fromLng);
        console.log("To LatLng:", toLat, toLng);
        console.log("Nearest Start:", start);
        console.log("Nearest End:", end);

        if (!start || !end) {
            return res.status(404).json({ message: "Start or End node not found in the graph" });
        }

        const { distance, previous } = dijstra(graph, start);
        const path = getPath(previous, start, end);
        const totalScore = distance[end];

        if (!path) return res.status(404).json({ message: "No path found" });

        return res.status(200).json({ path, totalScore });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { getShortestRoute };
