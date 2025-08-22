// src/components/Navbar.jsx
import React from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";

export default function NavigationBar({ onLogout, onToggleSidebar }) {
  const navigate = useNavigate();

  return (
    <Navbar bg="white" expand="lg" fixed="top" className="border-bottom shadow-sm">
      <Container fluid className="px-3">
        {/* Left: hamburger + brand */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-light d-inline-flex d-lg-none" /* visible on small screens */
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list"></i>
          </button>
          <Navbar.Brand onClick={() => navigate("/dashboard")} style={{ cursor: "pointer", fontWeight: 700 }}>
            Mining Admin
          </Navbar.Brand>
        </div>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/humans">Humans</Nav.Link>
            <Nav.Link as={NavLink} to="/machines">Machines</Nav.Link>
            <Nav.Link as={NavLink} to="/trucks">Trucks</Nav.Link>
          </Nav>

          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2">
              <img src="https://i.pravatar.cc/40" alt="Profile" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <span className="d-none d-sm-inline">Admin</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate("/profile")}>Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
