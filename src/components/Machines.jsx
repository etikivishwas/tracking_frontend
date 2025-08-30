import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Machines.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import Image from "./passport.jpg";
import "../App.css";

const API_URL = "http://localhost:5050"; // ✅ single base URL

function Machines() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [machines, setMachines] = useState([]);

  // ✅ Fetch machines from backend
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await fetch(`${API_URL}/machines`);
        const data = await res.json();
        setMachines(data || []);
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
    };

    fetchMachines();
  }, []);

  // ✅ Safe filter by search term
  const filteredMachines = machines.filter(
    (machine) =>
      (machine.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (machine.role || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
            <h2>Machine Management</h2>
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
            <h3>MACHINES</h3>
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

          {/* Machine cards */}
          <div className={styles.cards}>
            {filteredMachines.map((machine) => (
              <div
                key={machine.id || machine._id}
                className={styles.card}
                onClick={() =>
                  navigate(`/machines/${machine.id || machine._id}`)
                }
              >
                <div className={styles.profileHeader}>
                  <img
                    src={
                      machine.image?.startsWith("http")
                        ? machine.image
                        : `${API_URL}${machine.image}`
                    }
                    alt={machine.name}
                    className={styles.avatar}
                  />
                  <div>
                    <h4 className={styles.name}>{machine.name}</h4>
                    <span className={styles.role}>{machine.role}</span>
                  </div>
                </div>
                <p className={styles.description}>
                  {machine.description || "No description available"}
                </p>
              </div>
            ))}

            {/* If no results */}
            {filteredMachines.length === 0 && (
              <p className={styles.noData}>No machines found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Machines;
