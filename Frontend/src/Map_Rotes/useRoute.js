
import { useState } from "react";

export function useRoute() {
    const [route, setRoute] = useState(null);
    const[traffic, setTraffic] = useState([]);

    const fetchRoute = async (start, destination, mode) => {
        if (!start?.trim() || !destination?.trim() || !mode) {
            return null;
        }

        try {
            const baseURL =
                process.env.REACT_APP_BACKEND_URL ||
                "http://localhost:3005";

            const response = await fetch(
                `${baseURL}/api/places/route`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        start: start.trim(),
                        destination: destination.trim(),
                        mode: mode === "auto" ? "car" : mode,
                    }),
                }
            );



          if (!response.ok) {
    const errorBody = await response.text();

    console.error("Route API failed:", {
        url: `${baseURL}/api/places/route`,
        status: response.status,
        response: errorBody,
    });

    throw new Error(
        `Route API failed: HTTP ${response.status}`
    );
}

            const data = await response.json();
            const geoJSON = data.route;
            setRoute(data.route);
            setTraffic(data.traffic || [])
            return geoJSON.metaData ?? {};

            // Backend response: { start, destination, route }
 //            const geoJSON = data.route;
//
 //           if (
 //             !geoJSON ||
 //               geoJSON.type !== "FeatureCollection" ||
 //               !Array.isArray(geoJSON.features)
 //           ) {
 //               throw new Error(
 //                   "Backend response does not contain valid route GeoJSON."
 //               );
 //           }
//
 //           setRoute(geoJSON);
//
 //           return geoJSON.metaData ?? {};
      } catch (error) {
          console.error("Error fetching route:", error); //           setRoute(null);
          setRoute(null);
          setTraffic([]);
          return null;
        } 
    };

    return { route,traffic, fetchRoute, setRoute };
}
