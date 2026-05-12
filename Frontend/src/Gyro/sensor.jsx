import { useState, useEffect, useRef } from "react";

export default function useSensorApi() {
  const [damage, setDamage] = useState(null);

  const latestLocation = useRef({ lat: null, lng: null, speed: 0 });
  const latestSensorData = useRef({ ax: 0, ay: 0, az: 0 });
  const lastSentTime = useRef(0);

  const THROTTLE_INTERVAL = 1000;

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude, speed } = pos.coords;

      latestLocation.current = {
        lat: latitude,
        lng: longitude,
        speed: speed || 0
      };

      console.log("📍 Location:", latestLocation.current);
    });

    // Sensor Data 
    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
        
      if(typeof DeviceMotionEvent.requestPermission === 'function'){
        DeviceMotionEvent.requestPermission()
            .then(response => {
                    if(response === 'granted'){
                        console.log("Permission Granted")
                    }
            }) 
      }
      console.log("RAW:", acc);

      latestSensorData.current = {
        ax: acc.x || 0,
        ay: acc.y || 0,
        az: acc.z || 0
      };

      const now = Date.now();

      if (now - lastSentTime.current > THROTTLE_INTERVAL) {
        sendToBackend();
        lastSentTime.current = now;
      }
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("devicemotion", handleMotion);
      
    };
  }, []);

  function sendToBackend() {
    if (!latestLocation.current.lat) return;

    const payload = {
      ...latestLocation.current,
      ...latestSensorData.current
    };

    console.log(" Sending:", payload);
//const BACKEND_URL = "http://localhost:3001";
    const response = fetch(`${process.env.REACT_APP_BACKEND_URL}/api/sensor/sensor-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      console.log(" Backend:", data);
      console.log("Response", response);

        if(!data.success || !data.data){
            console.error("Backend Failed", data.message);
            return;
        }

        const d = data.data;

        setDamage({
          lat: d.lat,
          lng: d.lng,
          level: d.damageLevel
        });
      })
      .catch(err => console.error(" Error:", err));
  }

  return { damage };
}