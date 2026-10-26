import { useState, useEffect, useRef, useCallback } from "react";

export default function useSensorApi(isNavigating = false) {
  const [damage, setDamage] = useState(null);
  const [sensorError, setSensorError] = useState(null);
  const [motionEnabled, setMotionEnabled] = useState(false);

  // Latest GPS location
  const latestLocation = useRef({
    lat: null,
    lng: null,
    speed: 0
  });

  // Latest accelerometer readings
  const latestSensorData = useRef({
    ax: 0,
    ay: 0,
    az: 0
  });

  const lastSentTime = useRef(0);
  const requestInFlight = useRef(false);

  const THROTTLE_INTERVAL = 1000;

  // 1. Request motion permission from the Start Navigation button
  const requestMotionPermission = useCallback(async () => {
    try {
      if (typeof DeviceMotionEvent === "undefined") {
        throw new Error("Device motion is not supported on this device.");
      }

      // iOS Safari requires explicit permission
      if (typeof DeviceMotionEvent.requestPermission === "function") {
        const permission =
          await DeviceMotionEvent.requestPermission();

        if (permission !== "granted") {
          throw new Error("Motion sensor permission was denied.");
        }
      }

      setMotionEnabled(true);
      setSensorError(null);

      return true;
    } catch (error) {
      setMotionEnabled(false);
      setSensorError(
        error.message || "Could not access the motion sensor."
      );

      return false;
    }
  }, []);

  // 2. Send the latest GPS and sensor data to the backend
  const sendToBackend = useCallback(async () => {
    const { lat, lng } = latestLocation.current;

    // GPS coordinates must be available
    if (lat === null || lng === null) return;

    // Prevent overlapping requests
    if (requestInFlight.current) return;

    requestInFlight.current = true;

    const payload = {
      ...latestLocation.current,
      ...latestSensorData.current
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/sensor/sensor-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Backend HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(
          data.message || "Backend request failed."
        );
      }

      const result = data.data;

      setDamage({
        lat: result.lat,
        lng: result.lng,
        level: result.damageLevel
      });

      setSensorError(null);

      console.log("Backend response:", data);
    } catch (error) {
      console.error("Sensor API error:", error);

      setSensorError(
        error.message || "Failed to send sensor data."
      );
    } finally {
      requestInFlight.current = false;
    }
  }, []);

  // 3. GPS tracking: runs only during navigation
  useEffect(() => {
    if (!isNavigating) return;

    if (!("geolocation" in navigator)) {
      setSensorError("Geolocation is not supported.");
      return;
    }

    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const safespeed = Number.isFinite(speed) ? speed : 0;
        latestLocation.current = {
          lat: latitude,
          lng: longitude,
          speed: safespeed
        };
      },
      (error) => {
        setSensorError(`GPS error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating]);

  // 4. Motion tracking: runs only when navigation is active
  //    AND motion permission has been granted
  useEffect(() => {
    if (!isNavigating || motionEnabled !== true) return;

    const handleMotion = (event) => {
      const acceleration = event.accelerationIncludingGravity;

      if (!acceleration) return;

      latestSensorData.current = {
        ax: acceleration.x ?? 0,
        ay: acceleration.y ?? 0,
        az: acceleration.z ?? 0
      };

      const now = Date.now();

      // Throttle requests to approximately one per second
      if (now - lastSentTime.current >= THROTTLE_INTERVAL) {
        lastSentTime.current = now;
        sendToBackend();
      }
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isNavigating, motionEnabled, sendToBackend]);

  return {
    damage,
    requestMotionPermission,
    sensorError,
    motionEnabled
  };
}
