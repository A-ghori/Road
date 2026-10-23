
import { GeoJSON, Marker, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Approximate maximum distance for matching a TomTom segment
// to the Valhalla route. Tune after inspecting the map.
const MATCH_DISTANCE_METERS = 35;

function getTrafficColor(congestion) {
  switch (congestion) {
    case "LOW":
      return "#22c55e";
    case "MEDIUM":
      return "#eab308";
    case "HIGH":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

// Approximate distance between two [lng, lat] points, in metres.
function distanceMeters(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const meanLat = toRad((a[1] + b[1]) / 2);
  const dx = toRad(b[0] - a[0]) * Math.cos(meanLat);
  const dy = toRad(b[1] - a[1]);

  return 6371000 * Math.sqrt(dx * dx + dy * dy);
}

export default function RouteLayer({ route, traffic = [] }) {
  const map = useMap();

  const startIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    []
  );

  const endIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="background:#ef4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    []
  );

  useEffect(() => {
    if (!route?.features?.length) return;

    try {
      const bounds = L.geoJSON(route).getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } catch (err) {
      console.error("Invalid GeoJSON received:", err);
    }
  }, [route, map]);

  const coords = route?.features?.[0]?.geometry?.coordinates;

  // Match route points against TomTom segment coordinates.
  const matchedTraffic = useMemo(() => {
    if (!Array.isArray(coords) || !Array.isArray(traffic)) return [];

    const segments = traffic.filter(
      (item) =>
        Array.isArray(item.coordinates) &&
        item.coordinates.length >= 2 &&
        ["LOW", "MEDIUM", "HIGH"].includes(item.congestion)
    );

    if (!segments.length) return [];

    // For each route coordinate, find the nearest point in
    // any TomTom segment. Keep only close matches.
    const matched = [];
    let previousColor = null;
    let section = [];

    for (const routePoint of coords) {
      let nearest = null;
      let nearestDistance = Infinity;

      for (const item of segments) {
        for (const trafficPoint of item.coordinates) {
          const distance = distanceMeters(routePoint, trafficPoint);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = item;
          }
        }
      }

      const color =
        nearest && nearestDistance <= MATCH_DISTANCE_METERS
          ? getTrafficColor(nearest.congestion)
          : null;

      if (color !== previousColor) {
        if (section.length >= 2 && previousColor) {
          matched.push({
            color: previousColor,
            coordinates: section,
          });
        }

        section = [routePoint];
        previousColor = color;
      } else {
        section.push(routePoint);
      }
    }

    if (section.length >= 2 && previousColor) {
      matched.push({
        color: previousColor,
        coordinates: section,
      });
    }

    return matched;
  }, [coords, traffic]);

  if (!Array.isArray(coords) || coords.length < 2) return null;

  const start = [coords[0][1], coords[0][0]];
  const end = [coords[coords.length - 1][1], coords[coords.length - 1][0]];

  return (
    <>
      {/* Complete Valhalla route */}
      <GeoJSON
        data={route}
        style={{
          color: "#3b82f6",
          weight: 5,
          opacity: 0.85,
        }}
      />

      {/* Traffic colours only on matched route portions */}
      {matchedTraffic.map((item, index) => (
        <GeoJSON
          key={`matched-${index}`}
          data={{
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: item.coordinates,
            },
          }}
          style={{
            color: item.color,
            weight: 7,
            opacity: 1,
          }}
        />
      ))}

      <Marker position={start} icon={startIcon} interactive={false} />
      <Marker position={end} icon={endIcon} interactive={false} />
    </>
  );
}
