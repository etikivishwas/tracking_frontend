import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FiUsers, FiCpu, FiTruck } from "react-icons/fi";
import Sidebar from "./Sidebar";
import "../App.css"; 
import './dashboard.css'

function Dashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => navigate("/");

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
    <>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={handleLogout}
      />

      <main
        className={`app-content ${collapsed ? "content-collapsed" : "content-expanded"} dashboard-root`}
      >
        <Container fluid className="py-5">
          {/* Hero */}
          <header className="dash-hero text-center">
            <h1 className="dash-title">Ops eye</h1>
            <p className="dash-sub">Track your operations in one click</p>
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
                  {/* vignette + glass overlay handled in CSS */}
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
    </>
  );
}

export default Dashboard;
