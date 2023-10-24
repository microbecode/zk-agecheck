import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Signature,
} from 'o1js';

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY =
  'B62qkN4f1prDvFexmhGHNsNz1db84XCA6vkgtJpcAaqFJk2M1runpLd';
const MINIMUM_AGE = 18;

export class OracleExample extends SmartContract {
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
    this.requireSignature();
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
    this.emitEvent('verified', id);
  }
}
