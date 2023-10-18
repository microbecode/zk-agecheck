import {
  Field,
  SmartContract,
  method,
  Bool,
  state,
  State,
  Poseidon,
  Struct,
  Provable,
  Signature,
} from 'o1js';

export { Sudoku, SudokuZkApp };

class MyJSON extends Struct({
  a: Field,
  b: Field,
}) {
  /*
  class MyStruct extends Struct({a: Field, b: Field}) {}
    const original = new MyStruct({a: Field(0), b: Field(0)})
    const fieldsArray = MyStruct.toFields(original)
    // fieldsArray can be serialized to string and back to be sent over the wire
    const reconstructed = MyStruct.fromFields(fieldsArray)
  */
}

class Sudoku extends Struct({
  value: Provable.Array(Provable.Array(Field, 9), 9),
}) {
  static from(value: number[][]) {
    return new Sudoku({ value: value.map((row) => row.map(Field)) });
  }

  hash() {
    return Poseidon.hash(this.value.flat());
  }
}

class SudokuZkApp extends SmartContract {
  @state(Field) sudokuHash = State<Field>();
  @state(Bool) isSolved = State<Bool>();

  /**
   * by making this a `@method`, we ensure that a proof is created for the state initialization.
   * alternatively (and, more efficiently), we could have used `super.init()` inside `update()` below,
   * to ensure the entire state is overwritten.
   * however, it's good to have an example which tests the CLI's ability to handle init() decorated with `@method`.
   */
  @method init() {
    super.init();
  }

  @method verifyJSON(age: Field, signature: Signature) {
    // Get the oracle public key from the contract state
    // Evaluate whether the signature is valid for the provided data
    // Check that the signature is valid
    // Check that the provided credit score is greater than 700
    // Emit an event containing the verified users id
  }

  @method update(sudokuInstance: Sudoku) {
    this.sudokuHash.set(sudokuInstance.hash());
    this.isSolved.set(Bool(false));
  }

  @method submitSolution(sudokuInstance: Sudoku, solutionInstance: Sudoku) {
    let sudoku = sudokuInstance.value;
    let solution = solutionInstance.value;

    // first, we check that the passed solution is a valid sudoku

    // define helpers
    let range9 = Array.from({ length: 9 }, (_, i) => i);
    let oneTo9 = range9.map((i) => Field(i + 1));

    function assertHas1To9(array: Field[]) {
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
        Bool.or(cell.equals(0), cell.equals(solutionCell)).assertTrue(
          `solution cell (${i + 1},${j + 1}) matches the original sudoku`
        );
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

function divmod(k: number, n: number) {
  let q = Math.floor(k / n);
  return [q, k - q * n];
}
