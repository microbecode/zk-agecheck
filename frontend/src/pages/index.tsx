import { useEffect, useState } from "react";
import {
  PublicKey,
  Field,
  Mina,
  fetchAccount,
  Signature,
  JsonProof,
  verify,
} from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { createPortal } from "react-dom";
import KYC from "./kyc";
import { SignedAgeData } from "@/types";
import { AgeCheck } from "@/components/deployer";
import { zkProgram } from "@/components/zkProgram";

const transactionFee = 0.1;
const TESTNET = "https://proxy.testworld.minaexplorer.com/graphql";
const zkappPublicKey = PublicKey.fromBase58(
  "B62qjScikFVx1CeVRazFkcaSvkDfy8igZyMxQgmPQGbjHTmmcQFkEgP"
);

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

    const network = Mina.Network({
      mina: TESTNET,
    });
    Mina.setActiveInstance(network);

    /*  const mina = (window as any).mina;

    if (mina == null) {
      console.error("No Mina wallet");
      return;
    }

    const publicKeyBase58: string = (await mina.requestAccounts())[0];
    const publicKey = PublicKey.fromBase58(publicKeyBase58);

    console.log("Using wallet", publicKey);

    await fetchAccount({ publicKey: zkappPublicKey }); */

    const zkProg = zkProgram;
    const verificationKey = await zkProg.compile();
    /* 
    const zkApp = new AgeCheck(zkappPublicKey);
    const minAge = await zkApp.minimumAge.get();
    console.log("minage and zkappminage", minAge.toBigInt(), ageData.age);
    if (minAge.toBigInt() > ageData.age) {
      setProofState(ProofState.ERROR);
      setErrorText(`Minimum age is ${minAge}`);
      return;
    }
    console.log("creating tx");

    const transaction = await Mina.transaction(async () => {
      zkApp.verify(
        Field(ageData.id),
        Field(ageData.age),
        Signature.fromBase58(ageData.sig)
      );
    });
    console.log("tx", transaction);

    console.log("Prettified", transaction.toPretty());

    console.log("Creating proof...");
    const verificationKey = await AgeCheck.compile();
    setVerificationKey(verificationKey.verificationKey.data);
    const vkJson = JSON.stringify(verificationKey);
    try {
      const proof = await transaction.prove();

      const trimmedProof = proof.find((p) => p !== undefined);

      setProofState(ProofState.PROOF_GENERATED);

      console.log("Proof", trimmedProof!.toJSON());
      console.log("Verification key", vkJson);
      setProof(trimmedProof!.toJSON());
    } catch (e) {
      console.log("got error", e);
      return;
    } */
  };

  const verifyProof = async () => {
    if (proof && verificationKey) {
      setProofState(ProofState.PROOF_VERIFYING);
      const res = await verify(proof, verificationKey);
      console.log("is verified", res);
      if (res) {
        // forward to the real website
        window.location.href = "website";
      }
    }
  };

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        <p>You must be over 18 years old to enter! </p>
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
            Received signature: <p>{JSON.stringify(receivedSignature)}</p>
            <p>Generating proof... This takes a minute or two. Please wait.</p>
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
