var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, SmartContract, state, State, method, PublicKey, Signature, } from 'o1js';
// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY = 'B62qoAE4rBRuTgC42vqvEyUqCGhaZsW58SKVW4Ht8aYqP9UTvxFWBgy';
export class OracleExample extends SmartContract {
    constructor() {
        super(...arguments);
        // Define contract state
        this.oraclePublicKey = State();
        // Define contract events
        this.events = {
            verified: Field,
        };
    }
    init() {
        super.init();
        // Initialize contract state
        this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
        // Specify that caller should include signature with tx instead of proof
        this.requireSignature();
    }
    verify(id, creditScore, signature) {
        // Get the oracle public key from the contract state
        const oraclePublicKey = this.oraclePublicKey.get();
        this.oraclePublicKey.assertEquals(oraclePublicKey);
        // Evaluate whether the signature is valid for the provided data
        const validSignature = signature.verify(oraclePublicKey, [id, creditScore]);
        // Check that the signature is valid
        validSignature.assertTrue();
        // Check that the provided credit score is greater than 700
        creditScore.assertGreaterThanOrEqual(Field(700));
        // Emit an event containing the verified users id
        this.emitEvent('verified', id);
    }
}
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], OracleExample.prototype, "oraclePublicKey", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Field, Field, Signature]),
    __metadata("design:returntype", void 0)
], OracleExample.prototype, "verify", null);
//# sourceMappingURL=OracleExample.js.map