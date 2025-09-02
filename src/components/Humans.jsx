import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Humans.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import axios from "axios";
import "../App.css";

const API_URL = "https://trackingbackend-7fvy.onrender.com"; 

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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    phone: "",
    gender: "",
    age: "",
    blood_group: "",
    date_of_join: "",
    image: null,
  });

  // Fetch workers
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

      await axios.post(`${API_URL}/api/workers`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      setFormData({
        name: "",
        role: "",
        description: "",
        phone: "",
        gender: "",
        age: "",
        blood_group: "",
        date_of_join: "",
        image: null,
      });

      const res = await axios.get(`${API_URL}/api/workers`);
      setWorkers(res.data || []);
    } catch (err) {
      console.error("Error adding worker:", err);
    }
  };

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
        <div className={styles.content}>
          <div className={styles.topRow}>
            <h3 className={styles.sectionTitle}>WORK FORCE</h3>
            <div className={styles.topActions}>
              <button
                className={styles.addButton}
                onClick={() => setShowModal(true)}
              >
                  + Add Worker
              </button>
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
          </div>

          <div className={styles.cards}>
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className={styles.card}
                onClick={() => navigate(`/workers/${worker.id}`)}
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

   
    {showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h3>Add Worker</h3>
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
          placeholder="Full Name"
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
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="gender"
          placeholder="Gender"
          value={formData.gender}
          onChange={handleChange}
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
        />
        <input
          type="text"
          name="blood_group"
          placeholder="Blood Group"
          value={formData.blood_group}
          onChange={handleChange}
        />
        <input
          type="date"
          name="date_of_join"
          value={formData.date_of_join}
          onChange={handleChange}
        />
        <input type="file" name="image" onChange={handleChange} />

        <div className={styles.modalActions}>
          <button type="submit" className={styles.saveBtn}>
            Save Worker
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

export default Humans;
