import React from "react";
import styles from "./Loader.css";

function Loader() {
  return (
    <div className={styles.loaderPage}>
      <div className={styles.spinner}></div>
      <h3 className={styles.text}>Loading Workers...</h3>
    </div>
  );
}

export default Loader;
