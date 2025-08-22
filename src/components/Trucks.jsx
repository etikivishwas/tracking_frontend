import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Sidebar from "./Sidebar.jsx";
import "../App.css";

function Trucks() {
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

      <main className={`app-content ${collapsed ? "content-collapsed" : "content-expanded"}`}>
        <Container fluid className="py-4">
          <Row className="align-items-center mb-3">
            <Col><h2 className="mb-0">Trucks Management</h2></Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => navigate("/trucks/add")}>
                + Add Truck
              </Button>
            </Col>
          </Row>

          {/* Overview */}
          <Row className="g-4">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Fleet Operations Overview</h5>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary">Export</Button>
                    <Button size="sm" variant="outline-secondary">Refresh</Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={3}>
                      <div className="stats-card stats-truck shadow-sm">
                        <h6>Total Trucks</h6>
                        <h2 className="mb-0">30</h2>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stats-card shadow-sm" style={{ background: "#20c997" }}>
                        <h6>In Transit</h6>
                        <h2 className="mb-0">22</h2>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stats-card shadow-sm" style={{ background: "#0d6efd" }}>
                        <h6>At Loading</h6>
                        <h2 className="mb-0">5</h2>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="stats-card shadow-sm" style={{ background: "#6c757d" }}>
                        <h6>Under Maintenance</h6>
                        <h2 className="mb-0">3</h2>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <p className="mb-0">
                    Track live trips, assign drivers, and schedule service. Use “Add Truck” to onboard new vehicles.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Placeholder list/table */}
          <Row className="g-4 mt-1">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header>
                  <h5 className="mb-0">Fleet</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-muted">
                    Table/list of trucks goes here (Truck ID, plate, driver, current status, last location, next service, actions…)
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

export default Trucks;
