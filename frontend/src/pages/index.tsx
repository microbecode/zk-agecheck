import { useEffect, useState } from "react";
import "../components/reactCOIServiceWorker";
import { PublicKey, Field, Mina, fetchAccount, Signature } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { createPortal } from "react-dom";
import KYC from "./kyc";

export default function Enter() {
  const [showFrame, setShowFrame] = useState(false);

  const [receivedSignature, setReceivedSignature] = useState<string>();

  /*   useEffect(() => {
    const handler = (event: any) => {
      if (!event) {
        const data = JSON.parse(event.data);
        console.log("Hello", data);
      }
    };

    window.addEventListener("message", handler);

    // clean up
    return () => window.removeEventListener("message", handler);
  }, []); // empty array => run only once */

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
        <IFrame>
          <KYC setSig={setReceivedSignature} />
        </IFrame>
      </div>
    </div>
  );
}

function IFrame({ children }: { children: React.ReactNode }) {
  const [ref, setRef] = useState<HTMLIFrameElement | null>(null);
  const container = ref?.contentWindow?.document?.body;

  return (
    <iframe ref={(node) => setRef(node)}>
      {container && createPortal(children, container)}
    </iframe>
  );
}
