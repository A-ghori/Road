let latestLocation = {lat: null, lng: null, speed: null};
let latestSensorData = {ax:0, ay:0, az:0};
let lastSentTime = 0;
const THROTTLE_INTERVAL = 1000; // 1 second

// Get GPS LOCATION
navigator.geolocation.watchPosition((pos) => {
    const {latitude, longitude, speed} = pos.coords;
    latestLocation = {
        lat: latitude,
        lng: longitude,
        speed : speed || 0
    };
    console.log("Sensor Location From GYRO", latestLocation);
})

// Get Sensor Data
window.addEventListener("devicemotion",(event) => {
    const acc = event.accelerationIncludingGravity;
    if(!acc) return;

    latestSensorData = {
        ax: acc.x || 0,
        ay: acc.y || 0,
        az: acc.z || 0
    };
    console.log("Sensor Data From GYRO", latestSensorData);
    // THROTTLED API CALL
    const now = Date.now();
    
    if(lastSentTime - now > THROTTLE_INTERVAL){
        sendToBackend();
        lastSentTime = now;
    }
})


function sendToBackend() {
    const payload = {
        ...latestLocation,
        ...latestSensorData
    }

    console.log("Sending to backend:", payload);

    fetch("http://localhost:3001/api/sensor/sensor-data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
     .then(res => res.json())
    .then(data => console.log("Response:", data))
    .catch(err => console.error(" Error:", err));
}