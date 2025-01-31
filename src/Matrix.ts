const csrMatrixDeterminant = (matrix: Matrix): number => {
    const n = matrix.ROW_INDEX.length - 1;
    if (n === 0) return 1;
    if (n === 1) return matrix.V[0] || 0;

    const maxCol = Math.max(...matrix.COL_INDEX) + 1;
    if (n !== maxCol) throw new Error("A matriz não é quadrada");

    let det = 0;

    const row = 0;
    const rowStart = matrix.ROW_INDEX[row];
    const rowEnd = matrix.ROW_INDEX[row + 1];

    for (let i = rowStart; i < rowEnd; i++) {
        const col = matrix.COL_INDEX[i];
        const value = matrix.V[i];

        const subMatrix = csrMatrixSubmatrix(matrix, row, col);
        const cofactor = csrMatrixDeterminant(subMatrix);

        const sign = (row + col) % 2 === 0 ? 1 : -1;
        det += sign * value * cofactor;
    }

    return det;
};

const csrMatrixSubmatrix = (matrix: Matrix, excludeRow: number, excludeCol: number): Matrix => {
    const subV: number[] = [];
    const subCOL_INDEX: number[] = [];
    const subROW_INDEX: number[] = [0];

    const n = matrix.ROW_INDEX.length - 1;

    for (let i = 0; i < n; i++) {
        if (i === excludeRow) continue;

        const rowStart = matrix.ROW_INDEX[i];
        const rowEnd = matrix.ROW_INDEX[i + 1];
        let rowLength = 0;

        for (let j = rowStart; j < rowEnd; j++) {
            const col = matrix.COL_INDEX[j];
            if (col === excludeCol) continue;

            subV.push(matrix.V[j]);
            subCOL_INDEX.push(col < excludeCol ? col : col - 1);
            rowLength++;
        }

        subROW_INDEX.push(subROW_INDEX[subROW_INDEX.length - 1] + rowLength);
    }

    const m = new Matrix(matrix.cols, matrix.rows);
    m.V = subV;
    m.COL_INDEX = subCOL_INDEX;
    m.ROW_INDEX = subROW_INDEX;

    return m;
};

export class Matrix {
    V: number[] = [];
    COL_INDEX: number[] = [];
    ROW_INDEX: number[] = [0];

    constructor(public rows: number, public cols: number, data?: number[][]) {
        if (data) this.sparseData(data);
    }

    /**
     * Cria uma matriz a partir de um array de números.
     * @param arr Array de números.
     * @returns Matriz.
     * @example
     * Matrix.fromArray([1, 2, 3, 4, 5, 6]); // 1x6
     */
    static fromArray(arr: number[]): Matrix {
        return new Matrix(1, arr.length, [arr]);
    }

    /**
     * Cria uma matriz identidade.
     * @param size Tamanho da matriz.
     * @returns Matriz identidade.
     * @example
     * Matrix.identity(3); // 3x3
     */
    static identity(size: number): Matrix {
        return new Matrix(size, size);
    }

    /**
     * Cria uma matriz de zeros.
     * @param rows Número de linhas.
     * @param cols Número de colunas.
     * @returns Matriz de zeros.
     * @example
     * Matrix.zeros(2, 3); // 2x3
     */
    static zeros(rows: number, cols: number): Matrix {
        return new Matrix(rows, cols);
    }

