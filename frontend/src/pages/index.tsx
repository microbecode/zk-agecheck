import { useEffect, useState } from "react";
import { PublicKey, Field, Signature, JsonProof, verify } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { createPortal } from "react-dom";
import KYC from "./kyc";
import { SignedAgeData } from "@/types";
import { zkProgram } from "@/components/zkProgram";

const ORACLE_PUBLIC_KEY =
  "B62qkN4f1prDvFexmhGHNsNz1db84XCA6vkgtJpcAaqFJk2M1runpLd";
const MINIMUM_AGE = Field(18);

enum ProofState {
  START,
  AT_KYC,
  SIG_RECEIVED,
  PROOF_GENERATED,
  PROOF_VERIFYING,
  ERROR,
}

export default function Enter() {
  const [receivedSignature, setReceivedSignature] = useState<string>();
  const [proof, setProof] = useState<JsonProof>();
  const [verificationKey, setVerificationKey] = useState<string>();
  const [proofState, setProofState] = useState<ProofState>(ProofState.START);
  const [errorText, setErrorText] = useState<string>("");

  const setAgeData = async (ageData: SignedAgeData) => {
    setReceivedSignature(JSON.stringify(ageData));
    setProofState(ProofState.SIG_RECEIVED);

    const zkProg = zkProgram;
    const vkJson = await zkProg.compile();
    setVerificationKey(vkJson.verificationKey.data);

    const res = await zkProg.verifyAge(
      MINIMUM_AGE, // public
      PublicKey.fromBase58(ORACLE_PUBLIC_KEY),
      Field(ageData.id),
      Field(ageData.age),
      Signature.fromBase58(ageData.sig)
    );
    const proof = res.toJSON();

    console.log("Generated proof", res, proof.proof);

    setProofState(ProofState.PROOF_GENERATED);

    console.log("Verification key", vkJson);
    setProof(proof);
  };

  const verifyProof = async () => {
    if (proof && verificationKey) {
      setProofState(ProofState.PROOF_VERIFYING);
      const res = await verify(proof, verificationKey);
      if (res) {
        // forward to the real website
        window.location.href = "website";
      } else {
        setErrorText("Verification failed");
      }
    }
  };

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        <p>You must be over 18 years old to enter this site! </p>
        {proofState != ProofState.ERROR && (
          <p>Use a KYC provider to prove your age securely.</p>
        )}
        {proofState == ProofState.START && (
          <button
            className={styles.button}
            onClick={() => {
              setProofState(ProofState.AT_KYC);
            }}
          >
            Open provider
          </button>
        )}
        {proofState == ProofState.AT_KYC && (
          <IFrame>
            <KYC setSig={setAgeData} />
          </IFrame>
        )}
        {proofState == ProofState.SIG_RECEIVED && (
          <div>
            <p>
              Generating a proof based on the data from the identity provider...
              This may take a minute or two. Please wait.
            </p>
          </div>
        )}
        {proofState == ProofState.PROOF_GENERATED && (
          <div>
            <div>
              Generated proof:
              {proof?.proof.substring(0, 10) + "..."}
            </div>
            <button className={styles.button} onClick={verifyProof}>
              Submit proof
            </button>
          </div>
        )}
        {proofState == ProofState.PROOF_VERIFYING && (
          <div>Verifying proof...</div>
        )}
        {proofState == ProofState.ERROR && errorText && (
          <div>Error: {errorText}</div>
        )}
      </div>
    </div>
  );
}

// https://dev.to/graftini/rendering-in-an-iframe-in-a-react-app-2boa
function IFrame({ children }: { children: React.ReactNode }) {
  const [ref, setRef] = useState<HTMLIFrameElement | null>(null);
  const container = ref?.contentWindow?.document?.body;

  return (
    <iframe ref={(node) => setRef(node)} className={styles.kyc}>
      {container && createPortal(children, container)}
    </iframe>
  );
}
