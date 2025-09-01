import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Machines.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch,} from "react-icons/fa";
import Image from "./passport.jpg";
import "../App.css";

const API_URL = "http://localhost:5050"; // ✅ single base URL

function Machines() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [machines, setMachines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMachine, setNewMachine] = useState({
    name: "",
    role: "",
    description: "",
    image: "",
  });

  // ✅ Fetch machines
  const fetchMachines = async () => {
    try {
      const res = await fetch(`${API_URL}/machines`);
      const data = await res.json();
      setMachines(data || []);
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // ✅ Safe filter
  const filteredMachines = machines.filter(
    (machine) =>
      (machine.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (machine.role || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // ✅ Form submit
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
        setNewMachine({ name: "", role: "", description: "", image: "" });
        setShowForm(false);
        fetchMachines(); // reload list
      } else {
        alert("❌ Failed to add machine");
      }
    } catch (err) {
      console.error("Error adding machine:", err);
    }
  };

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

            {/* No results */}
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
