import { Field, PublicKey, Signature, ZkProgram, verify } from "o1js";

// https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkprogram/program-with-input.ts

let zkProgram = ZkProgram({
  name: "AgeCheck",
  /*  publicInput: Field, */

  methods: {
    verify: {
      privateInputs: [Field, PublicKey, Field, Field, Signature],
      method(
        minimumAge: Field,
        oraclePublicKey: PublicKey,
        id: Field,
        age: Field,
        signature: Signature
      ) {
        // Evaluate whether the signature is valid for the provided data
        const validSignature = signature.verify(oraclePublicKey, [id, age]);
        // Check that the signature is valid
        validSignature.assertTrue();
        // Check that the provided age is above the minimum age
        age.assertGreaterThanOrEqual(minimumAge);
      },
    },
  },
});

// compile the program
/* 
// verificationKey is a special feature found in some ZK systems:
// it's basically extra (public) data that is shared between Prover and Verifier
const { verificationKey } = await MyProgram.compile();

// produce proof
const proof = await MyProgram.multiply(Field(2), Field(3));

// verify proof
const proofValid = await verify(proof.toJSON(), verificationKey);

console.log("Proof:", JSON.stringify(proof.toJSON()));
console.log("Public output", proof.publicOutput.value);
console.log("Public inputs", proof.publicInput.value);
console.log("Verified successfully:", proofValid);

export { MyProgram }; */
export { zkProgram };
