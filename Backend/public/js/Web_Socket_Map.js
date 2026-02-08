const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude } = position.coords;

    socket.emit("Send Location", {
      latitude,
      longitude
    });

    console.log("Location sent:", latitude, longitude);
  });
}

const map = L.map("map").setView([28.6139, 77.2090], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map"
}).addTo(map);

const markers = {};

socket.on("recived location", (data) => {
  const { id, latitude, longitude } = data;

  map.setView([latitude, longitude], 17);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user disconnected", (data) => {
  if (markers[data.id]) {
    map.removeLayer(markers[data.id]);
    delete markers[data.id];
  }
});