import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Trucks.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import Image from "./passport.jpg";
import "../App.css";
import axios from "axios";

const API_URL = "http://localhost:5050"; // update when deployed

function Trucks() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [trucks, setTrucks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    image: null,
  });

  // Fetch trucks
  useEffect(() => {
    axios
      .get(`${API_URL}/api/trucks`)
      .then((res) => setTrucks(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredTrucks = trucks.filter(
    (truck) =>
      (truck.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (truck.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => navigate("/");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        fd.append(key, formData[key]);
      });

      await axios.post(`${API_URL}/api/trucks`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      setFormData({ name: "", role: "", description: "", image: null });

      const res = await axios.get(`${API_URL}/api/trucks`);
      setTrucks(res.data || []);
    } catch (err) {
      console.error("Error adding truck:", err);
    }
  };

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
            <div className={styles.topActions}>
              <button
                className={styles.addButton}
                onClick={() => setShowModal(true)}
              >
                + Add Truck
              </button>
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
                    src={`${API_URL}${truck.image_url}`}
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
              <div className={styles.noData}>No vehicles found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Add Truck</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                name="name"
                placeholder="Truck Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="role"
                placeholder="Type / Role"
                value={formData.role}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              <input
                type="file"
                name="image"
                onChange={handleChange}
              />
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveBtn}>
                  Save
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
    </div>
  );
}

export default Trucks;
