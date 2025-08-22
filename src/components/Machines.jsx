import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Sidebar from "./Sidebar.jsx";
import "../App.css";

function Machines() {
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
          <Row className="align-items-center mb-3">
            <Col><h2 className="mb-0">Machines Management</h2></Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => navigate("/machines/add")}>
                + Add Machine
              </Button>
            </Col>
          </Row>

          {/* Overview */}
          <Row className="g-4">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Mining Equipment Overview</h5>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary">Export</Button>
                    <Button size="sm" variant="outline-secondary">Refresh</Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="stats-card stats-machine shadow-sm">
                        <h6>Total Machines</h6>
                        <h2 className="mb-0">45</h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stats-card shadow-sm" style={{ background: "#20c997" }}>
                        <h6>Operational</h6>
                        <h2 className="mb-0">38</h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stats-card shadow-sm" style={{ background: "#6c757d" }}>
                        <h6>Under Maintenance</h6>
                        <h2 className="mb-0">7</h2>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <p className="mb-0">
                    Track machine uptime, assign equipment to jobs, and schedule maintenance.
                    Use the “Add Machine” button to onboard new equipment.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mt-1">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header>
                  <h5 className="mb-0">Machines</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-muted">
                    Table/list of machines goes here (name, type, site, status, last service, actions…)
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

export default Machines;
