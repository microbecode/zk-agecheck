import { Field, Signature, ZkProgram, verify } from "o1js";

// https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/examples/zkprogram/program-with-input.ts

let zkProgram = ZkProgram({
  name: "AgeCheck",
  /*  publicInput: Field, */

  methods: {
    verify: {
      privateInputs: [Field, Field, Field, Field, Signature],
      method(
        ageRequired: Field,
        oraclePublicKey: Field,
        id: Field,
        age: Field,
        signature: Signature
      ) {},
    },
    /* baseCase: {
        privateInputs: [],
        method(input: Field) {
          input.assertEquals(Field(0));
        },
      },
  
      inductiveCase: {
        privateInputs: [SelfProof],
        method(input: Field, earlierProof: SelfProof<Field, void>) {
          earlierProof.verify();
          earlierProof.publicInput.add(1).assertEquals(input);
        },
      }, */
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
