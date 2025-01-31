import { Matrix } from "./Matrix";

const model = [
    [10, 20],
    [0, 30, 0, 40],
    [0, 0, 50, 60, 70],
    [0, 0, 0, 0, 0, 80],
];

console.table(model);

const m = new Matrix(4, 6, model);

console.table(m.data);
console.table(m.transpose().data);

const a = new Matrix(2, 2, [
    [2, 5],
    [1, 7],
]);

console.table(a.data);

const b = new Matrix(2, 2, [
    [3, 7],
    [2, 9],
]);

console.table(b.data);

console.table(a.hadamard(b).data);

console.table(Matrix.zeros(2, 5).data);
