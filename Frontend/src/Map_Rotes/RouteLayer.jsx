import { GeoJSON, Marker, useMap } from "react-leaflet";
import {useState,useEffect} from "react"
import L from "leaflet";


// For Marker Icons 
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";



delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function RouteLayer ({
    route
}) {
    const map = useMap();

    useEffect(() => {
        if (!route || !route.features || !route.features.length) return;

        try {
            const bounds = L.geoJSON(route).getBounds();

            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        } catch (err) {
            console.error("Invalid GeoJSON received:", route);
        }
    }, [route, map]);

if(!route?.features?.length) return null;
const coords = route?.features?.[0]?.geometry?.coordinates;
if (!coords) return null;
const start = [coords[0][1], coords[0][0]];
const end = [coords[coords.length - 1][1], coords[coords.length - 1][0]];

 return (
    <>
      <GeoJSON data={route} style={{ color: "blue", weight: 5 }} />
      <Marker position={start} />
      <Marker position={end} />
    </>
  );
}



