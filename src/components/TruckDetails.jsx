import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./TruckDetails.module.css";
import { FaBell } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { Polyline } from "react-leaflet";
import {
  IoLocationOutline,
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
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";

const API_URL =
  process.env.REACT_APP_API_URL || "https://trackingbackend-v23j.onrender.com";

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Polygon helpers
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
      p3[0] * (p1[1] - p2[1])) /
    2
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
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openTile, setOpenTile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routePath, setRoutePath] = useState([]);


  // Theme state
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

  // Quarry boundary
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
    [15.586281, 79.82197],
    [15.585024, 79.822357],
  ];

  // Reusable fetch function
  const fetchTruckData = (date = selectedDate) => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/trucks/${id}?date=${date.toISOString().split("T")[0]}`)
      .then((res) => {
        setLogs(res.data.logs || []);
        setTracker(res.data.tracker?.[0] || null);
        setLocation(res.data.location || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching truck data:", err);
        setLoading(false);
      });
  };
  const fetchRoutePath = (date = selectedDate) => {
    axios
      .get(`${API_URL}/api/trucks/${id}/route?date=${date.toISOString().split("T")[0]}`)
      .then((res) => {
        setRoutePath(
          res.data.route.map((p) => [p.lat, p.lng])
        );
      })
      .catch((err) => console.error("Route path fetch error:", err));
  };

  const fetchTruckDataByDate = async (date) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/trucks/${id}/by-date?date=${date}`
    );

    const data = response.data;

    setLogs(data.logs || []);
    setTracker(data.latestTracker || null);

    setRoutePath(
      data.routePath?.map((p) => [p.latitude, p.longitude]) || []
    );

  } catch (error) {
    console.error("Error fetching truck data for date:", error);
  }
};



  useEffect(() => {
    fetchRoutePath();
  }, [id, selectedDate]);


  // Initial fetch + auto-refresh every 30 seconds
  useEffect(() => {
    console.log("Fetching truck details for ID:", id);
    setTruck(null);
    setLogs([]);
    setTracker(null);
    setLocation(null);
    setLoading(true);

    // Initial truck info fetch
    axios
      .get(`${API_URL}/api/trucks/${id}`)
      .then((res) => {
        setTruck(res.data.truck);
        setLogs(res.data.logs || []);
        setTracker(res.data.tracker?.[0] || null);
        setLocation(res.data.location || null);
        setTimeout(() => setLoading(false), 500);
      })
      .catch((err) => {
        console.error("Error fetching truck details:", err);
        setLoading(false);
      });

    // Auto-refresh interval
    const interval = setInterval(() => {
      fetchTruckData();
    }, 30000);

    return () => clearInterval(interval); // cleanup on unmount
  }, [id]);

  // Handle date change
  const handleDateChange = (date) => {
  setSelectedDate(date);

  const formatted = date.toISOString().split("T")[0]; // yyyy-mm-dd
  fetchTruckDataByDate(formatted);
};


  // Reverse geocoding
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

  const latestLog = logs.length ? logs[logs.length - 1] : null;
  const todayHours = latestLog ? latestLog.hours_worked : 0;
  const currentLocation =
    resolvedAddress ||
    latestLog?.current_location ||
    location?.current_location ||
    "N/A";

  const isInside =
    tracker?.latitude && tracker?.longitude
      ? isPointInside([tracker.latitude, tracker.longitude], quarryBoundaryLatLng)
      : false;

  const toggleTile = (key) => setOpenTile((p) => (p === key ? null : key));
  const handleLogout = () => navigate("/");

  return (
    <div className={`${styles.applayout} ${theme === "light" ? styles.light : styles.dark}`}>
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
          <div className={styles.loaderWrapper}>
            <div className={styles.loading}>Loading truck details...</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.leftHead}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                  <IoArrowBack size={16} />
                  <span>Back</span>
                </button>
                <button className={styles.badgeTab}>TRUCK INFO</button>
              </div>

              <div className={styles.rightHead}>
                <div className={styles.notification}>
                  <span className={styles.badge}>5</span>
                  <FaBell />
                </div>
                <button
                  onClick={toggleTheme}
                  className={styles.themeToggle}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
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

            {/* ROW 1: Hero and Stats */}
            <section className={styles.rowOne}>
              <div className={styles.heroCard}>
                <div className={styles.heroText}>
                  <h1 className={styles.heroName}>{truck?.name}</h1>
                  <span className={styles.rolePill}>{truck?.role}</span>
                  <p className={styles.heroDesc}>{truck?.description}</p>
                </div>

                <img
                  src={`${API_URL}${truck?.image_url || "/uploads/placeholder.jpg"}`}
                  alt={truck?.name}
                  className={styles.heroImg}
                  onError={(e) =>
                    (e.currentTarget.src = `${API_URL}/uploads/placeholder.jpg`)
                  }
                />
                <div className={styles.heroGlow} />
              </div>

              <div className={styles.statStack}>
                <div
                  className={`${styles.statTile} ${openTile === "loc" ? styles.open : ""}`}
                  onClick={() => toggleTile("loc")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <IoLocationOutline className={styles.tileIcon} />
                      <span className={styles.tileTitle}>CURRENT LOCATION</span>
                    </div>
                    {openTile === "loc" ? <IoChevronUp /> : <IoChevronDown />}
                  </div>
                  {openTile === "loc" && <div className={styles.tileContent}>{currentLocation}</div>}
                </div>

                <div
                  className={`${styles.statTile} ${openTile === "cond" ? styles.open : ""}`}
                  onClick={() => toggleTile("cond")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <span className={styles.tileIcon}>⚙️</span>
                      <span className={styles.tileTitle}>CONDITION</span>
                    </div>
                    {openTile === "cond" ? <IoChevronUp /> : <IoChevronDown />}
                  </div>
                  {openTile === "cond" && (
                    <div className={styles.tileContent}>
                      {tracker?.event_type === "movement"
                        ? "Working"
                        : tracker?.event_type === "idle"
                          ? "Idle"
                          : "N/A"}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ROW 2: Info Cards */}
            <section className={styles.rowTwo}>
              <div className={styles.infoCard}>
                <h3>Truck Data Info</h3>
                <div className={styles.infoGrid}>
                  <div><span>Latitude:</span><span>{tracker?.latitude}</span></div>
                  <div><span>Longitude:</span><span>{tracker?.longitude}</span></div>
                  <div><span>Altitude:</span><span>{tracker?.altitude} m</span></div>
                  <div><span>Speed:</span><span>{tracker?.speed_kmph} km/h</span></div>
                  <div><span>Heading:</span><span>{tracker?.heading_degrees}°</span></div>
                  <div><span>Ignition:</span><span>{tracker?.ignition ? "ON" : "OFF"}</span></div>
                  <div><span>Event:</span><span>{tracker?.event_type} - {tracker?.event_description}</span></div>
                  <div><span>Geofence:</span><span>{!isInside ? "🚨 Outside" : "✅ Inside"}</span></div>
                </div>
              </div>

              <div className={styles.infoCard}>
                <h3>Tracker Location Device</h3>
                <div className={styles.infoGrid}>
                  <div><span>Device ID:</span><span>{tracker?.device_id}</span></div>
                  <div><span>Timestamp:</span><span>{tracker ? new Date(tracker.timestamp).toLocaleString() : "N/A"}</span></div>
                  <div><span>Battery:</span><span>{tracker?.battery_level}%</span></div>
                  <div><span>Signal:</span><span>{tracker?.signal_strength}</span></div>
                  <div><span>GPS Fix:</span><span>{tracker?.gps_fix ? "Yes" : "No"}</span></div>
                  <div><span>Date:</span>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className={styles.datePicker}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.hoursCard}>
                <h3>WORKING HOURS TODAY</h3>
                <div className={styles.rings}>
                  <div className={styles.ringA} />
                  <div className={styles.ringB} />
                  <div className={styles.ringC} />
                  <div className={styles.hoursCenter}>
                    <div className={styles.hoursNumber}>{String(todayHours).padStart(2, "0")}</div>
                    <div className={styles.hoursLabel}>HOURS</div>
                  </div>
                </div>
              </div>
            </section>

            {/* MAP */}
            <div className="p-3 mb-5">
              <h6 style={{ color: "white" }}>Live Truck Location</h6>

              {tracker && tracker.latitude && tracker.longitude ? (
                <div style={{ height: "400px", width: "100%" }}>
                  <MapContainer
                    center={[tracker.latitude, tracker.longitude]}
                    zoom={18}
                    zoomSnap={0}
                    zoomDelta={0.25}  // Zoom-in VERY close (near building level)
                    style={{ height: "100%", width: "100%", borderRadius: "10px" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={22}
                    />
                    {/* -------- BASE LAYER (Satellite) -------- */}
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles © Esri — Source: Esri, Earthstar Geographics, Maxar'
                    />

                    {/* -------- NEW LAYER (Roads + Labels like Google Maps) -------- */}
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      opacity={0.75}   // Slight transparency so it merges with satellite
                    />

                    {/* Quarry boundary */}
                    <Polygon positions={quarryBoundaryLatLng} pathOptions={{ color: "red" }} />

                    {/* Route Path in BLACK */}
                    {routePath.length > 1 && (
                      <Polyline positions={routePath} color="black" weight={4} />
                    )}

                    {/* Truck Marker */}
                    <Marker position={[tracker.latitude, tracker.longitude]}>
                      <Popup>
                        Truck is here 🚚 <br />
                        {resolvedAddress || `${tracker.latitude}, ${tracker.longitude}`}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <p style={{ color: "black" }}>Location not available</p>
              )}
            </div>

          </>
        )}
      </main>

      <div className="mt-2">
        <footer
          className={`app-footer text-center ${collapsed ? "footer-collapsed" : "footer-expanded"}`}
        >
          © {new Date().getFullYear()} Designed and Developed by <strong>Milieu</strong>. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default TruckDetails;
