import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./WorkerDetails.module.css";
import { FaBell } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import {
  IoLocationOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoChevronDown,
  IoChevronUp,
  IoArrowBack,
} from "react-icons/io5";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix default Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const API_URL =
  process.env.REACT_APP_API_URL || "https://trackingbackend-7fvy.onrender.com";

function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [worker, setWorker] = useState(null);
  const [logs, setLogs] = useState([]);
  const [openTile, setOpenTile] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

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

  const fetchWorkerData = (date) => {
    setLoading(true);
    const dateQuery = date ? `?date=${date.toISOString().split("T")[0]}` : "";
    axios
      .get(`${API_URL}/api/workers/${id}${dateQuery}`)
      .then((res) => {
        setWorker(res.data.worker);
        setLogs(res.data.logs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkerData(selectedDate);
  }, [id]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchWorkerData(date);
  };

  // Reverse geocoding
  useEffect(() => {
    if (worker?.latitude && worker?.longitude) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/reverse?lat=${worker.latitude}&lon=${worker.longitude}&format=json`
        )
        .then((res) => {
          if (res.data?.display_name) setResolvedAddress(res.data.display_name);
        })
        .catch((err) => console.error("Reverse geocoding failed:", err));
    }
  }, [worker]);

  const todayHours = logs.length ? logs.reduce((a, b) => a + b.hours_worked, 0) : 0;
  const toggleTile = (key) => setOpenTile((p) => (p === key ? null : key));
  const handleLogout = () => navigate("/");

  return (
    <div
      className={`${styles.applayout} ${
        theme === "light" ? styles.light : styles.dark
      }`}
    >
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
          <div className={styles.loading}>Loading worker details...</div>
        ) : (
          <>
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.leftHead}>
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                  <IoArrowBack size={16} />
                  <span>Back</span>
                </button>
                <button className={styles.badgeTab}>WORKER INFO</button>
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
                <span className={styles.username}>Person Name</span>
              </div>
            </header>

            {/* ROW 1 */}
            <section className={styles.rowOne}>
              <div className={styles.heroCard}>
                <div className={styles.heroText}>
                  <h1 className={styles.heroName}>{worker.name}</h1>
                  <span className={styles.rolePill}>{worker.role}</span>
                  <p className={styles.heroDesc}>{worker.description}</p>
                </div>

                <img
                  src={`${API_URL}${worker.image_url}`}
                  alt={worker.name}
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
                  {openTile === "loc" && (
                    <div className={styles.tileContent}>
                      {resolvedAddress ||
                        (worker.latitude && worker.longitude
                          ? `${worker.latitude}, ${worker.longitude}`
                          : "Unknown")}
                    </div>
                  )}
                </div>

                <div
                  className={`${styles.statTile} ${openTile === "days" ? styles.open : ""}`}
                  onClick={() => toggleTile("days")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <IoCalendarOutline className={styles.tileIcon} />
                      <span className={styles.tileTitle}>DAYS WORKED</span>
                    </div>
                    {openTile === "days" ? <IoChevronUp /> : <IoChevronDown />}
                  </div>
                  {openTile === "days" && (
                    <div className={styles.tileContent}>28 Days</div>
                  )}
                </div>

                <div
                  className={`${styles.statTile} ${openTile === "att" ? styles.open : ""}`}
                  onClick={() => toggleTile("att")}
                >
                  <div className={styles.tileHeader}>
                    <div className={styles.tileLeft}>
                      <IoPeopleOutline className={styles.tileIcon} />
                      <span className={styles.tileTitle}>ATTENDANCE</span>
                    </div>
                    {openTile === "att" ? <IoChevronUp /> : <IoChevronDown />}
                  </div>
                  {openTile === "att" && (
                    <div className={styles.tileContent}>{worker.attendance}%</div>
                  )}
                </div>
              </div>
            </section>

            {/* ROW 2 */}
            <section className={styles.rowTwo}>
              <div className={styles.infoCard}>
                <h3>Information</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <span>ID NO :</span>
                    <span>{worker.id || worker._id}</span>
                  </div>
                  <div>
                    <span>Gender :</span>
                    <span>{worker.gender}</span>
                  </div>
                  <div>
                    <span>Phone Number :</span>
                    <span>{worker.phone}</span>
                  </div>
                  <div>
                    <span>Age :</span>
                    <span>{worker.age} years</span>
                  </div>
                  <div>
                    <span>Date of Join :</span>
                    <span>
                      {worker.date_of_join
                        ? new Date(worker.date_of_join).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span>Blood Group :</span>
                    <span>{worker.blood_group}</span>
                  </div>
                  <div>
                    <span>Height :</span>
                    <span>{worker.height} cm</span>
                  </div>
                  <div>
                    <span>Weight :</span>
                    <span>{worker.weight} kgs</span>
                  </div>
                </div>
                <div className={styles.datePickerWrapper}>
                  <span>Select Date :</span>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    className={styles.datePicker}
                  />
                </div>
                <button className={styles.editBtn}>EDIT PROFILE</button>
              </div>

              <div className={styles.chartCard}>
                <h3>TODAY ACTIVES</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={logs}>
                    <XAxis dataKey="work_date" />
                    <YAxis domain={[0, 12]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="hours_worked"
                      stroke="#21e065"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
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

            {/* ROW 3 */}
            <section className="mb-3 p-4">
              <h3>Live Worker Location</h3>
              {worker?.latitude && worker?.longitude ? (
                <MapContainer
                  center={[worker.latitude, worker.longitude]}
                  zoom={13}
                  style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[worker.latitude, worker.longitude]}>
                    <Popup>
                      {worker.name} is here 👷 <br />
                      {resolvedAddress || `${worker.latitude}, ${worker.longitude}`}
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
        className={`app-footer text-center ${
          collapsed ? "footer-collapsed" : "footer-expanded"
        }`}
      >
        © {new Date().getFullYear()} Designed and Developed by <strong>Milieu</strong>. All rights reserved.
      </footer>
    </div>
  );
}

export default WorkerDetails;
