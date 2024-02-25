import { ChangeEvent, ReactHTML, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import React from "react";
import { SignedAgeData } from "@/types";

export default function KYC() {
  /*   const [displayText, setDisplayText] = useState("");
  const [transactionlink, setTransactionLik] = useState("");
  const [uploadFile, setUploadFile] = useState<File>(); */

  // -------------------------------------------------------
  // Create UI elements

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        <div> Welcome to a restricted website!</div>
        <img src="/assets/tits.jpg" style={{ margin: "5px" }} />
        <i>A pair of great tits</i>
      </div>
    </div>
  );
}
