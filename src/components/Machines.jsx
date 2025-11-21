import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Machines.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import axios from "axios";
import "../App.css";

const API_URL = "https://trackingbackend-v23j.onrender.com";

const resolveImage = (url) => {
  if (!url) return `${API_URL}/uploads/placeholder.jpg`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

function Machines() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // theme
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

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    image: null,
    deviceId: "",
  });

  // Fetch machines from backend
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/machines`)
      .then((res) => {
        const normalized = (res.data || []).map((m) => ({
          ...m,
          id: m.id || m._id,
        }));
        setMachines(normalized);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching machines:", err);
        setLoading(false);
      });
  }, []);

  const filteredMachines = machines.filter(
    (machine) =>
      (machine?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (machine?.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => navigate("/");

  // ✅ Input handler supports both text and file
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Submit form using FormData (for image upload)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        fd.append(key, formData[key]);
      });

      await axios.post(`${API_URL}/machines`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      setFormData({
        name: "",
        role: "",
        description: "",
        image: null,
        deviceId: "",
      });

      const res = await axios.get(`${API_URL}/machines`);
      const normalized = (res.data || []).map((m) => ({
        ...m,
        id: m.id || m._id,
      }));
      setMachines(normalized);
    } catch (err) {
      console.error("Error adding machine:", err);
      alert("Error adding machine");
    }
  };

  return (
    <div className={`${styles.applayout} ${theme === "light" ? styles.light : styles.dark}`}>
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
              className={styles.avatar1}
            />
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
                onClick={() => setShowModal(true)}
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

          {loading ? (
            <div className={styles.loading}>Loading machines...</div>
          ) : (
            <div className={styles.cards}>
              {filteredMachines.map((machine) => (
                <div
                  key={machine.id}
                  className={styles.card}
                  onClick={() => navigate(`/machines/${machine.id}`)}
                >
                  <div className={styles.profileHeader}>
                    <img
                      src={resolveImage(machine.image)}
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
              {!filteredMachines.length && (
                <div className={styles.emptyState}>
                  No machines match “{searchTerm}”.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add Machine</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                name="name"
                placeholder="Machine Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="role"
                placeholder="Role"
                value={formData.role}
                onChange={handleChange}
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>

              {/* ✅ File upload instead of URL */}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="deviceId"
                placeholder="Device ID"
                value={formData.deviceId}
                onChange={handleChange}
                required
              />

              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>
                  Save Machine
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelBtn}
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
