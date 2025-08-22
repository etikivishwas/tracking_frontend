import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Sidebar from "./Sidebar";
import "../App.css";

function Humans() {
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
            <Col><h2 className="mb-0">Humans Management</h2></Col>
            <Col className="text-end">
              <Button variant="primary" onClick={() => navigate("/humans/add")}>
                + Add Worker
              </Button>
            </Col>
          </Row>

          {/* Overview card */}
          <Row className="g-4">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Workforce Overview</h5>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary">Export</Button>
                    <Button size="sm" variant="outline-secondary">Refresh</Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="stats-card stats-human shadow-sm">
                        <h6>Total Workers</h6>
                        <h2 className="mb-0">120</h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stats-card shadow-sm" style={{background:"#20c997"}}>
                        <h6>Active</h6>
                        <h2 className="mb-0">95</h2>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="stats-card shadow-sm" style={{background:"#6c757d"}}>
                        <h6>On Leave</h6>
                        <h2 className="mb-0">25</h2>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <p className="mb-0">
                    Manage check-ins, assign jobs, and view attendance. Use the “Add Worker” button to onboard new staff.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Placeholder list/table area */}
          <Row className="g-4 mt-1">
            <Col md={12}>
              <Card className="shadow">
                <Card.Header>
                  <h5 className="mb-0">Workers</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-muted">
                    Table/list of workers goes here (name, role, shift, status, actions…)
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

export default Humans;
