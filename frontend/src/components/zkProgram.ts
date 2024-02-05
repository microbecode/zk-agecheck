import { Field, PublicKey, Signature, ZkProgram, verify } from "o1js";

// https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkprogram/program-with-input.ts

let zkProgram = ZkProgram({
  name: "AgeCheck",
  publicInput: Field,
  publicOutput: Field,
  methods: {
    verifyAge: {
      privateInputs: [PublicKey, Field, Field, Signature],
      method(
        minimumAge: Field, // public input
        oraclePublicKey: PublicKey,
        id: Field, // TODO: is needed?
        age: Field,
        signature: Signature
      ): Field {
        // Evaluate whether the signature is valid for the provided data
        const validSignature = signature.verify(oraclePublicKey, [id, age]);
        // Check that the signature is valid
        validSignature.assertTrue();
        // Check that the provided age is above the minimum age
        age.assertGreaterThanOrEqual(minimumAge);

        return minimumAge;
      },
    },
  },
});

export { zkProgram };
