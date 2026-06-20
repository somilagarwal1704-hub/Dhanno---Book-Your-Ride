// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import { useEffect, useState } from "react";
// import { Polyline } from "react-leaflet";
// import L from "leaflet";

// // FIX leaflet default icon issue
// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function FitBounds({ userLocation, pickup, destination }) {
//   const map = useMap();

//   useEffect(() => {
//     const points = [];

//     if (userLocation) points.push(userLocation);
//     if (pickup) points.push(pickup);
//     if (destination) points.push(destination);

//     if (points.length === 0) return;

//     // only 1 point → normal zoom
//     if (points.length === 1) {
//       map.flyTo(points[0], 10, { duration: 1 });
//       return;
//     }

//     // multiple points → AUTO ZOOM OUT (MAIN FEATURE)
//     const bounds = L.latLngBounds(points);

//     map.fitBounds(bounds, {
//       padding: [80, 80],
//       animate: true,
//     });
//   }, [userLocation, pickup, destination]);

//   return null;
// }

// function LiveTracking({ pickup, destination }) {
//   const [userLocation, setUserLocation] = useState(null);
//   const [route, setRoute] = useState([]);
//   const [distance, setDistance] = useState(null);
//   const [duration, setDuration] = useState(null);

//   // GET USER LOCATION ON LOAD
//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setUserLocation([pos.coords.latitude, pos.coords.longitude]);
//       },
//       (err) => console.log(err),
//       { enableHighAccuracy: true },
//     );
//   }, []);

//   useEffect(() => {
//     if (!pickup || !destination) return;

//     const getRoute = async () => {
//       try {
//         const response = await fetch(
//           `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`,
//         );

//         const data = await response.json();

//         const coordinates = data.routes[0].geometry.coordinates.map(
//           ([lng, lat]) => [lat, lng],
//         );

//         const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
//         const timeMin = Math.ceil(data.routes[0].duration / 60);

//         console.log("Distance (km):", distanceKm);
//         console.log("Duration (min):", timeMin);

//         setDistance(distanceKm);
//         setDuration(timeMin);

//         setRoute(coordinates);
//       } catch (error) {
//         console.log("Route Error:", error);
//       }
//     };

//     getRoute();
//   }, [pickup, destination]);

//   return (
//     <MapContainer
//       center={[28.6139, 77.209]}
//       zoom={12}
//       dragging={true}
//       scrollWheelZoom={true}
//       doubleClickZoom={true}
//       style={{ height: "100vh", width: "100%" }}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//       {/* SMART CAMERA CONTROL */}
//       <FitBounds
//         userLocation={userLocation}
//         pickup={pickup}
//         destination={destination}
//       />

//       {/* USER LOCATION */}
//       {userLocation && (
//         <Marker position={userLocation}>
//           <Popup>Your Location 📍</Popup>
//         </Marker>
//       )}

//       {/* PICKUP */}
//       {pickup && (
//         <Marker position={pickup}>
//           <Popup>Pickup 🟢</Popup>
//         </Marker>
//       )}

//       {/* DESTINATION */}
//       {destination && (
//         <Marker position={destination}>
//           <Popup>Destination 🔴</Popup>
//         </Marker>
//       )}

//       {route.length > 0 && <Polyline positions={route} />}
//     </MapContainer>
//   );
// }

// export default LiveTracking;

// import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
// import { useEffect, useState } from "react";
// import L from "leaflet";

// delete L.Icon.Default.prototype._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

// function FitBounds({ userLocation, pickup, destination }) {
//   const map = useMap();

//   useEffect(() => {
//     const points = [];

//     if (userLocation) points.push(userLocation);
//     if (pickup) points.push(pickup);
//     if (destination) points.push(destination);

//     if (points.length === 0) return;

//     if (points.length === 1) {
//       map.flyTo(points[0], 10, { duration: 1 });
//       return;
//     }

//     const bounds = L.latLngBounds(points);

//     map.fitBounds(bounds, {
//       padding: [80, 80],
//       animate: true,
//     });
//   }, [userLocation, pickup, destination, map]);

//   return null;
// }

// function LiveTracking({
//   pickup,
//   destination,
//   setDistance,
//   setDuration,
// }) {
//   const [userLocation, setUserLocation] = useState(null);
//   const [route, setRoute] = useState([]);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setUserLocation([
//           pos.coords.latitude,
//           pos.coords.longitude,
//         ]);
//       },
//       (err) => console.log(err),
//       { enableHighAccuracy: true }
//     );
//   }, []);

