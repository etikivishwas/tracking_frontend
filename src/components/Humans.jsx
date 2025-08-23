import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Humans.module.css";
import Sidebar from "./Sidebar";
import { FaBell, FaSearch } from "react-icons/fa";
import Image from './passport.jpg'
import "../App.css";

function Humans() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const workers = [
    { id: 1, name: "Ravi Kumar", role: "Driller", description: "A driller is a skilled professional who operates drill equipment, most commonly in the context of oil and gas or mining operations.", image: Image },
    { id: 2, name: "Anita Sharma", role: "Engineer", description: "Responsible for designing, developing, and maintaining systems in the field.", image: Image },
    { id: 3, name: "Amit Verma", role: "Supervisor", description: "Supervises drilling teams and ensures operations are performed safely and efficiently.", image: Image },
  ];

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h2>Workers Management</h2>
          </div>
          <div className={styles.profile}>
            <div className={styles.notification}>
              <span className={styles.badge}>5</span>
              <FaBell />
            </div>
            <img
              src={Image}
              alt="User"
              className={styles.avatar}
            />
            <span className={styles.username}>Alex Kumar</span>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.topRow}>
            <h3>WORK FORCE</h3>
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
            {filteredWorkers.map(worker => (
                <div key={worker.id} className={styles.card}>
                  <div className={styles.profileHeader}>
                    <img
                      src={worker.image}
                      alt={worker.name}
                      className={styles.avatar}
                    />
                    <div>
                      <h4 className={styles.name}>{worker.name}</h4>
                      <span className={styles.role}>{worker.role}</span>
                    </div>
                  </div>
                  <p className={styles.description}>{worker.description}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Humans;
