import { useState } from "react";

export function useRoute() {
    const [route, setRoute] = useState(null);

    const fetchRoute = async (start, end) => {
        if (!start || !end) return null;

        try {
            // Lat, Lon ke beech se space hatane ke liye trim use karein
            const res = await fetch(`http://localhost:3001/api/route?start=${start.trim()}&end=${end.trim()}`);
            
            if (!res.ok) throw new Error("Failed to fetch route");

            const data = await res.json();
            
            // 1. Map ke liye GeoJSON set karein
            setRoute(data);  

            // 2. Metadata return karein (Backend mein 'metaData' hai ya 'metadata'?)
            // Aapke pichle code mein 'metaData' tha, toh yahan wahi use karenge.
            return data.metaData; 
            
        } catch (error) {
            console.error("Error fetching Route in UseRoute file:", error);
            return null;
        }
    };

    return { route, fetchRoute, setRoute };
}