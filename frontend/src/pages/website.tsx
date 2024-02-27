import { useState } from "react";
import styles from "../styles/Home.module.css";
import React from "react";
import { JsonProof, verify } from "o1js";

interface Props {
  requiredAge: number;
  proof: JsonProof;
  verificationKey: string;
}

export const MINIMUM_AGE = 18;

export default function RestrictedWebsite(props: Props) {
  const [isVerified, setIsVerified] = useState<boolean>();

  const verifyProof = async () => {
    if (props.proof && props.verificationKey) {
      const res = await verify(props.proof, props.verificationKey);
      if (res) {
        setIsVerified(true);
      }
    }
  };
  verifyProof();

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        {isVerified && (
          <>
            <div>Welcome to a restricted website!</div>
            <img src="/assets/tits.jpg" style={{ margin: "5px" }} />
            <i>A pair of great tits</i>
          </>
        )}
        {!isVerified && <div>Verifying... Please wait</div>}
      </div>
    </div>
  );
}
