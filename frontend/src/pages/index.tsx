import { useEffect, useState } from "react";
import { PublicKey, Field, Signature, JsonProof, verify } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { createPortal } from "react-dom";
import KYC from "./kyc";
import { SignedAgeData } from "@/types";
import { zkProgram } from "@/components/zkProgram";
import RestrictedWebsite, { MINIMUM_AGE } from "./website";

const ORACLE_PUBLIC_KEY =
  "B62qkN4f1prDvFexmhGHNsNz1db84XCA6vkgtJpcAaqFJk2M1runpLd";

enum ProofState {
  START,
  AT_KYC,
  SIG_RECEIVED,
  PROOF_GENERATED,
  PROOF_VERIFYING,
  ERROR,
}

export default function Enter() {
  const [proof, setProof] = useState<JsonProof>();
  const [verificationKey, setVerificationKey] = useState<string>();
  const [proofState, setProofState] = useState<ProofState>(ProofState.START);
  const [errorText, setErrorText] = useState<string>("");

  const setAgeData = async (ageData: SignedAgeData) => {
    if (ageData.age < MINIMUM_AGE) {
      setErrorText("Detected age is too low");
      setProofState(ProofState.ERROR);
      return;
    }
    setProofState(ProofState.SIG_RECEIVED);

    const zkProg = zkProgram;
    const vkJson = await zkProg.compile();
    setVerificationKey(vkJson.verificationKey.data);

    const res = await zkProg.verifyAge(
      Field(MINIMUM_AGE), // public
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

  return (
    <>
      {proofState == ProofState.PROOF_VERIFYING && (
        <RestrictedWebsite
          proof={proof!}
          requiredAge={MINIMUM_AGE}
          verificationKey={verificationKey!}
        ></RestrictedWebsite>
      )}
      {proofState != ProofState.PROOF_VERIFYING && (
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
                  Generating a proof based on the data from the identity
                  provider... This may take a minute or two. Please wait.
                </p>
              </div>
            )}
            {proofState == ProofState.PROOF_GENERATED &&
              proof &&
              verificationKey && (
                <div>
                  <div>
                    Generated proof:
                    {proof.proof.substring(0, 10) + "..."}
                  </div>

                  <button
                    className={styles.button}
                    onClick={() => {
                      setProofState(ProofState.PROOF_VERIFYING);
                    }}
                  >
                    Submit proof
                  </button>
                </div>
              )}
            {proofState == ProofState.ERROR && errorText && (
              <div>Error: {errorText}</div>
            )}
          </div>
        </div>
      )}
    </>
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