//   useEffect(() => {
//     if (!pickup || !destination) return;

//     const getRoute = async () => {
//       try {
//         const response = await fetch(
//           `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
//         );

//         const data = await response.json();

//         const coordinates =
//           data.routes[0].geometry.coordinates.map(
//             ([lng, lat]) => [lat, lng]
//           );

//         const distanceKm = Number(
//           (data.routes[0].distance / 1000).toFixed(1)
//         );

//         const timeMin = Math.ceil(
//           data.routes[0].duration / 60
//         );

//         setDistance(distanceKm);
//         setDuration(timeMin);

//         setRoute(coordinates);
//       } catch (error) {
//         console.log("Route Error:", error);
//       }
//     };

//     getRoute();
//   }, [pickup, destination, setDistance, setDuration]);

//   return (
//     <MapContainer
//       center={[28.6139, 77.209]}
//       zoom={12}
//       dragging={true}
//       scrollWheelZoom={true}
//       doubleClickZoom={true}
//       style={{ height: "100vh", width: "100%" }}
//     >
//       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//       <FitBounds
//         userLocation={userLocation}
//         pickup={pickup}
//         destination={destination}
//       />

//       {userLocation && (
//         <Marker position={userLocation}>
//           <Popup>Your Location 📍</Popup>
//         </Marker>
//       )}

//       {pickup && (
//         <Marker position={pickup}>
//           <Popup>Pickup 🟢</Popup>
//         </Marker>
//       )}

//       {destination && (
//         <Marker position={destination}>
//           <Popup>Destination 🔴</Popup>
//         </Marker>
//       )}

//       {route.length > 0 && (
//         <Polyline positions={route} weight={5} />
//       )}
//     </MapContainer>
//   );
// }

// export default LiveTracking;



import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

// FIX Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// AUTO FIT BOUNDS
function FitBounds({ pickup, destination, userLocation }) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (userLocation) points.push(userLocation);
    if (pickup) points.push(pickup);
    if (destination) points.push(destination);

    if (points.length === 0) return;

    if (points.length === 1) {
      map.flyTo(points[0], 13, { duration: 1 });
      return;
    }

    const bounds = L.latLngBounds(points);

    map.fitBounds(bounds, {
      padding: [80, 80],
      animate: true,
    });
  }, [pickup, destination, userLocation]);

  return null;
}

function LiveTracking({
  pickup,
  destination,
  setDistance,
  setDuration,
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState([]);

  // GET USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([
          pos.coords.latitude,
          pos.coords.longitude,
        ]);
      },
      (err) => console.log("Location error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // ROUTE FETCH
  useEffect(() => {
    if (!pickup || !destination) return;

    if (!Array.isArray(pickup) || !Array.isArray(destination)) {
      console.log("Invalid pickup/destination format");
      return;
    }

    const getRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (!data.routes || !data.routes.length) {
          console.log("No route found");
          return;
        }

        const routeData = data.routes[0];

        // Convert coordinates (lng,lat → lat,lng)
        const coords = routeData.geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        const distanceKm = Number(
          (routeData.distance / 1000).toFixed(1)
        );

        const durationMin = Math.ceil(
          routeData.duration / 60
        );

        setDistance(distanceKm);
        setDuration(durationMin);
        setRoute(coords);
      } catch (err) {
        console.log("Route error:", err);
      }
    };

    getRoute();
  }, [pickup, destination]);

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
      scrollWheelZoom={true}
      dragging={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds
        pickup={pickup}
        destination={destination}
        userLocation={userLocation}
      />

      {/* USER LOCATION */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>Your Location 📍</Popup>
        </Marker>
      )}

      {/* PICKUP */}
      {pickup && (
        <Marker position={pickup}>
          <Popup>Pickup 🟢</Popup>
        </Marker>
      )}

      {/* DESTINATION */}
      {destination && (
        <Marker position={destination}>
          <Popup>Destination 🔴</Popup>
        </Marker>
      )}

      {/* ROUTE LINE */}
      {route.length > 0 && (
        <Polyline positions={route} color="blue" weight={4} />
      )}
    </MapContainer>
  );
}

export default LiveTracking;