import { Field, SmartContract, State, PublicKey, Signature } from 'o1js';
export declare class AgeCheck extends SmartContract {
    oraclePublicKey: State<PublicKey>;
    minimumAge: State<import("o1js/dist/node/lib/field").Field>;
    events: {
        verified: typeof import("o1js/dist/node/lib/field").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/field").Field | import("o1js/dist/node/lib/field").FieldVar | import("o1js/dist/node/lib/field").FieldConst) => import("o1js/dist/node/lib/field").Field);
    };
    init(): void;
    verify(id: Field, age: Field, signature: Signature): void;
}
