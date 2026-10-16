
const pool = require("../db/psql_db")
const {analyzeSensor} = require('../Gyro_Accelerometer/gyro')



const getDamageReports = async (req,res) => {

  try {
    const query = `
    SELECT 
    damage_id,
    lat,
    lng,
    force,
    damage_level,
    confidence,
    status,
    reported_at,
    FROM damage_reports
    ORDER BY reported_at DESC`;

    const {rows} = await pool.query(query);
    res.status(200).json({
      success : true,
      count : rows.length,
      data:rows
    })
  } catch (error) {
    console.error("Fetch damage reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch damage reports"
    });
  }
  
}


const createDamageReport = async (req,res) => {
  try {
    const {lat,lng,ax,ay,az} = req.body
    if (
      lat === undefined ||
      lng === undefined ||
      ax === undefined ||
      ay === undefined ||
      az === undefined
    ){
      return res.status(400).json({
        success : false,
        message : "lat, lng, ax, ay, az are required"
      })
    }
    const result = analyzeSensor(
      Number(ax),
      Number(ay),
      Number(az),
    );
    const query = `INSERT INTO damage_reports
                    (lat,lng,force,damage_level,confidence)
                    VALUES($1,$2,$3,$4,$5)
                    Returning *
                    `;
    const values = [
      Number(lat),
      Number(lng),
      result.force,
      result.damageLevel,
      parseFloat(result.confidence)
    ]
    
    const {rows} = await pool.query(query, values);
    res.status(200).json({
      success : true,
      data : rows[0]
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Something Went Wrong"
    })
  }
}

module.exports = {
  createDamageReport,
  getDamageReports
}