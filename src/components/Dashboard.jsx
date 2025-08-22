import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./Sidebar";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => navigate("/");

  return (
    <>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onLogout={handleLogout}
      />

      <main
        className={`app-content ${
          collapsed ? "content-collapsed" : "content-expanded"
        }`}
      >
        <Container fluid className="py-4">
          <h2 className="mb-4 text-center">Mining Admin Dashboard</h2>

          <Row className=" mt-3 g-4 justify-content-center">
            <Col xs={12} sm={6} md={4}>
              <div
                className="dashboard-tile"
                onClick={() => navigate("/humans")}
                style={{ backgroundImage: `url('/image/workers.jpg')` }}
              >
                <div className="tile-overlay">
                  <h3>Workers</h3>
                  <p>Track and manage workforce</p>
                </div>
              </div>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <div
                className="dashboard-tile"
                onClick={() => navigate("/machines")}
                style={{ backgroundImage: `url('/image/Mining.jpg')` }}
              >
                <div className="tile-overlay">
                  <h3>Machines</h3>
                  <p>Monitor mining machines</p>
                </div>
              </div>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <div
                className="dashboard-tile"
                onClick={() => navigate("/trucks")}
                style={{ backgroundImage: `url('/image/Trucks.webp')` }}
              >
                <div className="tile-overlay">
                  <h3>Trucks</h3>
                  <p>Track fleet operations</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

export default Dashboard;
