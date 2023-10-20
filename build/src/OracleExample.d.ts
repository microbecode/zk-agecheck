import { Field, SmartContract, State, PublicKey, Signature } from 'o1js';
export declare class OracleExample extends SmartContract {
    oraclePublicKey: State<PublicKey>;
    events: {
        verified: typeof import("o1js/dist/node/lib/field").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/field").Field | import("o1js/dist/node/lib/field").FieldVar | import("o1js/dist/node/lib/field").FieldConst) => import("o1js/dist/node/lib/field").Field);
    };
    init(): void;
    verify(id: Field, creditScore: Field, signature: Signature): void;
}
