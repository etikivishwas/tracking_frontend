import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FiUsers, FiCpu, FiTruck, FiSun, FiMoon } from "react-icons/fi";
import Sidebar from "./Sidebar";
import "../App.css";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Theme: 'dark' or 'light'
  const [theme, setTheme] = useState(() => {
    // initialize from localStorage if exists
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

  const handleLogout = () => navigate("/");

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const tiles = [
    {
      key: "workers",
      title: "Workers",
      sub: "Track and manage workforce",
      img: "/image/workers.jpg",
      icon: <FiUsers />,
      to: "/humans",
    },
    {
      key: "machines",
      title: "Machines",
      sub: "Monitor mining machines",
      img: "/image/Mining.jpg",
      icon: <FiCpu />,
      to: "/machines",
    },
    {
      key: "trucks",
      title: "Trucks",
      sub: "Track fleet operations",
      img: "/image/Trucks.webp",
      icon: <FiTruck />,
      to: "/trucks",
    },
  ];

  return (
    <div className={`dashboard-layout`}>
      {/* Theme toggle (top-left) */}
      <div className={`theme-toggle-wrap ${theme}`}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
        <div className="theme-badge">
          <span className="theme-badge-dot" />
          <span className="theme-badge-text">{theme === "dark" ? "Dark" : "Light"}</span>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={handleLogout}
      />

  
      <main
        className={`app-content ${collapsed ? "content-collapsed" : "content-expanded"} dashboard-root ${theme === "light" ? "theme-light" : "theme-dark"}`}
      >
        <Container fluid className="py-5">
          {/* Hero */}
          <header className="dash-hero text-center">
            <h1 className="dash-title">Ops eye</h1>
            <p className="dash-sub">Track your operations in one click</p>
            <p>Powered by Milieu</p>
          </header>

          {/* Tiles */}
          <Row className="mt-4 g-4 justify-content-center">
            {tiles.map((t) => (
              <Col key={t.key} xs={12} sm={6} md={4}>
                <button
                  className="dashboard-tile improved"
                  onClick={() => navigate(t.to)}
                  aria-label={t.title}
                  style={{ backgroundImage: `url('${t.img}')` }}
                >
                  <div className="tile-glass">
                    <div className="tile-icon">{t.icon}</div>
                    <h3 className="tile-title">{t.title}</h3>
                    <p className="tile-sub">{t.sub}</p>
                  </div>
                </button>
              </Col>
            ))}
          </Row>
        </Container>
      </main>

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

export default Dashboard;
