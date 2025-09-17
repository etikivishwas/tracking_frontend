import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./TruckDetails.module.css";
import { FaBell } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import {
  IoLocationOutline,
  IoChevronDown,
  IoChevronUp,
  IoArrowBack,
} from "react-icons/io5";
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

// polygon helpers (unchanged)
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
    } catch {}
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Quarry boundary polygon (unchanged)
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

  // Fetch truck details
  useEffect(() => {
    console.log("Fetching truck details for ID:", id); // Log the truck ID
    setTruck(null);
    setLogs([]);
    setTracker(null);
    setLocation(null);
    setLoading(true);

    axios
      .get(`${API_URL}/api/trucks/${id}`)
      .then((res) => {
        console.log("API response for truck details:", res.data); // Log the API response
        setTruck(res.data.truck);
        setLogs(res.data.logs || []);
        setTracker(res.data.tracker?.[0] || null); // Use the first tracker object
        setLocation(res.data.location || null);
        setTimeout(() => setLoading(false), 500);
      })
      .catch((err) => {
        console.error("Error fetching truck details:", err); // Log the error
        setLoading(false);
      });
  }, [id]);

  // Date change fetch
  const handleDateChange = (date) => {
    console.log("Fetching truck data for date:", date); // Log the selected date
    setSelectedDate(date);
    setLoading(true);

    axios
      .get(`${API_URL}/api/trucks/${id}?date=${date.toISOString().split("T")[0]}`)
      .then((res) => {
        console.log("API response for truck data on date:", res.data); // Log the API response
        setLogs(res.data.logs || []);
        setTracker(res.data.tracker);
        setLocation(res.data.location);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching truck data for date:", err); // Log the error
        setLoading(false);
      });
  };

  // Reverse Geocoding
  useEffect(() => {
    if (tracker?.latitude && tracker?.longitude) {
      console.log("Performing reverse geocoding for:", tracker.latitude, tracker.longitude); // Log coordinates
      axios
        .get(
          `https://nominatim.openstreetmap.org/reverse?lat=${tracker.latitude}&lon=${tracker.longitude}&format=json`
        )
        .then((res) => {
          console.log("Reverse geocoding response:", res.data); // Log the response
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
        className={`${styles.appcontent} ${
          collapsed ? styles.contentcollapsed : styles.contentexpanded
        }`}
      >
        {loading ? (
          <div className={styles.loaderWrapper}>
            <div className={styles.loading}>Loading truck details...</div>
          </div>
        ) : (
          <>
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

                {/* Theme toggle beside notification */}
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

            {/* ROW 1 */}
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
                {/* Current Location */}
                <div
                  className={`${styles.statTile} ${openTile === "loc" ? styles.open : ""}`}
                  onClick={() => toggleTile("loc")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <IoLocationOutline className={styles.tileIcon} />
                      <span className={styles.tileTitle}>CURRENT LOCATION</span>
                    </div>
                    {openTile === "loc" ? (
                      <IoChevronUp className={styles.tileChevron} />
                    ) : (
                      <IoChevronDown className={styles.tileChevron} />
                    )}
                  </div>
                  {openTile === "loc" && <div className={styles.tileContent}>{currentLocation}</div>}
                </div>

                {/* Condition */}
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
                  {openTile === "cond" && <div className={styles.tileContent}>{latestLog ? latestLog.state : "N/A"}</div>}
                </div>
              </div>
            </section>

            {/* --- ROW 2: Info --- */}
            <section className={styles.rowTwo}>
              {/* Truck Data */}
              <div className={styles.infoCard}>
                <h3>Truck Data Info</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <span>Latitude:</span>
                    <span>{tracker?.latitude}</span>
                  </div>
                  <div>
                    <span>Longitude:</span>
                    <span>{tracker?.longitude}</span>
                  </div>
                  <div>
                    <span>Altitude:</span>
                    <span>{tracker?.altitude} m</span>
                  </div>
                  <div>
                    <span>Speed:</span>
                    <span>{tracker?.speed_kmph} km/h</span>
                  </div>
                  <div>
                    <span>Heading:</span>
                    <span>{tracker?.heading_degrees}°</span>
                  </div>
                  <div>
                    <span>Ignition:</span>
                    <span>{tracker?.ignition ? "ON" : "OFF"}</span>
                  </div>
                  <div>
                    <span>Event:</span>
                    <span>
                      {tracker?.event_type} - {tracker?.event_description}
                    </span>
                  </div>
                  <div>
                    <span>Geofence:</span>
                    <span>{!isInside ? "🚨 Outside" : "✅ Inside"}</span>
                  </div>
                </div>
              </div>

              {/* GPS Tracker Device */}
              <div className={styles.infoCard}>
                <h3>Tracker Location Device</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <span>Device ID:</span>
                    <span>{tracker?.device_id}</span>
                  </div>
                  <div>
                    <span>Timestamp:</span>
                    <span>
                      {tracker
                        ? new Date(tracker.timestamp).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span>Battery:</span>
                    <span>{tracker?.battery_level}%</span>
                  </div>
                  <div>
                    <span>Signal:</span>
                    <span>{tracker?.signal_strength}</span>
                  </div>
                  <div>
                    <span>GPS Fix:</span>
                    <span>{tracker?.gps_fix ? "Yes" : "No"}</span>
                  </div>
                  <div>
                    <span>Date:</span>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className={styles.datePicker}
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours */}
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

            {/* --- Fuel, Weight, Distance Chart --- */}
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
                    <XAxis dataKey="log_time" />
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

            {/* --- MAP --- */}
            <div className="p-3 mb-5">
              <h6 style={{ color: "white" }}>Live Truck Location</h6>
              {tracker && tracker.latitude && tracker.longitude ? ( // Ensure valid coordinates
                <div style={{ height: "400px", width: "100%" }}>
                  <MapContainer
                    center={[tracker.latitude, tracker.longitude]} // Use tracker latitude and longitude
                    zoom={15}
                    style={{
                      height: "100%",
                      width: "100%",
                      borderRadius: "10px",
                    }}
                  >
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='Tiles © Esri — Source: Esri, Earthstar Geographics, Maxar'
                    />
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
          </>
        )}
      </main>

       <div className="mt-2">
             <footer
        className={`app-footer text-center ${
          collapsed ? "footer-collapsed" : "footer-expanded"
        }`}
      >
        © {new Date().getFullYear()} Designed and Developed by{" "}
        <strong>Milieu</strong>. All rights reserved.
      </footer>
        </div>

      
    </div>
  );
}

export default TruckDetails;
