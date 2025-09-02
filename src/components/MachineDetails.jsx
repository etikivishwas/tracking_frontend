import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./MachineDetails.module.css";
import { FaBell } from "react-icons/fa";
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

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// ✅ Fix default Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const API_URL = process.env.REACT_APP_API_URL || "https://trackingbackend-7fvy.onrender.com";

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

  useEffect(() => {
    axios
      .get(`${API_URL}/machines/${id}`)
      .then((res) => {
        setMachine(res.data.machine);
        setLogs(res.data.logs || []);
        setBeacon(res.data.beacon);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    axios
      .get(
        `${API_URL}/machines/${id}?date=${date.toISOString().split("T")[0]}`
      )
      .then((res) => {
        setLogs(res.data.logs || []);
        setBeacon(res.data.beacon);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (beacon?.latitude && beacon?.longitude) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/reverse?lat=${beacon.latitude}&lon=${beacon.longitude}&format=json`,
          { headers: { "User-Agent": "MachineApp/1.0 (contact@example.com)" } }
        )
        .then((res) => {
          if (res.data?.display_name) setResolvedAddress(res.data.display_name);
        })
        .catch((err) => console.error("Reverse geocoding failed:", err));
    }
  }, [beacon]);

  if (!machine) return <div className={styles.loading}>Loading…</div>;

  const latestLog = logs.length ? logs[logs.length - 1] : null;
  const todayHours = latestLog ? latestLog.hours_worked : 0;
  const currentLocation =
    resolvedAddress ||
    beacon?.location ||
    (latestLog ? latestLog.current_location : "N/A");

  const toggleTile = (key) => setOpenTile((p) => (p === key ? null : key));
  const handleLogout = () => navigate("/");

  return (
    <div className={styles.applayout}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={handleLogout}
      />
      <main
        className={`${styles.appcontent} ${
          collapsed ? styles.contentcollapsed : styles.contentexpanded
        }`}
      >
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
            <img
              src={`${API_URL}/uploads/1.jpg`}
              alt="User"
              className={styles.topAvatar}
            />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </header>

        {/* ROW 1: Hero + Stat dropdowns */}
        <section className={styles.rowOne}>
          {/* Hero Profile */}
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
            />
            <div className={styles.heroGlow} />
          </div>

          {/* Stat Dropdowns */}
          <div className={styles.statStack}>
            {/* Location */}
            <div
              className={`${styles.statTile} ${
                openTile === "loc" ? styles.open : ""
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
              className={`${styles.statTile} ${
                openTile === "cond" ? styles.open : ""
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
                  {latestLog ? latestLog.state : "N/A"}
                </div>
              )}
            </div>

            {/* Coordinates */}
            <div
              className={`${styles.statTile} ${
                openTile === "coords" ? styles.open : ""
              }`}
              onClick={() => toggleTile("coords")}
            >
              <div className={styles.tileHeader}>
                <div className={styles.tileLeft}>
                  <IoCalendarOutline className={styles.tileIcon} />
                  <span className={styles.tileTitle}>LAT, LONG</span>
                </div>
                {openTile === "coords" ? <IoChevronUp /> : <IoChevronDown />}
              </div>
              {openTile === "coords" && (
                <div className={styles.tileContent}>
                  {beacon?.latitude && beacon?.longitude
                    ? `${beacon.latitude}, ${beacon.longitude}`
                    : "N/A"}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ROW 2: Device Info / Chart / Hours */}
        <section className={styles.rowTwo}>
          {/* Device Info */}
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

          {/* Chart */}
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
                  fill="rgba(21, 232, 32, 1)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hours */}
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
        <section className={styles.rowThree}>
          <h3>Live Machine Location</h3>
          {beacon?.latitude && beacon?.longitude ? (
            <MapContainer
              center={[beacon.latitude, beacon.longitude]}
              zoom={13}
              style={{ height: "400px", width: "100%", borderRadius: "12px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[beacon.latitude, beacon.longitude]}>
                <Popup>
                  Machine is here 🏗️ <br />
                  {resolvedAddress ||
                    `${beacon.latitude}, ${beacon.longitude}`}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p>No location available</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default MachineDetails;
