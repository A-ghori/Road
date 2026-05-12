const express = require('express');
const pino = require('pino');
const logger = pino({
    level: 'debug', // Set to 'debug' for development, can be 'info' or 'warn' in production
    transport: {
        target: "pino-pretty",
        options: { colorize: true }
    }
});

// 1. Module-specific Child Loggers
const sensorLog = logger.child({ component: 'SENSOR_INGESTION' });
const engineLog = logger.child({ component: 'ANALYSIS_ENGINE' });

const router = express.Router();
const { analyzeSensor } = require('../Gyro_Accelerometer/gyro');
const pothole = require('../models/Sensosr.model');

 router.post('/sensor-data', async (req, res) => {
    try {
        console.log("Received Sensor Data:", req.body);
        const { ax, ay, az, lat, lng, speed } = req.body;

        // 2. Log incoming data at DEBUG level for development
        sensorLog.debug({ raw: { ax, ay, az }, speed }, "Incoming Stream");

        // Validate data
        if (ax === undefined || ay === undefined || az === undefined) {
            sensorLog.warn({ body: req.body }, "Incomplete data packet received");
            return res.status(400).json({ error: "Missing Sensor Data" });
        }

        // 3. Process Data via your Engine
        const result = analyzeSensor(ax, ay, az);
        if(result.damageLevel !== "NONE"){


        // Optimization Db (Geo Fence Logic)
        // checking the potholes count within 5 meter radius 
        const nearbyCount = await pothole.countDocuments({
            location : {
                // near not working because mongo db is expecting distance data must be sorted as the order of distance 
                /*$near: { */
                //    $geometry: {
                //        type: 'Point', 
                //        coordinates : [lng, lat]
                //    },
                //    $maxDistance : 5
                //}
                $geoWithin: {
                    $centerSphere :[[lng, lat], 15 / 6378100] // for 15 meter radius 
                    
                }
            }
        })
    console.log(`Nearby points in 5 meters ${nearbyCount}`)
        // threshold  10 times available 
        if(nearbyCount >= 10){
            console.log("Skipping Save: Area already well-mapped (Count: " + nearbyCount + ")");
                return res.json({ success: true, message: "Limit reached for this spot" });
            }
// Else condition 
            const newDamage = new  pothole({
                location :{
                    type : "Point",
                    coordinates : [lng, lat],
                },
                damageLevel : result.damageLevel,
                force : result.force,
                speed : result.speed || 0,
                confidence : result.confidence,
            })
            await newDamage.save();
            console.log("Sensor Data Values are saved in DB", newDamage, result.damageLevel)
        }
         const responseData = {
            lat,
            lng,
            speed,
            force: Number(result.force).toFixed(2),
            damageLevel: result.damageLevel,
            confidence: result.confidence,
            timestamp: Date.now()
        };

        // 4. SMART LOGGING based on Damage Level
        if (result.damageLevel === "High") {
            engineLog.error(responseData, " SEVERE POTHOLE DETECTED! (SIGNAL RED)");
        } else if (result.damageLevel === "Medium") {
            engineLog.warn(responseData, "MODERATE BUMP DETECTED (SIGNAL YELLOW)");
        } else {
            engineLog.info({ force: responseData.force }, "Smooth Road (SIGNAL GREEN)");
        }



        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        // 5. FATAL: Unexpected errors that crash the engine
        logger.fatal({ error: err.message, stack: err.stack }, "SYSTEM ENGINE CRASHED");
        res.status(500).json({ success: false, message: "Internal Engine Error" });
    }
});


router.get('/all-potholes',async(req,res) => {
    try {
        
        const Potholes = await pothole.find({});
        const geojson = {
            type : 'FeatureCollection',
            features : Potholes.map (p => ({
                type : "Feature",
                geometry : p.location,
            properties : {
                speed : p.speed,
                damageLevel : p.damageLevel,
                force : p.force,
                timestamp : p.timestamp,
                confidence : p.confidence
            }
            })
        )}
        res.json(geojson)
    }catch (error) {
        res.json(500).jsonp({
            message : error.message
        })
    }
})

module.exports = router;