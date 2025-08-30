import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Humans from "./components/Humans.jsx";
import Machines from "./components/Machines.jsx";
import Trucks from "./components/Trucks.jsx";
import WorkerDetails from "./components/WorkerDetails";
import TruckDetails from "./components/TruckDetails";
import MachineDetails from './components/MachineDetails.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );

  // Sync to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ?
              <Navigate to="/dashboard" /> :
              <Login setIsAuthenticated={setIsAuthenticated} />
          }
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/humans"
          element={isAuthenticated ? <Humans /> : <Navigate to="/" />}
        />
        <Route
          path="/machines"
          element={isAuthenticated ? <Machines /> : <Navigate to="/" />}
        />
        <Route
          path="/trucks"
          element={isAuthenticated ? <Trucks /> : <Navigate to="/" />}
        />
        <Route path="/workers/:id" element={<WorkerDetails />} />
        <Route path="/trucks/:id" element={<TruckDetails />} />
        <Route path="/machines/:id" element={<MachineDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
