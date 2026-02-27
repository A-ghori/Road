import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, GeoJSON, useMap } from "react-leaflet";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";

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
const socket = io("http://localhost:3001");


function FitBounds({ geojson }) {
  const map = useMap();

  useEffect(() => {
    if (!geojson) return;

    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [geojson, map]);

  return null;
}

function LiveMap() {
  const [position, setPosition] = useState(null);
  const [users, setUsers] = useState({});
  const [routeData, setRouteData] = useState(null);
  const [startPlace, setStartPlace] = useState("");
  const [endPlace, setEndPlace] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude } = pos.coords;

        setPosition([latitude, longitude]);

        socket.emit("Send Location", {
          latitude,
          longitude,
        });
      });
    }

    socket.on("received location", (data) => {
      setUsers((prev) => ({
        ...prev,
        [data.id]: [data.latitude, data.longitude],
      }));
    });

    socket.on("user disconnected", (data) => {
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.id];
        return updated;
      });
    });

    return () => {
      socket.off("received location");
      socket.off("user disconnected");
    };
  }, []);

  const fetchRouteByName = async () => {
    if (!startPlace || !endPlace) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/route?start=${encodeURIComponent(startPlace)}&end=${encodeURIComponent(endPlace)}`
      );

      const data = await res.json();

      console.log("FULL RESPONSE:", data);
      console.log("TYPE:", data?.type);
      console.log("FEATURES:", data?.features);
      console.log(
        "COORD LENGTH:",
        data?.features?.[0]?.geometry?.coordinates?.length
      );

      setRouteData(data);
    } catch (err) {
      console.error("Route fetch error:", err);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{ padding: "10px" }}>
        <input
          type="text"
          placeholder="Start Location (e.g. Hauz Khas)"
          value={startPlace}
          onChange={(e) => setStartPlace(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="End Location (e.g. Qutub Minar)"
          value={endPlace}
          onChange={(e) => setEndPlace(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={fetchRouteByName}>Get Route</button>
      </div>

      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={12}
        style={{ height: "90vh", width: "100%" }}
      >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Current user */}
          {position && <Marker position={position} />}

          {/* Other users */}
          {Object.entries(users).map(([id, coords]) => (
            <Marker key={id} position={coords} />
          ))}

        {/* Route */}
{routeData?.features?.length > 0 && (
  <>
    <GeoJSON
      key={JSON.stringify(routeData)}
      data={routeData}
      style={{
        color: "blue",
        weight: 6,
        dashArray: "10,6",
      }}
    />

    {/* Safe Start Marker */}
    {routeData.features[0].geometry?.coordinates?.[0] && (
      <Marker
        position={[
          routeData.features[0].geometry.coordinates[0][1], // Lat
          routeData.features[0].geometry.coordinates[0][0], // Lng
        ]}
      />
    )}

    {/* Safe End Marker */}
    {routeData.features[0].geometry?.coordinates && (
      <Marker
        position={[
          routeData.features[0].geometry.coordinates[
            routeData.features[0].geometry.coordinates.length - 1
          ][1], // Lat
          routeData.features[0].geometry.coordinates[
            routeData.features[0].geometry.coordinates.length - 1
          ][0], // Lng
        ]}
      />
    )}

    <FitBounds geojson={routeData} />
  </>
)}
        </MapContainer>
    </div>
  );
}

export default LiveMap;