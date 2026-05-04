import React, {useRef} from 'react'
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { useSocketLocation} from '../Map_Rotes/userSocketLocation';
import { useRoute } from '../Map_Rotes/useRoute';
import RouteLayer from '../Map_Rotes/RouteLayer';
import { useMap } from 'react-leaflet';

const LiveMap = () => {
  
  const {position} = useSocketLocation();

  const [destination, setDestination] = useState(null);
  //const {route, fetchRoute} = useRoute()
  const [route, setRoute] = useState(null);
  const[query, setQuery] = useState('');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [mode, setMode] = useState('car');
  
  
  // Click and set destination
  //function MapClickHandler(){
  //  useMapEvents({
  //    click(e){
  //      const {lat, lng} = e.latlng;
  //      console.log(lat,lng);
  //      setDestination([lat, lng]);
  //    }
  //  })
  //}

// async function searchRoute(){
//   if(!query) return;
//   try{
//     const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
//    const res = await fetch(url);
//    const data = await res.json();
//
//    if(data.length > 0) {
//      const place = data[0];
//      const lat = parseFloat(place.lat);
//      const lon = parseFloat(place.lon);
//      setDestination([lat, lon]);
//    }
// 
//    } catch (error){
//      console.error("Error searching location:", error);
//    }
// }

const handleRoute = async () => {
  if(!from || ! to) return 
  setRoute(null);
  try{
    const res = await fetch("http://localhost:3001/api/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        start: from,
        end: to,
        mode: mode
      })
    })
    const data = await res.json();
    console.log("Route Data:", data);
    setRoute(data);
  } catch (error){
    console.error("Error fetching route:", error);
    //fetchRoute();
  }
}

//useEffect(() => {
//  if(!position || !destination) return;
//const fetchRoute = async () => {
//  try{
//  const url = `https://router.project-osrm.org/route/v1/driving/${position[1]},${position[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
//
//  const response = await fetch(url);
//   const data = await response.json()
//
//      setRoute(data.routes[0].geometry);
//      console.log("Route Data:", data);
//
//  } catch (error) {
//    console.error("Error fetching route:", error);
//  }
//}
//fetchRoute();
//
//  },[position, destination])


  function MapUpdater({position}){
    const map = useMap();

    useEffect(() => {
      if(!position) return;
      
      map.whenReady(() => {
        map.flyTo(position, 16)
      })
    },[position, map])
    return null;
  }



const mapRef = useRef(null);

 
//useEffect(() => {
//  if(position && mapRef.current){
//    mapRef.current.setView(position, 15);
//    console.log(position)
//  }
//},[position])

 
  
  return (
     <div>
    <div style={{
      position: "absolute",
      top: 10,
      left:10,
      zIndex: 1000,
      background: "white",
      padding: "10px",
      borderRadius: "5px",
      boxShadow: "0 0 10px rgba(0,0,0,0.3)"
     }}>
      <input 
      type='text'
      placeholder='From..'
      value={from}
      onChange={(e) => setFrom(e.target.value)}
/>
<br />
<input 
type='text'
placeholder='to...'
value={to}
onChange={(e) => setTo(e.target.value)}
></input>
<br/>

<select value={mode} onChange={(e) => setMode(e.target.value)} >

<option value="car">Car</option>
<option value="bike">Bike</option>
<option value="bus">bus</option>
<option value="walk">Walk</option>


</select>
<br/>
<button onClick={handleRoute}>Get Route</button>
     </div>

     

  <MapContainer center={position ||[22.57, 88.36] }
  zoom={15}
  whenCreated={(map) => (mapRef.current = map)}
  style={{ height: "500px", width: "100%" }}
>
  <MapUpdater position={position} />
   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />


{position  && !route && <Marker position={position} /> }
{/*<MapClickHandler setDestination={setDestination}></MapClickHandler> */}
{destination && <Marker position={destination} />}
{route && <RouteLayer route={route}/>
}
</MapContainer>
    </div>
  )
}

export default LiveMap