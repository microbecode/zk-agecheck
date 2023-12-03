import { useEffect, useState } from "react";
import "../components/reactCOIServiceWorker";
import { PublicKey, Field, Mina, fetchAccount, Signature } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";

export default function Home() {
  const [showFrame, setShowFrame] = useState(false);

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        You must be over 18 years old to enter!
        <button
          onClick={() => {
            setShowFrame(true);
          }}
        >
          Submit ID
        </button>
        {showFrame ? <iframe src="." height="500px"></iframe> : ""}
      </div>
    </div>
  );
}
