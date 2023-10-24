/**
 * Generates a random 9x9 sudoku. Cells are either filled out (1,...,9) or empty (0).
 *
 * @param {number?} difficulty number between 0 (easiest = full sudoku) and 1 (hardest = empty sudoku)
 * @returns {number[][]} the sudoku
 */
export function generateSudoku(difficulty?: number | null): number[][];
/**
 * Solve a given sudoku. Returns undefined if there is no solution.
 *
 * @param {number[][]} sudoku - The input sudoku with some cell values equal to zero
 * @returns {number[][] | undefined} - The full sudoku, or undefined if no solution exists
 */
export function solveSudoku(sudoku: number[][]): number[][] | undefined;
/**
 * Clones a sudoku.
 *
 * @template T
 * @param {T[]} sudoku
 * @returns {T[]}
 */
export function cloneSudoku<T>(sudoku: T[]): T[];
