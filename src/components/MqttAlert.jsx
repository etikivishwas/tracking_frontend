import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MqttAlert.css"; // import CSS file

function MqttAlert() {
  const [alert, setAlert] = useState(null);
  const [show, setShow] = useState(false); // for animation

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("https://trackingbackend-v23j.onrender.com/mqtt-status")
        .then(res => {
          if (!res.data.alive) {
            setAlert("🚨 No data received from MQTT broker!");
            setShow(true);
          } else {
            setShow(false);
            setTimeout(() => setAlert(null), 500); // wait for slide-out
          }
        })
        .catch(err => console.error(err));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!alert) return null;

  return (
    <div className={`alert ${show ? "slide-in" : "slide-out"}`}>
      {alert}
    </div>
  );
}

export default MqttAlert;
