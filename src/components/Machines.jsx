import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Machines.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import Image from "./passport.jpg";
import "../App.css";

const API_URL = "https://trackingbackend-v23j.onrender.com"; 

function Machines() {   
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true); // loader state
  const [showForm, setShowForm] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: "",
    role: "",
    description: "",
    image: "",
    deviceId: "", // Added deviceId field
  });

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

  // Fetch machines
  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/machines`);
      const data = await res.json();
      setMachines(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching machines:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const filteredMachines = machines.filter(
    (machine) =>
      (machine.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (machine.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/machines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMachine),
      });
      if (res.ok) {
        alert("✅ Machine added successfully!");
        setNewMachine({ name: "", role: "", description: "", image: "", deviceId: "" }); // Reset deviceId
        setShowForm(false);
        fetchMachines();
      } else {
        alert("❌ Failed to add machine");
      }
    } catch (err) {
      console.error("Error adding machine:", err);
    }
  };

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

            {/* Theme toggle button beside the bell */}
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>

            <img src={Image} alt="User" className={styles.avatar1} />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </div>
        <hr className={styles.horizontal} />

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.topRow}>
            <h3 className={styles.sectionTitle}>MACHINES</h3>
            <div className={styles.topActions}>
              <button
                className={styles.addButton}
                onClick={() => setShowForm(true)}
              >
                + Add Machine
              </button>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>

          {/* Loader */}
          {loading ? (
            <div className={styles.loading}>Loading machines...</div>
          ) : (
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
                      onError={(e) =>
                        (e.currentTarget.src = `${API_URL}/uploads/placeholder.jpg`)
                      }
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

              {filteredMachines.length === 0 && (
                <p className={styles.noData}>No machines found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add Machine</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Machine Name"
                value={newMachine.name}
                onChange={(e) =>
                  setNewMachine({ ...newMachine, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={newMachine.role}
                onChange={(e) =>
                  setNewMachine({ ...newMachine, role: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                value={newMachine.description}
                onChange={(e) =>
                  setNewMachine({
                    ...newMachine,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newMachine.image}
                onChange={(e) =>
                  setNewMachine({ ...newMachine, image: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Device ID" // Added input for deviceId
                value={newMachine.deviceId}
                onChange={(e) =>
                  setNewMachine({ ...newMachine, deviceId: e.target.value })
                }
                required
              />

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>
                  Save Machine
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer
        className={`app-footer text-center ${
          collapsed ? "footer-collapsed" : "footer-expanded"
        }`}
      >
        © {new Date().getFullYear()} Designed and Developed by{" "}
        <strong>Milieu</strong>. All rights reserved.
      </footer>
    </div>
  );
}

export default Machines;
