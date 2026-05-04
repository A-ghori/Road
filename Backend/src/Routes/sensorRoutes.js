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

router.post('/sensor-data', (req, res) => {
    try {
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

        const responseData = {
            lat,
            lng,
            speed,
            force: result.force.toFixed(3),
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
            data: responseData
        });

    } catch (err) {
        // 5. FATAL: Unexpected errors that crash the engine
        logger.fatal({ error: err.message, stack: err.stack }, "SYSTEM ENGINE CRASHED");
        res.status(500).json({ success: false, message: "Internal Engine Error" });
    }
});

module.exports = router;