import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export function useSocketLocation ()  {
    const [position, setPosition] = useState(null);
    const [users, setUsers] = useState({});
    const [rotation , setRotation] = useState(0);

    useEffect(() => {
        if(!navigator.geolocation){
            return
        }
        const watchId = navigator.geolocation.watchPosition((pos) => {
            const { latitude, longitude, heading } = pos.coords;
            
            // Update current users position
            setPosition([latitude, longitude]);
            console.log("Current Location:", latitude, longitude, "Heading:", heading);
            console.log("TYPE:", typeof position);

            setRotation(heading || 0) // For move the blue dot in the direction of movement, if heading is not available, default to 0

            // Emmit location to server
            socket.emit("Update Location", {
               lat : latitude,
                lng : longitude,
                heading
            });

            socket.emit("Send Location", {
                lat : latitude,
                lng : longitude,
                heading
            });
        }, 
        (err) => {
            console.error("Error getting Location:", err);
        },
        {enableHighAccuracy: true, // Use GPS for better accuracy
            maximumAge: 10000, // Cache location for 10 seconds
            timeout: 5000, // Timeout after 5 seconds
            distanceFilter: 1 // Only update if user has moved at least 1 meters
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
        }
    }, []);
    

    useEffect(() => {
    console.log("UPDATED POSITION:", position);
}, [position]);

    return {position, users, rotation};
}