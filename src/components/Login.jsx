import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from "axios";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");   // changed username -> email
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow" style={{ width: "350px" }}>
        <div className={styles.header}>
          <p className={styles.para1}>Ops eye</p>
          <p className={styles.para2}>Mining Management System</p>
        </div>
        <h3 className="text-center mb-4">Admin Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
