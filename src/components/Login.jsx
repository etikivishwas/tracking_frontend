import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from "axios";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState(""); // login with email
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://trackingbackend-7fvy.onrender.com/api/auth/login", {
        email,
        password,
        staySignedIn,
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
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.tabHeader}>
          <span className={styles.activeTab}>USER SIGN IN</span>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            type="text"
            placeholder="User name / Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />

          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="staySignedIn"
              checked={staySignedIn}
              onChange={(e) => setStaySignedIn(e.target.checked)}
            />
            <label htmlFor="staySignedIn">Stay Signed in</label>
          </div>

          <button type="submit" className={styles.signInBtn}>
            SIGN IN
          </button>
        </form>

        <p className={styles.forgot}>Forgot Password?</p>
      </div>
    </div>
  );
}

export default Login;
