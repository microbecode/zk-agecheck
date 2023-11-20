import { useEffect, useState } from "react";
import "./reactCOIServiceWorker.tsx";
import ZkappWorkerClient from "./zkappWorkerClient.ts";
import { PublicKey, Field, Mina, fetchAccount, Signature } from "o1js";
import styles from "../styles/Home.module.css";
import React from "react";

let transactionFee = 0.1;

export default function Home() {
  const [state, setState] = useState({
    // zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  const [displayText, setDisplayText] = useState("");
  const [transactionlink, setTransactionLink] = useState("");

  const zkappPublicKey = PublicKey.fromBase58(
    "B62qpbsHc4anQXXwxk9ESdkBeAoKdqJYxhZSbckhcWk68jKS62y996A"
  );

  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }

    (async () => {
      if (!state.hasBeenSetup) {
        setDisplayText("Loading web worker...");
        console.log("Loading web worker...");
        //const zkappWorkerClient = new ZkappWorkerClient();
        await timeout(10);

        setDisplayText("Done loading web worker");
        console.log("Done loading web worker");

        // await zkappWorkerClient.setActiveInstanceToBerkeley();
        const usednetwork = Mina.Network(
          "https://proxy.testworld.minaexplorer.com/graphql"
        );
        console.log("Berkeley Instance Created");
        Mina.setActiveInstance(usednetwork);

        await timeout(1);

        console.log("set to berkeley");

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        console.log(`Using key:${publicKey.toBase58()}`);
        setDisplayText(`Using key:${publicKey.toBase58()}`);

        /*         console.log("fetching zk app account");
        let { account, error } = await zkappWorkerClient.fetchAccount({
          publicKey: zkappPublicKey,
        });
        console.log("account errrors?", account, error); */

        setDisplayText("Checking if fee payer account exists...");
        console.log("Checking if fee payer account exists...");

        const res = await fetchAccount({ publicKey });

        // const res = await zkappWorkerClient.fetchAccount({
        //   publicKey: publicKey!,
        // });
        const accountExists = res.error == null;

        //await zkappWorkerClient.loadContract();

        console.log("Compiling zkApp...", res);
        setDisplayText("Compiling zkApp...");
        //await zkappWorkerClient.compileContract();

        const { AgeCheck } = await import(
          "../../../circuits/build/src/AgeCheck.js"
        );
        // let AgeCheck = AgeCheck;
        await AgeCheck.compile();
        await timeout(5);

        console.log("zkApp compiled");
        setDisplayText("zkApp compiled...");

        //await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        console.log("Getting zkApp state...");
        setDisplayText("Getting zkApp state...");
        /*  await zkappWorkerClient.fetchAccount({
          publicKey: zkappPublicKey,
        }); */
        const res2 = await fetchAccount({
          publicKey: zkappPublicKey,
        });
        console.log("ZK acc res", res2);
        /*         const currentNum = await zkappWorkerClient.getNum();
        console.log(`Current state in zkApp: ${currentNum.toString()}`); */
        setDisplayText("");

        setState({
          ...state,
          //zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
        });
      }
    })();
  }, []);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't

  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          setDisplayText("Checking if fee payer account exists2...");
          console.log("Checking if fee payer account exists2...");
          /*  const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          }); */
          const res = await fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async () => {
    setState({ ...state, creatingTransaction: true });

    setDisplayText("Creating a transaction...");
    console.log("Creating a transaction...");

    await fetchAccount({
      publicKey: state.publicKey!,
    });
    await fetchAccount({
      publicKey: zkappPublicKey,
    });

    //await state.zkappWorkerClient!.createUpdateTransaction();

    let sig = Signature.fromBase58(
      "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC"
    );

    const { AgeCheck } = await import(
      "../../../circuits/build/src/AgeCheck.js"
    );

    const zkApp = new AgeCheck(zkappPublicKey);

    const transaction = await Mina.transaction(() => {
      zkApp.verify(Field(1), Field(78), sig);
    });
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

    setState({ ...state, creatingTransaction: false });
  };

  // -------------------------------------------------------
  // Refresh the current state

  const onRefreshCurrentNum = async () => {
    console.log("Getting zkApp state...");
    setDisplayText("Getting zkApp state...");

    await fetchAccount({
      publicKey: state.zkappPublicKey!,
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

  let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = "https://www.aurowallet.com/";
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        Install Auro wallet here
      </a>
    );
    hasWallet = <div>Could not find a wallet. {auroLinkElem}</div>;
  }

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
      {hasWallet}
    </div>
  );

  let accountDoesNotExist;
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
  }

  let mainContent;
  if (state.hasBeenSetup && state.accountExists) {
    mainContent = (
      <div style={{ justifyContent: "center", alignItems: "center" }}>
        {/*   <div className={styles.center} style={{ padding: 0 }}>
          Current state in zkApp: {state.currentNum!.toString()}{" "}
        </div> */}
        <button
          className={styles.card}
          onClick={onSendTransaction}
          disabled={state.creatingTransaction}
        >
          Send Transaction
        </button>
        <button className={styles.card} onClick={onRefreshCurrentNum}>
          Get Latest State
        </button>
      </div>
    );
  }

  return (
    <div className={styles.main} style={{ padding: 0 }}>
      <div className={styles.center} style={{ padding: 0 }}>
        {setup}
        {accountDoesNotExist}
        {mainContent}
        HALLO
      </div>
    </div>
  );
}
