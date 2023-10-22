import Client from 'mina-signer';
import { OracleExample } from './OracleExample';
import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Signature,
} from 'o1js';

let proofsEnabled = false;

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY =
  'B62qkN4f1prDvFexmhGHNsNz1db84XCA6vkgtJpcAaqFJk2M1runpLd';

describe('OracleExample', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: OracleExample;

  beforeAll(async () => {
    if (proofsEnabled) await OracleExample.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new OracleExample(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  xit('generates and deploys the `OracleExample` smart contract', async () => {
    await localDeploy();
    const oraclePublicKey = zkApp.oraclePublicKey.get();
    expect(oraclePublicKey).toEqual(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
  });

  describe('dynamic values', () => {
    it('verify data dynamically', async () => {
      await localDeploy();

      const id = Field(1);
      const creditScore = Field(787);
      const oraclePrivateKey =
        'EKEiMUmYfFG4ohsQxQDVzq2oGEuEbjK6XgETrkN4hbF932X1q1zm';
      const fields = [id, creditScore];

      const signature = Signature.create(
        PrivateKey.fromBase58(oraclePrivateKey),
        fields
      );

      expect(async () => {
        const txn = await Mina.transaction(senderAccount, () => {
          zkApp.verify(id, creditScore, signature);
        });
      }).resolves;
    });
  });

  xdescribe('hardcoded values', () => {
    it('emits an `id` event containing the users id if their credit score is above 700 and the provided signature is valid', async () => {
      await localDeploy();

      const id = Field(1);
      const creditScore = Field(787);
      const signature = Signature.fromBase58(
        '7mXA5Acfr5wQy3DSNRbX54ukbrsNYnuyNvu9DF63ULuBobE6HXyvt9gLcosKAuPofzBtsrTWJ916wUK75XqbwhG4GoCCBqmE'
      );

      const txn = await Mina.transaction(senderAccount, () => {
        zkApp.verify(id, creditScore, signature);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();

      const events = await zkApp.fetchEvents();
      const verifiedEventValue = events[0].event.data.toFields(null)[0];
      expect(verifiedEventValue).toEqual(id);
    });

    xit('throws an error if the credit score is below 700 even if the provided signature is valid', async () => {
      await localDeploy();

      const id = Field(1);
      const creditScore = Field(536);
      const signature = Signature.fromBase58(
        '7mXXnqMx6YodEkySD3yQ5WK7CCqRL1MBRTASNhrm48oR4EPmenD2NjJqWpFNZnityFTZX5mWuHS1WhRnbdxSTPzytuCgMGuL'
      );

      expect(async () => {
        const txn = await Mina.transaction(senderAccount, () => {
          zkApp.verify(id, creditScore, signature);
        });
      }).rejects;
    });

    xit('throws an error if the credit score is above 700 and the provided signature is invalid', async () => {
      await localDeploy();

      const id = Field(1);
      const creditScore = Field(787);
      const signature = Signature.fromBase58(
        '7mXPv97hRN7AiUxBjuHgeWjzoSgL3z61a5QZacVgd1PEGain6FmyxQ8pbAYd5oycwLcAbqJLdezY7PRAUVtokFaQP8AJDEGX'
      );

      expect(async () => {
        const txn = await Mina.transaction(senderAccount, () => {
          zkApp.verify(id, creditScore, signature);
        });
      }).rejects;
    });
  });

  xdescribe('actual API requests', () => {
    it('emits an `id` event containing the users id if their credit score is above 700 and the provided signature is valid', async () => {
      await localDeploy();

      const response = await fetch(
        'https://07-oracles.vercel.app/api/credit-score?user=1'
      );
      const data = await response.json();

      const id = Field(data.data.id);
      const creditScore = Field(data.data.creditScore);
      const signature = Signature.fromBase58(data.signature);

      const txn = await Mina.transaction(senderAccount, () => {
        zkApp.verify(id, creditScore, signature);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();

      const events = await zkApp.fetchEvents();
      const verifiedEventValue = events[0].event.data.toFields(null)[0];
      expect(verifiedEventValue).toEqual(id);
    });

    it('throws an error if the credit score is below 700 even if the provided signature is valid', async () => {
      await localDeploy();

      const response = await fetch(
        'https://07-oracles.vercel.app/api/credit-score?user=2'
      );
      const data = await response.json();

      const id = Field(data.data.id);
      const creditScore = Field(data.data.creditScore);
      const signature = Signature.fromBase58(data.signature);

      expect(async () => {
        const txn = await Mina.transaction(senderAccount, () => {
          zkApp.verify(id, creditScore, signature);
        });
      }).rejects;
    });
  });
});
