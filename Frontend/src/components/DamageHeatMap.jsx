import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";


export default function DamageHeatMap({map, damages = []}){
    useEffect (() => {
        if (!map){
            return;
        }
        const heatPoints = damages.filter((damage) => {
            const lat = Number(damage.lat);
            const lng = Number(damage.lng);

            return (
                Number.isFinite(lat) && 
                Number.isFinite(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180 &&
                damage.level &&
                damage.level !== "NONE"
            )
        })
        .map((damage) => {
            const lat = Number(damage.lat);
            const lng = Number(damage.lng);
            
            const level = String(
                damage.level
            ).toUpperCase();
            const severity = {
                   LOW: 0.35,
                    MEDIUM: 0.6,
                    HIGH: 0.85,
                    CRITICAL: 1
            }
            const weight =
                    severity[level] ??
                    Math.max(
                        0.1,
                        Math.min(
                            1,
                            Number(damage.confidence) || 0.5
                        )
                    );

                return [lat, lng, weight];
            });

        const heatLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 20,
            maxZoom: 18,
            minOpacity: 0.35
        });

        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, damages]);

    return null;
}