    /**
     * Obtem os dados da matriz.
     * @returns Dados da matriz.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.data; // [[1, 2], [3, 4]]
     */
    get data(): number[][] {
        const data: number[][] = new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(0));
        this.forEach((value, row, col) => {
            data[row][col] = value;
        });
        return data;
    }

    /**
     * Obtem os dados da matriz em forma de array.
     * @returns Dados da matriz em forma de array.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.toArray(); // [1, 2, 3, 4]
     */
    toArray(): number[] {
        const arr: number[] = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                arr.push(this.get(row, col));
            }
        }
        return arr;
    }

    /**
     * Transforma uma matriz em Compressed sparse row (CSR) format.
     * @param data Dados da matriz.
     * @example
     * const data = [
     *    [10, 20],
     *    [0, 30, 0, 40],
     *    [0, 0, 50, 60, 70],
     *    [0, 0, 0, 0, 0, 80],
     * ];
     * Matrix.sparse(data);
     */
    private sparseData(data: number[][]): void {
        this.ROW_INDEX = [0];
        this.COL_INDEX = [];
        this.V = [];

        let row_end = 0;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (data[i] && typeof data[i][j] === "number" && data[i][j] != 0) {
                    this.V.push(data[i][j]);
                    this.COL_INDEX.push(j);
                    row_end += 1;
                }
            }
            this.ROW_INDEX.push(row_end);
        }
    }

    /**
     * Itera sobre os elementos da matriz.
     * @param callback Função de callback.
     * @param strict Se verdadeiro, pula os elementos iguais a zero.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.forEach((value, row, col) => {
     *    console.log(value, row, col);
     * });
     */
    forEach(callback: (value: number, row: number, col: number) => void, strict: boolean = true): void {
        if (strict) {
            for (let row = 0; row < this.ROW_INDEX.length - 1; row++) {
                let row_start = this.ROW_INDEX[row],
                    row_end = this.ROW_INDEX[row + 1];
                for (let i = row_start; i < row_end; i++) {
                    let col = this.COL_INDEX[i];
                    let value = this.V[i];
                    callback(value, row, col);
                }
            }
        } else {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    let value = this.get(row, col);
                    callback(value, row, col);
                }
            }
        }
    }

    /**
     * Itera sobre os elementos de uma linha.
     * @param row Número da linha.
     * @param callback Função de callback.
     * @param strict Se verdadeiro, pula os elementos iguais a zero.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.forEachRow(0, (value, col) => {
     *    console.log(value, col);
     * });
     */
    forEachRow(row: number, callback: (value: number, col: number) => void, strict: boolean = true): void {
        if (strict) {
            let row_start = this.ROW_INDEX[row],
                row_end = this.ROW_INDEX[row + 1];
            for (let i = row_start; i < row_end; i++) {
                let col = this.COL_INDEX[i];
                let value = this.V[i];
                callback(value, col);
            }
        } else {
            for (let col = 0; col < this.cols; col++) {
                let value = this.get(row, col);
                callback(value, col);
            }
        }
    }

    /**
     * Itera sobre os elementos de uma coluna.
     * @param col Número da coluna.
     * @param callback Função de callback.
     * @param strict Se verdadeiro, pula os elementos iguais a zero.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.forEachCol(0, (value, row) => {
     *    console.log(value, row);
     * });
     */
    forEachCol(col: number, callback: (value: number, row: number) => void, strict: boolean = true): void {
        if (strict) {
            for (let row = 0; row < this.ROW_INDEX.length - 1; row++) {
                let row_start = this.ROW_INDEX[row],
                    row_end = this.ROW_INDEX[row + 1];
                for (let i = row_start; i < row_end; i++) {
                    if (this.COL_INDEX[i] === col) {
                        callback(this.V[i], row);
                        break;
                    }
                }
            }
        } else {
            for (let row = 0; row < this.rows; row++) {
                let value = this.get(row, col);
                callback(value, row);
            }
        }
    }

    /**
     * Mapeia os elementos da matriz.
     * @param callback Função de callback.
     * @param strict Se verdadeiro, pula os elementos iguais a zero.
     * @returns Matriz resultante.
     * @example
     * const m = new Matrix(2, 2, [[1, 0], [0, 4]]);
     * m.map((value, row, col) => value + 2).data; // [[3, 0], [0, 6]]
     * m.map((value, row, col) => value + 2, false).data; // [[3, 2], [2, 6]]
     */
    map(callback: (value: number, row: number, col: number) => number, strict: boolean = true): Matrix {
        const C_V: number[] = [];
        const C_COL_INDEX: number[] = [];
        const C_ROW_INDEX: number[] = [0];

        if (strict) {
            this.forEach((value, row, col) => {
                const newValue = callback(value, row, col);
                if (newValue !== 0) {
                    C_V.push(newValue);
                    C_COL_INDEX.push(col);
                }
                if (C_ROW_INDEX.length - 1 < row + 1) {
                    C_ROW_INDEX.push(C_V.length);
                }
            });
        } else {
            let row_end = 0;

            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    const newValue = callback(this.get(i, j), i, j);
                    if (newValue != 0) {
                        this.V.push(newValue);
                        this.COL_INDEX.push(j);
                        row_end += 1;
                    }
                }
                this.ROW_INDEX.push(row_end);
            }
        }

        const C = new Matrix(this.rows, this.cols);
        C.V = C_V;
        C.COL_INDEX = C_COL_INDEX;
        C.ROW_INDEX = C_ROW_INDEX;

        return C;
    }

    /**
     * Obtem o valor de um elemento da matriz.
     * @param row Número da linha.
     * @param col Número da coluna.
     * @returns Valor do elemento.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.get(0, 1); // 2
     */
    get(row: number, col: number): number {
        const columns = this.COL_INDEX.slice(this.ROW_INDEX[row], this.ROW_INDEX[row + 1]);
        const i = columns.indexOf(col);
        return i < 0 ? 0 : this.V[this.ROW_INDEX[row] + i];
    }

    /**
     * Define o valor de um elemento da matriz.
     * @param row Número da linha.
     * @param col Número da coluna.
     * @param value Valor do elemento.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.set(0, 1, 5);
     * console.table(m.data); // [[1, 5], [3, 4]]
     * m.set(1, 0, 6);
     * console.table(m.data); // [[1, 5], [6, 4]]
     */
    set(row: number, col: number, value: number): void {
        const columns = this.COL_INDEX.slice(this.ROW_INDEX[row], this.ROW_INDEX[row + 1]);
        const i = columns.indexOf(col);

        if (i < 0) {
            if (value !== 0) {
                const index = this.ROW_INDEX[row] + columns.length;
                this.COL_INDEX.splice(index, 0, col);
                this.V.splice(index, 0, value);
                for (let i = row + 1; i < this.ROW_INDEX.length; i++) {
                    this.ROW_INDEX[i] += 1;
                }
            }
        } else {
            if (value === 0) {
                const index = this.ROW_INDEX[row] + i;
                this.COL_INDEX.splice(index, 1);
                this.V.splice(index, 1);
                for (let i = row + 1; i < this.ROW_INDEX.length; i++) {
                    this.ROW_INDEX[i] -= 1;
                }
            } else {
                this.V[this.ROW_INDEX[row] + i] = value;
            }
        }
    }

    /**
     * Transpõe a matriz.
     * @returns Matriz transposta.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.transpose().data; // [[1, 3], [2, 4]]
     */
    transpose(): Matrix {
        const T_V: number[] = [];
        const T_COL_INDEX: number[] = [];
        const T_ROW_INDEX: number[] = new Array(this.cols + 1).fill(0);

        for (let i = 0; i < this.V.length; i++) {
            const col = this.COL_INDEX[i];
            T_ROW_INDEX[col + 1]++;
        }

        for (let i = 1; i <= this.cols; i++) {
            T_ROW_INDEX[i] += T_ROW_INDEX[i - 1];
        }

        const rowPtr = [...T_ROW_INDEX];
        for (let i = 0; i < this.rows; i++) {
            const aStart = this.ROW_INDEX[i];
            const aEnd = this.ROW_INDEX[i + 1];
            for (let j = aStart; j < aEnd; j++) {
                const col = this.COL_INDEX[j];
                const pos = rowPtr[col]++;
                T_V[pos] = this.V[j];
                T_COL_INDEX[pos] = i;
            }
        }

        const C = new Matrix(this.cols, this.rows);
        C.V = T_V;
        C.COL_INDEX = T_COL_INDEX;
        C.ROW_INDEX = T_ROW_INDEX;

        return C;
    }

    /**
     * Adiciona uma matriz.
     * @param matrix Matriz a ser adicionada.
     * @returns Matriz resultante.
     * @example
     * const a = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * const b = new Matrix(2, 2, [[5, 6], [7, 8]]);
     * a.addition(b).data; // [[6, 8], [10, 12]]
     */
    addition(matrix: Matrix): Matrix {
        if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
            throw new Error("Matrix dimensions must match.");
        }

        const C_V: number[] = [];
        const C_COL_INDEX: number[] = [];
        const C_ROW_INDEX: number[] = [0];

        for (let i = 0; i < this.rows; i++) {
            const accumulator = new Map<number, number>();

            const aStart = this.ROW_INDEX[i];
            const aEnd = this.ROW_INDEX[i + 1];
            for (let j = aStart; j < aEnd; j++) {
                const col = this.COL_INDEX[j];
                accumulator.set(col, (accumulator.get(col) || 0) + this.V[j]);
            }

            const bStart = matrix.ROW_INDEX[i];
            const bEnd = matrix.ROW_INDEX[i + 1];
            for (let j = bStart; j < bEnd; j++) {
                const col = matrix.COL_INDEX[j];
                accumulator.set(col, (accumulator.get(col) || 0) + matrix.V[j]);
            }

            const sortedEntries = Array.from(accumulator.entries())
                .filter(([_, val]) => val !== 0)
                .sort((a, b) => a[0] - b[0]);

            for (const [col, val] of sortedEntries) {
                C_V.push(val);
                C_COL_INDEX.push(col);
            }
            C_ROW_INDEX.push(C_V.length);
        }

        const C = new Matrix(this.rows, this.cols);
        C.V = C_V;
        C.COL_INDEX = C_COL_INDEX;
        C.ROW_INDEX = C_ROW_INDEX;

        return C;
    }

    /**
     * Subtrai uma matriz.
     * @param matrix Matriz a ser subtraída.
     * @returns Matriz resultante.
     * @example
     * const a = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * const b = new Matrix(2, 2, [[5, 6], [7, 8]]);
     * a.subtract(b).data; // [[-4, -4], [-4, -4]]
     */
    subtract(matrix: Matrix): Matrix {
        if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
            throw new Error("Matrix dimensions must match.");
        }

        const C_V: number[] = [];
        const C_COL_INDEX: number[] = [];
        const C_ROW_INDEX: number[] = [0];

        for (let i = 0; i < this.rows; i++) {
            const accumulator = new Map<number, number>();

            const aStart = this.ROW_INDEX[i];
            const aEnd = this.ROW_INDEX[i + 1];
            for (let j = aStart; j < aEnd; j++) {
                const col = this.COL_INDEX[j];
                accumulator.set(col, (accumulator.get(col) || 0) + this.V[j]);
            }

            const bStart = matrix.ROW_INDEX[i];
            const bEnd = matrix.ROW_INDEX[i + 1];
            for (let j = bStart; j < bEnd; j++) {
                const col = matrix.COL_INDEX[j];
                accumulator.set(col, (accumulator.get(col) || 0) - matrix.V[j]);
            }

            const sortedEntries = Array.from(accumulator.entries())
                .filter(([_, val]) => val !== 0)
                .sort((a, b) => a[0] - b[0]);

            for (const [col, val] of sortedEntries) {
                C_V.push(val);
                C_COL_INDEX.push(col);
            }
            C_ROW_INDEX.push(C_V.length);
        }

        const C = new Matrix(this.rows, this.cols);
        C.V = C_V;
        C.COL_INDEX = C_COL_INDEX;
        C.ROW_INDEX = C_ROW_INDEX;

        return C;
    }

    /**
     * Produto de Hadamard de uma matriz.
     * @param matrix Matriz a ser multiplicada.
     * @returns Matriz resultante.
     * @example
     * const a = new Matrix(2, 2, [[ 2, 5 ], [ 1, 7 ]]);
     * const b = new Matrix(2, 2, [[ 3, 7 ], [ 2, 9 ]]);
     * a.hadamard(b).data; // [[ 6, 35 ], [ 2, 63 ]]
     */
    hadamard(matrix: Matrix): Matrix {
        if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
            throw new Error("Matrix dimensions must match.");
        }

        const C_V: number[] = [];
        const C_COL_INDEX: number[] = [];
        const C_ROW_INDEX: number[] = [0];

        for (let i = 0; i < this.rows; i++) {
            let aPtr = this.ROW_INDEX[i];
            let bPtr = matrix.ROW_INDEX[i];
            const aEnd = this.ROW_INDEX[i + 1];
            const bEnd = matrix.ROW_INDEX[i + 1];

            while (aPtr < aEnd && bPtr < bEnd) {
                const aCol = this.COL_INDEX[aPtr];
                const bCol = matrix.COL_INDEX[bPtr];

                if (aCol === bCol) {
                    const val = this.V[aPtr] * matrix.V[bPtr];
                    if (val !== 0) {
                        C_V.push(val);
                        C_COL_INDEX.push(aCol);
                    }
                    aPtr++;
                    bPtr++;
                } else if (aCol < bCol) {
                    aPtr++;
                } else {
                    bPtr++;
                }
            }

            C_ROW_INDEX.push(C_V.length);
        }

        const C = new Matrix(this.rows, this.cols);
        C.V = C_V;
        C.COL_INDEX = C_COL_INDEX;
        C.ROW_INDEX = C_ROW_INDEX;

        return C;
    }

    /**
     * Multiplica uma matriz.
     * @param matrix Matriz a ser multiplicada.
     * @returns Matriz resultante.
     * @example
     * const a = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * const b = new Matrix(2, 2, [[5, 6], [7, 8]]);
     * a.multiply(b).data; // [[19, 22], [43, 50]]
     */
    multiply(matrix: Matrix): Matrix {
        if (this.cols !== matrix.rows) {
            throw new Error("Matrix dimensions must match.");
        }

        const C_V: number[] = [];
        const C_COL_INDEX: number[] = [];
        const C_ROW_INDEX: number[] = [0];

        const numARows = this.ROW_INDEX.length - 1;

        for (let i = 0; i < numARows; i++) {
            const accumulator = new Map<number, number>();
            const aStart = this.ROW_INDEX[i];
            const aEnd = this.ROW_INDEX[i + 1];

            for (let aPtr = aStart; aPtr < aEnd; aPtr++) {
                const k = this.COL_INDEX[aPtr];
                const aVal = this.V[aPtr];

                const bStart = matrix.ROW_INDEX[k];
                const bEnd = matrix.ROW_INDEX[k + 1];

                for (let bPtr = bStart; bPtr < bEnd; bPtr++) {
                    const j = matrix.COL_INDEX[bPtr];
                    const bVal = matrix.V[bPtr];
                    accumulator.set(j, (accumulator.get(j) || 0) + aVal * bVal);
                }
            }

            const sortedEntries = Array.from(accumulator.entries())
                .filter(([_, val]) => val !== 0)
                .sort((a, b) => a[0] - b[0]);

            for (const [col, val] of sortedEntries) {
                C_V.push(val);
                C_COL_INDEX.push(col);
            }
            C_ROW_INDEX.push(C_V.length);
        }

        const C = new Matrix(this.rows, matrix.cols);
        C.V = C_V;
        C.COL_INDEX = C_COL_INDEX;
        C.ROW_INDEX = C_ROW_INDEX;

        return C;
    }

    /**
     * Calcula o determinante da matriz.
     * @returns Determinante da matriz.
     * @example
     * const m = new Matrix(2, 2, [[1, 2], [3, 4]]);
     * m.determinant(); // -2
     */
    determinant(): number {
        return csrMatrixDeterminant(this);
    }
}
