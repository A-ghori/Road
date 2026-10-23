import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export function useSocketLocation ()  {
    const [position, setPosition] = useState(null);
    const [users, setUsers] = useState({});
    const [rotation , setRotation] = useState(0);

    useEffect(() => {
        if(!navigator.geolocation){
            return
        }
  
const watchId = navigator.geolocation.watchPosition(
    (pos) => {
        const { latitude, longitude, heading, accuracy } = pos.coords;

        console.log("GPS reading:", {
            latitude,
            longitude,
            accuracy,
            timestamp: new Date(pos.timestamp).toLocaleTimeString()
        });

        // Reject highly inaccurate location readings.
        if (!Number.isFinite(accuracy) || accuracy > 100) {
            console.warn(
                `Ignoring inaccurate GPS reading: ${accuracy} metres`
            );
            return;
        }

        // Leaflet expects [latitude, longitude].
        setPosition([latitude, longitude]);
        setRotation(heading ?? 0);

        socket.emit("Update Location", {
            lat: latitude,
            lng: longitude,
            heading
        });

        socket.emit("Send Location", {
            lat: latitude,
            lng: longitude,
            heading
        });
    },
    (err) => {
        console.error("GPS error:", err.code, err.message);
    },
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
    }
);



        socket.on("received location",(data) => {
            console.log('Current Location', data.lat, data.lng)
            setUsers((prev) => ({
                ...prev,
                [data.id]:[data.lat, data.lng, data.heading]
            }))
        });
        socket.on("User Disconnected", (data) => {
            setUsers((prev) => {
                const updated = { ...prev};
                delete updated[data.id];
                return updated;
            })
        });

      return () => {
    navigator.geolocation.clearWatch(watchId);
    socket.off("received location");
    socket.off("User Disconnected");
};
    }, []);
    

    useEffect(() => {
    console.log("UPDATED POSITION:", position);
}, [position]);

    return {position, users, rotation};
}