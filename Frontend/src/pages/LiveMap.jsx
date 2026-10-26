import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { useRoute } from "../Map_Rotes/useRoute";
import { useSocketLocation } from "../Map_Rotes/userSocketLocation";
import RouteLayer from "../Map_Rotes/RouteLayer";
import DamageHeatMap from "../components/DamageHeatMap";
import EmergencyServicesLayer from "./EmergencyServicesLayer";
import API from "../services/api";
import TrafficLayer from "../components/TrafficLayer";
import LiveNavigationMarker from "../components/LiveNavigationMarker";



import SimulationControls from "../components/SimulationControls";
import useSensorApi from "../Gyro/sensor";
import { all } from "axios";


const DEFAULT_CENTER =  [22.0, 79.0]; // Approximate center of India;

const userIcon = L.divIcon({
    className: "",
    html: `<div style="
        width:16px;
        height:16px;
        background:#2563eb;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 10px #2563eb;
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

const potholeIcon = L.divIcon({
    className: "",
    html: `<div style="
        width: 14px;
        height: 14px;
        background: #dc2626;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 6px #dc2626;
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

// Follow current GPS location.
function CurrentLocation({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 16);
        }
    }, [position, map]);

    if (!position) return null;

    return (
        <Marker position={position} icon={userIcon}>
            <Popup>Your current location</Popup>
        </Marker>
    );
}

// Give the heatmap access to the real Leaflet map.
function HeatMapLayer({ damages = [] }) {
    const map = useMap();

    return <DamageHeatMap map={map} damages={damages} />;
}

