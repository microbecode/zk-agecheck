import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";
import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  Signature,
  fetchAccount,
} from "o1js";
import { AgeCheck } from "../../../circuits/build/src/";
//import { AgeCheck } from "./AgeCheck";
import ZkappWorkerClient from "./zkappWorkerClient.ts";

const zkApp = "B62qqGW9ZkQYNJkTpsED2E7GhkgTcvfEmKi3wqpsmf5YZQRG8Muyre1"; // berkeley
const publicKey = PublicKey.fromBase58(zkApp);

declare global {
  interface Window {
    mina?: any;
  }
}

export default function Home() {
  let zkAppInstance: AgeCheck;

  const [isVerified, setVerified] = useState<boolean>();

  const initialState = { accounts: [] };
  const [textUsed, settextUsed] = useState("Connect Auro");
  const [wallet, setWallet] = useState(initialState);
  const [networkLive, setnetworkLive] = useState();
  const [accountBalance, setAccountBalance] = useState();
  const [injectedProvider, setInjectedProvider] = useState(false); // Use state for injectedProvider
  const [isAuro, setIsAuro] = useState(false); // Use state for isAuro
  const [isNetwork, setIsNetwork] = useState(null); // Use state for isNetwork

  useEffect(() => {
    // Check for window.mina when the component mounts
    if (typeof window.mina !== "undefined") {
      setInjectedProvider(true);
      console.log(window.mina);
    }

    // Define the event handler function
    function handleChainChanged() {
      setnetworkLive(window.mina.requestNetwork());
    }

    // Add the event listener when the component mounts
    if (injectedProvider) {
      window.mina.on("chainChanged", handleChainChanged);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (injectedProvider) {
        window.mina.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [injectedProvider]); // Depend on injectedProvider

  const updateWallet = async (accounts: any) => {
    setWallet({ accounts });
    console.log(wallet);
  };

  const handleConnect = async () => {
    let accounts = await window.mina.request({
      method: "mina_requestAccounts",
    });

    let isNetwork = await window.mina.request({
      method: "mina_requestNetwork",
    });
    console.log("The network is:", isNetwork);

    const network = await window.mina.requestNetwork();
    console.log("Accounts", accounts);

    Mina.Network("https://proxy.berkeley.minaexplorer.com/graphql");

    updateWallet(accounts);
    // getAccountBalance(accounts);
    settextUsed("Connected");
    setIsNetwork(network);
    console.log(networkLive);
    /* 
    let ress = await fetchAccount({ publicKey: PublicKey.fromBase58(zkApp) });
    console.log("FETH", ress);
    let zkAppInstance = new AgeCheck(PublicKey.fromBase58(zkApp));
    let sig = Signature.fromBase58(
      "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC"
    );
    console.log("verifying");
    await zkAppInstance.verify(Field(1), Field(78), sig);

 */

    // -------------------------------------------------------
  };

  // -------------------------------------------------------
  // Send a transaction

  async function timeout(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  // -------------------------------------------------------
  // Send a transaction
  const onSendTransaction = async () => {
    // setState({ ...state, creatingTransaction: true });

    // setDisplayText('Creating a transaction...');
    console.log("Creating a transaction...");

    const zkappWorkerClient = new ZkappWorkerClient();
    await timeout(5);
    await zkappWorkerClient.setActiveInstanceToBerkeley();
    await timeout(1);
    await zkappWorkerClient.initZkappInstance(publicKey);
    await timeout(1);
    console.log("worker done");
    const acc = await zkappWorkerClient!.fetchAccount({
      publicKey: publicKey!,
    });

    console.log("found account", acc);
    await zkappWorkerClient!.createUpdateTransaction();

    console.log("Creating proof...");
    await zkappWorkerClient!.proveUpdateTransaction();
    console.log("Requesting send transaction...");
    //  const { hash } = await (window as any).mina.sendTransaction({
    const transactionJSON = await zkappWorkerClient!.getTransactionJSON();

    console.log("Getting transaction JSON...");
    let transactionFee = 0.1;
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: "",
      },
    });

    const transactionLink = `https://berkeley.minaexplorer.com/transaction/${hash}`;
    console.log(`View transaction at ${transactionLink}`);

    //console.log(transactionLink);
    //setDisplayText(transactionLink);

    //setState({ ...state, creatingTransaction: false });
  };

  // -------------------------------------------------------

  useEffect(() => {
    // Update isAuro based on injectedProvider
    setIsAuro(injectedProvider);
  }, [injectedProvider]); // Depend on injectedProvider

  // useEffect(() => {
  //   (async () => {
  //     //const { AgeCheck } = await import("../../../circuits/build/src/");
  //     console.log("launching blockchain 2");
  //     const Local = Mina.LocalBlockchain({ proofsEnabled: false });
  //     Mina.setActiveInstance(Local);

  //     let deployerAccount: PublicKey,
  //       deployerKey: PrivateKey,
  //       senderAccount: PublicKey,
  //       senderKey: PrivateKey,
  //       zkAppAddress: PublicKey,
  //       zkAppPrivateKey: PrivateKey;

  //     ({ privateKey: deployerKey, publicKey: deployerAccount } =
  //       Local.testAccounts[0]);
  //     ({ privateKey: senderKey, publicKey: senderAccount } =
  //       Local.testAccounts[1]);
  //     zkAppPrivateKey = PrivateKey.random();
  //     zkAppAddress = zkAppPrivateKey.toPublicKey();
  //     zkAppInstance = new AgeCheck(zkAppAddress);

  //     async function localDeploy() {
  //       const txn = await Mina.transaction(deployerAccount, () => {
  //         AccountUpdate.fundNewAccount(deployerAccount);
  //         zkAppInstance.deploy();
  //       });
  //       await txn.prove();
  //       // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
  //       await txn.sign([deployerKey, zkAppPrivateKey]).send();
  //     }

  //     console.log("starting deploy tx");
  //     await localDeploy();

  //     console.log("deploying contract");

  //     //const txPromise = await txn.send();
  //     /*
  //     `txn.send()` returns a promise with two closures - `.wait()` and `.hash()`
  //     `.hash()` returns the transaction hash, as the name might indicate
  //     `.wait()` automatically resolves once the transaction has been included in a block. this is redundant for the LocalBlockchain, but very helpful for live testnets
  //     */

  //     //await txPromise.wait();

  //     let sig = Signature.fromBase58(
  //       "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC"
  //     );
  //     console.log("verifying");
  //     await zkAppInstance.verify(Field(1), Field(78), sig);
  //     setVerified(true);

  //     // Update this to use the address (public key) for your zkApp account.
  //     // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
  //     // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
  //     //const zkAppAddress = "";
  //     // This should be removed once the zkAppAddress is updated.
  //     // if (!zkAppAddress) {
  //     //   console.error(
  //     //     'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
  //     //   );
  //     // }
  //     //const zkApp = new Add(PublicKey.fromBase58(zkAppAddress))
  //   })();
  // }, []);

  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with SnarkyJS" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <div className="flex flex-row items-center justify-evenly">
        {isAuro && (
          <button
            className="btn btn-outline btn-success"
            onClick={handleConnect}
          >
            {textUsed}
          </button>
        )}
        {textUsed === "Connected" && isAuro && (
          <div className="badge badge-primary badge-outline">{networkLive}</div>
        )}
        {textUsed === "Connected" && isAuro && wallet.accounts.length > 0 && (
          <div className="badge badge-primary badge-outline">
            {wallet.accounts[0]}
          </div>
        )}
        <br />
        <button onClick={onSendTransaction}>Hello</button>
      </div>
    </>
  );
}
