
const express = require("express");
const axios = require("axios");

const router = express.Router();
const CATEGORIES = [
    // Emergency and healthcare
    "healthcare.hospital",
    "healthcare.clinic_or_praxis",
    "healthcare.pharmacy",
    "service.police",
    "service.fire_station",
    "emergency.ambulance_station",

    // Fuel and EV charging
    "service.vehicle.fuel",
    "service.vehicle.charging_station",

    // Shopping and banking
    "commercial.supermarket",
    "commercial.convenience",
    "service.financial.atm",
    "service.financial.bank",

    // Vehicle services
    "service.vehicle.repair",
    "service.vehicle.car_wash",
    "parking"
];

router.post("/", async (req, res) => {
    const { south, west, north, east } = req.body || {};

    // Validate latitude and longitude separately.
    if (
        ![south, north].every(
            value => Number.isFinite(value) && value >= -90 && value <= 90
        ) ||
        ![west, east].every(
            value => Number.isFinite(value) && value >= -180 && value <= 180
        ) ||
        south >= north ||
        west >= east
    ) {
        return res.status(400).json({
            error: "Invalid map coordinates"
        });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
        console.error("GEOAPIFY_API_KEY is missing");
        return res.status(500).json({
            error: "Emergency services API is not configured"
        });
    }

    try {
        const response = await axios.get(
            "https://api.geoapify.com/v2/places",
            {
                params: {
                    categories: CATEGORIES.join(","),
                    filter: `rect:${west},${south},${east},${north}`,
                    limit: 1000,
                    apiKey
                },
                timeout: 20000
            }
        );

        return res.json(response.data);
    } catch (error) {
        console.error(
            "Geoapify error:",
            error.response?.status || error.message
        );

        return res.status(502).json({
            error: "Unable to load emergency services",
            upstreamStatus: error.response?.status || null
        });
    }
});

module.exports = router;
