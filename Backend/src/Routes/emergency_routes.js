const express = require("express");
const axios = require("axios");
const router = express.Router();


router.post ("/",async (req,res) => {
    const {south, west, north , east} = req.body;

      const query = `
        [out:json][timeout:25];
        nwr["amenity"~"^(hospital|police|fire_station|clinic|pharmacy|doctors|ambulance_station)$"]
        (${south},${west},${north},${east});
        out center;
    `;

    try {
        const response = await post(
            "https://overpass-api.de/api/interpreter",
            new URLSearchParams({data: query}).toString(),
              {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout: 30000
            }
        );
        res.json(response.data);
    } catch (error) {
        
        console.error("Overpass error:", error.message);
        res.status(502).json({
            error: "Emergency services API is temporarily unavailable"
        });
    }
})

module.exports = router;
