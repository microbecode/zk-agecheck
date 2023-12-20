import { useEffect, useState } from "react";
import "../components/reactCOIServiceWorker";
import { PublicKey, Field, Mina, fetchAccount, Signature } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { createPortal } from "react-dom";
import KYC from "./kyc";
import { SignedAgeData } from "@/types";
import { AgeCheck } from "@/components/deployer";

const transactionFee = 0.1;
const TESTNET = "https://proxy.testworld.minaexplorer.com/graphql";
const zkappPublicKey = PublicKey.fromBase58(
  "B62qjScikFVx1CeVRazFkcaSvkDfy8igZyMxQgmPQGbjHTmmcQFkEgP"
);

export default function Enter() {
  const [showFrame, setShowFrame] = useState(false);

  const [receivedSignature, setReceivedSignature] = useState<string>();
  const [proof, setProof] = useState<string>();

  const setAgeData = async (ageData: SignedAgeData) => {
    setReceivedSignature(JSON.stringify(ageData));

    const verificationKey = await AgeCheck.compile();
    const vkJson = JSON.stringify(verificationKey);

    const network = Mina.Network({
      mina: TESTNET,
    });
    Mina.setActiveInstance(network);

    const mina = (window as any).mina;

    if (mina == null) {
      console.error("No Mina wallet");
      return;
    }

    const publicKeyBase58: string = (await mina.requestAccounts())[0];
    const publicKey = PublicKey.fromBase58(publicKeyBase58);

    console.log("Using wallet", publicKey);

    await fetchAccount({ publicKey: zkappPublicKey });

    const zkApp = new AgeCheck(zkappPublicKey);
    console.log("creating tx");

    const transaction = await Mina.transaction(() => {
      zkApp.verify(
        Field(ageData.id),
        Field(ageData.age),
        Signature.fromBase58(ageData.sig)
      );
    });

    console.log("Prettified", transaction.toPretty());

    console.log("Creating proof...");
    const proof = await transaction.prove();

    const trimmedProof = proof.find((p) => p !== undefined);
    console.log("Proof", trimmedProof!.toJSON());
    console.log("Verification key", vkJson);
    setProof(trimmedProof!.toJSON().proof);
  };

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        You must be over 18 years old to enter!
        <button
          onClick={() => {
            setShowFrame(true);
          }}
        >
          Open KYC provider
        </button>
        <div>
          Received signature: <p>{JSON.stringify(receivedSignature)}</p>
        </div>
        <div>
          Generated proof: <p>{proof}</p>
        </div>
        {showFrame && (
          <IFrame>
            <KYC setSig={setAgeData} />
          </IFrame>
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
    <iframe ref={(node) => setRef(node)}>
      {container && createPortal(children, container)}
    </iframe>
  );
}
