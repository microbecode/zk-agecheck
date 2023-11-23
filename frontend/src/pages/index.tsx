import { useEffect, useState } from "react";
import "./reactCOIServiceWorker";
import {
  PublicKey,
  Field,
  Mina,
  fetchAccount,
  Signature,
  PrivateKey,
  AccountUpdate,
} from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";
import { deploy } from "./deployer";

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

export default function Home() {
  const [displayText, setDisplayText] = useState("");
  const [transactionlink, setTransactionLink] = useState("");

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async () => {
    if (window.mina !== undefined) {
      const chainId = await window.mina.requestNetwork();
      let account = await window.mina.requestAccounts();
      console.log("getAddress account", account, chainId);
    }

    setDisplayText("Creating a transaction...");
    console.log("Creating a transaction...");

    const { AgeCheck } = await import("./deployer");

    await AgeCheck.compile();

    const TESTNET = "https://proxy.testworld.minaexplorer.com/graphql";
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

    const aa = await fetchAccount({
      publicKey: publicKey,
    });
    console.log("fee payer checked", aa);
    await fetchAccount({ publicKey: zkappPublicKey });
    const zkApp2 = new AgeCheck(zkappPublicKey);
    const hasAccount = Mina.hasAccount(zkappPublicKey);
    const age = zkApp2.minimumAge.get();
    //const oraclePublicKey = zkApp2.oraclePublicKey.get();
    console.log("hasAccount", hasAccount);
    //console.log("age", age.toJSON());
    //console.log("oraclePublicKey", oraclePublicKey.toBase58());

    //await state.zkappWorkerClient!.createUpdateTransaction();

    let sig = Signature.fromBase58(
      "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC"
    );

    const zkApp = new AgeCheck(zkappPublicKey);
    console.log("creating tx");

    const transaction = await Mina.transaction(() => {
      zkApp.verify(Field(1), Field(78), sig);
    });
    console.log("Prettified", transaction.toPretty());
    //state.transaction = transaction;

    setDisplayText("Creating proof...");
    console.log("Creating proof...");
    //await state.zkappWorkerClient!.proveUpdateTransaction();
    await transaction.prove();

    console.log("Requesting send transaction...");
    setDisplayText("Requesting send transaction...");
    //const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();
    const transactionJSON = await transaction.toJSON();

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

  const onRefreshCurrentNum = async () => {
    console.log("Getting zkApp state...");
    setDisplayText("Getting zkApp state...");

    await fetchAccount({
      publicKey: zkappPublicKey,
    });

    /*  await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.zkappPublicKey!,
    }); */
    /*     const currentNum = await state.zkappWorkerClient!.getNum();
    setState({ ...state, currentNum });
    console.log(`Current state in zkApp: ${currentNum.toString()}`); */
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
      {/*   <div className={styles.center} style={{ padding: 0 }}>
          Current state in zkApp: {state.currentNum!.toString()}{" "}
        </div> */}
      <button
        className={styles.card}
        onClick={deploy}
        /* disabled={state.creatingTransaction} */
      >
        In-project deploy
      </button>
      <button
        className={styles.card}
        onClick={onSendTransaction}
        /*  disabled={state.creatingTransaction} */
      >
        Send Transaction
      </button>
      <button className={styles.card} onClick={onRefreshCurrentNum}>
        Get Latest State
      </button>
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
