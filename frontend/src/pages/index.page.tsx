import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";
import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  Signature,
} from "o1js";
//import { AgeCheck } from "../../../circuits/build/src/";
import { AgeCheck } from "./AgeCheck";

export default function Home() {
  let zkAppInstance: AgeCheck;

  useEffect(() => {
    (async () => {
      //const { AgeCheck } = await import("../../../circuits/build/src/");
      console.log("launching blockchain 2");
      const Local = Mina.LocalBlockchain({ proofsEnabled: false });
      Mina.setActiveInstance(Local);

      let deployerAccount: PublicKey,
        deployerKey: PrivateKey,
        senderAccount: PublicKey,
        senderKey: PrivateKey,
        zkAppAddress: PublicKey,
        zkAppPrivateKey: PrivateKey;
      //zkApp: AgeCheck;

      ({ privateKey: deployerKey, publicKey: deployerAccount } =
        Local.testAccounts[0]);
      ({ privateKey: senderKey, publicKey: senderAccount } =
        Local.testAccounts[1]);
      zkAppPrivateKey = PrivateKey.random();
      zkAppAddress = zkAppPrivateKey.toPublicKey();
      zkAppInstance = new AgeCheck(zkAppAddress);

      async function localDeploy() {
        const txn = await Mina.transaction(deployerAccount, () => {
          AccountUpdate.fundNewAccount(deployerAccount);
          zkAppInstance.deploy();
        });
        await txn.prove();
        // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
        await txn.sign([deployerKey, zkAppPrivateKey]).send();
      }

      console.log("starting deploy tx");
      await localDeploy();
      // const txn = await Mina.transaction(deployerAccount, () => {
      //   AccountUpdate.fundNewAccount(deployerAccount);
      //   zkApp.deploy();
      // });
      // await txn.prove();
      // await txn.sign([deployerKey, zkAppPrivateKey]).send();

      // let txn = await Mina.transaction(feePayer, () => {
      //   AccountUpdate.fundNewAccount(feePayer);
      //   zkAppInstance.deploy({ zkappKey: zkAppPrivateKey });
      // });
      console.log("deploying contract");

      //const txPromise = await txn.send();
      /*
      `txn.send()` returns a promise with two closures - `.wait()` and `.hash()`
      `.hash()` returns the transaction hash, as the name might indicate
      `.wait()` automatically resolves once the transaction has been included in a block. this is redundant for the LocalBlockchain, but very helpful for live testnets
      */

      //await txPromise.wait();

      let sig = Signature.fromBase58(
        "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC"
      );
      console.log("verifying");
      let x = await zkAppInstance.verify(Field(1), Field(78), sig);
      console.log("result", x);

      // Update this to use the address (public key) for your zkApp account.
      // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
      // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
      //const zkAppAddress = "";
      // This should be removed once the zkAppAddress is updated.
      // if (!zkAppAddress) {
      //   console.error(
      //     'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
      //   );
      // }
      //const zkApp = new Add(PublicKey.fromBase58(zkAppAddress))
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with SnarkyJS" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <GradientBG>
        <main className={styles.main}>
          <div className={styles.center}></div>
          <p className={styles.start}>To-be check your age with ZK!</p>
        </main>
      </GradientBG>
    </>
  );
}
