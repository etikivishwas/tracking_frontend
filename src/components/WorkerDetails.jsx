import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./WorkerDetails.module.css";
import { FaBell } from "react-icons/fa";
import { IoLocationOutline,IoCalendarOutline, IoPeopleOutline } from "react-icons/io5";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [worker, setWorker] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/workers/${id}`)
      .then(res => {
        setWorker(res.data.worker);
        setLogs(res.data.logs);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!worker) return <p>Loading...</p>;

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
            <h2>Workers Management</h2>
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
                        <h2>{worker.name}</h2>
                        <span className={styles.role}>{worker.role}</span>
                        <p>{worker.description}</p>
                        </div>
                        <img src={`http://localhost:5000${worker.image_url}`} alt={worker.name} className={styles.avatarBig} />
                    </div>  
                <div className={styles.info}>
                    <div className={styles.card}>
                        <div className={styles.row}>
                        <span className={styles.round}></span>
                        <IoLocationOutline className={styles.icon} />
                        <p className={styles.title}>CURRENT LOCATION</p>
                        </div>
                        <p className={styles.value}>Mining Site A</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.row}>
                        <IoCalendarOutline className={styles.icon} />
                        <p className={styles.title}>DAYS WORKED</p>
                        </div>
                        <p className={styles.value}>28</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.row}>
                        <IoPeopleOutline className={styles.icon} />
                        <p className={styles.title}>ATTENDANCE</p>
                        </div>
                        <p className={styles.value}>{worker.attendance}%</p>
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
                            stroke="#007bff"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={2 * Math.PI * 45 * (1 - todayHours / 12)}
                            transform="rotate(-90 50 50)"
                        />
                        </svg>
                        <span className={styles.circleText}>{todayHours} Hrs</span>
                    </div>
                </div>
            </div>
        </div>
        <div className={styles.container2}>
            <div className={styles.details}>
                <h3>Information</h3>

                <div className={styles.infoRow}>
                    <span>ID NO :</span>
                    <span>AP12345679</span>
                </div>

                <div className={styles.infoRow}>
                    <span>Gender :</span>
                    <span>{worker.gender}</span>
                </div>

                <div className={styles.infoRow}>
                    <span>Phone Number :</span>
                    <span>{worker.phone}</span>
                </div>

                <div className={styles.infoRow}>
                    <span>Age :</span>
                    <span>{worker.age} years</span>
                </div>

                <div className={styles.infoRow}>
                    <span>Date of Join :</span>
                    <span>{worker.date_of_join}</span>
                </div>

                <div className={styles.infoRow}>
                    <span>Blood Group :</span>
                    <span>{worker.blood_group}</span>
                </div>

                <div className={styles.infoRow}>
                    <span>Height :</span>
                    <span>{worker.height}</span>
                </div>

                <div className={styles.infoRow}>
                    <span>Weight :</span>
                    <span>{worker.weight}kgs</span>
                </div>

                <button className={styles.editBtn}>EDIT PROFILE</button>
            </div>
            <div className={styles.chartSection}>
                <h3>Work Logs</h3>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={logs}>
                    <XAxis dataKey="work_date" />
                    <YAxis domain={[0, 12]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours_worked" stroke="#007bff" strokeWidth={2} />
                </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
    </div>
  );
}

export default WorkerDetails;
