var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Field, SmartContract, method, Bool, state, State, Poseidon, Struct, Provable, Signature, PublicKey, } from 'o1js';
export { Sudoku, SudokuZkApp };
const ORACLE_PUBLIC_KEY = 'B62qrjMtZDvEnbxGWBFwhutATZd1DgwdgNmsLCAwrrDrvobpC3tkhHU';
class MyJSON extends Struct({
    a: Field,
    b: Field,
}) {
}
class Sudoku extends Struct({
    value: Provable.Array(Provable.Array(Field, 9), 9),
}) {
    static from(value) {
        return new Sudoku({ value: value.map((row) => row.map(Field)) });
    }
    hash() {
        return Poseidon.hash(this.value.flat());
    }
}
class SudokuZkApp extends SmartContract {
    constructor() {
        super(...arguments);
        this.sudokuHash = State();
        this.isSolved = State();
        this.oraclePublicKey = State();
    }
    /**
     * by making this a `@method`, we ensure that a proof is created for the state initialization.
     * alternatively (and, more efficiently), we could have used `super.init()` inside `update()` below,
     * to ensure the entire state is overwritten.
     * however, it's good to have an example which tests the CLI's ability to handle init() decorated with `@method`.
     */
    init() {
        super.init();
        // Initialize contract state
        this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
        // Specify that caller should include signature with tx instead of proof
        this.requireSignature();
    }
    verifyJSON(age, signature) {
        // Get the oracle public key from the contract state
        const oraclePublicKey = this.oraclePublicKey.get();
        this.oraclePublicKey.assertEquals(oraclePublicKey);
        // Evaluate whether the signature is valid for the provided data
        const validSignature = signature.verify(oraclePublicKey, [age]);
        // Check that the signature is valid
        validSignature.assertTrue();
        // Check that the provided credit score is greater than 700
        age.assertGreaterThanOrEqual(Field(10));
        // Emit an event containing the verified users id
        // this.emitEvent('verified', id);
    }
    update(sudokuInstance) {
        this.sudokuHash.set(sudokuInstance.hash());
        this.isSolved.set(Bool(false));
    }
    submitSolution(sudokuInstance, solutionInstance) {
        let sudoku = sudokuInstance.value;
        let solution = solutionInstance.value;
        // first, we check that the passed solution is a valid sudoku
        // define helpers
        let range9 = Array.from({ length: 9 }, (_, i) => i);
        let oneTo9 = range9.map((i) => Field(i + 1));
        function assertHas1To9(array) {
            oneTo9
                .map((k) => range9.map((i) => array[i].equals(k)).reduce(Bool.or))
                .reduce(Bool.and)
                .assertTrue('array contains the numbers 1...9');
        }
        // check all rows
        for (let i = 0; i < 9; i++) {
            let row = solution[i];
            assertHas1To9(row);
        }
        // check all columns
        for (let j = 0; j < 9; j++) {
            let column = solution.map((row) => row[j]);
            assertHas1To9(column);
        }
        // check 3x3 squares
        for (let k = 0; k < 9; k++) {
            let [i0, j0] = divmod(k, 3);
            let square = range9.map((m) => {
                let [i1, j1] = divmod(m, 3);
                return solution[3 * i0 + i1][3 * j0 + j1];
            });
            assertHas1To9(square);
        }
        // next, we check that the solution extends the initial sudoku
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let cell = sudoku[i][j];
                let solutionCell = solution[i][j];
                // either the sudoku has nothing in it (indicated by a cell value of 0),
                // or it is equal to the solution
                Bool.or(cell.equals(0), cell.equals(solutionCell)).assertTrue(`solution cell (${i + 1},${j + 1}) matches the original sudoku`);
            }
        }
        // finally, we check that the sudoku is the one that was originally deployed
        let sudokuHash = this.sudokuHash.getAndAssertEquals();
        sudokuInstance
            .hash()
            .assertEquals(sudokuHash, 'sudoku matches the one committed on-chain');
        // all checks passed => the sudoku is solved!
        this.isSolved.set(Bool(true));
    }
}
__decorate([
    state(Field),
    __metadata("design:type", Object)
], SudokuZkApp.prototype, "sudokuHash", void 0);
__decorate([
    state(Bool),
    __metadata("design:type", Object)
], SudokuZkApp.prototype, "isSolved", void 0);
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], SudokuZkApp.prototype, "oraclePublicKey", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SudokuZkApp.prototype, "init", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Field, Signature]),
    __metadata("design:returntype", void 0)
], SudokuZkApp.prototype, "verifyJSON", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Sudoku]),
    __metadata("design:returntype", void 0)
], SudokuZkApp.prototype, "update", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Sudoku, Sudoku]),
    __metadata("design:returntype", void 0)
], SudokuZkApp.prototype, "submitSolution", null);
function divmod(k, n) {
    let q = Math.floor(k / n);
    return [q, k - q * n];
}
//# sourceMappingURL=sudoku.js.map