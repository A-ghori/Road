
import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

const SERVICE_TYPES = [
    { category: "healthcare.hospital", label: "Hospital", icon: "🏥" },
    { category: "healthcare.clinic_or_praxis", label: "Clinic", icon: "🩺" },
    { category: "healthcare.pharmacy", label: "Pharmacy", icon: "💊" },
    { category: "service.police", label: "Police Station", icon: "🚔" },
    { category: "service.fire_station", label: "Fire Station", icon: "🚒" },
    { category: "emergency.ambulance_station", label: "Ambulance Station", icon: "🚑" },
    { category: "service.vehicle.fuel", label: "Fuel Station", icon: "⛽" },
    { category: "service.vehicle.charging_station", label: "EV Charging", icon: "🔌" },
    { category: "commercial.supermarket", label: "Supermarket", icon: "🛒" },
    { category: "commercial.convenience", label: "Convenience Store", icon: "🏪" },
    { category: "service.financial.atm", label: "ATM", icon: "🏧" },
    { category: "service.financial.bank", label: "Bank", icon: "🏦" },
    { category: "service.vehicle.repair", label: "Vehicle Repair", icon: "🔧" },
    { category: "service.vehicle.car_wash", label: "Car Wash", icon: "🚘" },
    { category: "parking", label: "Parking", icon: "🅿️" },
];

function findService(properties) {
    const categories = properties.categories || [];

    return SERVICE_TYPES.find(service =>
        categories.some(category =>
            category === service.category ||
            category.startsWith(`${service.category}.`)
        )
    );
}

export default function EmergencyServicesLayer() {
    const map = useMap();
    const [services, setServices] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let controller;
        let timer;

        async function loadServices() {
           
            if (!map || !map._loaded){
                return
            }
            if (map.getZoom() < 11) {
                setServices([]);
                return;
            }

            controller?.abort();
            controller = new AbortController();

            const bounds = map.getBounds();

            try {
                const response = await fetch(
                    `${(process.env.REACT_APP_BACKEND_URL || "http://localhost:3005").replace(/\/$/, "")}/api/emergency-services`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            south: bounds.getSouth(),
                            west: bounds.getWest(),
                            north: bounds.getNorth(),
                            east: bounds.getEast(),
                        }),
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(`API status ${response.status}`);
                }

                const data = await response.json();

                const results = (data.features || [])
                    .map(feature => {
                        const p = feature.properties || {};
                        const type = findService(p);
                        const [lng, lat] = feature.geometry?.coordinates || [];

                        if (!type || !Number.isFinite(lat) ||
                            !Number.isFinite(lng)) {
                            return null;
                        }

                        return {
                            id: p.place_id || `${lat}-${lng}`,
                            name: p.name || type.label,
                            address: p.formatted || "",
                            lat,
                            lng,
                            ...type,
                        };
                    })
                    .filter(Boolean);

                setServices(results);
                setError("");
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Emergency services error:", err);
                    setError("Services could not be loaded.");
                }
            }
        }

        const scheduleLoad = () => {
            clearTimeout(timer);
            timer = setTimeout(loadServices, 250);
        };

        loadServices();
        map.on("moveend", scheduleLoad);

        return () => {
            clearTimeout(timer);
            map.off("moveend", scheduleLoad);
            clearTimeout(timer);
            controller?.abort();
        };
    }, [map]);

    return (
        <>
            {services.map(service => (
                <Marker
                    key={service.id}
                    position={[service.lat, service.lng]}
                    icon={L.divIcon({
                        html: `<div style="font-size:22px">${service.icon}</div>`,
                        className: "",
                        iconSize: [28, 28],
                        iconAnchor: [14, 14],
                    })}
                >
                    <Popup>
                        <strong>{service.name}</strong>
                        <br />
                        {service.label}
                        {service.address && (
                            <>
                                <br />
                                <small>{service.address}</small>
                            </>
                        )}
                    </Popup>
                </Marker>
            ))}
            {error && console.warn(error)}
        </>
    );
}
