const { getHostedRoute } = require("./hostedValhalla");
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env")
});
async function test() {
  try {
    const route = await getHostedRoute(
      22.5726,  // start latitude
      88.3639,  // start longitude
      22.5958,  // destination latitude
      88.4332   // destination longitude
    );

    console.log(JSON.stringify(route, null, 2));
    console.log("Type:", route.type);
console.log("Distance:", route.metaData.distance, route.metaData.unit);
console.log("Duration:", route.metaData.duration, "minutes");
console.log("Geometry type:", route.features[0].geometry.type);
console.log(
  "Total coordinates:",
  route.features[0].geometry.coordinates.length
);
console.log(
  "First coordinate:",
  route.features[0].geometry.coordinates[0]
);
console.log(
  "Last coordinate:",
  route.features[0].geometry.coordinates.at(-1)
);
  } catch (error) {
    console.error("Route test failed:", error.message);

    if (error.response) {
      console.error("HTTP status:", error.response.status);
      console.error("API response:", error.response.data);
    }
  }
}

test();