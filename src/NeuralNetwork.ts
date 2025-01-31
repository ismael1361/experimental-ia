import { Matrix } from "./Matrix";
import { randFunction } from "./Utils";

type MatricesType = Matrix | Array<MatricesType>;

interface Matrices {
    shape: number[];
    matrices: MatricesType;
}

export class ANN {
    static rand(shape: number[], randFunction: () => number): Matrices {
        if (!Array.isArray(shape) || shape.length <= 0) {
            throw new Error("The shape must be an array of length greater than 0");
        }

        shape = shape.length === 1 ? [1, shape[0]] : shape;

        let matrices: MatricesType = shape.length === 2 ? Matrix.random(shape[0], shape[1], randFunction) : new Array(shape[0]).fill(null).map(() => ANN.rand(shape.slice(1), randFunction).matrices);

        return {
            shape,
            matrices,
        };
    }

    static randomNormal(shape: number[], mean: number = 0, stdDev: number = 1, dtype: "float32" | "int32" = "float32"): Matrices {
        return ANN.rand(shape, randFunction(mean, stdDev, dtype));
    }

    static randomStandardNormal(size: number[], dtype: "float32" | "int32" = "float32"): Matrices {
        return ANN.randomNormal(size, 0, 1, dtype);
    }
}
