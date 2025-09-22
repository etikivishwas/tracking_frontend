import React, { useEffect, useState } from "react";
import axios from "axios";

function MqttAlert() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("https://trackingbackend-v23j.onrender.com/mqtt-status")
        .then(res => {
          if (!res.data.alive) {
            setAlert("🚨 No data received from MQTT broker!");
          } else {
            setAlert(null);
          }
        })
        .catch(err => console.error(err));
    }, 30000); // poll every 30s

    return () => clearInterval(interval);
  }, []);

  if (!alert) return null;

  return (
    <div style={{
      background: "red",
      color: "white",
      padding: "10px",
      borderRadius: "5px",
      textAlign: "center",
      fontWeight: "bold"
    }}>
      {alert}
    </div>
  );
}

export default MqttAlert;
