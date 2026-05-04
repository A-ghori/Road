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
// 1. Icons Define Karein (Function ke andar)
    const startIcon = L.divIcon({
        html: `<div style="background:#22c55e; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.3);"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    const endIcon = L.divIcon({
        html: `<div style="background:#ef4444; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.3);"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
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
      <GeoJSON 
        data={route} 
        style={{ color: "#3b82f6", weight: 6, opacity: 0.7 }} 
        pointToLayer={() => null} // GeoJSON ke auto-markers hide karo
      />
      
      {/* Start Marker - Green Dot */}
      <Marker position={start} icon={startIcon} interactive={false} />
      
      {/* End Marker - Red Dot */}
      <Marker position={end} icon={endIcon} interactive={false} />
    </>
);
}