export default function LiveMap() {
    const { position, users, rotation } = useSocketLocation();
    const { route, traffic, fetchRoute, setRoute } = useRoute();

    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [routeInfo , setRouteInfo] = useState(null);
    const [mode, setMode] = useState("auto");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [potholes, setPotholes] = useState([]);
    const [potholeError, setPotholeError] = useState("");
    const [isNavigating, setIsNavigating] = useState(false);
    const {damage,requestMotionPermission, sensorError} = useSensorApi(isNavigating);

    //const [simPos, setSimPos] = useState(null); // Simulator se aane wali position

    // Agar simulator position de raha hai toh woh use karo, warna asli GPS position
    //const activePosition = simPos || position;

    async function handleAutoReroute(newStartCoords) {
    if (!end.trim()) return;
    setStart(newStartCoords);
    const metadata = await fetchRoute(newStartCoords, end, mode);
    if (metadata) {
        setRouteInfo({
            distance: metadata.distance,
            duration: metadata.duration,
            unit: metadata.unit || "KM"
        });
    }
}

const handleNavigationToggle = async () => {
    if(isNavigating) {
        setIsNavigating(false);
        return;
    }
    setIsNavigating(true);
    const allowed = await requestMotionPermission();

    if(allowed){
        console.log("Motion Sensor permission granted")
    }else {
        console.log("Navigation is active, but motion sensing is unavailable")
    }
}

    // async function handleDamageReport(sensorData) {
    //     try {
    //         const response = await API.post("/sensor/sensor-data", sensorData);
    //         console.log("Damage Report Saved", response.data);
    //     } catch (error) {
    //         console.error(
    //         "Damage report failed:",
    //         error.response?.data || error.message
    //     );
    //     }
    // }
    
    useEffect(() => {
        if (position) {
            setStart((previous) => previous || position.join(","));
        }
    }, [position]);

   useEffect(() => {
    let cancelled = false;

    async function loadPotholes() {
        try {
            const response = await API.get("/sensor/all-potholes");

            if(!cancelled){
                const features = response.data?.features ?? [];
                setPotholes(features);
                setPotholeError("");
            }
        } catch (err) {
            console.error("Could Not Load Potholes:",err);

            if(!cancelled){
                setPotholeError("Could Not Load Pothole Location")
            }
        }
    } 
    loadPotholes();
    return () => {
        cancelled = true
    }
   }, [])


async function handleRoute(e) {
    e.preventDefault();
    setError("");
    setRoute(null);

    if (!start.trim() || !end.trim()) {
        setError("Enter start and destination.");
        return;
    }

    setLoading(true);

    try {
        const metadata = await fetchRoute(start, end, mode);

        if (!metadata) {
            setError("Route not found. Check the backend response.");
            return;
        }

        setRouteInfo(
          {
            distance: metadata.distance,
            duration: metadata.duration,
            unit: metadata.unit || "KM"
          }
        )

        console.log("Route metadata:", metadata);
    } catch (err) {
        console.error("Route error:", err);
        setError(err.message || "Could not calculate the route.");
    } finally {
        setLoading(false);
    }
}


    function clearRoute() {
        setRouteInfo(null);
        setRoute(null);
        setRoute(null);
        setEnd("");
        setError("");
    }

  
    function currentLocation(){
     if (!position){
      setError("Current location is not available yet.");
      return 
     }else {
      setStart (`${position[0]}, ${position[1]}`)
      setError("")
     }
    }

return (
    <main style={{ padding: "16px" }}>
        <h2>Live Road Map</h2>

       

        {route && (
            <button
                type="button"
                onClick={handleNavigationToggle}
                style={{
                    background: isNavigating ? "#dc2626" : "#16a34a",
                    color: "white",
                    fontWeight: "bold",
                    padding: "8px 14px",
                    marginLeft: "8px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                {isNavigating
                    ? "⏹ Stop Navigation"
                    : "▶ Start Live Navigation"}
            </button>
        )}

        {routeInfo && (
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    padding: "12px 16px",
                    marginTop: "12px",
                    marginBottom: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    background: "#f8fafc",
                }}
            >
                <div>
                    <strong>Distance</strong>
                    <div>{Number(routeInfo.distance).toFixed(2)} km</div>
                </div>

                <div>
                    <strong>Estimated Time</strong>
                    <div>{routeInfo.duration} min</div>
                </div>
            </div>
        )}

        <form
            onSubmit={handleRoute}
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
                marginBottom: "12px",
            }}
        >
            <input
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="Start: location or lat,lng"
                aria-label="Start location"
            />

            <input
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="Destination: location or lat,lng"
                aria-label="Destination"
            />

            <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                aria-label="Travel mode"
            >
                <option value="auto">Driving</option>
                <option value="bicycle">Cycling</option>
                <option value="pedestrian">Walking</option>
            </select>

            <button type="submit" disabled={loading}>
                {loading ? "Finding route..." : "Find Route"}
            </button>

            <button type="button" onClick={currentLocation}>
                Get Current Location
            </button>

            <button type="button" onClick={clearRoute}>
                Clear Route
            </button>
        </form>

        {error && (
            <p role="alert" style={{ color: "red" }}>
                {error}
            </p>
        )}

        {potholeError && (
            <p role="alert" style={{ color: "red" }}>
                {potholeError}
            </p>
        )}

        {!position && (
            <p>Waiting for GPS permission or current location...</p>
        )}

        <p>Other connected users: {Object.keys(users).length}</p>

        <div
            style={{
                height: "70vh",
                minHeight: "400px",
                width: "100%",
                borderRadius: "10px",
                overflow: "hidden",
            }}
        >
            <MapContainer
                center={position ?? DEFAULT_CENTER}
                zoom={position ? 15:5}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                 <CurrentLocation position={position} /> 

                {potholes.map((feature, index) => {
                    const coordinates = feature?.geometry?.coordinates;

                    if (!coordinates || coordinates.length < 2) {
                        return null;
                    }

                    // GeoJSON coordinates: [longitude, latitude]
                    const [longitude, latitude] = coordinates;
                    const properties = feature.properties ?? {};

                    return (
                        <Marker
                            key={`${properties.timestamp || "pothole"}-${index}`}
                            position={[latitude, longitude]}
                            icon={potholeIcon}
                        >
                            <Popup>
                                <div>
                                    <strong>Pothole Detected</strong>

                                    <p>
                                        <strong>Damage Level:</strong>{" "}
                                        {properties.damageLevel ?? "Unknown"}
                                    </p>

                                    <p>
                                        <strong>Force:</strong>{" "}
                                        {properties.force != null
                                            ? Number(properties.force).toFixed(2)
                                            : "N/A"}
                                    </p>

                                    <p>
                                        <strong>Confidence:</strong>{" "}
                                        {properties.confidence ?? "N/A"}
                                    </p>

                                    <p>
                                        <strong>Detected At:</strong>{" "}
                                        {properties.timestamp
                                            ? new Date(
                                                  properties.timestamp
                                              ).toLocaleString()
                                            : "Unknown"}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <EmergencyServicesLayer />

                <LiveNavigationMarker
                    rawPosition={position}
                    heading={rotation}
                    route={route}
                    isNavigating={isNavigating}
                    onReroute={handleAutoReroute}
                />

                {Object.entries(users).map(([id, coords]) => {
                    const [lat, lng, heading] = coords;

                    if (
                        !Number.isFinite(Number(lat)) ||
                        !Number.isFinite(Number(lng))
                    ) {
                        return null;
                    }

                    return (
                        <Marker
                            key={id}
                            position={[Number(lat), Number(lng)]}
                        >
                            <Popup>
                                Connected user
                                <br />
                                Heading: {heading ?? "Unknown"}
                            </Popup>
                        </Marker>
                    );
                })}

                <RouteLayer route={route} traffic={traffic} />

                <HeatMapLayer damages={damage ? [damage] : []} />
            </MapContainer>
        </div>

        {/* Simulation controls: map ke bahar, clearly visible */}
        <div
            style={{
                display: "block",
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                boxSizing: "border-box",
                border: "2px solid #2563eb",
                borderRadius: "10px",
                background: "#f8fafc",
            }}
        >
            {/* <h3 style={{ marginTop: 0 }}>Navigation Simulator</h3> /*}

           {/*<SimulationControls
                route={route}
                realPosition={position}
                onSimPositionChange={setSimPos}
                onNavigationStateChange={setIsNavigating}
            /> */}

        </div>
    </main>
)
}