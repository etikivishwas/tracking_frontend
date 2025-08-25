import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Trucks.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import Image from './passport.jpg'
import "../App.css";
import axios from "axios";

function Trucks() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [truck, setTruck] = useState([]);

  useEffect(() => {
      axios.get("http://localhost:5000/api/trucks")
        .then(res => setTruck(res.data))
        .catch(err => console.error(err));
    }, []);

  const filteredTrucks = truck.filter(truck =>
    truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    truck.role.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
          <div className={styles.title}>
            <h2>Vehicles Management</h2>
          </div>
          <div className={styles.profile}>
            <div className={styles.notification}>
              <span className={styles.badge}>5</span>
              <FaBell />
            </div>
            <img
              src={Image}
              alt="User"
              className={styles.avatar1}
            />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </div>
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
          <div className={styles.cards}>
            {filteredTrucks.map(truck => (
              <div 
                key={truck.id} 
                className={styles.card}
                onClick={() => navigate(`/trucks/${truck.id}`)} // 🔥 Navigate to TruckDetails
              >
                <div className={styles.profileHeader}>
                  <img
                    src={`http://localhost:5000${truck.image_url}`}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trucks;
