import { AccountUpdate, Mina, PrivateKey } from 'o1js';
import { AgeCheck } from '../build/src/AgeCheck.js';

console.log('launching blockchain 2');
const local = Mina.LocalBlockchain({ proofsEnabled: false });
Mina.setActiveInstance(local);

// let zkAppPrivateKey = PrivateKey.random();
// let zkAppAddress = zkAppPrivateKey.toPublicKey();
// let zkAppInstance = new AgeCheck(zkAppAddress);

// console.log('starting deploy tx for ', zkAppAddress.toPublicKey());
// let feePayer = local.testAccounts[0].privateKey;
// let txn = await Mina.transaction(feePayer, () => {
//   AccountUpdate.fundNewAccount(feePayer);
//   zkAppInstance.deploy({ zkappKey: zkAppPrivateKey });
// });
// console.log('deploying contract');

const txPromise = await txn.send();
/*
      `txn.send()` returns a promise with two closures - `.wait()` and `.hash()`
      `.hash()` returns the transaction hash, as the name might indicate
      `.wait()` automatically resolves once the transaction has been included in a block. this is redundant for the LocalBlockchain, but very helpful for live testnets
      */

await txPromise.wait();
console.log('ready');
