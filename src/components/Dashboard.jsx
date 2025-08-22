// src/components/Dashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Mining Admin Dashboard</h2>
      <div className="row">
        <div className="col-md-4">
          <div
            className="card text-center shadow p-4"
            onClick={() => navigate("/humans")}
            style={{ cursor: "pointer" }}
          >
            <h4>Humans</h4>
            <p>Track and manage workforce</p>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card text-center shadow p-4"
            onClick={() => navigate("/machines")}
            style={{ cursor: "pointer" }}
          >
            <h4>Machines</h4>
            <p>Monitor mining machines</p>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card text-center shadow p-4"
            onClick={() => navigate("/trucks")}
            style={{ cursor: "pointer" }}
          >
            <h4>Trucks</h4>
            <p>Track fleet operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
