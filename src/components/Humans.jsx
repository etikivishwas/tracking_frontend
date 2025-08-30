import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Humans.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import axios from "axios"; 
import "../App.css";

const API_URL = "http://localhost:5050"; 

const resolveImage = (url) => {
  if (!url) return `${API_URL}/uploads/placeholder.jpg`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

function Humans() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/workers`)
      .then((res) => {
        setWorkers(res.data || []);
        
      })
      .catch((err) => {
        console.error("Error fetching workers:", err);
       
      });
  }, []);

  const filteredWorkers = workers.filter(
    (worker) =>
      (worker?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker?.role || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>Workers Management</h2>
          </div>
          <div className={styles.profile}>
            <div className={styles.notification}>
              <span className={styles.badge}>5</span>
              <FaBell />
            </div>
            <img
              src={`${API_URL}/uploads/1.jpg`}
              alt="User"
              className={styles.avatar}
            />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </div>


        {/* Content */}
        <div className={styles.content} >
          <div className={styles.topRow}>
            <h3 className={styles.sectionTitle}>WORK FORCE</h3>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.cards}>
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id || worker._id}
                className={styles.card}
                onClick={() => navigate(`/workers/${worker.id || worker._id}`)}
              >
                <div className={styles.profileHeader}>
                  <img
                    src={resolveImage(worker.image_url)}
                    alt={worker.name}
                    className={styles.cardAvatar}
                    onError={(e) =>
                      (e.currentTarget.src = `${API_URL}/uploads/placeholder.jpg`)
                    }
                  />
                  <div>
                    <h4 className={styles.name}>{worker.name}</h4>
                    <span className={styles.role}>{worker.role}</span>
                  </div>
                </div>
                <p className={styles.description}>{worker.description}</p>
              </div>
            ))}
            {!filteredWorkers.length && (
              <div className={styles.emptyState}>
                No workers match “{searchTerm}”.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Humans;
