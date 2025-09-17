import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from "axios";
import logo from "./logo.png"; 

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState(""); // login with email
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("https://trackingbackend-v23j.onrender.com/api/auth/login", {
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
        {/* ✅ Logo on top center */}
        <div className={styles.logoWrapper}>
          <img src={logo} alt="App Logo" className={styles.logo} />
        </div>

        {/* Theme toggle button (top-right of card). Reuse this component across pages. */}
        <div className={styles.themeWrapper}>
          <ThemeToggle />
        </div>

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

// ThemeToggle: handles localStorage + data-theme on document.documentElement.
// Default remains "dark" (so current dark look is preserved); user can switch to "light".
function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return (typeof window !== "undefined" && localStorage.getItem("theme")) || "dark";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggle}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

export default Login;
export { ThemeToggle };
