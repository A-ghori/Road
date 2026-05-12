import { useEffect, useState } from "react";
import io from "socket.io-client";

// Socket ko hook ke bahar rakho taaki component re-render par naya connection na bane
const socket = io(process.env.REACT_APP_BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"], // Polling fallback ke liye rakho
});

export function useSocketLocation() {
  const [position, setPosition] = useState(null);
  const [users, setUsers] = useState({});
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading } = pos.coords;
        const newPos = [latitude, longitude];

        setPosition(newPos);
        setRotation(heading || 0);

        // Sirf ek hi event bhejo jo backend handle kar raha hai
        socket.emit("Send Location", {
          lat: latitude,
          lng: longitude,
          heading: heading || 0,
        });
      },
      (err) => console.error("GPS Error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000, // 10s bohot zyada hai, 1s rakho real-time ke liye
        timeout: 10000,
        distanceFilter: 1,
      }
    );

    // Dhyaan se: Backend mein 'recived' hai ya 'received'? 
    // Jo backend mein hai wahi yahan likhna.
    socket.on("recived location", (data) => {
      setUsers((prev) => ({
        ...prev,
        [data.id]: [data.lat, data.lng, data.heading],
      }));
    });

    // Backend mein check karo 'user disconnected' hai ya 'User Disconnected'
    socket.on("user disconnected", (data) => {
      setUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.id];
        return updated;
      });
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.off("recived location");
      socket.off("user disconnected");
    };
  }, []);

  return { position, users, rotation };
}