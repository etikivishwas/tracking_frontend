import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./TruckDetails.module.css";
import { FaBell } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuFuel } from "react-icons/lu";
import { GiWeightScale } from "react-icons/gi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet/dist/leaflet.css";

// ✅ React-Leaflet
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";

// ✅ Fix default Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// -------------------
// ✅ Area Difference Method Helpers
// -------------------
function polygonArea(coords) {
  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function triangleArea(p1, p2, p3) {
  return Math.abs(
    (p1[0] * (p2[1] - p3[1]) +
      p2[0] * (p3[1] - p1[1]) +
      p3[0] * (p1[1] - p2[1])) / 2
  );
}

function isPointInside(point, polygon) {
  const polyArea = polygonArea(polygon);
  let sumArea = 0;
  for (let i = 0; i < polygon.length - 1; i++) {
    sumArea += triangleArea(point, polygon[i], polygon[i + 1]);
  }
  sumArea += triangleArea(point, polygon[polygon.length - 1], polygon[0]);
  return Math.abs(sumArea - polyArea) < 1e-6;
}

function TruckDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [truck, setTruck] = useState(null);
  const [logs, setLogs] = useState([]);
  const [tracker, setTracker] = useState(null);
  const [location, setLocation] = useState(null);

  // ✅ Reverse geocoded address
  const [resolvedAddress, setResolvedAddress] = useState(null);

  // Calendar
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ✅ Quarry boundary polygon in [lat, lng] for Leaflet
  const quarryBoundaryLatLng = [
    [15.585024, 79.822357],
    [15.584936, 79.823761],
    [15.585238, 79.823862],
    [15.585126, 79.824889],
    [15.584812, 79.824828],
    [15.584233, 79.825093],
    [15.584656, 79.827969],
    [15.584413, 79.831334],
    [15.585398, 79.830969],
    [15.586281, 79.821970],
    [15.585024, 79.822357], // close polygon
  ];

  // -------------------
  // API Fetch
  // -------------------
  useEffect(() => {
    axios
      .get(`http://localhost:5050/api/trucks/${id}`)
      .then((res) => {
        setTruck(res.data.truck);
        setLogs(res.data.logs);
        setTracker(res.data.tracker);
        setLocation(res.data.location);
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Handle calendar date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    axios
      .get(
        `http://localhost:5050/api/trucks/${id}?date=${date
          .toISOString()
          .split("T")[0]}`
      )
      .then((res) => {
        setLogs(res.data.logs);
        setTracker(res.data.tracker);
        setLocation(res.data.location);
      })
      .catch((err) => console.error(err));
  };

  // ✅ Reverse Geocoding
  useEffect(() => {
    if (tracker?.latitude && tracker?.longitude) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/reverse?lat=${tracker.latitude}&lon=${tracker.longitude}&format=json`
        )
        .then((res) => {
          if (res.data?.display_name) {
            setResolvedAddress(res.data.display_name);
          }
        })
        .catch((err) => console.error("Reverse geocoding failed:", err));
    }
  }, [tracker]);

  if (!truck) return <p>Loading...</p>;

  const latestLog = logs.length ? logs[logs.length - 1] : null;
  const todayHours = latestLog ? latestLog.hours_worked : 0;

  // ✅ Current location
  const currentLocation =
    resolvedAddress ||
    latestLog?.current_location ||
    location?.current_location ||
    "N/A";

  // ✅ Geofence check (using Area Difference Method)
  const isInside =
    tracker?.latitude && tracker?.longitude
      ? isPointInside(
          [tracker.latitude, tracker.longitude], // test point [lat, lng]
          quarryBoundaryLatLng
        )
      : false;

  console.log(
    "Truck Position:",
    tracker?.latitude,
    tracker?.longitude,
    "Inside Quarry?",
    isInside
  );

  const handleLogout = () => navigate("/");

  return (
    <div className={styles.applayout}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={handleLogout}
      />
      <div
        className={`${styles.appcontent} ${
          collapsed ? styles.contentcollapsed : styles.contentexpanded
        }`}
      >
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.head1}>
            <h2>Truck Management</h2>
          </div>
          <div className={styles.profile}>
            <div className={styles.notification}>
              <span className={styles.badge}>5</span>
              <FaBell />
            </div>
            <img
              src="http://localhost:5050/uploads/1.jpg"
              alt="User"
              className={styles.avatar}
            />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </div>
        <hr className={styles.horizontal} />

        {/* BACK + PROFILE */}
        <div className={styles.container1}>
          <div>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
              ⬅ Back
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.profileCard}>
              <div>
                <h3>{truck.name}</h3>
                <span className={styles.role}>{truck.role}</span>
                <p>{truck.description}</p>
              </div>
              <img
                src={`http://localhost:5050${truck.image_url}`}
                alt={truck.name}
                className={styles.avatarBig}
              />
            </div>
            <div className={styles.info}>
              <div className={styles.card}>
                <div className={styles.row}>
                  <span className={styles.round1}></span>
                  <IoLocationOutline className={styles.icon} />
                  <p className={styles.title}>CURRENT LOCATION</p>
                </div>
                <p className={styles.value1}>{currentLocation}</p>
              </div>
              <div className={styles.card}>
                <div className={styles.row}>
                  <span className={styles.round2}></span>
                  <p className={styles.title}>CONDITION</p>
                </div>
                <p className={styles.value2}>
                  {latestLog ? latestLog.state : "N/A"}
                </p>
              </div>
            </div>
            <div className={styles.infoBox}>
              <h4>Working Hours Today</h4>
              <div className={styles.progressCircle}>
                <svg width="100" height="100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#eee"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgb(17, 174, 17)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={
                      2 * Math.PI * 45 * (1 - todayHours / 15)
                    }
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className={styles.circleText}>{todayHours} Hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRACKER */}
        <div className={styles.container3}>
          {tracker ? (
            <div className={styles.trackerSplit}>
              <div className={styles.trackerSection}>
                <h5>Truck Data</h5>
                <div className={styles.trackerInfo}>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Latitude</p>
                    <p className={styles.value}>{tracker.latitude}</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Longitude</p>
                    <p className={styles.value}>{tracker.longitude}</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Altitude</p>
                    <p className={styles.value}>{tracker.altitude} m</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Speed</p>
                    <p className={styles.value}>{tracker.speed_kmph} km/h</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Heading</p>
                    <p className={styles.value}>{tracker.heading_degrees}°</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Ignition</p>
                    <p className={styles.value}>
                      {tracker.ignition ? "ON" : "OFF"}
                    </p>
                  </div>
                  <div className={styles.trackerCardWide}>
                    <p className={styles.title}>Event</p>
                    <p className={styles.value}>
                      {tracker.event_type} - {tracker.event_description}
                    </p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Geofence Alert</p>
                    <p className={styles.value}>
                      {!isInside
                        ? "🚨 Outside Boundary"
                        : "✅ Inside Boundary"}
                    </p>
                  </div>
                </div>
              </div>

              {/* GPS DEVICE */}
              <div className={styles.trackerSection}>
                <h5>GPS Tracker Device</h5>
                <div className={styles.trackerInfo}>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Device ID</p>
                    <p className={styles.value}>{tracker.device_id}</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Timestamp</p>
                    <p className={styles.value}>
                      {new Date(tracker.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Battery</p>
                    <p className={styles.value}>{tracker.battery_level}%</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>Signal</p>
                    <p className={styles.value}>{tracker.signal_strength}</p>
                  </div>
                  <div className={styles.trackerCard}>
                    <p className={styles.title}>GPS Fix</p>
                    <p className={styles.value}>
                      {tracker.gps_fix ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className={styles.trackerCalendar}>
                    <p className={styles.title}>Select Date</p>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className={styles.datePicker}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>No tracker data available</p>
          )}
        </div>

        {/* FUEL + WEIGHT + DISTANCE */}
        <div className={styles.container2}>
          <div className={styles.fuel}>
            <LuFuel className={styles.icon1} />
            <p className={styles.para}>Fuel Consumption</p>
            <p className={styles.para2}>
              {latestLog ? latestLog.fuel_consumption : "N/A"} Ltr
            </p>
          </div>
          <div className={styles.weight}>
            <GiWeightScale className={styles.icon1} />
            <p className={styles.para}>Material Tonnage</p>
            <p className={styles.para2}>
              {latestLog ? latestLog.weight : "N/A"} Tons
            </p>
          </div>
          <div className={styles.chartSection}>
            <h6 style={{ color: "white" }}>Total Distance Traveled</h6>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={logs}>
                <XAxis
                  dataKey="log_time"
                  tickFormatter={(time) =>
                    new Date(time).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }
                />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="distance_travelled"
                  stroke="#28a745"
                  fill="#28a745"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAP SECTION */}
        <div className={styles.container4}>
          <h6 style={{ color: "white" }}>Live Truck Location</h6>
          {tracker ? (
            <div style={{ height: "400px", width: "100%" }}>
              <MapContainer
                center={[tracker.latitude, tracker.longitude]}
                zoom={15}
                style={{ height: "100%", width: "100%", borderRadius: "10px" }}
              >
                {/* ✅ Satellite Layer from Esri */}
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles © Esri — Source: Esri, Earthstar Geographics, Maxar'
                />
                {/* ✅ Quarry Boundary (Leaflet needs [lat, lng]) */}
                <Polygon
                  positions={quarryBoundaryLatLng}
                  pathOptions={{ color: "red" }}
                />
                <Marker position={[tracker.latitude, tracker.longitude]}>
                  <Popup>
                    Truck is here 🚚 <br />
                    {resolvedAddress ||
                      `${tracker.latitude}, ${tracker.longitude}`}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <p style={{ color: "black" }}>Location not available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TruckDetails;
