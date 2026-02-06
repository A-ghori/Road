// Haversine function (meters)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // radius in meters
  const toRad = (x) => (x * Math.PI) / 180;
  const si1 = toRad(lat1),
    si2 = toRad(lat2);
  const si = toRad(lat2 - lat1);
  const del = toRad(lon2 - lon1);

  const a =
    Math.sin(si / 2) ** 2 +
    Math.cos(si1) * Math.cos(si2) * Math.sin(del / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
module.exports = { haversine };
