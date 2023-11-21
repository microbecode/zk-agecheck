import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Signature,
  fetchAccount,
  PrivateKey,
  Mina,
  PublicKey,
  UInt64,
  AccountUpdate,
} from "o1js";

const TESTNET = "https://proxy.testworld.minaexplorer.com/graphql";

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY =
  "B62qkN4f1prDvFexmhGHNsNz1db84XCA6vkgtJpcAaqFJk2M1runpLd";
const MINIMUM_AGE = 18;

export class AgeCheck extends SmartContract {
  // Define contract state
  @state(PublicKey) oraclePublicKey = State<PublicKey>();
  @state(Field) minimumAge = State<Field>();

  // Define contract events
  events = {
    verified: Field,
  };

  init() {
    super.init();
    // Initialize contract state
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    this.minimumAge.set(Field.from(MINIMUM_AGE));
    // Specify that caller should include signature with tx instead of proof
    //this.requireSignature();
  }

  @method verify(id: Field, age: Field, signature: Signature) {
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(oraclePublicKey);
    const minimumAge = this.minimumAge.get();
    this.minimumAge.assertEquals(minimumAge);

    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(oraclePublicKey, [id, age]);
    // Check that the signature is valid
    validSignature.assertTrue();
    // Check that the provided credit score is greater than 700
    age.assertGreaterThanOrEqual(minimumAge);
    // Emit an event containing the verified users id
    this.emitEvent("verified", id);
  }
}

async function main() {
  let deployer: PrivateKey | undefined = undefined;
  const transactionFee = 150_000_000;
  const network = Mina.Network({
    mina: TESTNET,
  });
  Mina.setActiveInstance(network);
  const key = process.env.NEXT_PUBLIC_DEPLOYER_KEY;
  if (!key) {
    throw "no deployment key";
  }
  deployer = PrivateKey.fromBase58(key);

  const balanceDeployer =
    Number((await accountBalance(deployer.toPublicKey())).toBigInt()) / 1e9;
  console.log(
    `Balance of the Deployer is`,
    balanceDeployer.toLocaleString(`en`),
    deployer.toPublicKey().toBase58()
  );

  await AgeCheck.compile();
  const sender = deployer.toPublicKey();
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
  console.log(
    `deploying the MySmartContract contract to an address ${zkAppPublicKey.toBase58()} using the deployer with public key ${sender.toBase58()}...`
  );
  await fetchAccount({ publicKey: sender });
  await fetchAccount({ publicKey: zkAppPublicKey });

  const zkApp = new AgeCheck(zkAppPublicKey);
  const transaction = await Mina.transaction(
    { sender, fee: transactionFee },
    () => {
      AccountUpdate.fundNewAccount(sender);
      zkApp.deploy({});
    }
  );

  await transaction.prove();
  transaction.sign([deployer, zkAppPrivateKey]);

  console.log("Sending the deploy transaction...");
  const tx = await transaction.send();

  if (tx.hash() !== undefined) {
    console.log(`
      Success! Deploy transaction sent.
    
      Your smart contract state will be updated
      as soon as the transaction is included in a block:
      ${tx.hash()}
      `);
  }
}

async function accountBalance(address: PublicKey): Promise<UInt64> {
  await fetchAccount({ publicKey: address });
  if (Mina.hasAccount(address)) return Mina.getBalance(address);
  else return UInt64.from(0);
}

export const domy = async () => {
  main();
};
