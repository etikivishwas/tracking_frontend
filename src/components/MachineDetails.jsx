import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./MachineDetails.module.css";
import { FaBell } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function MachineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [machine, setMachine] = useState(null);
  const [logs, setLogs] = useState([]);
  const [beacon, setBeacon] = useState(null);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Initial fetch (default latest data)
  useEffect(() => {
    axios
      .get(`http://localhost:5000/machines/${id}`)
      .then((res) => {
        setMachine(res.data.machine);
        setLogs(res.data.logs);
        setBeacon(res.data.beacon);
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Handle calendar date change
  const handleDateChange = (date) => {
    setSelectedDate(date);

    axios
      .get(
        `http://localhost:5000/machines/${id}?date=${
          date.toISOString().split("T")[0]
        }`
      )
      .then((res) => {
        setLogs(res.data.logs);
        setBeacon(res.data.beacon);
      })
      .catch((err) => console.error(err));
  };

  if (!machine) return <p>Loading...</p>;

  const latestLog = logs.length ? logs[logs.length - 1] : null;
  const todayHours = logs.length ? logs[logs.length - 1].hours_worked : 0;

  // ✅ Prefer beacon location, else fallback to log location
  const currentLocation =
    beacon?.location ||
    (latestLog ? latestLog.current_location : "N/A");

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
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.head1}>
            <h2>Machine Management</h2>
          </div>
          <div className={styles.profile}>
            <div className={styles.notification}>
              <span className={styles.badge}>5</span>
              <FaBell />
            </div>
            <img
              src="http://localhost:5000/uploads/1.jpg"
              alt="User"
              className={styles.avatar}
            />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </div>
        <hr className={styles.horizontal} />

        {/* Machine details */}
        <div className={styles.container1}>
          <div>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
              ⬅ Back
            </button>
          </div>
          <div className={styles.content}>
            <div className={styles.profileCard}>
              <div>
                <h3>{machine.name}</h3>
                <span className={styles.role}>{machine.role}</span>
                <p>{machine.description}</p>
              </div>
              <img
                src={`http://localhost:5000${machine.image}`}
                alt={machine.name}
                className={styles.avatarBig}
              />
            </div>

            <div className={styles.info}>
              {/* ✅ Location (Beacon > Logs > N/A) */}
              <div className={styles.card}>
                <div className={styles.row}>
                  <span className={styles.round1}></span>
                  <IoLocationOutline className={styles.icon} />
                  <p className={styles.title}>CURRENT LOCATION</p>
                </div>
                <p className={styles.value1}>{currentLocation}</p>
              </div>

              {/* Condition */}
              <div className={styles.card}>
                <div className={styles.row}>
                  <span className={styles.round2}></span>
                  <p className={styles.title}>CONDITION</p>
                </div>
                <p className={styles.value2}>
                  {latestLog ? latestLog.state : "N/A"}
                </p>
              </div>
              <div className={styles.card}>
                <div className={styles.row}>
                  <p className={styles.title}>LATITUDE, LONGITUDE</p>
                </div>
                <p className={styles.value3}>
                  {beacon?.latitude && beacon?.longitude
                    ? `${beacon.latitude}, ${beacon.longitude}`
                    : latestLog?.latitude && latestLog?.longitude
                    ? `${latestLog.latitude}, ${latestLog.longitude}`
                    : "N/A"}
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
                    stroke="green"
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

        {/* Beacon + Chart (side by side) */}
        <div className={styles.container2}>
          {/* Left - Beacon */}
          <div className={styles.beaconSection}>
            {beacon ? (
              <>
                <div className={styles.beaconCard}>
                  <p className={styles.para}>Beacon ID</p>
                  <p className={styles.para2}>{beacon.deviceId}</p>
                </div>
                <div className={styles.beaconCard}>
                  <p className={styles.para}>Timestamp</p>
                  <p className={styles.para2}>{beacon.timestamp}</p>
                </div>
                <div className={styles.beaconCard}>
                  <p className={styles.para}>Accelerometer (X,Y,Z)</p>
                  <p className={styles.para2}>
                    {beacon.accel_x}, {beacon.accel_y}, {beacon.accel_z}
                  </p>
                </div>
                <div className={styles.beaconCard}>
                  <p className={styles.para}>Signal / Battery</p>
                  <p className={styles.para2}>
                    RSSI: {beacon.rssi} | TxPower: {beacon.txPower} | Battery:{" "}
                    {beacon.batteryLevel}%
                  </p>
                </div>
                <div className={styles.beaconCard}>
                  <p className={styles.para}>Status</p>
                  <p className={styles.para2}>{beacon.status}</p>
                </div>

                {/* Calendar */}
                <div className={styles.trackerCalendar}>
                  <p className={styles.title}>Select Date</p>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    className={styles.datePicker}
                  />
                </div>
              </>
            ) : (
              <p>No beacon data available</p>
            )}
          </div>

          {/* Right - Chart */}
          <div className={styles.chartSection}>
            <h6>Operational Activity</h6>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={logs}>
                <XAxis
                  dataKey="log_date"
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
                  dataKey="hours_worked"
                  stroke="green"
                  fill="rgba(21, 232, 32, 1)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MachineDetails;
