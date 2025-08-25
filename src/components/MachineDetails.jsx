import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./MachineDetails.module.css";
import { FaBell } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { LuFuel } from "react-icons/lu";
import { GiWeightScale } from "react-icons/gi";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";


function MachineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [machine, setMachine] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/machines/${id}`)
      .then(res => {
        setMachine(res.data.machine);
        setLogs(res.data.logs);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!machine) return <p>Loading...</p>;

  const latestLog = logs.length ? logs[logs.length - 1] : null;

  const todayHours = logs.length ? logs[logs.length - 1].hours_worked : 0;
  const daysWorked = logs.length;

  const handleLogout = () => navigate("/");

  return (
    <div className={styles.applayout}>
        <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
              />
    <div className={`${styles.appcontent} ${collapsed ? styles.contentcollapsed : styles.contentexpanded}`}>
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
        <div className={styles.container1}>
            <div>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>⬅ Back</button>
            </div>
            <div className={styles.content}>
                <div className={styles.profileCard}>
                    <div>
                        <h3>{machine.name}</h3>
                        <span className={styles.role}>{machine.role}</span>
                        <p>{machine.description}</p>
                        </div>
                        <img src={`http://localhost:5000${machine.image}`} alt={machine.name} className={styles.avatarBig} />
                    </div>  
                <div className={styles.info}>
                    <div className={styles.card}>
                        <div className={styles.row}>
                        <span className={styles.round1}></span>
                        <IoLocationOutline className={styles.icon} />
                        <p className={styles.title}>CURRENT LOCATION</p>
                        </div>
                        <p className={styles.value1}>{latestLog ? latestLog.current_location : "N/A"}</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <span className={styles.round2}></span>
                            <p className={styles.title}>CONDUCTION</p>
                        </div>
                        <p className={styles.value2}>{latestLog ? latestLog.state : "N/A"}</p>
                    </div>
                </div>
                <div className={styles.infoBox}>
                    <h4>Working Hours Today</h4>
                    <div className={styles.progressCircle}>
                        <svg width="100" height="100">
                        <circle cx="50" cy="50" r="45" stroke="#eee" strokeWidth="10" fill="none" />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="rgb(139, 31, 139)"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - todayHours / 15)}
                            transform="rotate(-90 50 50)"
                        />
                        </svg>
                        <span className={styles.circleText}>{todayHours} Hrs</span>
                    </div>
                </div>
            </div>
        </div>
        <div className={styles.container2}>
            <div className={styles.fuel}>
                <LuFuel className={styles.icon1} />
                <p className={styles.para}>Fuel Consumption</p>
                <p className={styles.para2}>{latestLog ? latestLog.fuel_consumption : "N/A"} Ltr</p>
            </div>
            <div className={styles.weight}>
                <GiWeightScale className={styles.icon1} />
                <p className={styles.para}>Material Processed</p>
                <p className={styles.para2}>{latestLog ? latestLog.material_processed : "N/A"} Tons</p>
            </div>
            <div className={styles.chartSection}>
                <h6>Operational Activity</h6>
                <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={logs}>
                        <XAxis 
                            dataKey="log_date" 
                            tickFormatter={(time) => new Date(time).toLocaleDateString("en-US", { weekday: "short" })} 
                        />
                        <YAxis />
                        <Tooltip />
                        <Area 
                            type="monotone" 
                            dataKey="hours_worked" 
                            stroke="rgb(139, 31, 139)"            
                            fill="rgb(139, 31, 139)"              
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
