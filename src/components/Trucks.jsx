import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Trucks.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import Image from "./passport.jpg";
import "../App.css";
import axios from "axios";

function Trucks() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/trucks")
      .then((res) => setTrucks(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => navigate("/");

  return (
    <div className={styles.applayout}>
      {/* Sidebar */}
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
            <h2>Vehicles Management</h2>
          </div>
          <div className={styles.profile}>
            <div className={styles.notification}>
              <span className={styles.badge}>5</span>
              <FaBell />
            </div>
            <img src={Image} alt="User" className={styles.avatar1} />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </div>
        <hr className={styles.horizontal} />

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.topRow}>
            <h3>VEHICLES</h3>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Cards */}
          <div className={styles.cards}>
            {filteredTrucks.map((truck) => (
              <div
                key={truck.id}
                className={styles.card}
                onClick={() => navigate(`/trucks/${truck.id}`)}
              >
                <div className={styles.profileHeader}>
                  <img
                    src={`http://localhost:5050${truck.image_url}`}
                    alt={truck.name}
                    className={styles.avatar}
                  />
                  <div>
                    <h4 className={styles.name}>{truck.name}</h4>
                    <span className={styles.role}>{truck.role}</span>
                  </div>
                </div>
                <p className={styles.description}>{truck.description}</p>
              </div>
            ))}
            {!filteredTrucks.length && (
              <div className={styles.emptyState}>No vehicles found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trucks;
