import React from 'react'
import { TileLayer } from 'react-leaflet'


const TrafficLayer = () => {
  const api_key = process.env.REACT_APP_TOMTOM_API_KEY;

  if(!api_key){
    console.warn("TOM TOM API KEY IS MISSING");
    return null
  }
  
    return (

       <TileLayer
            url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${api_key}&tileSize=256`}
            opacity={0.8}
            minZoom={0}
            maxZoom={22}
            attribution='Traffic data © <a href="https://www.tomtom.com/">TomTom</a>'
        />
  )
}

export default TrafficLayer
