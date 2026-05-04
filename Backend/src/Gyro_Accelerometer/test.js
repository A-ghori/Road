// test.js
const { analyzeSensor } = require('./gyro.js'); // Apni main file ka naam likho

console.log("🚀 Starting Sensor Test...");

// Ek dummy interval banate hain jo har 500ms pe data bhejega
setInterval(() => {
    // Random data simulate kar rahe hain (Kabhi halka, kabhi zor ka jhatka)
    let fakeX = (Math.random() * 5).toFixed(2);
    let fakeY = (Math.random() * 5).toFixed(2);
    let fakeZ = (9.8 + Math.random() * 15).toFixed(2); // Gravity + Impact

    analyzeSensor(parseFloat(fakeX), parseFloat(fakeY), parseFloat(fakeZ));
}, 500);