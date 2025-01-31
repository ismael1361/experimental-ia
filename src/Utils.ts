export const randFunction = (mean: number = 0, stdDev: number = 1, dtype: "float32" | "int32" = "float32"): (() => number) => {
    let nextVal: number = NaN;

    return () => {
        if (!isNaN(nextVal)) {
            const value = nextVal;
            nextVal = NaN;
            return value;
        }

        let v1: number, v2: number, s: number;

        do {
            v1 = 2 * Math.random() - 1;
            v2 = 2 * Math.random() - 1;
            s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s === 0);

        const mul = Math.sqrt((-2.0 * Math.log(s)) / s);
        nextVal = mean + stdDev * v2 * mul;
        nextVal = dtype === "float32" ? nextVal : Math.round(nextVal);
        const val = mean + stdDev * v1 * mul;
        return dtype === "float32" ? val : Math.round(val);
    };
};
