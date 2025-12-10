import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Humans from "./components/Humans.jsx";
import Machines from "./components/Machines.jsx";
import Trucks from "./components/Trucks.jsx";
import WorkerDetails from "./components/WorkerDetails.jsx";
import TruckDetails from "./components/TruckDetails.jsx";
import MachineDetails from "./components/MachineDetails.jsx";
import Loader from "./components/Loader.jsx"; // ✅ fixed typo (Lodaer → Loader)
//import MqttAlert from "./components/MqttAlert";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  // 🔒 Private route wrapper
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      {/* ✅ Wrap routes in Suspense with Loader */}
      <Suspense fallback={<Loader />}>
      {/* <MqttAlert /> */}
        <Routes>
          {/* Always go to login first */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Login page */}
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/humans"
            element={
              <PrivateRoute>
                <Humans />
              </PrivateRoute>
            }
          />

          <Route
            path="/machines"
            element={
              <PrivateRoute>
                <Machines />
              </PrivateRoute>
            }
          />

          <Route
            path="/trucks"
            element={
              <PrivateRoute>
                <Trucks />
              </PrivateRoute>
            }
          />

          <Route
            path="/workers/:id"
            element={
              <PrivateRoute>
                <WorkerDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/trucks/:id"
            element={
              <PrivateRoute>
                <TruckDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/machines/:id"
            element={
              <PrivateRoute>
                <MachineDetails />
              </PrivateRoute>
            }
          />

  
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
