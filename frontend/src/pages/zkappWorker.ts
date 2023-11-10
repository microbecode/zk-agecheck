import { Field, Mina, PublicKey, Signature, fetchAccount } from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { AgeCheck } from "../../../circuits/src/AgeCheck";

const state = {
  AgeCheck: null as null | typeof AgeCheck,
  zkapp: null as null | AgeCheck,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    console.log("starting berkeley");
    const Berkeley = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql" //"https://api.minascan.io/node/berkeley/v1/graphql" //"https://proxy.berkeley.minaexplorer.com/graphql"
    );
    console.log("Berkeley Instance Created");
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { AgeCheck } = await import(
      "../../../circuits/build/src/AgeCheck.js"
    );
    state.AgeCheck = AgeCheck;
  },
  compileContract: async (args: {}) => {
    console.log("starting compile in worker");
    await state.AgeCheck!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.AgeCheck!(publicKey);
  },
  /*   getNum: async (args: {}) => {
    const currentNum = await state.zkapp!.num.get();
    return JSON.stringify(currentNum.toJSON());
  }, */
  createUpdateTransaction: async (args: {}) => {
    let sig = Signature.fromBase58(
      "7mXJiJsHzGHPFvJGF9hZpqc2qigR4GjFLJe6j56cwjwcT5LCKFPKQAzKNJs2g5JRHafqvWRPLuYDHJZhppuk9rYXnYipgocC"
    );

    const transaction = await Mina.transaction(() => {
      state.zkapp!.verify(Field(1), Field(78), sig);
    });
    state.transaction = transaction;
  },
  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== "undefined") {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData,
      };
      // console.log("posting");
      postMessage(message);
    }
  );
}

console.log("Web Worker Successfully Initialized.");
