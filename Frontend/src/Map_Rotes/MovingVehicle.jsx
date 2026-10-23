import { useEffect,useMemo } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";


function getRouteCoordinates(route){
    const feature = route?.features?.find(
        (item) => 
            item?.geometry?.type === "LineString"       
    );
    if (!feature) {
        return [];
    }
    return feature.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
    )
}



export default function MovingVehicle({
    position,
    rotation = 0,
    mode = "auto"
}) {
    const map = useMap();

    const vehicleIcon = useMemo(() => {
        const symbol = mode === "bicycle" ? "🚲" : "🚗";

        return L.divIcon({
            className: "",
            html: `
                <div style="
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    transform: rotate(${rotation}deg);
                ">${symbol}</div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19]
        });
    }, [mode, rotation]);

    useEffect(() => {
        if (!position) return;

        map.panTo(position, { animate: true, duration: 0.5 });
    }, [position, map]);

    if (
        !position ||
        !Number.isFinite(Number(position[0])) ||
        !Number.isFinite(Number(position[1]))
    ) {
        return null;
    }

    return (
        <Marker
            position={position}
            icon={vehicleIcon}
            interactive={false}
            zIndexOffset={1000}
        />
    );
}
