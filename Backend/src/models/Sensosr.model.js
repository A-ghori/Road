const mongoose = require('mongoose');

const sensorSchema = mongoose.Schema({
    location : {
        type : {
            type : "String",
            enum : ['Point'],
            required : true,
            default : 'Point'
            },

        coordinates : {
                type : [Number], // Lattitude , Longitude
                required: true
            }
            },
        // Save the sensor datas
        damageLevel : {
            type : "String",
            enum : ["Low", "High", "Medium"],
            required : true,
        },
            force : {type : Number},
            confidence : {type : String},
            speed : {type : Number},
            timestamp: { type: Date, default: Date.now },

        })
    sensorSchema.index ({location : "2dsphere"});
    const pothole = mongoose.model("Pothole", sensorSchema);
    module.exports = pothole