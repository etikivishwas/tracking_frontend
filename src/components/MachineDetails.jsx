import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./MachineDetails.module.css";
import { FaBell } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import {
  IoLocationOutline,
  IoCalendarOutline,
  IoChevronDown,
  IoChevronUp,
  IoArrowBack,
} from "react-icons/io5";
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

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  Polygon,
  ImageOverlay
} from "react-leaflet";
import L from "leaflet";

// Fix default Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const { BaseLayer } = LayersControl;

const API_URL =
  process.env.REACT_APP_API_URL || "https://trackingbackend-v23j.onrender.com";

// 📍 Predefined Gateway coordinates
const gatewayCoords = {
  "Gateway-A1": { lat: 15.5869, lon: 79.8222694444, label: "A1" },
  "Gateway-A2": { lat: 15.5863833333, lon: 79.825, label: "A2" },
  'Gateway-A6': { lat: 15.5862416667, lon: 79.8273194444, label: "A6" },
  'Gateway-A7': { lat: 15.5860916667, lon: 79.830075, label: "A7" },
  'Gateway-A5': { lat: 15.5846722222, lon: 79.8278944444, label: "A5" },
  "Gateway-A4": { lat: 15.5841944444, lon: 79.825075, label: "A4" },
  "Gateway-A3": { lat: 15.5853583333, lon: 79.8240361111, label: "A3" },
}

const bounds = [
  [15.5871234, 79.821908],  // southwest
  [15.583961, 79.831580]   // northeast
];

const gatewayCoordsArray = Object.keys(gatewayCoords).map(key => {
  const coord = gatewayCoords[key]
  return [coord.lat, coord.lon]
})

function MachineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [machine, setMachine] = useState(null);
  const [logs, setLogs] = useState([]);
  const [beacon, setBeacon] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openTile, setOpenTile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [activity, setActivity] = useState(null);

  // Theme state (persisted)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("milieu-theme") || "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("milieu-theme", theme);
    } catch { }
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Fetch machine details
  const fetchMachineData = (date) => {
    setLoading(true);
    const dateQuery = date ? `?date=${date.toISOString().split("T")[0]}` : "";
    axios
      .get(`${API_URL}/machines/${id}${dateQuery}`)
      .then((res) => {
        setMachine(res.data.machine);
        setLogs(res.data.logs || []);
        setBeacon(res.data.last_record || null);
        setLocation(res.data.location || []);
        setActivity(res.data.latest_activity || []);
        setTimeout(() => setLoading(false), 400);
      })
      .catch((err) => {
        console.error("Error fetching machine:", err);
        setLoading(false);
      });
  };

  // useEffect(() => {
  //   // Fetch immediately on mount or when id/date changes
  //   fetchMachineData(selectedDate);

  //   const interval = setInterval(() => {
  //     fetchMachineData(selectedDate);
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [id, selectedDate]);

  // // Handle date change
  // const handleDateChange = (date) => {
  //   setSelectedDate(date);
  //   fetchMachineData(date); // immediate fetch
  // };
  useEffect(() => {
    // Fetch immediately on mount or when id/date changes
    fetchMachineData(selectedDate);
  }, [id, selectedDate]);

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchMachineData(date); // immediate fetch
  };

  // Reverse geocoding for location
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`,
          { headers: { "User-Agent": "MachineApp/1.0 (contact@example.com)" } }
        )
        .then((res) => {
          if (res.data?.display_name) setResolvedAddress(res.data.display_name);
        })
        .catch((err) => console.error("Reverse geocoding failed:", err));
    }
  }, [location]);

  const latestLog = logs.length ? logs[logs.length - 1] : null;
  const todayHours = latestLog ? latestLog.hours_worked : 0;
  const currentLocation =
    resolvedAddress ||
    location?.name ||
    (latestLog ? latestLog.current_location : "N/A");

  const toggleTile = (key) => setOpenTile((p) => (p === key ? null : key));
  const handleLogout = () => navigate("/");

  return (
    <div
      className={`${styles.applayout} ${theme === "light" ? styles.light : styles.dark
        }`}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={handleLogout}
        theme={theme}
      />

      <main
        className={`${styles.appcontent} ${collapsed ? styles.contentcollapsed : styles.contentexpanded
          }`}
      >
        {loading ? (
          <div className={styles.loading}>Loading machine details...</div>
        ) : (
          <>
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.leftHead}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                  <IoArrowBack size={16} />
                  <span>Back</span>
                </button>
                <button className={styles.badgeTab}>MACHINE INFO</button>
              </div>

              <div className={styles.rightHead}>
                <div className={styles.notification}>
                  <span className={styles.badge}>5</span>
                  <FaBell />
                </div>

                <button
                  onClick={toggleTheme}
                  className={styles.themeToggle}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"
                    } mode`}
                  title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  {theme === "dark" ? <FiSun /> : <FiMoon />}
                </button>

                <img
                  src={`${API_URL}/uploads/1.jpg`}
                  alt="User"
                  className={styles.topAvatar}
                />
                <span className={styles.username}>Alex Kumar</span>
              </div>
            </header>

            {/* ROW 1: Hero + Stats */}
            <section className={styles.rowOne}>
              <div className={styles.heroCard}>
                <div className={styles.heroText}>
                  <h1 className={styles.heroName}>{machine.name}</h1>
                  <span className={styles.rolePill}>{machine.role}</span>
                  <p className={styles.heroDesc}>{machine.description}</p>
                </div>
                <img
                  src={`${API_URL}${machine.image}`}
                  alt={machine.name}
                  className={styles.heroImg}
                  onError={(e) =>
                    (e.currentTarget.src = `${API_URL}/uploads/placeholder.jpg`)
                  }
                />
                <div className={styles.heroGlow} />
              </div>

              <div className={styles.statStack}>
                {/* Location */}
                <div
                  className={`${styles.statTile} ${openTile === "loc" ? styles.open : ""
                    }`}
                  onClick={() => toggleTile("loc")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <IoLocationOutline className={styles.tileIcon} />
                      <span className={styles.tileTitle}>CURRENT LOCATION</span>
                    </div>
                    {openTile === "loc" ? <IoChevronUp /> : <IoChevronDown />}
                  </div>
                  {openTile === "loc" && (
                    <div className={styles.tileContent}>{currentLocation}</div>
                  )}
                </div>

                {/* Condition */}
                <div
                  className={`${styles.statTile} ${openTile === "cond" ? styles.open : ""
                    }`}
                  onClick={() => toggleTile("cond")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <IoCalendarOutline className={styles.tileIcon} />
                      <span className={styles.tileTitle}>CONDITION</span>
                    </div>
                    {openTile === "cond" ? <IoChevronUp /> : <IoChevronDown />}
                  </div>
                  {openTile === "cond" && (
                    <div className={styles.tileContent}>
                      {activity ? activity.status : "N/A"}
                    </div>
                  )}
                </div>

                {/* Coordinates */}
                <div
                  className={`${styles.statTile} ${openTile === "coords" ? styles.open : ""
                    }`}
                  onClick={() => toggleTile("coords")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <IoCalendarOutline className={styles.tileIcon} />
                      <span className={styles.tileTitle}>LAT, LONG</span>
                    </div>
                    {openTile === "coords" ? (
                      <IoChevronUp />
                    ) : (
                      <IoChevronDown />
                    )}
                  </div>
                  {openTile === "coords" && (
                    <div className={styles.tileContent}>
                      {location?.latitude && location?.longitude
                        ? `${location.latitude}, ${location.longitude}`
                        : "N/A"}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ROW 2: Device Info / Chart / Hours */}
            <section className={styles.rowTwo}>
              <div className={styles.infoCard}>
                <h3>Device Information</h3>
                {beacon ? (
                  <div className={styles.infoGrid}>
                    <div>
                      <span>Device ID :</span>
                      <span>{beacon.deviceId}</span>
                    </div>
                    <div>
                      <span>Timestamp :</span>
                      <span>{new Date(beacon.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                      <span>Accelerometer :</span>
                      <span>{`${beacon.accel_x}, ${beacon.accel_y}, ${beacon.accel_z}`}</span>
                    </div>
                    <div>
                      <span>Signal / Battery :</span>
                      <span>
                        RSSI {beacon.rssi} | Tx {beacon.txPower} | Battery{" "}
                        {beacon.batteryLevel}%
                      </span>
                    </div>
                    <div>
                      <span>Status :</span>
                      <span>{beacon.status}</span>
                    </div>
                    <div>
                      <span>Select Date :</span>
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="yyyy-MM-dd"
                        className={styles.datePicker}
                      />
                    </div>
                  </div>
                ) : (
                  <p>No device info available</p>
                )}
              </div>

              <div className={styles.chartCard}>
                <h3>Operational Activity</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={logs}>
                    <XAxis dataKey="log_date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="hours_worked"
                      stroke="#21e065"
                      fill="rgba(21, 232, 32, 0.3)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.hoursCard}>
                <h3>WORKING HOURS TODAY</h3>
                <div className={styles.rings}>
                  <div className={styles.ringA} />
                  <div className={styles.ringB} />
                  <div className={styles.ringC} />
                  <div className={styles.hoursCenter}>
                    <div className={styles.hoursNumber}>
                      {String(todayHours).padStart(2, "0")}
                    </div>
                    <div className={styles.hoursLabel}>HOURS</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ROW 3: Map */}
            {/* ROW 3: Map */}
            <section className="mb-3 p-4">
              <h3>Live Machine Location</h3>
              {location?.latitude && location?.longitude ? (
                <MapContainer
                  key={id} // ✅ ensures Leaflet fully remounts when machine changes
                  center={[location.latitude, location.longitude]} // ✅ dynamic center
                  zoom={18}
                  zoomSnap={0}
                  zoomDelta={0.25}
                  style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                >
                  {/* Base OSM */}
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={22}
                  />

                  {/* Overlay sketch image (background) */}
                  <ImageOverlay url={"/Sketch.png"} bounds={bounds} opacity={0.7} />

                  {/* Gateway polygon */}
                  <Polygon
                    positions={gatewayCoordsArray}
                    pathOptions={{ color: "red", fillColor: "orange", fillOpacity: 0.05 }}
                  />

                  {/* Google map layers */}
                  <LayersControl position="topright">
                    <BaseLayer checked name="Google Street">
                      <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                        url="http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                      />
                    </BaseLayer>

                    <BaseLayer name="Google Satellite">
                      <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                        url="http://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                      />
                    </BaseLayer>

                    <BaseLayer name="Google Hybrid">
                      <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                        url="http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                      />
                    </BaseLayer>

                    <BaseLayer name="Google Terrain">
                      <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                        url="http://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                      />
                    </BaseLayer>
                  </LayersControl>

                  {/* Gateway markers */}
                  {Object.keys(gatewayCoords).map((gatewayId) => {
                    const gateway = gatewayCoords[gatewayId];
                    if (!gateway) return null;

                    const redIcon = L.divIcon({
                      className: "custom-red-marker",
                      html: `<div style="
            background-color: red;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
          ">${gateway.label}</div>`,
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    });

                    return (
                      <Marker
                        key={gatewayId}
                        position={[gateway.lat, gateway.lon]}
                        icon={redIcon}
                      >
                        <Popup>{gatewayId}</Popup>
                      </Marker>
                    );
                  })}

                  {/* Machine marker */}
                  <Marker position={[location.latitude, location.longitude]}>
                    <Popup>
                      Machine is here 🏗️ <br />
                      {resolvedAddress || `${location.latitude}, ${location.longitude}`}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p>No location available</p>
              )}
            </section>

          </>
        )}
      </main>

      <footer
        className={`app-footer text-center ${collapsed ? "footer-collapsed" : "footer-expanded"
          }`}
      >
        © {new Date().getFullYear()} Designed and Developed by{" "}
        <strong>Milieu</strong>. All rights reserved.
      </footer>
    </div>
  );
}

export default MachineDetails;
