// valhalla we want route -> response -> geometry decode -> frontend compatible data return

// Input -> Api Request -> Response Validation -> Gemotery Decode -> Final Result 
const axios = require("axios");

const VALHALLA_URL = process.env.VALHALLA_URL;


const polyline = require("../RoadData/PolyLine");

const VALHALL_PROVIDER = process.env.VALHALLA_PROVIDER || 'local';
const VALHALLA_CONFIG = {
    local : {
        url:process.env.LOCAL_VALHALLA_URL,
        headers : {}
    },

    transitland : {
        url : process.env.TRANSITLAND_VALHALLA_URL,
        headers : {
            apikey : process.env.VALHALLA_API_KEY
        }
    }
}
async function getHostedRoute(startLat, startLng, endLat, endLng, mode="car") {
    // const api_key = process.env.VALHALLA_API_KEY;

    // if (!api_key){
    //     throw new Error("Valhalla Api Key Error");
    // }
    
const config = VALHALLA_CONFIG[VALHALL_PROVIDER];
if (!config?.url){
    throw new Error (
        `Invalid or missing valhalla config : ${VALHALL_PROVIDER}`
    )
}
if (
    VALHALL_PROVIDER === "transitland" && !process.env.TRANSITLAND_VALHALLA_API_KEY
){
    throw new Error("TransitLand API is missing")
}

const costingModes = {
    car: "auto",
    auto: "auto",
    bus: "bus",
    walk: "pedestrian",
    pedestrian: "pedestrian",
    bike: "bicycle",
    bicycle: "bicycle"
};

    const costing = costingModes[mode]

    if (!costing){
        throw new Error(`Unsupported travel mode : ${mode}`);
    }

    const response = await axios.post(
        config.url,
        {
            locations : [
                {lat : Number(startLat), lon : Number(startLng)},
                {lat : Number(endLat), lon: Number(endLng)}
            ],
            costing,
            units : "kilometers"
        },
        {
            headers: {
        // apikey: api_key,
        "Content-Type": "application/json",
        ...config.headers
      },
      timeout: 20000
        }
    );

    const trip = response.data.trip;

    if(!trip?.legs?.length){
        throw new Error("Valhalla Returned No Route");
    }

    const coordinates = []

    for (const leg of trip.legs){
        if(!leg.shape){
            throw new Error("Route Geometry Missing From Valhalla Response");
        }
        const points = polyline.decode(leg.shape);

        coordinates.push(
            ...points.slice(coordinates.length ? 1 : 0)
        )
    }
    if (coordinates.length < 2) {
        throw new Error("Route Geometry is incomplete");
    }

    return {
    type: "FeatureCollection",
    metaData: {
      distance: trip.summary.length,
      duration: Math.round(trip.summary.time / 60),
      unit: "KM"
    },
    features: [
      {
        type: "Feature",
        properties: { name: "Valhalla Route" },
        geometry: {
          type: "LineString",
          coordinates
        }
      }
    ]
  };
}
module.exports = getHostedRoute