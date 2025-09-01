import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear session/local storage if used
    localStorage.removeItem("token"); 
    // navigate to login
    navigate("/login");
  };

  return (
    <aside className={`app-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header with toggle */}
      <div className="sidebar-header">
        <button
          type="button"
          className="btn btn-light btn-sm hamburg"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <i className="bi bi-list"></i>
        </button>
        {!collapsed && <span className="brand">Admin Panel</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-speedometer2"></i>
          <span className="label">Dashboard</span>
        </NavLink>

        <NavLink to="/humans" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-people-fill"></i>
          <span className="label">Workers</span>
        </NavLink>

        <NavLink to="/machines" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-gear-fill"></i>
          <span className="label">Machines</span>
        </NavLink>

        <NavLink to="/trucks" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-truck"></i>
          <span className="label">Trucks</span>
        </NavLink>
      </nav>

      {/* Footer with profile + logout */}
      <div className="sidebar-footer">
        <div className="profile-info">
          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            className="profile-img"
          />
          {!collapsed && <span className="profile-name">Admin</span>}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-danger w-100 mt-2"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          {!collapsed && <span className="ms-2">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
