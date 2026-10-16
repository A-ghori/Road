const express = require("express");

const {
    createDamageReport,
    getDamageReports
} = require("../Controller/damage_controller");

const router = express.Router();

router.post("/", createDamageReport);
router.post("/", getDamageReports)

module.exports = router;