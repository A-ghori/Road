import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState , useEffect} from "react";
import  {useSocketLocation}  from "../Map_Rotes/userSocketLocation";
import  {useRoute}  from "../Map_Rotes/useRoute";
import RouteLayer from "../Map_Rotes/RouteLayer";
import * as geolib from 'geolib';
import {getDistance, getPathLength }from 'geolib/es/getDistance';



function LiveMap() {
  const { position, users, rotation } = useSocketLocation();
  const { route, fetchRoute, setRoute } = useRoute();
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [stats, setStats] = useState({distance: "null", duration: "null"});
  const [errorMsg, setErrorMsg] = useState(null);


const updateProgress = (userLat, userLon, routeData) => {
  const pathArray = routeData?.features?.[0]?.geometry?.coordinates?.map(c => ({
    latitude: c[1],
    longitude: c[0]
  })) 
  if(!pathArray) return;

  if(!pathArray || pathArray.length === 0) return 0;
    const nearest = geolib.findNearest({latitude: userLat, longitude: userLon}, pathArray);
    const preciseDistance = geolib.getPreciseDistance(
      {
        latitude : userLat,
        longitude: userLon,
      },
      {
        latitude : nearest.latitude,
        longitude: nearest.longitude,
      }
    )
    console.log("Precise Distance to Path:", preciseDistance, "meters");
    //const index = pathArray.indexOf(nearest);
  const index = pathArray.findIndex(p=> p.latitude === nearest.latitude && p.longitude === nearest.longitude);


      // calculate remaining path distance
      const remainingDistance = pathArray.slice(index)
      const remainingDistanceMeters = getPathLength(remainingDistance);
      console.log("Remaining Distance on Path:", remainingDistanceMeters, "meters");

        setStats({
          distance: (remainingDistanceMeters / 1000).toFixed(2), // Convert to KM
          duration: Math.round((remainingDistanceMeters / 1000) * 60 / 30) // Assuming avg speed of 30 km/h
        })

    }

useEffect(() => {
  if(position && route) {
    updateProgress(position[0], position[1], route);

  }
}, [position, route])

const handleGetRoute = async () => {
  setLoading(true);
  setRoute(null); // clear previous route immediately for better UX
  setErrorMsg(null); // clear previous errors
  try {
    const result = await fetchRoute(start,end);
    setLoading(false);
    if(result) {
      setErrorMsg(null);
      setStats({
        distance: result.distance || "N/A",
        duration: result.duration || "N/A"
      });
    } else {
      setStats({distance: "null", duration: "null"});
    setErrorMsg("Bakchodi Na Mere Orginal Location De BSDK!");
    }
  } catch (error) {
    setErrorMsg("An error occurred while fetching the route. Please try again.");
    console.log(error);
   }
}

  return (
    <div style={{ height: "100vh" }}>
      <div style={{ padding: 10 }}>
        <input
          placeholder="Start"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          placeholder="End"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button onClick={() => handleGetRoute(start, end)}>
          {loading ? "Searching...": "Get Route"}
        </button>
      </div>

{errorMsg && (
  <div style={{
    color: "white",
    background: "#ef4444", // Red color for error
    padding: "10px",
    marginTop: "10px",
    borderRadius: "5px",
    textAlign: "center",
    fontWeight: "bold"
  }}>
    ⚠️ {errorMsg}
  </div>
)}

      {/* Stats Display Card */}
      {stats.distance && (
        <div style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 1000,
          background: "white", padding: "15px", borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)", minWidth: "150px"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>Route Details</h4>
          <p style={{ margin: "5px 0" }}><b>Distance:</b> {stats.distance} km</p>
          <p style={{ margin: "5px 0" }}><b>Time:</b> {stats.duration} mins</p>
        </div>
      )}


    <MapContainer
center={[22.700, 88.390]}
        zoom={15}
        style={{ height: "90vh" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {position && <Marker position={position} />}

        {Object.entries(users).map(([id, coords]) => (
          <Marker key={id} position={coords} />
        ))}

        <RouteLayer route={route} />
      </MapContainer>
    </div>
  );
}

export default LiveMap;