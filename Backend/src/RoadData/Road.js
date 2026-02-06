// const fs = require("fs");

// // Defining Random Min and Max
// function random(min,max){
//     return Math.random() * (max - min) + min // suppose random always gives 0-1 values in between so the orginal lat and lng not matched always so min -> 10 max -> 20 so 0.5(suppose random) * 20 -10 + 10 this the lat and lng which belongs
// }
// // Min and Max .floor
// function minMaxFloor(min,max) {
//     return Math.floor(random(min,max))
// }

// // Convert the orginal (degree+ directions + minutes) = Decimal orginal conversition of lat and lng
// function dmstoDecimal(deg, min, dir) {
//     let dec = deg + min / 60;
//     if (dir === "S" || dir === "W") {
//         dec = -dec;
//     }
//     return dec;
// }

// let LAT_MIN =  dmstoDecimal(21,20,"N");
// let LAT_MAX = dmstoDecimal(27,32,"N");

// let LNG_MIN = dmstoDecimal(85,50,"E");
// let LNG_MAX = dmstoDecimal(89,52,"E");

// console.log(LAT_MIN, LAT_MAX, LNG_MIN, LNG_MAX);

// console.log("Using Region:");
// console.log("LAT_MAX TO:", LAT_MAX, "LAT_MIN :", LAT_MIN);
// console.log("LNG_MAX TO:",LNG_MAX, "LNG_MIN", LNG_MIN);

// // Road Generator
// function generateRoads(count) {
// const roads = [];

// let lastLat = random(LAT_MIN, LAT_MAX);
// let lastLng = random(LNG_MIN, LNG_MAX);

// for(let i=0; i<count; i++){

// //    // Simulate connected roads
//     const newLat = lastLat + random(-0.01, 0.01);
//     const newLng = lastLng + random(-0.01, 0.01);

//     // Clamp Inside Region
//     let connectedFinalLat = Math.min(Math.max(newLat, LAT_MIN), LAT_MAX);
// let connectedFinalLng = Math.min(Math.max(newLng, LNG_MIN), LNG_MAX);

// const potholes = minMaxFloor(0,10);
// const crackRoads = minMaxFloor(0,10);
// const traffic = minMaxFloor(0,10);
// const quality = minMaxFloor(0,10);

// // If quality number is high that mean the road is very bad condition
// const score = potholes + crackRoads + traffic+(10 - quality);
// console.log("Score is : ", score);

// const road = {
// road_id : `r_${i}`,
// from : [Number(lastLat.toFixed(6)), Number(lastLng.toFixed(6))],
// to : [Number(connectedFinalLat.toFixed(6)) , Number(connectedFinalLng.toFixed(6))],
// potholes,
// crackRoads,
// traffic,
// quality,
// score
// };
// roads.push(road);

// lastLat = connectedFinalLat;
// lastLng = connectedFinalLng;

// }
// return roads;
// }

// console.log("Generating road datasets...");

// fs.writeFileSync("roads_1k.json", JSON.stringify(generateRoads(1000), null, 2));
// fs.writeFileSync("roads_10k.json", JSON.stringify(generateRoads(10000), null, 2));
// fs.writeFileSync("roads_100k.json", JSON.stringify(generateRoads(100000)));

// console.log("Done!");
// console.log("roads_1k.json (1,000 roads)");
// console.log("roads_10k.json (10,000 roads)");
// console.log("roads_100k.json (100,000 roads)");
const fs = require("fs");

const geojson = JSON.parse(fs.readFileSync("kolkata.geojson", "utf8"));

const coords = geojson.coordinates[0][0]; // MultiPolygon -> Polygon
let poly = "Kolkata\n"; // name line
poly += coords.map(([lng, lat]) => `  ${lng} ${lat}`).join("\n");
poly += "\nEND\n";

fs.writeFileSync("kolkata.poly", poly);
console.log("✅ kolkata.poly created!");
