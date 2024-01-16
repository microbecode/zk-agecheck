import { ChangeEvent, ReactHTML, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import React from "react";
import { SignedAgeData } from "@/types";

interface Props {
  setSig: (ageData: SignedAgeData) => void;
}

export default function KYC({ setSig }: Props) {
  const [uploadFile, setUploadFile] = useState<File>();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files && event.target.files.length > 0) {
      setUploadFile(event.target.files[0]);
    }
  };

  const submitDoc = async () => {
    console.log("Getting zkApp state...");
    if (!uploadFile) {
      return;
    }

    const formData = new FormData();

    // Update the formData object
    formData.append("src", uploadFile, uploadFile.name);

    const response = await fetch("/api/kycProvider", {
      method: "POST",
      body: formData,
    });

    let responseJSON = await response.json();
    let signedAgeData = responseJSON as SignedAgeData;
    console.log("got json", responseJSON);
    setSig(signedAgeData);
  };

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        <p>Welcome to your KYC provider!</p>
        <p>Please provide your ID document:</p>
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <input type="file" onChange={onFileChange} />
          <button className={styles.card} onClick={submitDoc}>
            Submit file
          </button>
        </div>
      </div>
    </div>
  );
}
