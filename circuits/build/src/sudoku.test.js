import { Sudoku, SudokuZkApp } from './sudoku';
import { cloneSudoku, generateSudoku, solveSudoku } from './sudoku-lib';
import { PrivateKey, Mina, AccountUpdate } from 'o1js';
describe('sudoku', () => {
    let zkApp, zkAppPrivateKey, zkAppAddress, sudoku, sender, senderKey;
    beforeEach(async () => {
        let Local = Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);
        sender = Local.testAccounts[0].publicKey;
        senderKey = Local.testAccounts[0].privateKey;
        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkApp = new SudokuZkApp(zkAppAddress);
        sudoku = generateSudoku(0.5);
    });
    it('accepts a correct solution', async () => {
        await deploy(zkApp, zkAppPrivateKey, sudoku, sender, senderKey);
        let isSolved = zkApp.isSolved.get().toBoolean();
        expect(isSolved).toBe(false);
        let solution = solveSudoku(sudoku);
        if (solution === undefined)
            throw Error('cannot happen');
        let tx = await Mina.transaction(sender, () => {
            let zkApp = new SudokuZkApp(zkAppAddress);
            zkApp.submitSolution(Sudoku.from(sudoku), Sudoku.from(solution));
        });
        await tx.prove();
        await tx.sign([senderKey]).send();
        isSolved = zkApp.isSolved.get().toBoolean();
        expect(isSolved).toBe(true);
    });
    it('rejects an incorrect solution', async () => {
        await deploy(zkApp, zkAppPrivateKey, sudoku, sender, senderKey);
        let solution = solveSudoku(sudoku);
        if (solution === undefined)
            throw Error('cannot happen');
        let noSolution = cloneSudoku(solution);
        noSolution[0][0] = (noSolution[0][0] % 9) + 1;
        await expect(async () => {
            let tx = await Mina.transaction(sender, () => {
                let zkApp = new SudokuZkApp(zkAppAddress);
                zkApp.submitSolution(Sudoku.from(sudoku), Sudoku.from(noSolution));
            });
            await tx.prove();
            await tx.sign([senderKey]).send();
        }).rejects.toThrow(/array contains the numbers 1...9/);
        let isSolved = zkApp.isSolved.get().toBoolean();
        expect(isSolved).toBe(false);
    });
});
async function deploy(zkApp, zkAppPrivateKey, sudoku, sender, senderKey) {
    let tx = await Mina.transaction(sender, () => {
        AccountUpdate.fundNewAccount(sender);
        zkApp.deploy();
        zkApp.update(Sudoku.from(sudoku));
    });
    await tx.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await tx.sign([zkAppPrivateKey, senderKey]).send();
}
//# sourceMappingURL=sudoku.test.js.map