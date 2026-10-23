import { useEffect, useState, useRef } from "react";
import {Marker, Popup, useMap} from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";


// Rotating Navigation Arrow Icon 
function createArrowIcon(angle = 0) {
    return L.divIcon({
        className: "nav-arrow-icon",
        html: `
            <div style="
                transform: rotate(${angle}deg);
                transition: transform 0.3s ease-out;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#2563eb" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4));">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" stroke="white" stroke-width="2"/>
                </svg>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });
}

export default function LiveNavigationMarker({
    rawPosition, //[lat, lng] from useSocketLocation
    heading, // rotation from gps
    route, // GeoJSON route from backend
    isNavigating, // true/false toggle
    onReroute // Callback if the road is wrong
}) {
    const map = useMap();
    const [displayPos, setDisplayPos] = useState(rawPosition);
    const [angle, setAngle] = useState(0);
    const  lastValidPosRef = useRef(null);
    const lastRerouteTimeRef = useRef(0);

    useEffect(() => {
        if(!rawPosition || rawPosition.length < 2) return;

        const [rawLat , rawLng] = rawPosition;
        const currentPt = turf.point([rawLng, rawLat]);

        // Stop Detection if user stop (movement < 4 meters), arrow stick on the point
        if(lastRerouteTimeRef.current){
            const prevPt = turf.point([lastValidPosRef.current[1], lastValidPosRef.current[0]]);
            const moveMeters = turf.distance(prevPt, currentPt, {units: "meters"});
            if (moveMeters < 4){ // it means the user is standalone no jittering please
                return 
            }
            if (!heading || heading === 0){
                const calculateBearing = turf.bearing(prevPt, currentPt);
                setAngle(calculateBearing)
            }else {
                setAngle(heading)
            }
        }
        lastValidPosRef.current = [rawLat, rawLng];
        
        // 2. ROUTE SNAPPING & OFF-ROUTE RECALCULATION
        const routeCoords = route?.features[0]?.geometry?.coordinates;
        
        if(isNavigating && routeCoords && routeCoords.length >=2 ){
            const routeLine = turf.lineString(routeCoords);
            const snapped = turf.nearestPointOnLine(routeLine, currentPt, {units : "meters"})
            const distanceFromRoute = snapped.properties.dist; // in meters
            // If user route is going to 35 or far from the mapping road it means user choose the wrong one
            if (distanceFromRoute >  35){
                const now = Date.now();
            // every 8 seconds we call the reroute max 1 time for not spamming the API 
                if (now - lastRerouteTimeRef.current > 8000) {
                    console.log("Wrong Route detected! Recalculating route from current location...");
                lastRerouteTimeRef.current = now;
                onReroute(`${rawLat}, ${rawLng}`)
                }
                // Show the original positions until unless getting the new route
                setDisplayPos([rawLat, rawLng]);
            } else {
                // else we are in right route now snapped the arrow in the middle of the road

                const[snapLng, snapLat] = snapped.geometry.coordinates;
                setDisplayPos([snapLat , snapLng]);
            }
        } else {
            // normal mode without active route
            setDisplayPos([rawLat, rawLng]);
        }
        // Camera Auto Follow (when the navigation is on)
        if (isNavigating){
            map.panTo([rawLat, rawLng], {animate : true, duration : 0.8});

        }
    }, [rawPosition , heading, route, isNavigating, map, onReroute]);
    if(!displayPos) return null;

    return (
        <Marker position={displayPos} icon={createArrowIcon(angle)}>
            <Popup>Live Navigation Active</Popup>
        </Marker>
    );

}