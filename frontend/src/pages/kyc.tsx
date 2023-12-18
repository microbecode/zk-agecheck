import { ChangeEvent, ReactHTML, useEffect, useState } from "react";
import "../components/reactCOIServiceWorker";
import { PublicKey, Field, Mina, fetchAccount, Signature } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { deploy } from "../components/deployer";
import { SignedAgeData } from "@/types";

let transactionFee = 0.1;
const TESTNET = "https://proxy.testworld.minaexplorer.com/graphql";

const zkappPublicKey = PublicKey.fromBase58(
  "B62qjScikFVx1CeVRazFkcaSvkDfy8igZyMxQgmPQGbjHTmmcQFkEgP"
);

declare global {
  interface Window {
    mina?: any;
  }
}

interface Props {
  setSig: (ageData: SignedAgeData) => void;
}

export default function KYC({ setSig }: Props) {
  const [displayText, setDisplayText] = useState("");
  const [transactionlink, setTransactionLink] = useState("");
  const [uploadFile, setUploadFile] = useState<File>();

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async () => {
    setDisplayText("Creating a transaction...");
    console.log("Creating a transaction...");

    const response = await fetch("/api/kycProvider", {
      method: "POST",
      body: JSON.stringify({
        id: 1, // FIXME
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    let ageData = (await response.json()) as SignedAgeData;

    console.log("got age data response", ageData);

    const { AgeCheck } = await import("../components/deployer");

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

    setDisplayText("Creating proof...");
    console.log("Creating proof...");
    const proof = await transaction.prove();

    const trimmedProof = proof.find((p) => p !== undefined);
    console.log("Proof", trimmedProof!.toJSON());
    console.log("Verification key", vkJson);

    return; //temp

    console.log("Requesting send transaction...");
    setDisplayText("Requesting send transaction...");
    const transactionJSON = await transaction.toJSON();

    const aa = await fetchAccount({
      publicKey: publicKey,
    });
    console.log("fee payer checked", aa);

    setDisplayText("Getting transaction JSON...");
    console.log("Getting transaction JSON...");
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: "",
      },
    });

    const transactionLink = `https://minascan.io/testworld/tx/${hash}`;
    console.log(`View transaction at ${transactionLink}`);

    setTransactionLink(transactionLink);
    setDisplayText(transactionLink);
  };

  // -------------------------------------------------------
  // Refresh the current state

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Update the state
    if (event?.target?.files && event.target.files.length > 0) {
      setUploadFile(event.target.files[0]);
    }
  };

  const submitDoc = async () => {
    console.log("Getting zkApp state...");
    setDisplayText("Getting zkApp state...");
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

    setDisplayText("");
  };

  // -------------------------------------------------------
  // Create UI elements

  /*   let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = "https://www.aurowallet.com/";
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        Install Auro wallet here
      </a>
    );
    hasWallet = <div>Could not find a wallet. {auroLinkElem}</div>; 
  }*/

  const stepDisplay = transactionlink ? (
    <a href={displayText} target="_blank" rel="noreferrer">
      View transaction
    </a>
  ) : (
    displayText
  );

  let setup = (
    <div
      className={styles.start}
      style={{ fontWeight: "bold", fontSize: "1.5rem", paddingBottom: "5rem" }}
    >
      {stepDisplay}
      {/* {hasWallet} */}
    </div>
  );

  /*   let accountDoesNotExist;
  if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink =
      "https://faucet.minaprotocol.com/?address=" + state.publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        <span style={{ paddingRight: "1rem" }}>Account does not exist.</span>
        <a href={faucetLink} target="_blank" rel="noreferrer">
          Visit the faucet to fund this fee payer account
        </a>
      </div>
    );
  } */

  let mainContent;
  // if (state.hasBeenSetup && state.accountExists) {
  mainContent = (
    <div style={{ justifyContent: "center", alignItems: "center" }}>
      {/*       <button
        className={styles.card}
        onClick={deploy}
      >
        In-project deploy
      </button> */}
      {/*      <button
        className={styles.card}
        onClick={onSendTransaction}
      >
        Send Transaction
      </button> */}
      <button className={styles.card} onClick={submitDoc}>
        Submit doc
      </button>
      <input type="file" onChange={onFileChange} />
    </div>
  );
  // }

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        {setup}
        {/*   {accountDoesNotExist} */}
        {mainContent}
        HALLO
      </div>
    </div>
  );
}
