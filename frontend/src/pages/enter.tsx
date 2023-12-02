import { useEffect, useState } from "react";
import "../components/reactCOIServiceWorker";
import { PublicKey, Field, Mina, fetchAccount, Signature } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";

export default function Home() {
  const [displayText, setDisplayText] = useState("");
  const [transactionlink, setTransactionLink] = useState("");

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        You must be over 18 years old to enter!
        <iframe src="."></iframe>
      </div>
    </div>
  );
}
